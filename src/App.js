import Script from 'react-load-script'

import './App.css';
import { EasybaseProvider } from 'easybase-react';
import ebconfig from './ebconfig';
import Timeline from './components/timeline'
import { useState, useEffect } from 'react';

declare var webgazer;

function WebGazeLoader() {

  const [wg, setWg] = useState(null)
  const [wgLogs, setWgLogs] = useState([])

  function handleScriptLoad() {
    webgazer.setGazeListener((data, elapsedTime) => {
      if (data == null) { return; }
      // const newWgLogs = [...wgLogs, { timestamp: Date.now(), ...webgazer.util.bound(data) }]
      // setWgLogs(newWgLogs)
      wgLogs.push({ timestamp: Date.now(), id: "eye-coords", ...webgazer.util.bound(data) })
      // console.log({ wg: wg, wgLogs: wgLogs })
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

  return (
    <EasybaseProvider ebconfig={ebconfig}>
      {/* <button onClick={() => console.log("wgLogs", wgLogs)}>LOG WG</button> */}
      <Script
        url={process.env.PUBLIC_URL + "webgazer.js"}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <Timeline wg={wg} wgLogs={wgLogs} />
    </EasybaseProvider>
  )
}

function App() {
  return (
    <div className="App" style={{ display: "flex", justifyContent: "center" }}>
      <WebGazeLoader />
    </div>
  );
}

export default App;