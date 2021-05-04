import { useState, useEffect } from "react"

import { profileText, bioQuestions, emojis, makeBio, makeBioPlain } from '../assets/text'
import { prevNext, slider, writeData } from '../lib/utils'

export default function Profile(props) {

    const [screen, setScreen] = useState("uploadPhoto")
    const [participantImg, setParticipantImg] = useState("#")
    const [participantImgScore, setParticipantImgScore] = useState("")
    const [participantBio, setParticipantBio] = useState({})

    useEffect(() => {
        props.curr.wg.setScreen(`profile uploadPhoto`)
    }, [])

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
        setParticipantBio({ ...participantBio, [id]: document.getElementById(id).value.toLowerCase() })
    }

    function handleBioEmoji(e) {
        setParticipantBio({ ...participantBio, emoji: e.target.id })
    }

    function handleUploadToBio(e) {
        setParticipantImgScore(document.getElementById("participantImgScore").value)
        setScreen("bio")
        props.curr.wg.setScreen(`profile bio`)
    }

    function handleBioToUpload(e) {
        setScreen("uploadPhoto")
        props.curr.wg.setScreen(`profile uploadPhoto`)
    }

    function handleBioToDisplay(e) {
        setScreen("display")
        props.curr.wg.setScreen(`profile display`)
    }

    function handleDisplayToBio(e) {
        setScreen("bio")
        props.curr.wg.setScreen(`profile uploadPhoto`)
    }

    async function saveRow(rec) {
        writeData("metadata", rec, props.curr.id)
    }


    async function save() {
        const bio = makeBioPlain(participantBio)
        props.setParticipantImgTimeline(participantImg)
        props.setParticipantBioTimeline(makeBio(participantBio))
        await saveRow({
            name: "participant-img-score",
            value: participantImgScore.toString(),
        })
        await saveRow({
            name: "participant-bio",
            value: bio,
        })
        await saveRow({
            name: "participant-bio-score",
            value: document.getElementById("participantBioScore").value,
        })
    }

    if (screen === "uploadPhoto") {
        return (<div>
            {profileText[0]}
            <div className="upload">
                <div className="profile-quadrant quadrant-square">
                    <img id="participantImg" src={participantImg} alt="participant" style={{ height: "250px", width: "250px", borderRadius: "50%", display: participantImg === "#" ? "none" : "inline" }} />
                </div>
                <div>
                    {profileText[1]}
                    <label htmlFor="fileUpload" className="upload-button">Upload Image</label>
                    <input type='file' id="fileUpload" style={{ display: "none" }} onChange={handleUpload} accept="image/png, image/jpeg, image/jpg" />
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
            <div className="bio-screen">
                <div className="profile-quadrant">
                    {Object.entries(bioQuestions).reduce((a, v) =>
                        (v[0] === "emoji") ?
                            a.concat(emojis.reduce((a1, v1) => [
                                ...a1,
                                ((participantBio.emoji === v1) ?
                                    <input type="radio" id={v1} name="emoji" autoComplete="off" onClick={handleBioEmoji} checked /> :
                                    <input type="radio" id={v1} name="emoji" autoComplete="off" onClick={handleBioEmoji} />),
                                <label htmlFor={v1} className="emoji">{v1}</label>,
                                (v1 === emojis[Math.floor((emojis.length - 1) / 2)]) ? <br /> : null
                            ], [<span>{v[1]}</span>, <br />])) :
                            [
                                ...a,
                                <label htmlFor={v[0]}>{v[1]}</label>, <br />,
                                <input type="text" id={v[0]} autoComplete="off" onInput={handleBio} value={participantBio[v[0]]} />, <br />, <br />
                            ], []
                    )}
                </div>
                <div style={{ width: "60%", display: "flex", flexDirection: "column"}}>
                    <div style={{flexGrow: 100}}>
                        {profileText[3]}
                        {Object.keys(bioQuestions).every(e => participantBio.hasOwnProperty(e)) ?
                            (<div style={{ marginTop: "50px" }}>
                                {profileText[4]}
                                <div className="editable-bio">{makeBio(participantBio)}</div>
                            </div>) :
                            null
                        }
                    </div>
                    <div className="prev-next" style={{flexGrow: 0}}>
                        <button style={{ margin: "5px" }} onClick={handleBioToUpload}>Previous</button>
                        {Object.keys(bioQuestions).every(e => participantBio.hasOwnProperty(e)) ?
                            (<button style={{ margin: "30px", display: props.next ? "inline" : "none" }} onClick={handleBioToDisplay}>Next</button>) :
                            null
                        }
                    </div>
                </div>
            </div>
        </div>)
    } else {  // display
        return (<div style={{ textAlign: "center", margin: "0px" }}>
            {profileText[6]}
            <div className="profile-quadrant" style={{ margin: "auto", width: "275px" }}>
                <img id="participantImg" src={participantImg} alt="participant" className="display-profile-img" />
                <p className="display-profile-bio">{makeBio(participantBio)}</p>
            </div>
            <div>
                {profileText[5]}
                {slider("participantBioScore")}
            </div>
            {prevNext({ ...props, prev: handleDisplayToBio }, save)}
        </div>)
    }
}