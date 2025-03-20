import { useState, useEffect } from "react";

import { eye } from '../assets/imgs';
import { watchText, beforeSummaryText } from '../assets/text';
import Feeling from './feeling';
import { writeData } from '../lib/utils';

const timerSecs = {
    "anticipation": 3,
    "feedback": 6,
    "loading": 2,
    "fixation": 0.5
};

const color = (score) => score < 2.5 ? "red" : "green";

export default function Summary(allProps) {
    const props = allProps.props;
    const participant = { img: allProps.curr.img, bio: allProps.curr.bio, id: "participant" };
    props.summaries = props.summaries.map(e => {
        return {
            participant: { img: participant.img, score: e.participant.score },
            left: e.left, right: e.right, watching: e.watching
        };
    });

    const [trialInd, setTrialInd] = useState(0);
    const [screenType, setScreenType] = useState("loading");
    const [finished, setFinished] = useState(false);
    const [currBlock, setCurrBlock] = useState(props.blockInfo.number);

    useEffect(() => {
        allProps.curr.wg.screen.screen = `summary ${props.blockInfo.number} trial 1 loading`;
    }, []);

    if (currBlock !== props.blockInfo.number && finished) {
        // we started a new block and need to reset the state
        setTrialInd(0);
        setScreenType("loading");
        setFinished(false);
        setCurrBlock(props.blockInfo.number);
    }

    function blockDescription() {
        return {
            type: "summary",
            block: props.blockInfo.number,
            subnum: props.blockInfo.subnum,
            majority: props.blockInfo.majority,
            trial: trialInd + 1,
            rater_id: JSON.stringify({left: props.summaries[trialInd].left.id, right: props.summaries[trialInd].right.id}),
            num_watching: props.trials[trialInd].watching
        };
    }

    function nextTrial() {
        writeData("trials", blockDescription(), allProps.curr.id);
        console.log(blockDescription());

        if (trialInd + 1 === props.summaries.length) {
            setFinished(true);
        } else {
            setTrialInd(trialInd + 1);
            setScreenType("fixation");
            allProps.curr.wg.screen.screen = `summary ${props.blockInfo.number} trial ${trialInd + 1 + 1} fixation`;
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (screenType === "loading") {
                setScreenType("fixation");
                allProps.curr.wg.screen.screen = `summary ${props.blockInfo.number} trial ${trialInd + 1} fixation`;
            } else if (screenType === "anticipation") {
                setScreenType("feedback");
                allProps.curr.wg.screen.screen = `summary ${props.blockInfo.number} trial ${trialInd + 1} feedback`;
            } else if (screenType === "feedback") {
                nextTrial();
            } else { // can only be fixation
                setScreenType("anticipation");
                allProps.curr.wg.screen.screen = `summary ${props.blockInfo.number} trial ${trialInd + 1} anticipation`;
            }
        }, 1000 * timerSecs[screenType]);
        // Clear timeout if the component is unmounted
        return () => clearTimeout(timer);
    }, [trialInd, screenType]);

    useEffect(() => {
        document.getElementById("app").style.cursor = finished ? "auto" : "none";
    });

    function watchSummary(n) {
        return (<div className="watch-summary">
            <img src={eye} alt="eye" className="summary-eye" />
            {watchText.summary(n)}
        </div>);
    }

    function personSummary(p) {
        const drawScore = p.score !== null && screenType === "feedback";
        const score = (<p className="summary-score">Average rating: <br /><span style={{ fontSize: "larger", color: color(p.score) }}>{p.score}</span></p>);

        return (<div className="summary-person">
            <img src={p.img} alt="person summary" className="summary-person-img" />
            {drawScore ? score : null}
        </div>);
    }

    if (screenType === "loading") {
        return beforeSummaryText[1];
    } else if (screenType === "fixation") {
        return (<input type="button" className="calibration" disabled="true" style={{ backgroundColor: "white", marginTop: "365px"}} />);
    } else if (!finished) {
        console.log(props.summaries[trialInd]);
        return (<div style={{ textAlign: "center" }}>
            {watchSummary(props.summaries[trialInd].watching)}
            <div className="summary">
                {personSummary(props.summaries[trialInd].left)}
                {personSummary(props.summaries[trialInd].participant)}
                {personSummary(props.summaries[trialInd].right)}
            </div>
        </div>);
    } else {
        return <Feeling loc={"after block " + JSON.stringify(props.blockInfo)} next={allProps.next} curr={allProps.curr} />;
    }

}