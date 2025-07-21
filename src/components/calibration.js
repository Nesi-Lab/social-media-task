import { useState, useEffect } from 'react';

import { writeData } from '../lib/utils';
import Instruction from './instruction';
import { useWebgazer } from './WebgazerContext';
import { useScreen } from './ScreenContext';
import { useParticipant } from './ParticipantContext';

const numPoints = 9;  // changing this is not as easy: careful
const numClicksPerPoint = 5;  // changing this messes up the instructions 

export default function Calibration(props) {

    const [points, setPoints] = useState([...Array(numPoints)].map(_ => numClicksPerPoint));
    const [done, setDone] = useState(false);
    const [regressed, setRegressed] = useState(false);

    const wg = useWebgazer();
    const { setScreen } = useScreen();
    const { participantId } = useParticipant();

    useEffect(() => {
        setScreen("calibration");
    }, []);

    function opacity(clicksLeft) { return clicksLeft === 0 ? 1 : clicksLeft / numClicksPerPoint; }

    useEffect(() => {
        // on load 
        writeData("metadata", {
            name: "screen-width",
            value: window.innerWidth
        }, participantId);
        writeData("metadata", {
            name: "screen-height",
            value: window.innerHeight
        }, participantId);
    }, []);

    useEffect(() => {
        if (!done && !regressed && Object.values(points).every(v => v === 0)) {
            setDone(true);
        }
    }, [points]);
    useEffect(() => {
        if (done && !regressed ) {
            setTimeout(() => {
                console.log("Regressing");
                const model = wg.getRegression()[0];
                model.train();
                setRegressed(true);
            }, 0);
        }
    }, [done]);

    function handleClick(e) {
        const pointNum = parseInt(e.target.id.replace("pt", ""));
        const point = document.getElementById(e.target.id);
        const newPointClicksLeft = points[pointNum] - 1;
        setPoints({ ...points, [pointNum]: newPointClicksLeft });

        const loc = e.target.getBoundingClientRect();
        const x_loc = loc.left + (loc.right - loc.left) / 2;
        const y_loc = loc.top + (loc.bottom - loc.top) / 2;
        wg.recordScreenPosition(x_loc, y_loc);

        // Update opacity immediately for instant visual feedback
        point.style.opacity = newPointClicksLeft === 0 ? 1 : newPointClicksLeft / numClicksPerPoint;

        if (newPointClicksLeft === 0) {
            // Update color immediately for instant feedback
            point.style.backgroundColor = "yellow";
            point.disabled = "true";
        }
    }

    function shouldDisplay(ptNum) {
        let vals = Object.values(points);
        vals.splice(4, 1);
        return ptNum !== 4 || vals.every(v => v === 0);
    }

    function makePoints() {
        return (<div className="all-calibration-points">
            {Object.values(points).map((ptClicksLeft, ptNum) => {
                if (shouldDisplay(ptNum)) {
                    return (<input
                        type="button"
                        className="calibration"
                        id={"pt" + ptNum.toString()}
                        key={ptNum.toString()}
                        onClick={handleClick}
                        style={{ opacity: opacity(ptClicksLeft) }} />);
                } else {
                    return (<div></div>);
                }
            })}
        </div>);
    }

    if (!done) {
        return makePoints();
    } else if (!regressed){
        return (<div><p style={{textAlign: "center"}}>Please wait...</p></div>);
    }  else {
        return (<Instruction id="calibrationText" ind="2" next={props.next} prev={props.prev} curr={props.curr} />);
    }
}