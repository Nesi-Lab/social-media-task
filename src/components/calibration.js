import { useState, useEffect } from 'react'

import { writeData } from '../lib/utils'
import Instruction from './instruction'

const numPoints = 9  // changing this is not as easy: careful
const numClicksPerPoint = 5  // changing this messes up the instructions 

export default function Calibration(props) {

    const [points, setPoints] = useState([...Array(numPoints)].map(_ => numClicksPerPoint))
    const [done, setDone] = useState(false)

    useEffect(() => {
        props.curr.wg.screen.screen = "calibration"
    }, [])

    function opacity(clicksLeft) { return clicksLeft === 0 ? 1 : clicksLeft / numClicksPerPoint }

    useEffect(() => {
        // on load 
        writeData("metadata", {
            name: "screen-width",
            value: window.innerWidth
        }, props.curr.id)
        writeData("metadata", {
            name: "screen-height",
            value: window.innerHeight
        }, props.curr.id)
    }, [])

    useEffect(() => {
        if (!done && Object.values(points).every(v => v === 0)) {
            setDone(true)
            const model = props.curr.wg.wg.getRegression()[0]
            model.train()
        }
    }, [points])

    function handleClick(e) {
        const pointNum = parseInt(e.target.id.replace("pt", ""))
        const point = document.getElementById(e.target.id)
        const newPointClicksLeft = points[pointNum] - 1
        setPoints({ ...points, [pointNum]: newPointClicksLeft })

        const loc = e.target.getBoundingClientRect()
        const x_loc = loc.left + (loc.right - loc.left) / 2
        const y_loc = loc.top + (loc.bottom - loc.top) / 2
        props.curr.wg.wg.recordScreenPosition(x_loc, y_loc)

        if (newPointClicksLeft === 0) {
            point.style.backgroundColor = "yellow"
            point.disabled = "true"
        }
    }

    function shouldDisplay(ptNum) {
        let vals = Object.values(points)
        vals.splice(4, 1)
        return ptNum !== 4 || vals.every(v => v === 0)
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
                        style={{ opacity: opacity(ptClicksLeft) }} />)
                } else {
                    return (<div></div>)
                }
            })}
        </div>)
    }

    if (!done) {
        return makePoints()
    } else {
        return (<Instruction id="calibrationText" ind="2" next={props.next} prev={props.prev} curr={props.curr} />)
    }
}