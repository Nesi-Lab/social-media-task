import { useState, useEffect } from 'react';

import { feelingText, feelingList } from '../assets/text';
import { multiSlider, writeData, prevNext } from '../lib/utils';
import { pick } from 'lodash';
import { useScreen } from './ScreenContext';
import { useParticipant } from './ParticipantContext';

export default function Feeling(props) {

    // const [curr, setCurr] = useState(props.loc)
    const [vals, setVals] = useState(Object.fromEntries(feelingList.map(e => [e, "50"])));
    const [screenNum, setScreenNum] = useState(0);
    const { setScreen } = useScreen();
    const { participantId } = useParticipant();

    const splitInd = Math.floor(feelingList.length / 2);
    const feelingsToDisplay = feelingList.slice(...(screenNum === 0 ? [0, splitInd] : [splitInd]));
    const valsSubset = pick(vals, feelingsToDisplay);

    useEffect(() => {
        setScreen(`feeling 1`);
    }, []);

    async function handleSliderChange(e) {
        const changed = e.target.id;
        setVals({...vals, [changed]: document.getElementById(changed).value});
    }

    async function save() {
        writeData("feelings", Object.keys(vals).reduce(
            (a, c) => { return { ...a, [c.toLowerCase()]: vals[c] }; },
            { "location": props.loc }
        ), participantId);
    }

    function changeScreen() {
        setScreenNum(screenNum === 0 ? 1 : 0);
        setScreen(`feeling ${screenNum === 0 ? 1 + 1 : 0 + 1}`);
    }

    async function onNext() {
        save().then(() => props.next(props.curr.i));
    }

    return (<div>
        {feelingText}
        <div className="feeling-slider">
            {multiSlider(valsSubset, handleSliderChange)}
        </div>
        <div className="prev-next">
            {prevNext({
                ...props,
                prev: changeScreen,
                next: screenNum === 0 ? changeScreen : onNext
            })}
        </div>
    </div>);
}