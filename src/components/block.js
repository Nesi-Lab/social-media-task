import { useState, useEffect } from "react"
import ReactDOMServer from 'react-dom/server'
import { useEasybase } from 'easybase-react'

import { eye, x } from '../assets/imgs'
import { rateText, interpretationText, watchText } from '../assets/text'
import Feeling from './feeling'
import { slider, getTime } from '../lib/utils'

const timerSecs = {
    "watching": {
        "anticipation": 3,
        "feedback": 6,
    },
    "rating": {
        "feedback": 2,
    },
    "rated": {
        "anticipation": 3,
        "feedback": 6,
    }
}

const quadrantStyle = {
    backgroundColor: "#091147",
    borderRadius: "20px",
    width: "250px",
    height: "250px",
    padding: "20px",
    paddingTop: "15px",
    margin: "25px",
    textAlign: "center"
}

const color = (score) => score < 2.5 ? "red" : "green"

export default function Block(allProps) {
    const props = allProps.props
    const participant = { img: allProps.curr.img, bio: allProps.curr.bio, id: "participant" }

    // add participant into props where appropriate
    if (props.blockInfo.type === "rating") {
        props.trials = props.trials.map(e => { return { ...e, rater: participant } })
    } else if (props.blockInfo.type === "rated") {
        props.trials = props.trials.map(e => { return { ...e, ratee: participant } })
        props.summaries = props.summaries.map(e => {
            return {
                participant: { img: participant.img, score: e.participant.score },
                left: e.left, right: e.right, watching: e.watching
            }
        })
    }

    const [trialInd, setTrialInd] = useState(0)
    const [screenType, setScreenType] = useState("anticipation")
    const [isSummary, setIsSummary] = useState(false)
    const [clickable, setClickable] = useState(props.blockInfo.type === "rating")
    const [finished, setFinished] = useState(false)
    const [currBlock, setCurrBlock] = useState(props.blockInfo.number)
    const [selectedThumb, setSelectedThumb] = useState(null)  // just for logging interactive (i.e. rating) scores

    if (currBlock !== props.blockInfo.number && finished) {
        // we started a new block and need to reset the state
        setTrialInd(0)
        setScreenType("anticipation")
        setIsSummary(false)
        setClickable(props.blockInfo.type === "rating")
        setFinished(false)
        setCurrBlock(props.blockInfo.number)
    }

    const {
        sync,
        configureFrame,
        addRecord,
        isUserSignedIn
    } = useEasybase()

    const thumbStyle = (isUp) => {
        const img = isUp ? `url(/img/up_thumb.png)` : `url(/img/down_thumb.png)`
        const marginTop = isUp ? "0px" : "15px"
        const marginBottom = isUp ? "15px" : "0px"
        const styles = {
            backgroundImage: img,
            backgroundSize: "50px 50px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "60px",
            width: "60px",
            backgroundColor: "transparent",
            border: "none",
            marginRight: "10px",
            marginTop: marginTop,
            marginBottom: marginBottom,
            fontSize: "larger",
            paddingTop: marginBottom,
            paddingBottom: marginTop,
            color: "black"
        }
        if (props.blockInfo.type === "rating" && screenType === "anticipation") {
            styles["cursor"] = "pointer"
        }
        return styles
    }

    async function saveRow(rec) {
        const record = {
            insertAtEnd: true,
            newRecord: rec,
            tableName: "TRIALS"
        }
        if (isUserSignedIn()) {
            if (!(await addRecord(record)).success) {
                console.log("failed to add trial record, trying again...")
                console.log(await addRecord(record))
            }
            if (!configureFrame({ tableName: "TRIALS" }).success) {
                console.log("failed to configure frame")
            }
            if (!(await sync()).success) { console.log("failed to sync") }
        }
    }

    function nextTrial(interpretationScore = null) {
        if (!isSummary) {
            const today = new Date()
            const record = {
                type: props.blockInfo.type,
                block: props.blockInfo.number,
                round: [props.blockInfo.gender, props.blockInfo.majority].filter(e => e).join("-"),
                trial: trialInd + 1,
                "rater-id": props.trials[trialInd].rater.id,
                "ratee-id": props.trials[trialInd].ratee.id,
                score: (props.blockInfo.type === "rating") ? selectedThumb : props.trials[trialInd].score,
                "num-watching": props.trials[trialInd].watching,
                "save-time": getTime(today),
                "save-datetime": today.getTime().toString()
            }
            if (interpretationScore) { record["interpretation-score"] = interpretationScore }
            saveRow(record)
            console.log(record)
        }

        const screenList = isSummary ? props.summaries : props.trials
        if (trialInd + 1 === screenList.length) {
            if (props.blockInfo.type !== "rated" || isSummary) {
                setFinished(true)
            } else {  // move to summary
                setTrialInd(0)
                setScreenType("anticipation")
                setIsSummary(true)
            }
        } else {
            setTrialInd(trialInd + 1)
            setScreenType("anticipation")
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
            ["X", "rateBox"].forEach(e => {
                const elt = document.getElementById(e)
                if (elt !== null) { elt.style.display = "none" }
            })
        }
        if (!isSummary && screenType === "feedback" && props.blockInfo.type !== "rating" && props.trials[trialInd].score !== 0) {
            highlightThumb("thumb-" + props.trials[trialInd].score)
        }

        // move to next screen
        if ((screenType === "anticipation" && props.blockInfo.type !== "rating") || screenType === "feedback") {
            // move automatically
            const timer = setTimeout(() => {
                if (screenType === "anticipation") {
                    setScreenType("feedback")
                } else { // can only be feedback
                    if (props.blockInfo.type === "rated" && !isSummary) {
                        setScreenType("interpretation")
                    } else {
                        nextTrial()
                    }
                }
            }, 1000 * timerSecs[props.blockInfo.type][screenType])
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer)
        }

    }, [trialInd, screenType, isSummary])

    function rateBox(score) {
        const makeRateBox = inner => <p style={{ width: "140px", padding: "8px", position: "absolute", top: "104px", left: "47px", backgroundColor: "#3C3C3C", borderRadius: "10px" }}>{inner}</p>
        return score === 0 ?
            makeRateBox(<span style={{ fontSize: "large" }}>NO RATING PROVIDED</span>) :
            makeRateBox([<span style={{ fontSize: "larger" }}>Rating: </span>, <span style={{ color: color(score), fontSize: "larger" }}>{score}</span>])
    }

    function person(p, isRatee, score = null) {
        const drawX = score !== null && screenType === "feedback" && (score === 1 || score === 2)
        const X = (<img src={x} alt="x" style={{ height: "185px", width: "185px", position: "absolute", top: "7px", left: "35px", }} />)

        const drawRateBox = score !== null && screenType === "feedback"

        return (<div style={quadrantStyle}>
            <div style={{ position: "relative", top: "0", left: "0" }}>
                <img src={p.img} alt={isRatee ? "ratee" : "rater"} style={{ height: "200px", width: "200px", borderRadius: "50%", position: "relative", top: "0", left: "0" }} />
                <div id="X" style={{ display: drawX ? "inline" : "none" }}>{isRatee ? X : null}</div>
                <div id="rateBox" style={{ display: drawRateBox ? "inline" : "none" }}>{isRatee ? rateBox(score) : null}</div>
            </div>
            <p style={{ marginTop: 0, fontSize: "smaller" }}>{p.bio}</p>
        </div>)
    }

    function watch(n) {
        return (<div style={quadrantStyle}>
            <img src={eye} alt="eye" style={{ width: "150px" }} />
            {props.blockInfo.type === "watching" ? watchText.withYou(n) : watchText.withoutYou(n)}
        </div>)
    }

    function rate() {
        return (<div style={quadrantStyle}>
            {rateText}
            <div style={{ display: "flex", flexDirection: "row", marginRight: "-10px" }}>
                <button style={thumbStyle(false)} id="thumb-1" onClick={handleThumbClick}>1</button>
                <button style={thumbStyle(false)} id="thumb-2" onClick={handleThumbClick}>2</button>
                <button style={thumbStyle(true)} id="thumb-3" onClick={handleThumbClick}>3</button>
                <button style={thumbStyle(true)} id="thumb-4" onClick={handleThumbClick}>4</button>
            </div>
        </div>)
    }

    function highlightThumb(id) {
        const score = id.split("-")[1]
        const style = document.getElementById(id).style
        style.color = color(score)
        style.border = "2px solid #6a6d80"
        setClickable(false)
        setSelectedThumb(score)
    }

    function handleThumbClick(e) {
        if (clickable) {
            highlightThumb(e.target.id)
            const score = e.target.id.split("-")[1]
            if (score === 1 || score === 2) {
                document.getElementById("X").style.display = "inline"
            }
            document.getElementById("rateBox").style.display = "inline"
            document.getElementById("rateBox").innerHTML = ReactDOMServer.renderToString(rateBox(score))
            setClickable(false)
            setScreenType("feedback")
        }
    }

    function handleInterpretationClick(e) {
        nextTrial(document.getElementById("interpretation").value)
    }

    function watchSummary(n) {
        return (<div style={{ display: "grid", gridTemplateColumns: "auto auto auto", margin: "50px", gap: "10px", alignItems: "center", justifyContent: "center" }}>
            <img src={eye} alt="eye" style={{ width: "200px", height: "100px", marginRight: "20px" }} />
            {watchText.summary(n)}
        </div>)
    }

    function personSummary(p) {
        const drawScore = p.score !== null && screenType === "feedback"
        const score = (<p style={{ width: "200px", marginTop: "5px" }}>Average rating: <br /><span style={{ fontSize: "larger", color: color(p.score) }}>{p.score}</span></p>)

        return (<div style={{ textAlign: "center", margin: "20px" }}>
            <img src={p.img} alt="person summary" style={{ height: "200px", width: "200px", borderRadius: "50%" }} />
            {drawScore ? score : null}
        </div>)
    }

    if (!finished) {
        if (!isSummary) {
            if (screenType !== "interpretation") {
                return (<div style={{ display: "grid", gridTemplateColumns: "auto auto", margin: "30px" }}>
                    {watch(props.trials[trialInd].watching)}
                    {person(props.trials[trialInd].ratee, true, props.trials[trialInd].score)}
                    {person(props.trials[trialInd].rater, false)}
                    {rate()}
                </div>)
            } else {
                return (<div style={{ textAlign: "center" }}>
                    {interpretationText}
                    <img src={props.trials[trialInd].rater.img} alt="rater" style={{ height: "250px", width: "250px", borderRadius: "50%", margin: "30px" }} />
                    {slider("interpretation")}
                    <button style={{ marginTop: "60px" }} onClick={handleInterpretationClick}>Next</button>
                </div>)
            }
        } else {
            return (<div style={{ textAlign: "center" }}>
                {watchSummary(props.summaries[trialInd].watching)}
                <div style={{ display: "flex", flexDirection: "row" }}>
                    {personSummary(props.summaries[trialInd].left)}
                    {personSummary(props.summaries[trialInd].participant)}
                    {personSummary(props.summaries[trialInd].right)}
                </div>
            </div>)
        }
    } else {
        return <Feeling loc={"after block " + JSON.stringify(props.blockInfo)} next={allProps.next} curr={allProps.curr.i} />
    }
}