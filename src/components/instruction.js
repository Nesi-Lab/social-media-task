import { useEffect } from "react";

import * as text from '../assets/text';
import { tutorialImgs } from '../assets/imgs';
import { prevNext } from '../lib/utils';
import { useScreen } from './ScreenContext';

export default function Instruction(props) {
    const { setScreen } = useScreen();

    useEffect(() => {
        console.log('Instruction: rendering with props:', props);
        setScreen(`instruction ${props.id} ${props.ind}`);
    }, []);

    // Add error handling for missing text
    const textContent = text[props.id] && text[props.id][props.ind] ? text[props.id][props.ind] : <p>Error: Text not found for {props.id}[{props.ind}]</p>;

    return (<div>
        {textContent}
        {Object.keys(props).includes("img") ?
            (<img src={tutorialImgs[props.img]} alt="tutorial slide" className="tutorial-slide" />)
            : null}
        <div style={Object.keys(props).includes("img") ? {marginTop: "-40px", marginBottom: "-50px"} : {}}>{prevNext(props)}</div>
    </div>);
}