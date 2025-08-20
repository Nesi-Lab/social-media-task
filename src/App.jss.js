// Loading overlay styles for WebGazer initialization
export const loadingStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    color: 'white',
    fontSize: '18px',
    textAlign: 'center'
  },

  content: {
    marginBottom: '20px'
  },

  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },

  errorIcon: {
    width: '50px',
    height: '50px',
    border: '4px solid #e74c3c',
    borderRadius: '50%',
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },

  subtitle: {
    fontSize: '14px',
    opacity: 0.8,
    marginTop: '10px'
  },

  continueButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  }
};
