import { useEasybase } from 'easybase-react';

import { feelingText, feelingList } from '../assets/text'
import { getTime, prevNext, slider } from '../lib/utils'

export default function Feeling(props) {

    const {
        Frame,
        sync,
        configureFrame,
        addRecord,
        isUserSignedIn,
        useFrameEffect
    } = useEasybase()

    async function save() {
        const row = feelingList.reduce(
            (a, c) => { return { ...a, [c.toLowerCase()]: document.getElementById(c).value } },
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
            {slider(feelingList)}
        </div>
        {prevNext(props, save)}
    </div>)
}