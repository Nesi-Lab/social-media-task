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

    // Check if tutorial image is needed
    const hasImage = Object.keys(props).includes("img");
    const imageSrc = hasImage ? tutorialImgs[props.img] : null;

    return (<div>
        <div style={{ minHeight: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {textContent}
        </div>
        {hasImage ? (
            <div className="instruction-container">
                <img
                    src={imageSrc}
                    alt="tutorial slide"
                    className="tutorial-slide"
                />
            </div>
        ) : null}
        <div style={hasImage ? { marginTop: "-40px", marginBottom: "-50px" } : {}}>
            {prevNext(props)}
        </div>
    </div>);
}
