import { useEffect, useState } from 'react';
import * as text from '../assets/text';
import { prevNext } from '../lib/utils';
import { useWebgazer } from './WebgazerContext';
import { useScreen } from './ScreenContext';

export default function FaceCheck(props) {

    const [vidUp, setVidUp] = useState(false);
    const [dummyCounter, setDummyCounter] = useState(0);
    const wg = useWebgazer();
    const { setScreen } = useScreen();

    useEffect(() => {
        setScreen("facecheck");
    }, []);

    async function save() {
        wg.showVideo(false).showFaceFeedbackBox(false);
    }

    useEffect(() => {
        wg.showVideo(true); // .showFaceFeedbackBox(true).showFaceOverlay(false).showFaceFeedbackBox(true)
        const vid = document.getElementById("webgazerVideoFeed"); // , box = document.getElementById("webgazerFaceFeedbackBox")
        if (vid) {
            setVidUp(true);
            // vid.style.position = "relative"
            vid.style.top = "50%";
            vid.style.left = "calc(50% - 160px)";
            // box.style.left = "calc(50% - 80px)"
            // box.style.top = "calc(50% + 40px)"
        } else {
            setDummyCounter(dummyCounter + 1);
        }
    }, [dummyCounter, wg]);

    if (!vidUp) {
        return (<div>
            {text.loadingText}
            <details style={{ margin: "50px" }}>
                <summary>Click here for other options</summary>
                <p>We're waiting for the eye tracking software to load. Do you want to continue the game without it?</p>
                {<div>{prevNext(props, save)}</div>}
            </details>
        </div>);
    } else {
        return (<div style={{ margin: 'auto' }}>
            {text["faceCheckText"]}
            <div>{prevNext(props, save)}</div>
        </div>);
    }
}
