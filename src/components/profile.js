import { useState, useEffect } from "react";

import { profileText, bioQuestions, emojis, makeBio, makeBioPlain } from '../assets/text';
import { prevNext, slider, writeData } from '../lib/utils';
import { useScreen } from './ScreenContext';
import ImageCropper from './ImageCropper';

export default function Profile(props) {

    const { screen, setScreen } = useScreen();
    const [participantImg, setParticipantImg] = useState("#");
    const [participantImgScore, setParticipantImgScore] = useState("");
    const [participantBio, setParticipantBio] = useState({});
    const [showCropper, setShowCropper] = useState(false);
    const [originalImg, setOriginalImg] = useState(null);

    useEffect(() => {
        setScreen(`profile uploadPhoto`);
    }, []);

    const reader = new FileReader();

    reader.onload = function (e) {
        setOriginalImg(reader.result);
        setShowCropper(true);
    };

    function handleUpload(input) {
        if (input.target.files && input.target.files[0]) {
            reader.readAsDataURL(input.target.files[0]);
        }
    }

    function handleCropSave(croppedImage) {
        setParticipantImg(croppedImage);
        setShowCropper(false);
    }

    function handleCropCancel() {
        setShowCropper(false);
        setOriginalImg(null);
    }

    function handleBio(e) {
        const id = e.target.id;
        setParticipantBio({ ...participantBio, [id]: document.getElementById(id).value.toLowerCase() });
    }

    function handleBioEmoji(e) {
        setParticipantBio({ ...participantBio, emoji: e.target.id });
    }

    function handleUploadToBio(e) {
        setParticipantImgScore(document.getElementById("participantImgScore").value);
        setScreen(`profile bio`);
    }

    function handleBioToUpload(e) {
        setScreen(`profile uploadPhoto`);
    }

    function handleBioToDisplay(e) {
        setScreen(`profile display`);
    }

    function handleDisplayToBio(e) {
        setScreen(`profile uploadPhoto`);
    }

    async function saveRow(rec) {
        writeData("metadata", rec, props.curr.id);
    }


    async function save() {
        const bio = makeBioPlain(participantBio);
        props.setParticipantImgTimeline(participantImg);
        props.setParticipantBioTimeline(makeBio(participantBio));
        await saveRow({
            name: "participant-img-score",
            value: participantImgScore.toString(),
        });
        await saveRow({
            name: "participant-bio",
            value: bio,
        });
        await saveRow({
            name: "participant-bio-score",
            value: document.getElementById("participantBioScore").value,
        });
    }

    if (screen === "profile uploadPhoto") {
        return (
            <div>
                {profileText[0]}
                <div className="upload">
                    <div className="profile-quadrant quadrant-square" style={{ width: '250px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                        <img id="participantImg" src={participantImg} alt="participant" style={{ height: "100%", width: "100%", borderRadius: "50%", objectFit: "cover", display: participantImg === "#" ? "none" : "inline" }} />
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
                    </div>
                }
                {showCropper && originalImg && (
                    <ImageCropper 
                        imageSrc={originalImg}
                        onSave={handleCropSave}
                        onCancel={handleCropCancel}
                    />
                )}
            </div>
        );
    } else if (screen === "profile bio") {
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
                        {Object.keys(bioQuestions).every(e => Object.prototype.hasOwnProperty.call(participantBio, e)) ?
                            (<div style={{ marginTop: "50px" }}>
                                {profileText[4]}
                                <div className="editable-bio">{makeBio(participantBio)}</div>
                            </div>) :
                            null
                        }
                    </div>
                    <div className="prev-next">
                        {prevNext(props)}
                    </div>
                </div>
            </div>
        </div>);
    } else {  // display
        return (<div style={{ textAlign: "center", margin: "0px" }}>
            {profileText[6]}
            <div className="profile-quadrant" style={{ margin: "auto", width: "290px", height: "auto", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <img id="participantImg" src={participantImg} alt="participant" className="display-profile-img" style={{ height: "250px", width: "250px", borderRadius: "50%", objectFit: "cover", marginBottom: '16px' }} />
                <p className="display-profile-bio" style={{ marginTop: 0 }}>{makeBio(participantBio)}</p>
            </div>
            <div>
                {profileText[5]}
                {slider("participantBioScore")}
            </div>
            {prevNext({ ...props, prev: handleDisplayToBio }, save)}
        </div>);
    }
}