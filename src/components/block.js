import { useState, useEffect } from "react"

import { eye, x } from '../assets/imgs'
import { rateText, interpretationText, watchText } from '../assets/text'
import Feeling from './feeling'
import { slider } from '../lib/utils'

const timerSecs = {
    "anticipation": 3,
    "feedback": 6
}

const quadrantStyle = {
    backgroundColor: "#091147",
    borderRadius: "20px",
    width: "250px",
    height: "250px",
    padding: "20px",
    paddingTop: "15px",
    margin: "20px",
    textAlign: "center"
}

const thumbStyle = (isUp) => {
    const img = isUp ? `url(/img/up_thumb.png)` : `url(/img/down_thumb.png)`
    const marginTop = isUp ? "0px" : "15px"
    const marginBottom = isUp ? "15px" : "0px"
    return {
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
}

const color = (score) => score < 2.5 ? "red" : "green"

export default function Block(allProps) {
    // props = {
    //     blockInfo: {
    //         type: watching | rating | rated,
    //         number: 1 to 7,
    //         gender: f | m (optional),
    //         majority: acc | rej (optional),
    //     },
    //     trials: [{
    //         rater: {img, bio},
    //         ratee: {img, bio},
    //         watching: n,
    //         score: 0 to 4 where 0 is unrated, null if rating
    //     }],
    //     summaries: [{
    // participant: {img, score},
    // left: {img, score},
    // right: {img, score},
    // watching: n,
    //     }], only if rated
    //     next and curr?
    // }
    const props = allProps.props
    const participant = { img: allProps.curr.img, bio: allProps.curr.bio }

    // add participant into props where appropriate
    if (props.blockInfo.type == "rating") {
        props.trials = props.trials.map(e => { return { ...e, rater: participant } })
    } else if (props.blockInfo.type == "rated") {
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
    const [clickable, setClickable] = useState(props.blockInfo.type == "rating")
    const [finished, setFinished] = useState(false)
    const [currBlock, setCurrBlock] = useState(props.blockInfo.number)

    if (currBlock != props.blockInfo.number && finished) {
        // we started a new block and need to reset the state
        setTrialInd(0)
        setScreenType("anticipation")
        setIsSummary(false)
        setClickable(props.blockInfo.type == "rating")
        setFinished(false)
        setCurrBlock(props.blockInfo.number)
    }

    console.log("render", props.blockInfo, trialInd, screenType)

    function nextTrial() {
        const screenList = isSummary ? props.summaries : props.trials
        if (trialInd + 1 == screenList.length) {
            if (props.blockInfo.type != "rated" || isSummary) {
                setFinished(true)
            } else {  // move to summary
                setTrialInd(0)
                setScreenType("anticipation")
                setIsSummary(true)
            }
        } else {
            setTrialInd(trialInd + 1)
            setScreenType("anticipation")
            setClickable(props.blockInfo.type == "rating")
        }
    }

    useEffect(() => {

        // edit current screen document
        [1, 2, 3, 4].forEach(e => {
            const elt = document.getElementById("thumb-" + e)
            if (elt != null) {
                elt.disabled = (!clickable)
                if (screenType == "anticipation") {
                    elt.style.color = "black"
                    elt.style.border = "none"
                }
            }
        })
        if (!isSummary && screenType == "feedback" && props.blockInfo.type != "rating" && props.trials[trialInd].score != 0) {
            highlightThumb("thumb-" + props.trials[trialInd].score)
        }

        // move to next screen
        if ((screenType == "anticipation" && props.blockInfo.type != "rating") || screenType == "feedback") {
            // move automatically
            const timer = setTimeout(() => {
                if (screenType == "anticipation") {
                    setScreenType("feedback")
                } else { // can only be feedback
                    if (props.blockInfo.type == "rated" && !isSummary) {
                        setScreenType("interpretation")
                    } else {
                        nextTrial()
                    }
                }
            }, 1000 * timerSecs[screenType])
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer)
        }

    }, [trialInd, screenType, isSummary, clickable])

    function person(p, score = null) {
        const drawX = score != null && screenType == "feedback" && (score == 1 || score == 2)
        const X = (<img src={x} style={{ height: "185px", width: "185px", position: "absolute", top: "7px", left: "35px" }} />)

        const drawRateBox = score != null && screenType == "feedback"
        const makeRateBox = inner => <p style={{ width: "140px", padding: "8px", position: "absolute", top: "104px", left: "47px", backgroundColor: "#3C3C3C", borderRadius: "10px" }}>{inner}</p>
        const rateBox = score == 0 ? makeRateBox("NO RATING PROVIDED") : makeRateBox([<span style={{ fontSize: "larger" }}>Rating: </span>, <span style={{ color: color(score), fontSize: "larger" }}>{score}</span>])

        return (<div style={quadrantStyle}>
            <div style={{ position: "relative", top: "0", left: "0" }}>
                <img src={p.img} style={{ height: "200px", width: "200px", borderRadius: "50%", position: "relative", top: "0", left: "0" }} />
                {drawX ? X : null}
                {drawRateBox ? rateBox : null}
            </div>
            <p style={{ marginTop: 0, fontSize: "smaller" }}>{p.bio}</p>
        </div>)
    }

    function watch(n) {
        return (<div style={quadrantStyle}>
            <img src={eye} style={{ width: "150px" }} />
            {props.blockInfo.type == "watching" ? watchText.withYou(n) : watchText.withoutYou(n)}
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
    }

    function handleThumbClick(e) {
        if (clickable) {
            highlightThumb(e.target.id)
            setClickable(false)
            setScreenType("feedback")
        }
    }

    function handleInterpretationClick(e) {
        nextTrial()
    }

    function watchSummary(n) {
        return (<div style={{ display: "grid", gridTemplateColumns: "auto auto auto", margin: "50px", gap: "10px", alignItems: "center", justifyContent: "center" }}>
            <img src={eye} style={{ width: "200px", height: "100px", marginRight: "20px" }} />
            {watchText.summary(n)}
        </div>)
    }

    function personSummary(p) {
        const drawScore = p.score != null && screenType == "feedback"
        const score = (<p style={{ width: "200px", marginTop: "5px" }}>Average rating: <br /><span style={{ fontSize: "larger", color: color(p.score) }}>{p.score}</span></p>)

        return (<div style={{ textAlign: "center", margin: "20px" }}>
            <img src={p.img} style={{ height: "200px", width: "200px", borderRadius: "50%" }} />
            {drawScore ? score : null}
        </div>)
    }

    if (!finished) {
        if (!isSummary) {
            if (screenType != "interpretation") {
                return (<div style={{ display: "grid", gridTemplateColumns: "auto auto", margin: "30px" }}>
                    {watch(props.trials[trialInd].watching)}
                    {person(props.trials[trialInd].ratee, props.trials[trialInd].score)}
                    {person(props.trials[trialInd].rater)}
                    {rate()}
                </div>)
            } else {
                return (<div style={{ textAlign: "center" }}>
                    {interpretationText}
                    <img src={props.trials[trialInd].rater.img} style={{ height: "250px", width: "250px", borderRadius: "50%", margin: "30px" }} />
                    {slider()}
                    <button style={{ marginTop: "60px" }} onClick={handleInterpretationClick}>Next</button>
                </div>)
            }
        } else {
            return (<div style={{textAlign: "center"}}>
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