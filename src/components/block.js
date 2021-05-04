import { useState, useEffect } from "react"
import ReactDOMServer from 'react-dom/server'

import { eye, x, check } from '../assets/imgs'
import { rateText, interpretationText, watchText } from '../assets/text'
import Feeling from './feeling'
import { slider, writeData } from '../lib/utils'
import Instruction from "./instruction"

const timerSecs = {
    "watching": {
        "anticipation": 3,
        "feedback": 6,
        "fixation": 0.5
    },
    "rating": {
        "feedback": 1.5,
        "fixation": 0.5
    },
    "rated": {
        "anticipation": 3,
        "feedback": 6,
        "fixation": 0.5
    }
}

const color = (score) => score < 2.5 ? "red" : "green"

function Block(allProps) {
    const props = allProps.props
    console.log(props)
    const participant = { img: allProps.curr.img, bio: allProps.curr.bio, id: "participant" }

    // add participant into props where appropriate
    if (props.blockInfo.type === "rating") {
        props.trials = props.trials.map(e => { return { ...e, rater: participant } })
    } else if (props.blockInfo.type === "rated") {
        props.trials = props.trials.map(e => { return { ...e, ratee: participant } })
    }

    const [trialInd, setTrialInd] = useState(0)
    const [screenType, setScreenType] = useState("fixation")
    const [clickable, setClickable] = useState(props.blockInfo.type === "rating")
    const [finished, setFinished] = useState(false)
    const [currBlock, setCurrBlock] = useState(props.blockInfo.number)
    const [selectedThumb, setSelectedThumb] = useState(null)  // just for logging interactive (i.e. rating) scores

    useEffect(() => {
        allProps.curr.wg.screen.screen = `block ${props.blockInfo.number} trial 1 fixation`
    }, [])

    useEffect(() => {
        document.getElementById("app").style.cursor = (finished || (screenType !== "fixation" && clickable)) ? "auto" : "none"
    }, [clickable, finished, screenType])

    if (currBlock !== props.blockInfo.number && finished) {
        // we started a new block and need to reset the state
        setTrialInd(0)
        setScreenType("fixation")
        allProps.curr.wg.screen.screen = `block ${props.blockInfo.number} trial 1 fixation`
        setClickable(props.blockInfo.type === "rating")
        setFinished(false)
        setCurrBlock(props.blockInfo.number)
    }

    function nextTrial(interpretationScore = null) {
        const record = {
            type: props.blockInfo.type,
            block: props.blockInfo.number,
            subnum: props.blockInfo.subnum,
            majority: props.blockInfo.majority,
            trial: trialInd + 1,
            rater_id: props.trials[trialInd].rater.id,
            ratee_id: props.trials[trialInd].ratee.id,
            num_watching: props.trials[trialInd].watching,
            score: (props.blockInfo.type === "rating") ? selectedThumb : props.trials[trialInd].score
        }
        if (interpretationScore) { record["interpretation-score"] = interpretationScore }
        writeData("trials", record, allProps.curr.id)

        if (trialInd + 1 === props.trials.length) {
            setFinished(true)
        } else {
            allProps.curr.wg.screen.screen = `block ${props.blockInfo.number} trial ${trialInd + 1 + 1} fixation`
            setTrialInd(trialInd + 1)
            setScreenType("fixation")
            setClickable(props.blockInfo.type === "rating")
        }
    }

    useEffect(() => {
        // edit current screen document
        [1, 2, 3, 4].forEach(e => {
            const elt = document.getElementById("thumb-" + e)
            if (elt !== null) {
                elt.disabled = (!clickable)
                if (screenType === "anticipation") {
                    elt.style.color = "black"
                    elt.style.border = "none"
                }
            }
        })
        if (screenType === "anticipation") {
            ["X", "ch", "rateBox"].forEach(e => {
                const elt = document.getElementById(e)
                if (elt !== null) { elt.style.display = "none" }
            })
        }
        if (screenType === "feedback" && props.blockInfo.type !== "rating" && props.trials[trialInd].score !== 0) {
            highlightThumb("thumb-" + props.trials[trialInd].score)
        }

        // move to next screen
        if ((screenType === "anticipation" && props.blockInfo.type !== "rating") || screenType === "feedback" || screenType === "fixation") {
            // move automatically
            const timer = setTimeout(() => {
                if (screenType === "anticipation") {
                    setScreenType("feedback")
                    allProps.curr.wg.screen.screen = `block ${props.blockInfo.number} trial ${trialInd + 1} feedback`
                } else if (screenType === "feedback") {
                    const ratee = document.getElementById("ratee-img")
                    if (ratee !== null) {
                        ratee.style.border = "none"
                        ratee.style.marginTop = "0px"
                    }
                    if (props.blockInfo.type === "rated") {
                        setScreenType("interpretation")
                        setClickable("true")
                        allProps.curr.wg.screen.screen = `block ${props.blockInfo.number} trial ${trialInd + 1} interpretation`
                    } else {
                        nextTrial()
                    }
                } else {  // can only be fixation
                    setScreenType("anticipation")
                    allProps.curr.wg.screen.screen = `block ${props.blockInfo.number} trial ${trialInd + 1} anticipation`
                }
            }, 1000 * timerSecs[props.blockInfo.type][screenType])
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer)
        }

    }, [trialInd, screenType, clickable])

    function rateBox(score) {
        const makeRateBox = inner => <p className="rate-box">{inner}</p>
        return score === 0 ?
            makeRateBox(<span style={{ fontSize: "large" }}>NO RATING PROVIDED</span>) :
            makeRateBox([<span style={{ fontSize: "larger" }}>Rating: </span>, <span style={{ color: color(score), fontSize: "larger" }}>{score}</span>])
    }

    function person(p, isRatee, score = null) {
        const drawX = score !== null && screenType === "feedback" && (score === 1 || score === 2)
        const drawCheck = score !== null && screenType === "feedback" && (score === 3 || score === 4)
        const X = (<img src={x} alt="x" className="overlay" />)
        const ch = (<img src={check} alt="check" className="overlay" />)

        const drawRateBox = score !== null && screenType === "feedback"

        return (<div className="quadrant">
            <div className="person">
                <img src={p.img} style={{ border: drawCheck ? "10px solid " + color(score) : "none", marginTop: drawCheck ? "-10px" : "0px" }} alt={isRatee ? "ratee" : "rater"} className="person-img" id={isRatee ? "ratee-img" : "rater-img"} />
                <div id="X" style={{ display: drawX ? "inline" : "none" }}>{isRatee ? X : null}</div>
                <div id="ch" style={{ display: drawCheck ? "inline" : "none" }}>{isRatee ? ch : null}</div>
                <div id="rateBox" style={{ display: drawRateBox ? "inline" : "none" }}>{isRatee ? rateBox(score) : null}</div>
            </div>
            <p className="person-bio">{p.bio}</p>
        </div>)
    }

    function watch(n) {
        return (<div className="quadrant">
            <img src={eye} alt="eye" style={{ width: "150px" }} />
            {props.blockInfo.type === "watching" ? watchText.withYou(n) : watchText.withoutYou(n)}
        </div>)
    }

    function rate() {
        const antRat = (props.blockInfo.type === "rating" && screenType === "anticipation") ? "thumb-anticipation-rating" : ""
        return (<div className="quadrant">
            {rateText}
            <div className="thumbs">
                <button className={"thumb thumb-down " + antRat} id="thumb-1" key={"1"} onClick={handleThumbClick}>1</button>
                <button className={"thumb thumb-down " + antRat} id="thumb-2" key={"2"} onClick={handleThumbClick}>2</button>
                <button className={"thumb thumb-up " + antRat} id="thumb-3" key={"3"} onClick={handleThumbClick}>3</button>
                <button className={"thumb thumb-up " + antRat} id="thumb-4" key={"4"} onClick={handleThumbClick}>4</button>
            </div>
        </div>)
    }

    function highlightThumb(id) {
        const score = id.split("-")[1]
        const style = document.getElementById(id).style
        style.color = color(score)
        style.border = "2px solid #6a6d80"
        setSelectedThumb(score)
    }

    function handleThumbClick(e) {
        if (clickable) {
            highlightThumb(e.target.id)
            const score = parseInt(e.target.id.split("-")[1])
            if (score === 1 || score === 2) {
                document.getElementById("X").style.display = "inline"
            } else {
                document.getElementById("ratee-img").style.border = "10px solid " + color(score)
                document.getElementById("ratee-img").style.marginTop = "-10px"
                document.getElementById("ch").style.display = "inline"
            }
            document.getElementById("rateBox").style.display = "inline"
            document.getElementById("rateBox").innerHTML = ReactDOMServer.renderToString(rateBox(score))
            setClickable(false)
            setScreenType("feedback")
            allProps.curr.wg.screen.screen = `block ${props.blockInfo.number} trial ${trialInd + 1} feedback`
        }
    }

    function handleInterpretationClick(e) {
        nextTrial(document.getElementById("interpretation").value)
    }

    console.log({
        type: props.blockInfo.type,
        block: props.blockInfo.number,
        subnum: props.blockInfo.subnum,
        majority: props.blockInfo.majority,
        trial: trialInd + 1,
        rater_id: props.trials[trialInd].rater.id,
        ratee_id: props.trials[trialInd].ratee.id,
        num_watching: props.trials[trialInd].watching
    })

    if (!finished) {
        if (screenType === "fixation") {
            return (<input type="button" className="calibration" disabled="true" style={{ backgroundColor: "white", marginTop: "365px"}} />)
        } else if (screenType !== "interpretation") {
            return (<div className="reg-block">
                {watch(props.trials[trialInd].watching)}
                {person(props.trials[trialInd].ratee, true, props.trials[trialInd].score)}
                {person(props.trials[trialInd].rater, false)}
                {rate()}
            </div>)
        } else {
            return (<div style={{ textAlign: "center" }}>
                {interpretationText}
                <img src={props.trials[trialInd].rater.img} alt="rater" className="interpretation-img" />
                {slider("interpretation")}
                <button style={{ marginTop: "60px" }} onClick={handleInterpretationClick}>Next</button>
            </div>)
        }
    } else {
        if (props.blockInfo.type === "rated") {
            return <Instruction id="beforeSummaryText" ind="0" next={allProps.next} curr={allProps.curr} />
        } else {
            return <Feeling loc={"after block " + JSON.stringify(props.blockInfo)} next={allProps.next} curr={allProps.curr} />
        }
    }
}

export default Block;