import { useEffect, useState } from 'react'
import * as text from '../assets/text'
import { prevNext } from '../lib/utils'

export default function FaceCheck(props) {

    const [vidUp, setVidUp] = useState(false)
    const [dummyCounter, setDummyCounter] = useState(0)

    useEffect(() => {
        props.curr.wg.screen.screen = "facecheck"
    }, [])

    async function save() {
        props.curr.wg.wg.showVideo(false)
    }

    useEffect(() => {
        props.curr.wg.wg.showVideo(true).showFaceOverlay(false)
        const vid = document.getElementById("webgazerVideoContainer")
        if (vid) {
            setVidUp(true)
            vid.style.position = "relative"
            vid.style.left = "calc(50% - 160px)"
            document.getElementById("webgazerFaceFeedbackBox").style.position = "absolute"
        } else {
            setDummyCounter(dummyCounter + 1)
        }
    })

    if (!vidUp) {
        return (<div>
            {text.loadingText}
            <details style={{margin: "50px"}}>
                <summary>Click here for other options</summary>
                <p>We're waiting for the eye tracking software to load. Do you want to continue the game without it?</p>
                {<div>{prevNext(props, save)}</div>}
            </details>
        </div>)
    } else {
        return (<div>
            {text["faceCheckText"]}
            <div>{prevNext(props, save)}</div>
        </div>)
    }
}