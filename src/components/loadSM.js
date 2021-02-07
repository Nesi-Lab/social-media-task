import { useState, useEffect } from 'react';
import { useEasybase } from 'easybase-react';

import { socialMediaImgs, check, loading } from '../assets/imgs'
import { socialMediaText } from '../assets/text'
import { prevNext } from '../lib/utils'

export default function LoadSM(props) {

    const {
        Frame,
        sync,
        configureFrame
    } = useEasybase()

    configureFrame({ tableName: "METADATA" })
    const selected = Frame().filter(e => e.name == "social-medias")[0].value.split(",")
    const [checked, setChecked] = useState(selected.map(_ => false))
    const [finished, setFinished] = useState(false)

    useEffect(() => {
        if (!finished) {
            const timer = setTimeout(() => {
                const ind = checked.findIndex(e => !e)
                if (ind == -1) {
                    setFinished(true)
                }
                const copy = [...checked]
                copy[ind] = true
                setChecked(copy)
            }, 1000)
            // Clear timeout if the component is unmounted
            return () => clearTimeout(timer)
        } else { return () => {} }
    })
    const imgs = selected.map((e, i) => (<img src={checked[i] ? check : socialMediaImgs[e]} style={{ width: "75px", margin: "10px" }} />))

    if (!finished) {
        return (<div style={{ display: "flex", flexDirection: "row" }}>
            <img src={loading} style={{ width: "75px", margin: "10px" }} />
            {imgs}
        </div>)
    } else {
        return (<div>
            <div style={{ display: "flex", flexDirection: "row" }}>
                {imgs}
            </div>
            {socialMediaText[2]}
            {prevNext(props)}
        </div>)
    }
}