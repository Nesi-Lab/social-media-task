import Script from 'react-load-script'
import { useState, useEffect } from 'react';

import './App.css';
import Timeline from './components/timeline'
import { writeData } from './lib/utils'

declare var webgazer;

function WebGazeLoader(props) {

  const [wg, setWg] = useState(null)
  const [wgLogs, setWgLogs] = useState([])
  const [wgSec, setWgSec] = useState(0)
  const [screen, setScreen] = useState(null)

  function makeWgRecord() {
    return wgLogs.reduce((acc, curr) => {
      const i = acc.length
      return { ...acc, ["x" + i]: curr.x, ["y" + i]: curr.y }
    })
  }

  function gazeListener(data, elapsedTime) {
    if (data == null) { return; }
    wgLogs.push(webgazer.util.bound(data))
    if (Math.floor(elapsedTime / 1000) > wgSec) {
      writeData("eye_tracking", makeWgRecord(), props.participantId)  // need to get id avail at this level
      setWgSec(Math.floor(elapsedTime / 1000))
      setWgLogs([])
    }
  }

  function handleScriptLoad() {
    webgazer.setGazeListener(gazeListener.showVideo(false).showPredictionPoints(false).begin();
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
    <Timeline wg={{ wg: wg, screen: screen, "setScreen": setScreen }} participantId={props.participantId} setParticipantId={props.setParticipantId} />
  </div>)
}

function App() {

  const [participantId, setParticipantId] = useState(null)

  return (
    <div className="App" style={{ display: "flex", justifyContent: "center" }}>
      <WebGazeLoader participantId={participantId} setParticipantId={setParticipantId}/>
    </div>
  );
}

export default App;