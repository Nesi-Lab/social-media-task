import Script from 'react-load-script'

import './App.css';
import Timeline from './components/timeline'
import { useState, useEffect } from 'react';

declare var webgazer;

function WebGazeLoader() {

  const [wg, setWg] = useState(null)
  const [wgLogs, setWgLogs] = useState([])
  const [screen, setScreen] = useState(null)

  function handleScriptLoad() {
    webgazer.setGazeListener((data, elapsedTime) => {
      if (data == null) { return; }
      wgLogs.push({ timestamp: Date.now(), id: "eye-coords", ...webgazer.util.bound(data) })
    }).showVideo(false).showPredictionPoints(false).begin();
    setWg(webgazer)
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
      <Timeline wg={{wg: wg, wgLogs: wgLogs, screen: screen, "setScreen": setScreen}} />
    </div>)
}

function App() {
  return (
    <div className="App" style={{ display: "flex", justifyContent: "center" }}>
      <WebGazeLoader />
    </div>
  );
}

export default App;