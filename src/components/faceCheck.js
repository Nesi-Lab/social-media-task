import { useEffect, useState } from 'react'
import * as text from '../assets/text'
import { prevNext } from '../lib/utils'

export default function FaceCheck(props) {

    const [vidUp, setVidUp] = useState(false)
    const [dummyCounter, setDummyCounter] = useState(0)

    useEffect(() => {
        props.curr.wg.setScreen("facecheck")
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
        return text.loadingText
    } else {
        return (<div>
            {text["faceCheckText"]}
            <div>{prevNext(props, save)}</div>
        </div>)
    }
}