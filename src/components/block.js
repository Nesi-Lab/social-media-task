import { useState, useEffect } from "react";
import ReactDOMServer from 'react-dom/server';

import { eye, x, check } from '../assets/imgs';
import { rateText, interpretationText, watchText } from '../assets/text';
import Feeling from './feeling';
import { slider, writeData } from '../lib/utils';
import Instruction from "./instruction";
import { useScreen } from './ScreenContext';

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

const color = (score) => score < 2.5 ? "red" : "green";

function Block({ curr, next, blockInfo, trials, ...rest }) {
    const participant = { img: curr.img, bio: curr.bio, id: "participant" };

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
        document.getElementById("app").style.cursor = (finished || (screenType !== "fixation" && clickable)) ? "auto" : "none";
    }, [clickable, finished, screenType]);

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
        writeData("trials", record, curr.id);

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
        if (screenType === "feedback" && trialsCopy[trialInd].score !== 0) {
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

    function person(p, isRatee, score = null) {
        const drawX = score !== null && screenType === "feedback" && (score === 1 || score === 2);
        const drawCheck = score !== null && screenType === "feedback" && (score === 3 || score === 4);
        const X = (<img src={x} alt="x" className="overlay" />);
        const ch = (<img src={check} alt="check" className="overlay" />);

        const drawRateBox = score !== null && screenType === "feedback";

        return (<div className={isRatee ? "quadrant grid-top grid-right" : "quadrant grid-bottom grid-left"}>
            <div className="person">
                <img src={p.img} style={{ border: drawCheck ? "10px solid " + color(score) : "none", marginTop: drawCheck ? "-10px" : "0px" }} alt={isRatee ? "ratee" : "rater"} className="person-img" id={isRatee ? "ratee-img" : "rater-img"} />
                <div id="X" style={{ display: drawX ? "inline" : "none" }}>{isRatee ? X : null}</div>
                <div id="ch" style={{ display: drawCheck ? "inline" : "none" }}>{isRatee ? ch : null}</div>
                <div id="rateBox" style={{ display: drawRateBox ? "inline" : "none" }}>{isRatee ? rateBox(score) : null}</div>
            </div>
            <p className="person-bio">{p.bio}</p>
        </div>);
    }

    function watch(n) {
        return (<div className="quadrant grid-top grid-left">
            <img src={eye} alt="eye" style={{ width: "150px", margin: "15px 0px 0px 0px"}} />
            {blockInfo.type === "watching" ? watchText.withYou(n) : watchText.withoutYou(n)}
        </div>);
    }

    function rate() {
        const antRat = (blockInfo.type === "rating" && screenType === "anticipation") ? "thumb-anticipation-rating" : "";
        return (<div className="quadrant grid-bottom grid-right">
            {rateText}
            <div className="thumbs">
                <button className={"thumb thumb-down " + antRat} id="thumb-1" key={"1"} onClick={handleThumbClick}>1</button>
                <button className={"thumb thumb-down " + antRat} id="thumb-2" key={"2"} onClick={handleThumbClick}>2</button>
                <button className={"thumb thumb-up " + antRat} id="thumb-3" key={"3"} onClick={handleThumbClick}>3</button>
                <button className={"thumb thumb-up " + antRat} id="thumb-4" key={"4"} onClick={handleThumbClick}>4</button>
            </div>
        </div>);
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
            return (<input type="button" className="calibration" disabled="true" style={{ backgroundColor: "white", marginTop: "365px"}} />);
        } else if (screenType !== "interpretation") {
            return (<div className="reg-block">
                {watch(trialsCopy[trialInd].watching)}
                {person(trialsCopy[trialInd].ratee, true, trialsCopy[trialInd].score)}
                {person(trialsCopy[trialInd].rater, false)}
                {rate()}
            </div>);
        } else {
            return (<div style={{ textAlign: "center" }}>
                {interpretationText}
                <img src={trialsCopy[trialInd].rater.img} alt="rater" className="interpretation-img" />
                {slider("interpretation")}
                <button style={{ marginTop: "60px" }} onClick={handleInterpretationClick}>Next</button>
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