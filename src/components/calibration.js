import { useState, useEffect } from 'react'

import { calibrationText } from '../assets/text'
import { writeData } from '../lib/utils'
import Instruction from './instruction'

const numPoints = 9  // changing this is not as easy: careful
const numClicksPerPoint = 5  // changing this messes up the instructions 
const staringSecs = 5 + 1

export default function Calibration(props) {

    const [points, setPoints] = useState([...Array(numPoints)].map(_ => numClicksPerPoint))
    const [screen, setScreen] = useState("clicking")

    function opacity(clicksLeft) { return clicksLeft === 0 ? 1 : clicksLeft / numClicksPerPoint }

    function dist(i, past50) {
        const staringPointX = window.innerHeight / 2, staringPointY = window.innerWidth / 2
        const x50 = past50[0], y50 = past50[1]
        return Math.sqrt(Math.pow(x50[i] - staringPointX, 2) + Math.pow(y50[i] - staringPointY, 2))
    }

    function precisionPercentage(distance) {
        const halfWindowHeight = window.innerHeight / 2
        return distance <= halfWindowHeight ? 100 - (distance / halfWindowHeight * 100) : 0
    }

    useEffect(() => {

        function accuracy(past50) {
            return Math.round(Object
                .keys([...Array(50)])
                .map(i => dist(i, past50))
                .map(precisionPercentage)
                .reduce((acc, curr) => acc + curr) / 50)
        }

        if (screen === "clicking") {
            // props.curr.wg.showPredictionPoints(true)
            if (Object.values(points).every(v => v === 0)) {
                setScreen("staring")
                props.curr.wg.params.storingPoints = true
            }
        } else if (screen === "staring") {
            const timer = setTimeout(() => {
                setScreen("done")
                props.curr.wg.params.storingPoints = false
                // props.curr.wg.showPredictionPoints(false)
                console.log("wg acc", accuracy(props.curr.wg.getStoredPoints()))
                writeData("metadata", {
                    name: "calibration accuracy", 
                    value: accuracy(props.curr.wg.getStoredPoints()).toString() 
                }, props.curr.id)
            }, 1000 * staringSecs)
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer)
        }
    }, [screen, points, props.curr.wg])

    useEffect(() => {
        props.curr.wgLogs.push({ timestamp: Date.now(), id: "calibration", type: screen })
    }, [screen])

    function handleClick(e) {
        const pointNum = parseInt(e.target.id.replace("pt", ""))
        const point = document.getElementById(e.target.id)
        const newPointClicksLeft = points[pointNum] - 1
        setPoints({ ...points, [pointNum]: newPointClicksLeft })
        if (newPointClicksLeft === 0) {
            point.style.backgroundColor = "yellow"
            point.disabled = "true"
        }
    }

    function shouldDisplay(ptNum) {
        if (screen === "clicking") {
            let vals = Object.values(points)
            vals.splice(4, 1)
            return ptNum !== 4 || vals.every(v => v === 0)
        } else if (screen === "staring") {
            return ptNum === 4
        }
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

    if (screen === "clicking" || screen === "staring") {
        return (<div>
            {makePoints()}
            {screen === "staring" ? calibrationText[1] : null}
        </div>)
    } else {
        return (<Instruction id="calibrationText" ind="2" next={props.next} prev={props.prev} curr={props.curr} />)
    }
}