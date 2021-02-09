import * as text from '../assets/text'
import { tutorialImgs } from '../assets/imgs'
import { prevNext } from '../lib/utils'

export default function Instruction(props) {
    return (<div>
        {text[props.id][props.ind]}
        {Object.keys(props).includes("img") ?
            (<img src={tutorialImgs[props.img]} style={{maxWidth: "100%", height: "auto"}} />)
            : null}
        {prevNext(props)}
    </div>)
}