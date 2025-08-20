import React from 'react';

export default function Button({ onClick, children, disabled = false, variant = 'primary', style = {}, ...rest }) {
    const baseStyle = {
        padding: '10px 24px',
        borderRadius: '8px',
        border: 'none',
        fontWeight: 600,
        fontSize: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: variant === 'primary' ? '#4f8cff' : '#f0f0f0',
        color: variant === 'primary' ? '#ffffff' : '#222',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
        ...style,
    };
    return (
        <button
            onClick={disabled ? undefined : onClick}
            style={baseStyle}
            disabled={disabled}
            {...rest}
        >
            {children}
        </button>
    );
} 