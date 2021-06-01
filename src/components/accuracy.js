import { useState, useEffect } from 'react'

import { writeData } from '../lib/utils'
import Instruction from './instruction'

const staringSecs = 5

export default function Accuracy(props) {
    const [done, setDone] = useState(false)
    const [storedPoints, setStoredPoints] = useState({ x: [], y: [] })
    const [storing, setStoring] = useState(null)

    useEffect(() => {
        props.curr.wg.screen.screen = "accuracy"
    }, [])

    function dist(i, past50) {
        const staringPointX = window.innerHeight / 2, staringPointY = window.innerWidth / 2
        // const x50 = past50[0], y50 = past50[1]
        const x50 = past50.x, y50 = past50.y
        return Math.sqrt(Math.pow(x50[i] - staringPointX, 2) + Math.pow(y50[i] - staringPointY, 2))
    }

    function precisionPercentage(distance) {
        const halfWindowHeight = window.innerHeight / 2
        return distance <= halfWindowHeight ? 100 - (distance / halfWindowHeight * 100) : 0
    }

    useEffect(() => {  // on load
        // props.curr.wg.wg.params.storingPoints = true
        console.log("wg", props.curr.wg.wg)
        setStoring(setInterval(async() => {
            const pred = await props.curr.wg.wg.getCurrentPrediction()
            // console.log("pred")
            storedPoints.x.push(pred.x)
            storedPoints.y.push(pred.y)
        }, 50))

        // return () => {
        //     clearInterval(interval)
        // }
    }, [])

    console.log("storedPoints", storedPoints)

    useEffect(() => {
        document.getElementById("app").style.cursor = done ? "auto" : "none"
    })

    useEffect(() => {
        function accuracy(past50) {
            return Math.round(Object
                .keys([...Array(50)])
                .map(i => dist(i, past50))
                .map(precisionPercentage)
                .reduce((acc, curr) => acc + curr) / 50)
        }

        if (!done) {
            const timer = setTimeout(() => {
                setDone(true)
                clearInterval(storing)
                console.log("stop interval")
                console.log("storedPoints", storedPoints)
                // props.curr.wg.wg.params.storingPoints = false
                // const acc = accuracy(props.curr.wg.wg.getStoredPoints())
                const acc = accuracy(storedPoints)
                console.log("wg acc", acc)
                writeData("metadata", {
                    name: "calibration accuracy",
                    value: acc.toString()
                }, props.curr.id)
            }, 1000 * staringSecs)
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer)
        }
    }, [props.curr.wg.wg])

    if (!done) {
        return (<div style={{ height: "100vh", position: "relative" }}>
            <input type="button" className="calibration" disabled="true" style={{ backgroundColor: "yellow", position: "absolute", top: '50%' }} />
        </div>)
    } else {
        return (<Instruction id="calibrationText" ind="3" next={props.next} prev={props.prev} curr={props.curr} />)
    }
}