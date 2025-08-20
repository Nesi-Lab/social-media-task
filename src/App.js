import Script from 'react-load-script'
import { useState, useEffect, useRef } from 'react';

import './App.css';
import Timeline from './components/timeline'
import { writeData } from './lib/utils'
import { WebgazerProvider } from './components/WebgazerContext';
import { ScreenProvider, useScreen } from './components/ScreenContext';
import { ParticipantProvider, useParticipant } from './components/ParticipantContext';

declare var webgazer;

function WebGazeLoader({ onScreenChange }) {

  const [wg, setWg] = useState(null)
  const [wgLogs, setWgLogs] = useState([])
  const { screen } = useScreen();
  const { participantId } = useParticipant();

  // Refs for latest values
  const screenRef = useRef(screen);
  const participantIdRef = useRef(participantId);
  const initialTimestampRef = useRef(null);

  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { participantIdRef.current = participantId; }, [participantId]);

  function formatRelativeTimestamp(ts) {
    if (initialTimestampRef.current === null) return 0;
    return ts - initialTimestampRef.current;
  }

  function makeWgRecord(items) {
    return items.reduce((acc, curr, i) => {
      return { ...acc, ["timestamp" + i]: formatRelativeTimestamp(curr.timestamp), ["x" + i]: curr.x, ["y" + i]: curr.y }
    }, { screen: screenRef.current })
  }


  function handleScriptLoad() {
    webgazer.setRegression('ridge')
      .setTracker('TFFacemesh')
      .setGazeListener((data, elapsedTime) => {
        if (data == null) { return; }
        const calcSecond = log_ind => Math.floor(wgLogs[log_ind].timestamp / 1000)
        const now = Date.now();
        if (initialTimestampRef.current === null) initialTimestampRef.current = now;
        wgLogs.push({ ...webgazer.util.bound(data), timestamp: now })
        if (wgLogs.length >= 2) {
          // exists a previous reading
          const prevReadingSec = calcSecond(wgLogs.length - 2)
          if ((calcSecond(wgLogs.length - 1) !== prevReadingSec) || (wgLogs[wgLogs.length - 2].screen !== wgLogs[wgLogs.length - 1].screen)) {
            // we entered a different second from the previous reading
            // so let's write the previous second's data 
            const toWrite = []
            for (let i = wgLogs.length - 2; i >= 0 && i > wgLogs.length - 22; i--) {
              // for the last 20 readings (ignoring the current reading)
              if (calcSecond(i) === prevReadingSec) { toWrite.push(wgLogs[i]) }
              else { break }
            }
            toWrite.reverse()  // so indices increase with time
            writeData("eye_tracking", makeWgRecord(toWrite), participantIdRef.current)
          }
        }
      })
      .showVideo(false)
      .showFaceOverlay(false)
      .showFaceFeedbackBox(false)
      .begin()
      // .showPredictionPoints(false);
    window.applyKalmanFilter = true;
    setWg(webgazer)
    console.log(webgazer)
  }

  useEffect(() => {
    return () => {
      // fired on component unmount.
      console.log("component unmount wgLogs", wgLogs)
    }
  }, [])

  function handleScriptError() {
    console.log('error');
  }

  return (<div>
    <Script
      url={process.env.PUBLIC_URL + "webgazer.js"}
      onLoad={handleScriptLoad}
      onError={handleScriptError}
    />
    <WebgazerProvider value={wg}>
        <Timeline onScreenChange={onScreenChange} />
    </WebgazerProvider>
  </div>)
}

function App() {
  const appRef = useRef(null);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [fullscreenActivated, setFullscreenActivated] = useState(false);

  // Callback to handle screen changes
  const handleScreenChange = (screenIndex) => {
    console.log('Screen changed to index:', screenIndex);
    setCurrentScreenIndex(screenIndex);
  };

  // Function to enter fullscreen
  const enterFullscreen = async () => {
    try {
      if (appRef.current) {
        console.log('Attempting to enter fullscreen...');
        if (appRef.current.requestFullscreen) {
          await appRef.current.requestFullscreen();
        } else if (appRef.current.webkitRequestFullscreen) {
          await appRef.current.webkitRequestFullscreen();
        } else if (appRef.current.msRequestFullscreen) {
          await appRef.current.msRequestFullscreen();
        }
        console.log('Fullscreen request sent');
      }
    } catch (error) {
      console.log('Fullscreen request failed:', error);
    }
  };

  // Callback to trigger fullscreen on final feeling next
  const handleFinalNext = () => {
    console.log('Final feeling next clicked, entering fullscreen...');
    if (!fullscreenActivated) {
      enterFullscreen();
      setFullscreenActivated(true);
    }
  };

  useEffect(() => {
    console.log('Current screen index:', currentScreenIndex, 'Fullscreen activated:', fullscreenActivated);
    
    // Function to handle click and enter fullscreen (for manual activation)
    const handleClick = () => {
      if (currentScreenIndex >= 3 && !fullscreenActivated) {
        console.log('Click detected, entering fullscreen...');
        enterFullscreen();
        setFullscreenActivated(true);
      }
    };

    // Add click listener to the entire app
    const appElement = appRef.current;
    if (appElement) {
      appElement.addEventListener('click', handleClick);
    }

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && 
          !document.webkitFullscreenElement && 
          !document.msFullscreenElement) {
        console.log('Exited fullscreen, attempting to re-enter...');
        // Exited fullscreen, try to re-enter if we're past the feeling block
        if (currentScreenIndex >= 2) {
          setTimeout(enterFullscreen, 100);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      if (appElement) {
        appElement.removeEventListener('click', handleClick);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [currentScreenIndex, fullscreenActivated]);

  return (
    <div className="App" id="app" ref={appRef} style={{ display: "flex", justifyContent: "center" }}>
      <ScreenProvider>
        <ParticipantProvider>
          <WebGazeLoader onScreenChange={handleScreenChange} />
        </ParticipantProvider>
      </ScreenProvider>
    </div>
  );
}

export default App;