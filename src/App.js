import Script from 'react-load-script'
import { useState, useEffect, useRef } from 'react';

import './App.css';
import Timeline from './components/timeline'
import { writeData } from './lib/utils'
import { WebgazerProvider } from './components/WebgazerContext';
import { ScreenProvider, useScreen } from './components/ScreenContext';
import { ParticipantProvider, useParticipant } from './components/ParticipantContext';

declare var webgazer;

function WebGazeLoader() {

  const [wg, setWg] = useState(null)
  const [wgLogs, setWgLogs] = useState([])
  const { screen } = useScreen();
  const { participantId } = useParticipant();

  // Refs for latest values
  const screenRef = useRef(screen);
  const participantIdRef = useRef(participantId);

  useEffect(() => { screenRef.current = screen; }, [screen]);
  useEffect(() => { participantIdRef.current = participantId; }, [participantId]);

  function formatTimestamp(unix_ts) {
    const d = new Date(unix_ts)
    const pad = n => ("0" + n).slice(-2), pad3 = n => ("00" + n).slice(-3)
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad3(d.getUTCMilliseconds())}+00`
  }

  function makeWgRecord(items) {
    return items.reduce((acc, curr, i) => {
      return { ...acc, ["timestamp" + i]: formatTimestamp(curr.timestamp), ["x" + i]: curr.x, ["y" + i]: curr.y }
    }, { screen: screenRef.current })
  }


  function handleScriptLoad() {
    webgazer.setRegression('ridge')
      .setTracker('TFFacemesh')
      .setGazeListener((data, elapsedTime) => {
        if (data == null) { return; }
        const calcSecond = log_ind => Math.floor(wgLogs[log_ind].timestamp / 1000)
        wgLogs.push({ ...webgazer.util.bound(data), timestamp: Date.now() })
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
        <Timeline />
    </WebgazerProvider>
  </div>)
}

function App() {
  return (
    <div className="App" id="app" style={{ display: "flex", justifyContent: "center" }}>
      <ScreenProvider>
        <ParticipantProvider>
          <WebGazeLoader />
        </ParticipantProvider>
      </ScreenProvider>
    </div>
  );
}

export default App;