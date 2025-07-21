import { useEffect } from "react";

import * as text from '../assets/text';
import { tutorialImgs, logo } from '../assets/imgs';
import { prevNext } from '../lib/utils';
import { useScreen } from './ScreenContext';

export default function Instruction(props) {
    const { setScreen } = useScreen();

    useEffect(() => {
        setScreen(`instruction ${props.id} ${props.ind}`);
    }, []);
    return (<div>
        {text[props.id][props.ind]}
        {Object.keys(props).includes("img") ?
            (<img src={tutorialImgs[props.img]} alt="tutorial slide" className="tutorial-slide" />)
            : null}
        <div style={Object.keys(props).includes("img") ? {marginTop: "-40px", marginBottom: "-50px"} : {}}>{prevNext(props)}</div>
    </div>);
}