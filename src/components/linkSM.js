import { useEasybase } from 'easybase-react';
import { useEffect, useState } from 'react';

import { socialMediaImgs, check, loading } from '../assets/imgs'
import { socialMediaText } from '../assets/text'
import { prevNext } from '../lib/utils'

function makeOption(socialMedia) {
    const img = socialMediaImgs[socialMedia]
    return (<div className="social-media">
        <input type="checkbox" id={socialMedia} name={socialMedia} value={socialMedia} />
        <label htmlFor={socialMedia}><img src={img} alt="social media icon" className="social-media-img" /></label>
        {/* <input type="text" placeholder={socialMedia === "fb" ? "Email/phone" : "Username"} style={{ width: "180px" }} /> */}
        {/* <br /> */}
    </div>)
}

export default function LinkSM(props) {

    const [selected, setSelected] = useState(null)
    const [isLoad, setIsLoad] = useState(false)
    const [checked, setChecked] = useState(null)
    const [finished, setFinished] = useState(false)
    const [phoneFilled, setPhoneFilled] = useState(false)

    const {
        sync,
        configureFrame,
        addRecord,
        isUserSignedIn
    } = useEasybase();

    useEffect(() => {
        if (isLoad && !finished) {
            const timer = setTimeout(() => {
                const ind = checked.findIndex(e => !e)
                if (ind === -1) {
                    setFinished(true)
                }
                const copy = [...checked]
                copy[ind] = true
                setChecked(copy)
            }, 1000)
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer)
        }
    })

    async function onPrev() {
        save().then(() => props.prev(props.curr))
    }

    function setupLoad(_) {
        setIsLoad(true)
        const sel = Object.keys(socialMediaImgs).filter(
            e => document.getElementById(e).checked
        )
        setSelected(sel)
        setChecked(sel.map(_ => false))
        setFinished(sel.length === 0)
    }

    async function save() {
        if (isUserSignedIn()) {
            if (!(await addRecord({
                insertAtEnd: true,
                newRecord: {
                    name: "social-medias",
                    value: isLoad ?
                        selected.join(",") :
                        Object.keys(socialMediaImgs).filter(e => document.getElementById(e).checked).join(",")
                },
                tableName: "METADATA"
            })).success) { console.log("failed to add social media record") }
            if (!configureFrame({ tableName: "METADATA" }).success) {
                console.log("failed to configure frame")
            }
            if (!(await sync()).success) { console.log("failed to sync") }
        }
    }

    function handlePhoneTyped(e) {
        const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
        if (phoneRegex.test(e.target.value)) { setPhoneFilled(true) }
    }


    if (!isLoad) {
        return (<div style={{ textAlign: "center" }}>
            {socialMediaText[0]}
            <div style={{ margin: "60px" }}>
                <label htmlFor="phone" style={{ marginRight: "20px" }}>Phone number:</label>
                <input type="text" placeholder={"(XXX) XXX-XXXX"} autoComplete="off" onInput={handlePhoneTyped} id="phone" style={{ width: "180px" }} />
                <div className="social-medias">
                    {Object.keys(socialMediaImgs).map(makeOption)}
                </div>
            </div>
            {socialMediaText[1]}
            <div className="prev-next">
                <button style={{ margin: "5px", display: props.prev ? "inline" : "none" }} onClick={onPrev}>Previous</button>
                {phoneFilled ?
                    <button style={{ margin: "5px", display: props.next ? "inline" : "none" }} onClick={setupLoad}>Next</button> :
                    null}
            </div>
        </div>)
    } else {
        const imgs = selected.map((e, i) => (<img src={checked[i] ? check : socialMediaImgs[e]} alt="social media icon" style={{ width: "75px", margin: "10px" }} />))
        if (!finished) {
            return (<div className="social-media-loading">
                <img src={loading} alt="loading gif" className="loading-gif" />
                {imgs}
            </div>)
        } else {
            return (<div>
                <div className="social-media-loading">
                    {imgs}
                </div>
                {socialMediaText[2]}
                {prevNext({ curr: props.curr, next: props.next }, save)}
            </div>)
        }
    }
}