import { useEffect } from 'react'
import * as text from '../assets/text'
import { prevNext } from '../lib/utils'

export default function FaceCheck(props) {

    async function save() {
        props.curr.wg.showVideo(false)
    }

    useEffect(() => {
        props.curr.wg.showVideo(true).showFaceOverlay(false)
        const vid = document.getElementById("webgazerVideoContainer")
        if (vid) {
            vid.style.position = "relative"
            vid.style.left = "calc(50% - 160px)"
            document.getElementById("webgazerFaceFeedbackBox").style.position = "absolute"
        }
    })

    return (<div>
        {text["faceCheckText"]}
        <div>{prevNext(props, save)}</div>
    </div>)
}