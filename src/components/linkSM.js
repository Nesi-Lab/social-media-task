import { useEffect, useState } from 'react';

import { socialMediaImgs, check, loading } from '../assets/imgs';
import { socialMediaText } from '../assets/text';
import { prevNext, writeData } from '../lib/utils';

function makeOption(socialMedia) {
    const img = socialMediaImgs[socialMedia];
    return (<div className="social-media">
        <input type="checkbox" id={socialMedia} key={socialMedia} name={socialMedia} value={socialMedia} />
        <label htmlFor={socialMedia}><img src={img} alt="social media icon" className="social-media-img" /></label>
    </div>);
}

export default function LinkSM(props) {

    const [selected, setSelected] = useState(null);
    const [isLoad, setIsLoad] = useState(false);
    const [checked, setChecked] = useState(null);
    const [finished, setFinished] = useState(false);
    const [phoneFilled, setPhoneFilled] = useState(false);

    useEffect(() => {
        props.curr.wg.screen.screen = `linksm selecting`;
    }, []);

    useEffect(() => {
        if (isLoad && !finished) {
            const timer = setTimeout(() => {
                const ind = checked.findIndex(e => !e);
                if (ind === -1) {
                    setFinished(true);
                    props.curr.wg.screen.screen = `linksm finished`;
                }
                const copy = [...checked];
                copy[ind] = true;
                setChecked(copy);
            }, 1000);
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer);
        }
    });

    async function onPrev() {
        save().then(() => props.prev(props.curr.i));
    }

    function setupLoad() {
        setIsLoad(true);
        const sel = Object.keys(socialMediaImgs).filter(
            e => document.getElementById(e).checked
        );
        setSelected(sel);
        setChecked(sel.map(_ => false));
        setFinished(sel.length === 0);
        props.curr.wg.screen.screen = `linksm ${sel.length === 0 ? "finished" : "selecting"}`;
    }

    async function save() {
        writeData("metadata", {
            name: "social-medias",
            value: isLoad ?
                selected.join(",") :
                Object.keys(socialMediaImgs).filter(e => document.getElementById(e).checked).join(",")
        }, props.curr.id);
    }

    function handlePhoneTyped(e) {
        // const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
        // if (phoneRegex.test(e.target.value)) { setPhoneFilled(true) }
        const nums = e.target.value.match(/\d+/g).map(a => a.split("")).flat();
        if (nums != null && nums.length >= 10) { setPhoneFilled(true); }
    }


    if (!isLoad) {
        return (<div style={{ textAlign: "center"}}>
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
        </div>);
    } else {
        const imgs = selected.map((e, i) => (<img src={checked[i] ? check : socialMediaImgs[e]} alt="social media icon" key={i.toString()} style={{ width: "75px", margin: "10px" }} />));
        if (!finished) {
            return (<div className="social-media-loading">
                <img src={loading} alt="loading gif" className="loading-gif" />
                {imgs}
            </div>);
        } else {
            return (<div>
                <div className="social-media-loading">
                    {imgs}
                </div>
                {socialMediaText[2]}
                {prevNext({ curr: props.curr, next: props.next }, save)}
            </div>);
        }
    }
}