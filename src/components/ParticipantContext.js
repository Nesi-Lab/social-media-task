import React, { createContext, useContext, useState } from 'react';

export const ParticipantContext = createContext(null);

export function ParticipantProvider({ children }) {
    const [participantId, setParticipantId] = useState(null);
    const [img, setImg] = useState(null);
    const [bio, setBio] = useState(null);
    return (
        <ParticipantContext.Provider value={{ participantId, setParticipantId, img, setImg, bio, setBio }}>
            {children}
        </ParticipantContext.Provider>
    );
}

export function useParticipant() {
    const context = useContext(ParticipantContext);
    if (context === undefined) {
        throw new Error('useParticipant must be used within a ParticipantProvider');
    }
    return context;
} 