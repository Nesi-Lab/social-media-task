import { useState, useEffect } from "react"

import { eye } from '../assets/imgs'
import { watchText, beforeSummaryText } from '../assets/text'
import Feeling from './feeling'
import { writeData } from '../lib/utils'

const timerSecs = {
    "anticipation": 3,
    "feedback": 6,
    "loading": 2
}

const color = (score) => score < 2.5 ? "red" : "green"

export default function Summary(allProps) {
    const props = allProps.props
    const participant = { img: allProps.curr.img, bio: allProps.curr.bio, id: "participant" }
    props.summaries = props.summaries.map(e => {
        return {
            participant: { img: participant.img, score: e.participant.score },
            left: e.left, right: e.right, watching: e.watching
        }
    })


    const [trialInd, setTrialInd] = useState(0)
    const [screenType, setScreenType] = useState("loading")
    const [finished, setFinished] = useState(false)
    const [currBlock, setCurrBlock] = useState(props.blockInfo.number)

    if (currBlock !== props.blockInfo.number && finished) {
        // we started a new block and need to reset the state
        setTrialInd(0)
        setScreenType("anticipation")
        setFinished(false)
        setCurrBlock(props.blockInfo.number)
    }

    function blockDescription() {
        return {
            type: props.blockInfo.type,
            block: props.blockInfo.number,
            round: [props.blockInfo.gender, props.blockInfo.majority].filter(e => e).join("-"),
            trial: trialInd + 1,
            "rater-left-id": props.summaries[trialInd].left.id,
            "rater-right-id": props.summaries[trialInd].right.id,
            "num-watching": props.trials[trialInd].watching
        }
    }

    function nextTrial() {
        writeData("trials", blockDescription(), allProps.curr.id)
        console.log(blockDescription())

        if (trialInd + 1 === props.summaries.length) {
            setFinished(true)
        } else {
            setTrialInd(trialInd + 1)
            setScreenType("anticipation")
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (screenType === "loading") {
                setScreenType("anticipation")
            } if (screenType === "anticipation") {
                setScreenType("feedback")
            } else { // can only be feedback
                nextTrial()
            }
        }, 1000 * timerSecs[screenType])
        // Clear timeout if the component is unmounted
        return () => clearTimeout(timer)
    }, [trialInd, screenType])

    function watchSummary(n) {
        return (<div className="watch-summary">
            <img src={eye} alt="eye" className="summary-eye" />
            {watchText.summary(n)}
        </div>)
    }

    function personSummary(p) {
        const drawScore = p.score !== null && screenType === "feedback"
        const score = (<p className="summary-score">Average rating: <br /><span style={{ fontSize: "larger", color: color(p.score) }}>{p.score}</span></p>)

        return (<div className="summary-person">
            <img src={p.img} alt="person summary" className="summary-person-img" />
            {drawScore ? score : null}
        </div>)
    }

    if (screenType === "loading") {
        return beforeSummaryText[1]
    } else if (!finished) {
        return (<div style={{ textAlign: "center" }}>
            {watchSummary(props.summaries[trialInd].watching)}
            <div className="summary">
                {personSummary(props.summaries[trialInd].left)}
                {personSummary(props.summaries[trialInd].participant)}
                {personSummary(props.summaries[trialInd].right)}
            </div>
        </div>)
    } else {
        return <Feeling loc={"after block " + JSON.stringify(props.blockInfo)} next={allProps.next} curr={allProps.curr} />
    }

}