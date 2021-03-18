import * as text from '../assets/text'
import { tutorialImgs } from '../assets/imgs'
import { prevNext } from '../lib/utils'
import { useEffect } from 'react'

export default function Instruction(props) {

    useEffect(() => {
        props.curr.wgLogs.push({ timestamp: Date.now(), id: "instruction-start", type: props.id, ind: props.img })
    }, [props])

    async function save() {
        props.curr.wgLogs.push({ timestamp: Date.now(), id: "end-instruction", type: props.id, ind: props.img })
    }

    return (<div>
        {text[props.id][props.ind]}
        {Object.keys(props).includes("img") ?
            (<img src={tutorialImgs[props.img]} alt="tutorial slide" className="tutorial-slide" />)
            : null}
        <div style={Object.keys(props).includes("img") ? {marginTop: "-40px", marginBottom: "-50px"} : {}}>{prevNext(props, save)}</div>
    </div>)
}