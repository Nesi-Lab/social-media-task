import { useState, useEffect } from "react"
import { useEasybase } from 'easybase-react';

import { profileText } from '../assets/text'
import { prevNext, slider } from '../lib/utils'

export default function ProfileImg(props) {

    const {
        Frame,
        sync,
        configureFrame,
        updateRecordImage
    } = useEasybase()

    const [participantImg, setParticipantImg] = useState("#")
    const reader = new FileReader();

    reader.onload = function (e) {
        setParticipantImg(reader.result)
    }

    function upload(input) {
        if (input.target.files && input.target.files[0]) {
            reader.readAsDataURL(input.target.files[0])
            // updateRecordImage({
            //     attachment: input.target.files[0],
            //     tableName: "METADATA",
            //     columnName: "img",
            //     record: null
            // })
        }
    }

    async function save() {
        props.setParticipantImg(participantImg)
        console.log("saved participant img")
    }

    // async function save() {
    //     const checked = Object.keys(socialMediaImgs).filter(
    //         e => document.getElementById(e).checked
    //     )
    //     addOrUpdateTable("METADATA", "name", { name: "social-medias", value: checked.join(",") }, eb)
    //     console.log("h", Frame())
    // }

    return (<div>
        {profileText[0]}
        <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ marginRight: "15px", marginTop: "15px" }}>
                <img id="participantImg" src={participantImg} style={{ height: "250px", width: "250px", borderRadius: "50%", display: participantImg == "#" ? "none" : "inline" }} />
                <input type='file' onChange={upload} accept="image/png, image/jpeg, image/jpg" />
            </div>
            <div>
                {profileText[1]}
                {participantImg == "#" ? null : profileText[2]}
                {participantImg == "#" ? null : slider()}
            </div>
        </div>
        {participantImg == "#" ? null : prevNext(props, save)}
    </div>)
}