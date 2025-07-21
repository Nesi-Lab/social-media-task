import { useState, useEffect } from "react";

import { eye } from '../assets/imgs';
import { watchText, beforeSummaryText } from '../assets/text';
import Feeling from './feeling';
import { writeData } from '../lib/utils';
import { useScreen } from './ScreenContext';
import { useParticipant } from './ParticipantContext';

const timerSecs = {
    "anticipation": 3,
    "feedback": 6,
    "loading": 2,
    "fixation": 0.5
};

const color = (score) => score < 2.5 ? "red" : "green";

export default function Summary({ curr, next, blockInfo, summaries, trials, ...rest }) {
    const { participantId } = useParticipant();
    const participant = { img: curr.img, bio: curr.bio, id: "participant" };
    const summariesCopy = summaries.map(e => {
        return {
            participant: { img: participant.img, score: e.participant.score },
            left: e.left, right: e.right, watching: e.watching
        };
    });

    const [trialInd, setTrialInd] = useState(0);
    const [screenType, setScreenType] = useState("loading");
    const [finished, setFinished] = useState(false);
    const [currBlock, setCurrBlock] = useState(blockInfo.number);

    const { setScreen } = useScreen();

    useEffect(() => {
        setScreen(`summary ${blockInfo.number} trial 1 loading`);
    }, []);

    if (currBlock !== blockInfo.number && finished) {
        // we started a new block and need to reset the state
        setTrialInd(0);
        setScreenType("loading");
        setFinished(false);
        setCurrBlock(blockInfo.number);
    }

    function blockDescription() {
        return {
            type: "summary",
            block: blockInfo.number,
            subnum: blockInfo.subnum,
            majority: blockInfo.majority,
            trial: trialInd + 1,
            rater_id: JSON.stringify({left: summariesCopy[trialInd].left.id, right: summariesCopy[trialInd].right.id}),
            num_watching: trials[trialInd].watching
        };
    }

    function nextTrial() {
        writeData("trials", blockDescription(), participantId);
        if (trialInd + 1 === summariesCopy.length) {
            setFinished(true);
        } else {
            setScreen(`summary ${blockInfo.number} trial ${trialInd + 2} loading`);
            setTrialInd(trialInd + 1);
            setScreenType("loading");
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (screenType === "loading") {
                setScreenType("fixation");
                setScreen(`summary ${blockInfo.number} trial ${trialInd + 1} fixation`);
            } else if (screenType === "anticipation") {
                setScreenType("feedback");
                setScreen(`summary ${blockInfo.number} trial ${trialInd + 1} feedback`);
            } else if (screenType === "feedback") {
                nextTrial();
            } else { // can only be fixation
                setScreenType("anticipation");
                setScreen(`summary ${blockInfo.number} trial ${trialInd + 1} anticipation`);
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
        return (<div style={{ textAlign: "center" }}>
            {watchSummary(summariesCopy[trialInd].watching)}
            <div className="summary">
                {personSummary(summariesCopy[trialInd].left)}
                {personSummary(summariesCopy[trialInd].participant)}
                {personSummary(summariesCopy[trialInd].right)}
            </div>
        </div>);
    } else {
        return <Feeling loc={"after block " + JSON.stringify(blockInfo)} next={next} curr={curr} />;
    }

}