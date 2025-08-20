import { useState, useEffect } from "react";

import { loadingText } from '../assets/text';
import { prevNext, setTimezone } from '../lib/utils';
import { useScreen } from './ScreenContext';
import { useParticipant } from './ParticipantContext';

const loadingSecs = 5;

export default function User(props) {
    const { setScreen } = useScreen();
    const { setParticipantId } = useParticipant();
    const [usernameValue, setUsernameValue] = useState("");
    const [loading, setLoading] = useState(false); // No delay

    useEffect(() => {
        setScreen("user");
    }, []);

    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
                setTimezone("America/New_York");
            }, 1000 * loadingSecs);
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer);
        }
    }, [loading, setLoading]);

    if (loading) {
        return loadingText;
    } else {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
                <div style={{ width: '100%', maxWidth: 340, margin: '0 auto', padding: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                    <label htmlFor="username" style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, display: 'block', color: '#235390' }}>
                        Participant ID
                    </label>
                    <input
                        id="username"
                        type="text"
                        className="sign-in"
                        value={usernameValue}
                        onChange={e => setUsernameValue(e.target.value)}
                        placeholder=""
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: 16,
                            borderRadius: 8,
                            border: '2px solid #d0d7de',
                            outline: 'none',
                            marginBottom: 20,
                            background: '#f8fafc',
                            color: '#222',
                            boxSizing: 'border-box',
                            transition: 'border 0.2s, box-shadow 0.2s',
                        }}
                        onFocus={e => e.target.style.border = '2px solid #4f8cff'}
                        onBlur={e => e.target.style.border = '2px solid #d0d7de'}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {usernameValue === "" ? null : prevNext(props, async () => {
                            setParticipantId(usernameValue);
                            console.log(`id: ${usernameValue}`);
                        })}
                    </div>
                </div>
            </div>
        );
    }
}