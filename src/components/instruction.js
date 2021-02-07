import * as text from '../assets/text'
import { prevNext } from '../lib/utils'

export default function Instruction(props) {
    return (<div>
        {text[props.id][props.ind]}
        {prevNext(props)}
    </div>)
}