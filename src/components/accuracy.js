import { useState, useEffect } from 'react'

import { writeData } from '../lib/utils'
import Instruction from './instruction'

const staringSecs = 5

export default function Accuracy(props) {

    const [done, setDone] = useState(false)

    function dist(i, past50) {
        const staringPointX = window.innerHeight / 2, staringPointY = window.innerWidth / 2
        const x50 = past50[0], y50 = past50[1]
        return Math.sqrt(Math.pow(x50[i] - staringPointX, 2) + Math.pow(y50[i] - staringPointY, 2))
    }

    function precisionPercentage(distance) {
        const halfWindowHeight = window.innerHeight / 2
        return distance <= halfWindowHeight ? 100 - (distance / halfWindowHeight * 100) : 0
    }

    useEffect(() => {  // on load
        props.curr.wg.wg.params.storingPoints = true
    }, [])

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
                props.curr.wg.wg.params.storingPoints = false
                console.log("wg acc", accuracy(props.curr.wg.wg.getStoredPoints()))
                writeData("metadata", {
                    name: "calibration accuracy", 
                    value: accuracy(props.curr.wg.wg.getStoredPoints()).toString() 
                }, props.curr.id)
            }, 1000 * staringSecs)
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer)
        }
    }, [props.curr.wg.wg])

    if (!done) {
        return (<input type="button" className="calibration" disabled="true" style={{backgroundColor: "yellow", marginTop: "200px"}} />)
    } else {
        return (<Instruction id="calibrationText" ind="2" next={props.next} prev={props.prev} curr={props.curr} />)
    }
}