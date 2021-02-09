import { useEasybase } from 'easybase-react';
import { useEffect, useState } from 'react';

import { feelingText, feelingList } from '../assets/text'
import { getTime, prevNext, slider } from '../lib/utils'

export default function Feeling(props) {

    // const [curr, setCurr] = useState(props.loc)
    const [vals, setVals] = useState(Object.fromEntries(feelingList.map(e => [e, "50"])))

    // if (curr != props.loc) {
    //     // we started a new feelings screen and need to reset the state
    //     console.log("new screen")
    //     setVals(Object.fromEntries(feelingList.map(e => [e, "50"])))
    //     setCurr(props.loc)
    //     console.log(vals)
    // }

    const {
        Frame,
        sync,
        configureFrame,
        addRecord,
        isUserSignedIn,
        useFrameEffect
    } = useEasybase()

    function handleSliderChange() {
        setVals(Object.keys(vals).reduce((a, c) => {
            return { ...a, [c]: document.getElementById(c).value }
        }, {}))
    }

    async function save() {

        if (!configureFrame({ tableName: "FEELINGS" }).success) {
            console.log("failed to configure frame")
        }
        if (!(await sync()).success) { console.log("failed to sync") }

        console.log(Frame())
        console.log(Frame().map(e => e.location))

        const row = Object.keys(vals).reduce(
            (a, c) => { return { ...a, [c.toLowerCase()]: vals[c] } },
            { "location": props.loc, "save-time": getTime() }
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

    return (<div>
        {feelingText}
        <div style={{ marginLeft: "50px", marginRight: "50px" }}>
            {slider(null, vals, handleSliderChange)}
        </div>
        {prevNext(props, save)}
    </div>)
}