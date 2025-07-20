import { useEffect, useState } from 'react';

import { socialMediaImgs, check, loading } from '../assets/imgs';
import { socialMediaText } from '../assets/text';
import { prevNext, writeData } from '../lib/utils';
import { useScreen } from './ScreenContext';

function PhoneInput({ onPhoneValid, onPhoneInvalid }) {
    const [phoneFilled, setPhoneFilled] = useState(false);

    function handlePhoneTyped(e) {
        // Remove all non-digit characters
        const digits = e.target.value.replace(/\D/g, '');
        
        // Only allow up to 10 digits
        const limitedDigits = digits.slice(0, 10);
        
        // Format as phone number
        let formatted = '';
        if (limitedDigits.length > 0) {
            if (limitedDigits.length <= 3) {
                formatted = `(${limitedDigits}`;
            } else if (limitedDigits.length <= 6) {
                formatted = `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
            } else {
                formatted = `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
            }
        }
        
        // Update the input value with formatted number
        e.target.value = formatted;
        
        // Check if we have exactly 10 digits
        if (limitedDigits.length === 10) {
            setPhoneFilled(true);
            if (onPhoneValid) onPhoneValid(formatted);
        } else {
            setPhoneFilled(false);
            if (onPhoneInvalid) onPhoneInvalid();
        }
    }

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '16px',
            marginBottom: '40px'
        }}>
            <label htmlFor="phone" style={{ 
                fontSize: '18px', 
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '8px'
            }}>
                Phone number:
            </label>
            <input 
                type="tel" 
                placeholder="(XXX) XXX-XXXX" 
                autoComplete="off" 
                onInput={handlePhoneTyped} 
                id="phone" 
                maxLength="14"
                style={{ 
                    width: "220px",
                    padding: "12px 16px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: "2px solid #333",
                    backgroundColor: "#1a1a1a",
                    color: "#ffffff",
                    outline: "none",
                    transition: "all 0.2s ease",
                    boxSizing: "border-box"
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = "#0275ff";
                    e.target.style.backgroundColor = "#2a2a2a";
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = "#333";
                    e.target.style.backgroundColor = "#1a1a1a";
                }}
            />
        </div>
    );
}

function makeOption(socialMedia) {
    const img = socialMediaImgs[socialMedia];
    return (<div className="social-media">
        <input type="checkbox" id={socialMedia} key={socialMedia} name={socialMedia} value={socialMedia} />
        <label htmlFor={socialMedia}><img src={img} alt="social media icon" className="social-media-img" /></label>
    </div>);
}

export default function LinkSM(props) {

    const { setScreen } = useScreen();
    const [selected, setSelected] = useState(null);
    const [isLoad, setIsLoad] = useState(false);
    const [checked, setChecked] = useState(null);
    const [finished, setFinished] = useState(false);
    const [phoneFilled, setPhoneFilled] = useState(false);

    useEffect(() => {
        setScreen(`linksm selecting`);
    }, []);

    useEffect(() => {
        if (isLoad && !finished) {
            const timer = setTimeout(() => {
                const ind = checked.findIndex(e => !e);
                if (ind === -1) {
                    setFinished(true);
                    setScreen(`linksm finished`);
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
        setScreen(`linksm ${sel.length === 0 ? "finished" : "selecting"}`);
    }

    async function save() {
        writeData("metadata", {
            name: "social-medias",
            value: isLoad ?
                selected.join(",") :
                Object.keys(socialMediaImgs).filter(e => document.getElementById(e).checked).join(",")
        }, props.curr.id);
    }

    function handlePhoneValid() {
        setPhoneFilled(true);
    }

    function handlePhoneInvalid() {
        setPhoneFilled(false);
    }

    if (!isLoad) {
        return (<div style={{ textAlign: "center"}}>
            {socialMediaText[0]}
            <div style={{ margin: "60px" }}>
                <PhoneInput 
                    onPhoneValid={handlePhoneValid}
                    onPhoneInvalid={handlePhoneInvalid}
                />
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