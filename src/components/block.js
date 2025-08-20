import { useState, useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';

import { eye, x, check } from '../assets/imgs';
import { rateText, interpretationText, watchText } from '../assets/text';
import Feeling from './feeling';
import { slider, writeData, prevNext } from '../lib/utils';
import Instruction from "./instruction";
import { useScreen } from './ScreenContext';
import { useParticipant } from './ParticipantContext';

const positionClassMap = {
    'top-left': 'quadrant grid-top grid-left',
    'top-right': 'quadrant grid-top grid-right',
    'bottom-left': 'quadrant grid-bottom grid-left',
    'bottom-right': 'quadrant grid-bottom grid-right',
};
function BlockQuadrant({ position, children }) {
    return (
        <div className={positionClassMap[position] || 'quadrant'}>
            {children}
        </div>
    );
}

function WatchQuadrant({ n, blockInfo }) {
    return (
        <>
            <div style={{ height: "105px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                    src={eye}
                    alt="eye"
                    className="eye-icon"
                    style={{ margin: "15px 0px 0px 0px" }}
                />
            </div>
            {blockInfo.type === "watching" ? watchText.withYou(n) : watchText.withoutYou(n)}
        </>
    );
}

const color = (score) => score < 2.5 ? "red" : "green";
// Add a pill style for bio items (copied from profile.js)
const bioPillStyle = {
    display: 'inline-block',
    background: 'white',
    color: 'black',
    borderRadius: '6px', // much less rounded
    padding: '2px 8px', // boxier
    margin: '2px',
    fontWeight: 500,
    fontSize: '1.2rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
};

function BioPillsFromString({ bioString }) {
    if (!bioString) return null;
    // If it's an object, use its values; otherwise, split the string
    let items = [];
    let emoji = null;
    if (typeof bioString === 'object') {
    // Assume keys are word, activity, place, artist, color, emoji
        const { word, activity, place, artist, color, emoji: emj } = bioString;
        items = [word, activity, place, artist, color].map(v => v && String(v).trim()).filter(Boolean);
        if (emj) emoji = String(emj).trim();
    } else {
        const bio = String(bioString);
        items = bio.split('|').map(s => s.trim()).filter(Boolean);
        if (items.length > 0) {
            const last = items[items.length - 1];
            const match = last.match(/^(.*?)(\p{Emoji}+)$/u);
            if (match) {
                items[items.length - 1] = match[1].trim();
                emoji = match[2];
            } else if (/^\p{Emoji}+$/u.test(last)) {
                emoji = items.pop();
            }
        }
    }
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '2px', maxWidth: 350, margin: '0 auto', rowGap: '6px' }}>
            {items.map((item, i) => (
                <span key={i} style={bioPillStyle}>{item}</span>
            ))}
            {emoji && <span key="emoji" style={bioPillStyle}>{emoji}</span>}
        </div>
    );
}

function PersonQuadrant({ p, isRatee, score = null, screenType }) {
    const drawX = score !== null && screenType === "feedback" && (score === 1 || score === 2);
    const drawCheck = score !== null && screenType === "feedback" && (score === 3 || score === 4);
    const X = (<img src={x} alt="x" className="overlay" />);
    const ch = (<img src={check} alt="check" className="overlay" />);
    const drawRateBox = score !== null && screenType === "feedback";
    const rateBox = (score) => {
        const makeRateBox = inner => <p className="rate-box">{inner}</p>;
        return score === 0 ?
            makeRateBox(<span style={{ fontSize: "large" }}>NO RATING PROVIDED</span>) :
            makeRateBox([
                <span style={{ fontSize: "larger" }}>Rating: </span>,
                <span style={{ color: color(score), fontSize: "larger" }}>{score}</span>
            ]);
    };
    return (
        <>
            <div className="person" style={{ position: "relative" }}>
                <div style={{ width: 200, height: 200, position: "relative", margin: "0 auto" }}>
                    <img
                        src={p.img}
                        width={200}
                        height={200}
                        style={{
                            border: drawCheck ? "10px solid " + color(score) : "none",
                            marginTop: drawCheck ? "-10px" : "0px",
                            objectFit: "cover",
                            width: "200px",
                            height: "200px",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            display: "block"
                        }}
                        alt={isRatee ? "ratee" : "rater"}
                        className="person-img"
                        id={isRatee ? "ratee-img" : "rater-img"}
                    />
                </div>
                <div id="X" style={{ display: drawX ? "inline" : "none" }}>{isRatee ? X : null}</div>
                <div id="ch" style={{ display: drawCheck ? "inline" : "none" }}>{isRatee ? ch : null}</div>
                <div id="rateBox" style={{ display: drawRateBox ? "inline" : "none" }}>{isRatee ? rateBox(score) : null}</div>
            </div>
            <div className="person-bio"><BioPillsFromString bioString={p.bio} /></div>
        </>
    );
}

