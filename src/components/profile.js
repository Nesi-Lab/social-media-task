import { useState } from "react"
import { useEasybase } from 'easybase-react';

import { profileText, bioQuestions, emojis, makeBio } from '../assets/text'
import { prevNext, slider } from '../lib/utils'

const quadrantStyle = {
    backgroundColor: "#091147",
    borderRadius: "20px",
    padding: "20px",
    margin: "20px",
    marginLeft: "0px"
}

export default function Profile(props) {

    const {
        Frame,
        sync,
        configureFrame,
        updateRecordImage,
        addRecord,
        isUserSignedIn
    } = useEasybase()

    const [screen, setScreen] = useState("uploadPhoto")
    const [participantImg, setParticipantImg] = useState("#")
    const [participantImgScore, setParticipantImgScore] = useState("")
    const [participantBio, setParticipantBio] = useState({})
    const [participantBioScore, setParticipantBioScore] = useState("")

    const reader = new FileReader()

    reader.onload = function (e) {
        setParticipantImg(reader.result)
    }

    function handleUpload(input) {
        if (input.target.files && input.target.files[0]) {
            reader.readAsDataURL(input.target.files[0])
        }
    }

    function handleBio(e) {
        const id = e.target.id
        setParticipantBio({ ...participantBio, [id]: document.getElementById(id).value })
    }

    function handleBioEmoji(e) {
        setParticipantBio({ ...participantBio, emoji: e.target.id })
    }

    function handleUploadToBio(e) {
        setParticipantImgScore(document.getElementById("participantImgScore").value)
        setScreen("bio")
    }

    function handleBioToUpload(e) {
        const bioScore = document.getElementById("participantBioScore")
        if (bioScore) { setParticipantBioScore(bioScore.value) }
        setScreen("uploadPhoto")
    }

    function handleBioToDisplay(e) {
        setParticipantBioScore(document.getElementById("participantBioScore").value)
        setScreen("display")
    }

    async function saveRow(rec) {
        const record = {
            insertAtEnd: true,
            newRecord: rec,
            tableName: "METADATA"
        }
        if (isUserSignedIn()) {
            if (!(await addRecord(record)).success) {
                console.log("failed to add bio records, trying again...")
                console.log(await addRecord(record))
            }
            if (!configureFrame({ tableName: "METADATA" }).success) {
                console.log("failed to configure frame")
            }
            if (!(await sync()).success) { console.log("failed to sync") }
        }
    }

    async function saveImg() {
        if (isUserSignedIn()) {
            if (!configureFrame({ tableName: "METADATA" }).success) {
                console.log("failed to configure frame")
            }
            if (!(await sync()).success) { console.log("failed to sync") }
            const imgRecord = Frame().filter(e => e.name === "participant-img")[0]
            // const imgRecord = { name: "participant-img" }
            const record = {
                attachment: participantImg,
                columnName: "img",
                record: imgRecord,
                tableName: "METADATA"
            }
            if (!(await updateRecordImage(record)).success) {
                console.log("failed to add bio image record, trying again...")
                console.log(await updateRecordImage(record))
            }
            if (!(await sync()).success) { console.log("failed to sync") }
        }
    }

    // useFrameEffect(() => {
    //     console.log("useFrameEffect triggered")
    //     sync()
    //     const rec = {
    //         name: "participant-img",
    //         value: participantImg.toString()
    //     }
    //     console.log(Frame())
    //     if (Frame().includes(rec)) { 
    //         console.log("h")
    //         saveImg(rec) 
    //     }
    // })

    // const rec = {
    //     name: "participant-img",
    //     value: participantImg.toString()
    // }
    // saveImg(rec)


    async function save() {
        const bio = `I'm from ${participantBio.town} ${participantBio.emoji} I love to ${participantBio.activity}`
        props.setParticipantImgTimeline(participantImg)
        props.setParticipantBioTimeline(bio)
        // await saveRow({
        //     name: "participant-img",
        //     value: participantImg.toString()
        // })
        saveImg()
        await saveRow({
            name: "participant-img-score",
            value: participantImgScore
        })
        await saveRow({
            name: "participant-bio",
            value: bio
        })
        await saveRow({
            name: "participant-bio-score",
            value: participantBioScore
        })
    }

    if (screen === "uploadPhoto") {
        return (<div>
            {profileText[0]}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
                <div style={{ ...quadrantStyle, height: "250px", width: "250px" }}>
                    <img id="participantImg" src={participantImg} alt="participant" style={{ height: "250px", width: "250px", borderRadius: "50%", display: participantImg === "#" ? "none" : "inline" }} />
                </div>
                <div>
                    {profileText[1]}
                    <label htmlFor="fileUpload" class="upload">Upload Image</label>
                    <input type='file' id="fileUpload" style={{display: "none"}} onChange={handleUpload} accept="image/png, image/jpeg, image/jpg" />
                </div>
            </div>
            {participantImg === "#" ?
                null :
                <div style={{ textAlign: "center" }}>
                    {profileText[2]}
                    {slider("participantImgScore")}
                    <button style={{ margin: "30px", display: props.next ? "inline" : "none" }} onClick={handleUploadToBio}>Next</button>
                </div>
            }
        </div>)
    } else if (screen === "bio") {
        return (<div>
            {profileText[0]}
            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={quadrantStyle}>
                    {Object.entries(bioQuestions).reduce((a, v) =>
                        (v[0] === "emoji") ?
                            a.concat(emojis.reduce((a1, v1) => [
                                ...a1,
                                ((participantBio.emoji === v1) ?
                                    <input type="radio" id={v1} name="emoji" autoComplete="off" onClick={handleBioEmoji} checked /> :
                                    <input type="radio" id={v1} name="emoji" autoComplete="off" onClick={handleBioEmoji} />),
                                <label htmlFor={v1} style={{ fontSize: "xx-large", marginRight: "10px" }}>{v1}</label>,
                                (v1 === emojis[Math.floor((emojis.length - 1) / 2)]) ? <br /> : null
                            ], [<span>{v[1]}</span>, <br />])) :
                            [
                                ...a,
                                <label htmlFor={v[0]}>{v[1]}</label>, <br />,
                                <input type="text" id={v[0]} autoComplete="off" onInput={handleBio} value={participantBio[v[0]]} />, <br />, <br />
                            ], []
                    )}
                </div>
                <div>
                    {profileText[3]}
                    {Object.keys(bioQuestions).every(e => participantBio.hasOwnProperty(e)) ?
                        (<div style={{ marginTop: "50px" }}>
                            {profileText[4]}
                            <div style={{ textAlign: "center", display: "inline-block", padding: "15px", borderRadius: "10px", border: "2px solid darkgrey" }}>{makeBio(participantBio)}</div>
                        </div>) :
                        null
                    }
                </div>
            </div>
            <div>
                {Object.keys(bioQuestions).every(e => participantBio.hasOwnProperty(e)) ?
                    (<div style={{ textAlign: "center" }}>
                        {profileText[5]}
                        {slider("participantBioScore")}
                    </div>) :
                    null
                }
                <div style={{ textAlign: "center", marginTop: "20px", marginBottom: "50px" }}>
                    <button style={{ margin: "5px" }} onClick={handleBioToUpload}>Previous</button>
                    {Object.keys(bioQuestions).every(e => participantBio.hasOwnProperty(e)) ?
                        (<button style={{ margin: "30px", display: props.next ? "inline" : "none" }} onClick={handleBioToDisplay}>Next</button>) :
                        null
                    }
                </div>
            </div>
        </div>)
    } else {  // display
        return (<div style={{ textAlign: "center" }}>
            {profileText[6]}
            <div style={{ ...quadrantStyle, marginRight: "0px" }}>
                <img id="participantImg" src={participantImg} alt="participant" style={{ height: "250px", width: "250px", borderRadius: "50%" }} />
                <p style={{ margin: "0px", fontSize: "smaller" }}>{makeBio(participantBio)}</p>
            </div>
            {prevNext({ ...props, prev: (_) => setScreen("bio") }, save)}
        </div>)
    }
}