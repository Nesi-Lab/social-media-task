import { useState, useEffect, useRef } from 'react'
import Instruction from './instruction'
import Target from './target'
import { writeData } from '../lib/utils'

const NUM_SAMPLES = 5
const PUASE_TIME = 2000
const COLLECT_INTERVAL = 200
const NORMAL_DOT_SIZE = 1
const NUM_TEST_POINTS = 5
const TIME = 1000
const SHRINK_TIME = 250

const AnimationState = {
    Shrinking: "SHRINKING",
    Moving: "MOVING",
    Collecting: "COLLECTING"
}

function sigmoid(x) {
    const k = 20
    return 1 / (1 + Math.exp(-1 * k * (x - 0.5)))
}

export default function NewCalibration(props) {

    const [done, setDone] = useState(false)
    const [regressed, setRegressed] = useState(false)
    const [counter, setCounter] = useState(0)
    const [dotLoc, setDotLoc] = useState({x:0, y:0})
    const [dotSize, setDotSize] = useState(NORMAL_DOT_SIZE)
    const [animState, setAnimState] = useState(AnimationState.Moving)
    const [testing, setTesting] = useState([])

    const timeRef = useRef()
    const requestRef = useRef()
    const previousTimeRef = useRef()
    const numSamples = useRef()

    // Set screen for logging
    useEffect(() => {
        if (props.test) {
            props.curr.wg.screen.screen = "accuracy"
        } else {
            props.curr.wg.screen.screen = "calibration"

            writeData("metadata", {
                name: "screen-width",
                value: window.innerWidth
            }, props.curr.id)
            writeData("metadata", {
                name: "screen-height",
                value: window.innerHeight
            }, props.curr.id)

            props.curr.wg.wg.clearData()
        }
    }, [])

    /**
     * Computes the accuracy of webgazer given a set of prediction and ground truth points
     */
    function computeAccuracy() {
        let sum = 0
        testing.forEach(item => {
            const errorX = item.x - item.realX
            const errorY = item.y - item.realY
            const error = Math.sqrt(errorX ** 2 + errorY ** 2)
            sum = sum + error
        })
        return sum / testing.length
    }

    /**
     * Compute where the dot should be in the next frame
     * @param timestamp
     * @returns New x and y positions, allong with if collection is done
     */
    function computeNextPosition(timestamp){

        const current = props.points[counter]
        let prev;
        if (counter === 0) {
            prev = [0, 0]
        } else {
            prev = props.points[counter - 1]
        }
        
        const distX = current[0] - prev[0]
        const distY = current[1] - prev[1]
        const t = (timestamp - timeRef.current) / TIME
        if (t >= 1) {
            // TODO: Make sure this cannot overjump the distance
            const next = {x: props.points[counter][0], y: props.points[counter][1], collectDone: true}
            return next
        }
        const newX = dotLoc.x + (sigmoid(t) * distX)
        const newY = dotLoc.y + (sigmoid(t) * distY)
        return {x: newX, y: newY, collectDone:false}
    }

    /**
     * Sets state variables for the shrink and expand dot animation
     * @param timestamp 
     */
    function shrink(timestamp) { 
    
        if (timeRef.current === undefined){
            timeRef.current = timestamp;
        }
        const t = (timestamp - timeRef.current) / SHRINK_TIME
        if (t >= 3.5){
            timeRef.current = undefined
            setAnimState(AnimationState.Collecting)
        } else {
            setDotSize(0.5 * Math.sin(t * Math.PI) + 1)
            requestAnimationFrame(shrink)
        }
    }

    /**
     * Sets state variables for the collection method.
     * Depending on whether or not this is a test, either calibrates and trains WG, or tests (determined by props.test)
     * @param timestamp 
     */
    function collect(timestamp) {
        if (timeRef.current === undefined){
            timeRef.current = timestamp;
            numSamples.current = 0
        }

        previousTimeRef.current = timestamp
        const realX = props.points[counter][0] * window.innerWidth
        const realY = props.points[counter][1] * window.innerHeight

        const gap = timestamp - timeRef.current


        
        // Calibration
        if (!props.test && gap / COLLECT_INTERVAL > numSamples.current + 2 && numSamples.current < NUM_SAMPLES){
            props.curr.wg.wg.recordScreenPosition(realX, realY)
            numSamples.current = numSamples.current + 1
            // console.log("---- RECORDING ----")

        // Testing
        } else if (props.test && gap / COLLECT_INTERVAL > numSamples.current + 2 && numSamples.current < NUM_TEST_POINTS) {
            const pred = props.curr.wg.wg.getCurrentPrediction()

            if (pred) {
                pred.then(value => {
                    if (value && value.x && value.y) {
                        setTesting([...testing, {x: value.x, y: value.y, realX: realX, realY: realY}]);
                    }
                })
            }
            numSamples.current = numSamples.current + 1
        }

        // Done pausing
        if (gap >= PUASE_TIME){
            // console.log("Collection Done")
            timeRef.current = undefined
            setCounter(counter + 1)
            setDotSize(NORMAL_DOT_SIZE)
            setAnimState(AnimationState.Moving)


        } else {
            requestAnimationFrame(collect)
        }
    }

    /**
     * Sets the state variables to update with the next dot location
     * @param timestamp 
     */
    function step(timestamp) {
        // console.log("STEPPPING")
        if (timeRef.current === undefined){
            timeRef.current = timestamp;
        }
        if (previousTimeRef.current === undefined) {
            previousTimeRef.current = timestamp
        }
        const dt = timestamp - previousTimeRef.current
        if (dt >= 0 && counter !== props.points.length) {
            previousTimeRef.current = timestamp
            const {x, y, collectDone} = computeNextPosition(timestamp)
            setDotLoc({x, y})
            if (collectDone) {
                timeRef.current = undefined
                setAnimState(AnimationState.Shrinking)
            } else {
                requestAnimationFrame(step)
            }
        }
    }
    
    // Once the animation state is changed, trigger the next states animation
    useEffect(() => {
        if (done) {
            return () => cancelAnimationFrame(requestRef.current);
        }
        if (animState === AnimationState.Moving){
            requestRef.current = requestAnimationFrame(step)
        } else if (animState === AnimationState.Collecting){
            requestRef.current = requestAnimationFrame(collect)
        } else if (animState === AnimationState.Shrinking){
            requestRef.current = requestAnimationFrame(shrink)
        } else {
            console.log("INVALID ANIMATION STATE")
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [animState]);


    useEffect(() => {
        // console.log("COUNTER:", counter, "LENGTH: ", props.points.length)
        if (!done && counter === props.points.length) {
            setDone(true)

            // If this was a test, compute the accuracy
            if (props.test) {
                const acc = computeAccuracy()
                console.log("acc:", acc)
                writeData("metadata", {
                    name: `calibration-accuracy${props.loc ? '-' + props.loc : ''}`,
                    value: acc.toString()
                }, props.curr.id)

            // If this was a calibration, train the model
            } else {

                setTimeout(() => {
                    console.log("Regressing")
                    const model = props.curr.wg.wg.getRegression()[0]
                    model.train()
                    setRegressed(true)
                }, 0)

            }

        }
    }, [counter])

    if (!done){
        return (<Target x={dotLoc.x} y={dotLoc.y} size={dotSize}/>)
    } else if (!regressed && !props.test){
        return (<div><p style={{textAlign: "center"}}>Please wait...</p></div>)
    } else {
        if (props.test) {
            return (<Instruction id="calibrationText" ind="3" next={props.next} prev={props.prev} curr={props.curr} />)
        } else {
            return (<Instruction id="calibrationText" ind="2" next={props.next} prev={props.prev} curr={props.curr} />)
        }

    }

}