export { PersonQuadrant };

function RateQuadrant({ blockInfo, screenType, handleThumbClick, clickable }) {
    const antRat = (blockInfo.type === "rating" && screenType === "anticipation") ? "thumb-anticipation-rating" : "";
    return (
        <>
            {rateText}
            <div className="thumbs">
                <button className={"thumb thumb-down " + antRat} id="thumb-1" key={"1"} onClick={handleThumbClick} disabled={!clickable}>1</button>
                <button className={"thumb thumb-down " + antRat} id="thumb-2" key={"2"} onClick={handleThumbClick} disabled={!clickable}>2</button>
                <button className={"thumb thumb-up " + antRat} id="thumb-3" key={"3"} onClick={handleThumbClick} disabled={!clickable}>3</button>
                <button className={"thumb thumb-up " + antRat} id="thumb-4" key={"4"} onClick={handleThumbClick} disabled={!clickable}>4</button>
            </div>
        </>
    );
}

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
};

function Block({ curr, next, blockInfo, trials, ...rest }) {
    const { participantId, img, bio } = useParticipant();
    const participant = { img, bio, id: "participant" };

    // add participant into props where appropriate
    let trialsCopy = trials;
    if (blockInfo.type === "rating") {
        trialsCopy = trials.map(e => { return { ...e, rater: participant }; });
    } else if (blockInfo.type === "rated") {
        trialsCopy = trials.map(e => { return { ...e, ratee: participant }; });
    }

    const [trialInd, setTrialInd] = useState(0);
    const [screenType, setScreenType] = useState("fixation");
    const [clickable, setClickable] = useState(blockInfo.type === "rating");
    const [finished, setFinished] = useState(false);
    const [currBlock, setCurrBlock] = useState(blockInfo.number);
    const [selectedThumb, setSelectedThumb] = useState(null);  // just for logging interactive (i.e. rating) scores

    const { setScreen } = useScreen();

    useEffect(() => {
        setScreen(`block ${blockInfo.number} trial 1 fixation`);
    }, []);

    useEffect(() => {
        document.getElementById("app").style.cursor = "auto";
    }, [clickable, finished, screenType]);

    // Note: All images are now preloaded at the beginning of the task when webgazer initializes
    // This provides much better performance and eliminates image pop-in effects

    if (currBlock !== blockInfo.number && finished) {
        // we started a new block and need to reset the state
        setTrialInd(0);
        setScreenType("fixation");
        setScreen(`block ${blockInfo.number} trial 1 fixation`);
        setClickable(blockInfo.type === "rating");
        setFinished(false);
        setCurrBlock(blockInfo.number);
    }

    function nextTrial(interpretationScore = null) {
        const record = {
            type: blockInfo.type,
            block: blockInfo.number,
            subnum: blockInfo.subnum,
            majority: blockInfo.majority,
            trial: trialInd + 1,
            rater_id: trialsCopy[trialInd].rater.id,
            ratee_id: trialsCopy[trialInd].ratee.id,
            num_watching: trialsCopy[trialInd].watching,
            score: (blockInfo.type === "rating") ? selectedThumb : trialsCopy[trialInd].score
        };
        if (interpretationScore) { record["interpretation_score"] = interpretationScore; }
        writeData("trials", record, participantId);

        if (trialInd + 1 === trialsCopy.length) {
            setFinished(true);
        } else {
            setScreen(`block ${blockInfo.number} trial ${trialInd + 1 + 1} fixation`);
            setTrialInd(trialInd + 1);
            setScreenType("fixation");
            setClickable(blockInfo.type === "rating");
        }
    }

    useEffect(() => {
        // edit current screen document
        [1, 2, 3, 4].forEach(e => {
            const elt = document.getElementById("thumb-" + e);
            if (elt !== null) {
                elt.disabled = (!clickable);
                if (screenType === "anticipation") {
                    elt.style.color = "black";
                    elt.style.border = "none";
                }
            }
        });
        if (screenType === "anticipation") {
            ["X", "ch", "rateBox"].forEach(e => {
                const elt = document.getElementById(e);
                if (elt !== null) { elt.style.display = "none"; }
            });
        }
        if (screenType === "feedback" && blockInfo.type !== "rating" && trialsCopy[trialInd].score !== 0) {
            highlightThumb("thumb-" + trialsCopy[trialInd].score);
        }

        // move to next screen
        if ((screenType === "anticipation" && blockInfo.type !== "rating") || screenType === "feedback" || screenType === "fixation") {
            // move automatically
            const timer = setTimeout(() => {
                if (screenType === "anticipation") {
                    setScreenType("feedback");
                    setScreen(`block ${blockInfo.number} trial ${trialInd + 1} feedback`);
                } else if (screenType === "feedback") {
                    const ratee = document.getElementById("ratee-img");
                    if (ratee !== null) {
                        ratee.style.border = "none";
                        ratee.style.marginTop = "0px";
                    }
                    if (blockInfo.type === "rated") {
                        setScreenType("interpretation");
                        setClickable("true");
                        setScreen(`block ${blockInfo.number} trial ${trialInd + 1} interpretation`);
                    } else {
                        nextTrial();
                    }
                } else {  // can only be fixation
                    setScreenType("anticipation");
                    setScreen(`block ${blockInfo.number} trial ${trialInd + 1} anticipation`);
                }
            }, 1000 * timerSecs[blockInfo.type][screenType]);
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer);
        }
    }, [trialInd, screenType, clickable]);

    function rateBox(score) {
        const makeRateBox = inner => <p className="rate-box">{inner}</p>;
        return score === 0 ?
            makeRateBox(<span style={{ fontSize: "large" }}>NO RATING PROVIDED</span>) :
            makeRateBox([<span style={{ fontSize: "larger" }}>Rating: </span>, <span style={{ color: color(score), fontSize: "larger" }}>{score}</span>]);
    }

    function highlightThumb(id) {
        const score = id.split("-")[1];
        const style = document.getElementById(id).style;
        style.color = color(score);
        style.border = "2px solid #6a6d80";
        setSelectedThumb(score);
    }

    function handleThumbClick(e) {
        if (clickable) {
            highlightThumb(e.target.id);
            const score = parseInt(e.target.id.split("-")[1]);
            if (score === 1 || score === 2) {
                document.getElementById("X").style.display = "inline";
            } else {
                document.getElementById("ratee-img").style.border = "10px solid " + color(score);
                document.getElementById("ratee-img").style.marginTop = "-10px";
                document.getElementById("ch").style.display = "inline";
            }
            document.getElementById("rateBox").style.display = "inline";
            document.getElementById("rateBox").innerHTML = ReactDOMServer.renderToString(rateBox(score));
            setClickable(false);
            setScreenType("feedback");
            setScreen(`block ${blockInfo.number} trial ${trialInd + 1} feedback`);
        }
    }

    function handleInterpretationClick(e) {
        nextTrial(document.getElementById("interpretation").value);
    }

    console.log({
        type: blockInfo.type,
        block: blockInfo.number,
        subnum: blockInfo.subnum,
        majority: blockInfo.majority,
        trial: trialInd + 1,
        rater_id: trialsCopy[trialInd].rater.id,
        ratee_id: trialsCopy[trialInd].ratee.id,
        num_watching: trialsCopy[trialInd].watching
    });

    if (!finished) {
        if (screenType === "fixation") {
            return (<input type="button" className="calibration" disabled="true" style={{ backgroundColor: "white", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />);
        } else if (screenType !== "interpretation") {
            return (
                <div className="reg-block">
                    <BlockQuadrant position="top-left">
                        <WatchQuadrant n={trialsCopy[trialInd].watching} blockInfo={blockInfo} />
                    </BlockQuadrant>
                    <BlockQuadrant position="top-right">
                        <PersonQuadrant p={trialsCopy[trialInd].ratee} isRatee={true} score={trialsCopy[trialInd].score} screenType={screenType} />
                    </BlockQuadrant>
                    <BlockQuadrant position="bottom-left">
                        <PersonQuadrant p={trialsCopy[trialInd].rater} isRatee={false} screenType={screenType} />
                    </BlockQuadrant>
                    <BlockQuadrant position="bottom-right">
                        <RateQuadrant blockInfo={blockInfo} screenType={screenType} handleThumbClick={handleThumbClick} clickable={clickable} />
                    </BlockQuadrant>
                </div>
            );
        } else {
            return (<div style={{ textAlign: "center" }}>
                {interpretationText}
                <img src={trialsCopy[trialInd].rater.img} alt="rater" className="interpretation-img" />
                {slider("interpretation")}
                {prevNext({ ...rest, curr, prev: undefined, next: () => handleInterpretationClick(document.getElementById("interpretation").value) })}
            </div>);
        }
    } else {
        if (blockInfo.type === "rated") {
            return <Instruction id="beforeSummaryText" ind="0" next={next} curr={curr} />;
        } else {
            return <Feeling loc={"after block " + JSON.stringify(blockInfo)} next={next} curr={curr} />;
        }
    }
}

export default Block;
