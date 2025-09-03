import React, { createContext, useContext, useRef } from 'react';

// Create a context to share the initial timestamp reference and webgazer instance
const InitialTimeContext = createContext();

export function InitialTimeProvider({ children, initialTimestampRef }) {
    const value = {
        initialTimestampRef,
        // Helper function to get relative timestamp
        getRelativeTimestamp: () => {
            if (initialTimestampRef?.current === null) return 0;
            return Date.now() - initialTimestampRef.current;
        }
    };

    return (
        <InitialTimeContext.Provider value={value}>
            {children}
        </InitialTimeContext.Provider>
    );
}

export function useInitialTime() {
    const context = useContext(InitialTimeContext);
    if (!context) {
        throw new Error('useInitialTime must be used within an InitialTimeProvider');
    }
    return context;
}
