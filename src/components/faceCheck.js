import { useEffect } from 'react'
import * as text from '../assets/text'
import { prevNext } from '../lib/utils'

export default function FaceCheck(props) {

    async function save() {
        props.curr.wg.showVideo(false)
        props.curr.wgLogs.push({ timestamp: Date.now(), id: "end-face-check" })
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

    useEffect(() => {
        props.curr.wgLogs.push({ timestamp: Date.now(), id: "start-face-check" })
    }, [])

    return (<div>
        {text["faceCheckText"]}
        <div>{prevNext(props, save)}</div>
    </div>)
}