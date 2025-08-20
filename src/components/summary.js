import { useState, useEffect } from "react";

import { beforeSummaryText } from '../assets/text';
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
    const { participantId, img: participantImg, bio: participantBio } = useParticipant();
    const participant = { img: participantImg, bio: participantBio, id: "participant" };

    // Safety check for undefined summaries and trials - provide defaults
    const safeSummaries = summaries || [];
    const safeTrials = trials || [];

    const summariesCopy = safeSummaries.map(e => {
        return {
            participant: { img: participant.img, score: e.participant.score },
            raters: e.raters, watching: e.watching
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
            rater_id: JSON.stringify({ raters: summariesCopy[trialInd].raters.slice(0, 8).map(r => r.id) }),
            num_watching: safeTrials[trialInd]?.watching || 0
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

    function personSummary(p) {
        const drawScore = p.score !== null;
        const score = (<p className="summary-score">Average rating: <br /><span style={{ fontSize: "larger", color: color(p.score) }}>{p.score}</span></p>);

        return (<div className="summary-person">
            <img src={p.img} alt="person summary" className="summary-person-img" />
            {drawScore ? score : null}
        </div>);
    }

    function renderGrid() {
        const raters = summariesCopy[trialInd].raters;
        const participant = summariesCopy[trialInd].participant;

        // Take first 8 raters for the 3x3 grid (8 others + 1 participant in center)
        const selectedRaters = raters.slice(0, 8);

        // Create 3x3 grid with participant in center (position 4)
        const grid = [
            selectedRaters[0], selectedRaters[1], selectedRaters[2],
            selectedRaters[3], participant, selectedRaters[4],
            selectedRaters[5], selectedRaters[6], selectedRaters[7]
        ];

        return (
            <div className="summary-grid">
                {grid.map((person, index) => (
                    <div key={index} className="summary-grid-item">
                        {personSummary(person)}
                    </div>
                ))}
            </div>
        );
    }

    if (screenType === "loading") {
        return beforeSummaryText[1];
    } else if (screenType === "fixation") {
        return (<input type="button" className="calibration" disabled="true" style={{ backgroundColor: "white", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />);
    } else if (!finished && summariesCopy.length > 0) {
        return (<div style={{ textAlign: "center" }}>
            {renderGrid()}
        </div>);
    } else if (!finished && summariesCopy.length === 0) {
        // No summaries to show, skip to next
        setFinished(true);
        return null;
    } else {
        return <Feeling loc={"after block " + JSON.stringify(blockInfo)} next={next} curr={curr} />;
    }

}
