import { useEasybase } from 'easybase-react';
import { useState } from 'react';

import { feelingText, feelingList } from '../assets/text'
import { getTime, multiSlider } from '../lib/utils'
var pick = require('lodash.pick');

export default function Feeling(props) {

    // const [curr, setCurr] = useState(props.loc)
    const [vals, setVals] = useState(Object.fromEntries(feelingList.map(e => [e, "50"])))
    const [screenNum, setScreenNum] = useState(0)

    const splitInd = Math.floor(feelingList.length / 2) + 1
    const feelingsToDisplay = feelingList.slice(...(screenNum === 0 ? [0, splitInd] : [splitInd]))
    const valsSubset = pick(vals, feelingsToDisplay)

    // if (curr !== props.loc) {
    //     // we started a new feelings screen and need to reset the state
    //     console.log("new screen")
    //     setVals(Object.fromEntries(feelingList.map(e => [e, "50"])))
    //     setCurr(props.loc)
    //     console.log(vals)
    // }

    const {
        sync,
        configureFrame,
        addRecord,
        isUserSignedIn
    } = useEasybase()

    async function handleSliderChange(e) {
        const changed = e.target.id
        setVals({...vals, [changed]: document.getElementById(changed).value})
    }

    async function save() {

        if (!configureFrame({ tableName: "FEELINGS" }).success) {
            console.log("failed to configure frame")
        }
        if (!(await sync()).success) { console.log("failed to sync") }

        const row = Object.keys(vals).reduce(
            (a, c) => { return { ...a, [c.toLowerCase()]: vals[c] } },
            { "location": props.loc, "save-time": getTime(), "participant-id": props.curr.id }
        )
        const record = {
            insertAtEnd: true,
            newRecord: row,
            tableName: "FEELINGS"
        }
        if (isUserSignedIn()) {
            if (!(await addRecord(record)).success) {
                console.log("failed to add feeling record, trying again...")
                console.log(await addRecord(record))
            }
            if (!configureFrame({ tableName: "FEELINGS" }).success) {
                console.log("failed to configure frame")
            }
            if (!(await sync()).success) { console.log("failed to sync") }
        }
    }

    function changeScreen() {
        setScreenNum(screenNum === 0 ? 1 : 0)
    }

    async function onNext() {
        save().then(() => props.next(props.curr.i))
    }

    return (<div>
        {feelingText}
        <div className="feeling-slider">
            {multiSlider(valsSubset, handleSliderChange)}
        </div>
        <div className="prev-next">
            <button style={{ margin: "5px", display: props.prev ? "inline" : "none" }} onClick={screenNum === 0 ? () => props.prev(props.curr.i) : changeScreen}>Previous</button>
            <button style={{ margin: "5px", display: props.next ? "inline" : "none" }} onClick={screenNum === 0 ? changeScreen : onNext}>Next</button>
        </div>
    </div>)
}