import { useEasybase } from 'easybase-react';
import { useState, useEffect } from "react"
import axios from 'axios';
import { loadingText } from '../assets/text'

import { prevNext, writeData } from '../lib/utils'

const refreshSecs = 0.5

export default function CorsCheck(props) {
    const [good, setGood] = useState(null)

    const {
        isUserSignedIn,
        addRecord,
        configureFrame,
        sync
    } = useEasybase();

    async function update() {
        // await axios.post(
        //     'https://nofaorjosb.execute-api.us-east-1.amazonaws.com/default',
        //     {
        //         table: "METADATA",
        //         data: {
        //             "participant-id": "1",
        //             "value": "17"
        //         },
        //     },
        //     {
        //         headers: {
        //             "Access-Control-Allow-Origin": "*",
        //             'Content-Type': 'application/json'
        //         }
        //     }
        // ).then((response) => {
        //     console.log(response);
        // })
        //     .catch((error) => {
        //         console.log(error);
        //     });

        const record = {
            insertAtEnd: true,
            newRecord: {},
            tableName: "METADATA"
        }
        if (isUserSignedIn()) {
            setGood(true)
            if (!(await addRecord(record)).success) {
                console.log("failed to add records")
                setGood(false)
            }
            if (!configureFrame({ tableName: "METADATA" }).success) {
                console.log("failed to configure frame")
                setGood(false)
            }
            if (!(await sync()).success) {
                console.log("failed to sync")
                setGood(false)
            }
        }
    }

    async function save() {
        props.curr.wgLogs.push({ timestamp: Date.now(), id: "end-cors-check", good: good })
        writeData("metadata", {success: "!"})
    }

    useEffect(() => {
        if (good === null || good === false) {
            update()
        } else {
            const timer = setTimeout(() => { update() }, 1000 * refreshSecs)
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer)
        }
    })

    useEffect(() => {
        props.curr.wgLogs.push({ timestamp: Date.now(), id: "start-cors-check" })
    }, [])

    if (good === null) {
        return loadingText
    } else if (good) {
        return (
            <div style={{ textAlign: "center" }}>
                <p>Setup looks good! Please continue.</p>
                { prevNext(props, save)}
            </div>
        )
    } else {
        return (
            <div style={{ textAlign: "center" }}>
                <p>Setup doesn't look good. Please talk with the supervisor.</p>
                { prevNext(props, save)}
            </div>
        )
    }
}