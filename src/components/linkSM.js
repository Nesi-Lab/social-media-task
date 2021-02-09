import { useEasybase } from 'easybase-react';
import { useEffect, useState } from 'react';

import { socialMediaImgs, check, loading } from '../assets/imgs'
import { socialMediaText } from '../assets/text'
import { prevNext, addOrUpdateTable } from '../lib/utils'

function makeOption(socialMedia) {
    const img = socialMediaImgs[socialMedia]
    return (<div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
        <input type="checkbox" id={socialMedia} name={socialMedia} value={socialMedia} />
        <label htmlFor={socialMedia}><img src={img} style={{ width: "75px", margin: "10px" }} /></label>
        <input type="text" placeholder={socialMedia == "fb" ? "Email/phone" : "Username"} style={{ width: "180px" }} />
        <br />
    </div>)
}

export default function LinkSM(props) {

    const [selected, setSelected] = useState(null)
    const [isLoad, setIsLoad] = useState(false)
    const [checked, setChecked] = useState(null)
    const [finished, setFinished] = useState(false)

    const {
        Frame,
        sync,
        configureFrame,
        addRecord,
        isUserSignedIn
    } = useEasybase();

    useEffect(() => {
        if (isLoad && !finished) {
            const timer = setTimeout(() => {
                const ind = checked.findIndex(e => !e)
                if (ind == -1) {
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
        setFinished(sel.length == 0)
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

    if (!isLoad) {
        return (<div>
            {socialMediaText[0]}
            {Object.keys(socialMediaImgs).map(makeOption)}
            {socialMediaText[1]}
            <div style={{ textAlign: "center", marginTop: "50px", marginBottom: "50px" }}>
                <button style={{ margin: "5px", display: props.prev ? "inline" : "none" }} onClick={onPrev}>Previous</button>
                <button style={{ margin: "5px", display: props.next ? "inline" : "none" }} onClick={setupLoad}>Next</button>
            </div>
        </div>)
    } else {
        const imgs = selected.map((e, i) => (<img src={checked[i] ? check : socialMediaImgs[e]} style={{ width: "75px", margin: "10px" }} />))
        if (!finished) {
            return (<div style={{ display: "flex", flexDirection: "row" }}>
                <img src={loading} style={{ width: "75px", margin: "10px" }} />
                {imgs}
            </div>)
        } else {
            return (<div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    {imgs}
                </div>
                {socialMediaText[2]}
                {prevNext({curr: props.curr, next: props.next}, save)}
            </div>)
        }
    }
}