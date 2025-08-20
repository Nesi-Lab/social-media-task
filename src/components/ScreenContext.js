import React, { createContext, useContext, useState } from 'react';

export const ScreenContext = createContext(null);

export function ScreenProvider({ children }) {
    const [screen, setScreen] = useState("");
    return (
        <ScreenContext.Provider value={{ screen, setScreen }}>
            {children}
        </ScreenContext.Provider>
    );
}

export function useScreen() {
    const context = useContext(ScreenContext);
    if (context === undefined) {
        throw new Error('useScreen must be used within a ScreenProvider');
    }
    return context;
}
