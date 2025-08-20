import { useEffect, useState } from 'react';

import { check, loading } from '../assets/imgs';
import { socialMediaText } from '../assets/text';
import { prevNext, writeData } from '../lib/utils';
import { useScreen } from './ScreenContext';
import { useParticipant } from './ParticipantContext';

function EmailInput({ onEmailValid, onEmailInvalid }) {
    const [emailFilled, setEmailFilled] = useState(false);

    function handleEmailTyped(e) {
        const email = e.target.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailRegex.test(email)) {
            setEmailFilled(true);
            if (onEmailValid) onEmailValid(email);
        } else {
            setEmailFilled(false);
            if (onEmailInvalid) onEmailInvalid();
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
            <label htmlFor="email" style={{ 
                fontSize: '18px', 
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '8px'
            }}>
                Email address: <span style={{ color: 'red' }}>*</span>
            </label>
            <input 
                type="email" 
                placeholder="your.email@example.com" 
                autoComplete="off" 
                onInput={handleEmailTyped} 
                id="email" 
                required
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
                Phone number: <span style={{ color: '#888' }}>(optional)</span>
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

export default function LinkSM(props) {

    const { setScreen } = useScreen();
    const { participantId } = useParticipant();
    const [isLoad, setIsLoad] = useState(false);
    const [finished, setFinished] = useState(false);
    const [phoneFilled, setPhoneFilled] = useState(false);
    const [emailFilled, setEmailFilled] = useState(false);

    useEffect(() => {
        setScreen(`linksm selecting`);
    }, []);

    useEffect(() => {
        if (isLoad && !finished) {
            const timer = setTimeout(() => {
                setFinished(true);
                setScreen(`linksm finished`);
            }, 2000);
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer);
        }
    });

    useEffect(() => {
        if (finished) {
            // Auto advance to next screen after showing the finished state
            const timer = setTimeout(() => {
                props.next();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [finished]);

    async function onPrev() {
        save().then(() => props.prev());
    }

    function setupLoad() {
        setIsLoad(true);
        setFinished(false);
        setScreen(`linksm selecting`);
    }

    async function save() {
        const email = document.getElementById('email')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        
        writeData("metadata", {
            name: "contact-info",
            value: JSON.stringify({ email, phone })
        }, participantId);
    }

    function handlePhoneValid() {
        setPhoneFilled(true);
    }

    function handlePhoneInvalid() {
        setPhoneFilled(false);
    }

    function handleEmailValid() {
        setEmailFilled(true);
    }

    function handleEmailInvalid() {
        setEmailFilled(false);
    }

    if (!isLoad) {
        return (<div style={{ 
            textAlign: "center",
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "20px",
            boxSizing: "border-box",
            paddingTop: 0,
            wordWrap: "break-word",
            wordBreak: "break-word"
        }}>
            <div style={{ maxWidth: "600px", width: "100%" }}>
                {socialMediaText[0]}
            </div>
            <div>
                <EmailInput 
                    onEmailValid={handleEmailValid}
                    onEmailInvalid={handleEmailInvalid}
                />
                <PhoneInput 
                    onPhoneValid={handlePhoneValid}
                    onPhoneInvalid={handlePhoneInvalid}
                />
            </div>
            <div style={{ maxWidth: "600px", width: "100%" }}>
                {socialMediaText[1]}
            </div>
            <div className="prev-next">
                {prevNext({ ...props, disableNext: !emailFilled }, setupLoad)}
            </div>
        </div>);
    } else {
        if (!finished) {
            return (<div style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "20px",
                boxSizing: "border-box",
                wordWrap: "break-word",
                wordBreak: "break-word"
            }}>
                <img src={loading} alt="loading gif" className="loading-gif" style={{ marginBottom: "30px" }} />
                <h1 style={{ marginBottom: "20px" }}>Looking for matches...</h1>
                <p style={{ fontSize: "larger", maxWidth: "600px" }}>Please wait while we find other participants for you to connect with.</p>
            </div>);
        } else {
            return (<div style={{
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                padding: "20px",
                boxSizing: "border-box",
                wordWrap: "break-word",
                wordBreak: "break-word"
            }}>
                <div style={{ marginBottom: "40px" }}>
                    <img src={check} alt="check mark" style={{ width: "75px", margin: "10px" }} />
                </div>
                <div style={{ maxWidth: "600px", width: "100%" }}>
                    {socialMediaText[2]}
                </div>
            </div>);
        }
    }
}

// New component for taking to Connect
export function TakingToConnect(props) {
    const { setScreen } = useScreen();

    useEffect(() => {
        setScreen(`taking-to-connect`);
        
        console.log('TakingToConnect: auto-advancing after 5 seconds');
        
        // Auto advance after 5 seconds
        const timer = setTimeout(() => {
            console.log('TakingToConnect: advancing to next screen');
            props.next();
        }, 5000);

        return () => {
            console.log('TakingToConnect: clearing timer');
            clearTimeout(timer);
        };
    }, []);

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "20px",
            boxSizing: "border-box"
        }}>
            <img src={loading} alt="loading gif" className="loading-gif" style={{ marginBottom: "30px" }} />
            <h1 style={{ marginBottom: "20px" }}>Taking you to Connect...</h1>
            <p style={{ fontSize: "larger" }}>Please wait while we prepare your experience.</p>
        </div>
    );
}