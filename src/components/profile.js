import { useState, useEffect } from "react";

import { profileText, bioQuestions, emojis, makeBio, makeBioPlain } from '../assets/text';
import { prevNext, slider, writeData } from '../lib/utils';
import { useScreen } from './ScreenContext';
import { useParticipant } from './ParticipantContext';
import ImageCropper from './ImageCropper';
import { PersonQuadrant } from './block';

export default function Profile(props) {

    const { setScreen } = useScreen();
    const { participantId, setImg, setBio } = useParticipant();
    const [participantImg, setParticipantImg] = useState("#");
    const [participantImgScore, setParticipantImgScore] = useState("");
    const [participantBio, setParticipantBio] = useState({});
    const [showCropper, setShowCropper] = useState(false);
    const [originalImg, setOriginalImg] = useState(null);
    const [profileStep, setProfileStep] = useState("uploadPhoto"); // 'uploadPhoto', 'bio', 'display'

    useEffect(() => {
        setScreen(`profile ${profileStep}`);
    }, [profileStep, setScreen]);

    const reader = new FileReader();

    reader.onload = function(e) {
        setOriginalImg(reader.result);
        setShowCropper(true);
    };

    function handleUpload(input) {
        if (input.target.files && input.target.files[0]) {
            reader.readAsDataURL(input.target.files[0]);

            // Return to fullscreen after file selection
            setTimeout(() => {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                }
            }, 200);
        }
    }

    function handleUploadClick() {
        // Trigger file input click
        document.getElementById("fileUpload").click();
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
        setProfileStep("bio");
        // Request fullscreen when moving to bio step
        setTimeout(() => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        }, 100);
    }

    function handleBioToUpload(e) {
        setProfileStep("uploadPhoto");
    }

    function handleBioToDisplay(e) {
        setProfileStep("display");
        // Request fullscreen when moving to display step
        setTimeout(() => {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
        }, 100);
    }

    function handleDisplayToBio(e) {
        setProfileStep("uploadPhoto");
    }

    async function saveRow(rec) {
        writeData("metadata", rec, participantId);
    }

    async function save() {
        const bio = makeBioPlain(participantBio);
        props.setParticipantImgTimeline(participantImg);
        props.setParticipantBioTimeline(makeBio(participantBio));
        setImg(participantImg);
        setBio(participantBio); // Store the full object, not the formatted string
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

    // Only call props.next when profile is fully complete (display screen)
    function handleFinalNext() {
        save().then(() => {
            // Request fullscreen after saving with a delay
            setTimeout(() => {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(err => console.log('Fullscreen request failed:', err));
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                }
            }, 500);
            props.next();
        });
    }

    if (profileStep === "uploadPhoto") {
        return (
            <div>
                {profileText[0]}
                <div className="upload">
                    <div className="profile-quadrant quadrant-square profile-quadrant-centered">
                        <img id="participantImg" src={participantImg} alt="participant" style={{ display: participantImg === "#" ? "none" : "inline" }} />
                    </div>
                    <div>
                        {profileText[1]}
                        <button className="upload-button" onClick={handleUploadClick}>Upload Image</button>
                        <input type='file' id="fileUpload" style={{ display: "none" }} onChange={handleUpload} accept="image/png, image/jpeg, image/jpg" />
                    </div>
                </div>
                {participantImg === "#" ?
                    null :
                    <div style={{ textAlign: "center" }}>
                        {profileText[2]}
                        {slider("participantImgScore")}
                        <div className="prev-next">
                            {prevNext({ ...props, next: handleUploadToBio })}
                        </div>
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
    } else if (profileStep === "bio") {
        const allFieldsFilled = Object.keys(bioQuestions).every(e => participantBio[e] && participantBio[e].trim() !== "");
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
                <div style={{ width: "60%", display: "flex", flexDirection: "column" }}>
                    <div style={{ flexGrow: 100 }}>
                        {profileText[3]}
                        {allFieldsFilled ?
                            (<div className="profile-text-margin" style={{ marginTop: "50px" }}>
                                {profileText[4]}
                                <div className="editable-bio"><PersonQuadrant p={{ img: participantImg, bio: makeBioPlain(participantBio) }} isRatee={true} screenType="profile" score={null} /></div>
                            </div>) :
                            null
                        }
                    </div>
                    <div className="prev-next">
                        {prevNext({ ...props, prev: handleBioToUpload, next: handleBioToDisplay, disableNext: !allFieldsFilled })}
                    </div>
                </div>
            </div>
        </div>);
    } else {  // display
        return (<div style={{ textAlign: "center", margin: "0px" }}>
            {profileText[6]}
            <div className="profile-quadrant profile-quadrant-display">
                <PersonQuadrant p={{ img: participantImg, bio: makeBioPlain(participantBio) }} isRatee={true} screenType="profile" score={null} />
            </div>
            <div>
                {profileText[5]}
                {slider("participantBioScore")}
            </div>
            {prevNext({ ...props, prev: handleDisplayToBio, next: handleFinalNext }, save)}
        </div>);
    }
}
