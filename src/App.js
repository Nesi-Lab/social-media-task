import Script from 'react-load-script'
import { useState, useEffect } from 'react';

import './App.css';
import Timeline from './components/timeline'
import { writeData } from './lib/utils'

declare var webgazer;

function WebGazeLoader(props) {

  const [wg, setWg] = useState(null)
  const [wgLogs, setWgLogs] = useState([])
  // const [wgSec, setWgSec] = useState(0)
  const [screen, setScreen] = useState("")
  const [participantId, setParticipantId] = useState({id: props.participantId}) // this is dumb but mutable

  function makeWgRecord(items) {
    return items.reduce((acc, curr, i) => {
      return { ...acc, ["x" + i]: curr.x, ["y" + i]: curr.y }
    }, { screen: screen })
  }

  useEffect(() => {
    participantId.id = props.participantId
  }, [props.participantId])

  function handleScriptLoad() {
    webgazer.setGazeListener((data, elapsedTime) => {
      if (data == null) { return; }
      // const i = Math.floor((elapsedTime % 1000) / 50)
      // const prevTime = wgLogs[wgLogs.length - 1]
      // const time = (prevTime == null || prevTime.time === 19) ? 0 : prevTime.time + 1
      // wgLogs.push({...webgazer.util.bound(data), time: time})
      // // setWgLogs([...wgLogs, webgazer.util.bound(data)])
      // if (time === 19) {
      //   const rec = makeWgRecord(wgLogs.slice(wgLogs.length - 20))
      //   writeData("eye_tracking", rec, props.participantId)
      // }
      const calcSecond = log_ind => Math.floor(wgLogs[log_ind].utc_time / 1000)
      wgLogs.push({ ...webgazer.util.bound(data), utc_time: Date.now() })
      if (wgLogs.length >= 2) {
        // exists a previous reading
        const prevReadingSec = calcSecond(wgLogs.length - 2)
        if (calcSecond(wgLogs.length - 1) !== prevReadingSec) {
          // we entered a different second from the previous reading
          // so let's write the previous second's data 
          const toWrite = []
          for (let i = wgLogs.length - 2; i >= 0 && i > wgLogs.length - 22; i--) {
            // for the last 20 readings (ignoring the current reading)
            if (calcSecond(i) === prevReadingSec) { toWrite.push(wgLogs[i]) }
            else { break }
          }
          toWrite.reverse()  // so indices increase with time
          // console.log(toWrite)
          writeData("eye_tracking", makeWgRecord(toWrite), participantId.id)
        }
      }
    }).showVideo(false).showPredictionPoints(false).begin();
    setWg(webgazer)
    console.log(webgazer)
  }

  // useEffect(() => {
  //   console.log("write wg", makeWgRecord())
  // }, [wgLogs])

  useEffect(() => {
    // const interval = setInterval(() => {
    //   if (wgLogs.length === 0) { return; }
    //   let zeroInd = null
    //   wgLogs.forEach((log, i) => {
    //     if (log.time == 0) { zeroInd = i }
    //   })
    //   console.log(zeroInd, wgLogs)
    //   const chosen = (!zeroInd || zeroInd < wgLogs.length - 20) ? wgLogs.slice(wgLogs.length - 20) : wgLogs.slice(zeroInd)
    //   console.log("write wg", makeWgRecord(chosen))
    //   // writeData("eye_tracking", makeWgRecord(), props.participantId)  // need to get id avail at this level
    //   // setWgLogs([])
    // }, 1000);
    // const predInterval = setInterval(() => {
    //   if (wg) { 
    //     setWgLogs([...wgLogs, wg.getCurrentPrediction()]) 
    //     console.log(wg.getCurrentPrediction())
    //   }
    // }, 50)
    return () => {
      // fired on component unmount.
      console.log("component unmount wgLogs", wgLogs)
      // console.log(`clearing interval`);
      // clearInterval(interval);
      // clearInterval(predInterval);
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
    <div className="App" id="app" style={{ display: "flex", justifyContent: "center" }}>
      <WebGazeLoader participantId={participantId} setParticipantId={setParticipantId} />
    </div>
  );
}

export default App;