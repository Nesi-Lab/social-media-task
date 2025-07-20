import React, { createContext, useContext } from 'react';

export const WebgazerContext = createContext(null);

export function WebgazerProvider({ value, children }) {
    return (
        <WebgazerContext.Provider value={value}>
            {children}
        </WebgazerContext.Provider>
    );
}

export function useWebgazer() {
    const context = useContext(WebgazerContext);
    if (context === undefined) {
        throw new Error('useWebgazer must be used within a WebgazerProvider');
    }
    return context;
} 