import React, { createContext, useContext, useState } from 'react';

export const ParticipantContext = createContext(null);

export function ParticipantProvider({ children }) {
    const [participantId, setParticipantId] = useState(null);
    return (
        <ParticipantContext.Provider value={{ participantId, setParticipantId }}>
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