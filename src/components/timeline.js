import { useState } from "react";
import timelineConfig from './timeline.config.json';
import { useParticipant } from './ParticipantContext';
import trialProps from '../lib/trialProps';
import User from './user';
import FaceCheck from './faceCheck';
import Instruction from './instruction';
import Calibration from './calibration';
import NewCalibration from "./newCalibration";
import Feeling from './feeling';
import LinkSM from './linkSM';
import Profile from './profile';
import Block from './block';
import Summary from './summary';

// Points arrays for calibration steps
const fourPoints = [
    [.25, .25],
    [.25, .75],
    [.75, .75],
    [.75, .25]
];
const ninePoints = [
    [.05, .05], [.05, .5], [.05, .95], [.5, .95], [.95, .95], [.95, .5], [.95, .05], [.5, .05], [.5, .5]
];

// Map config 'type' to React component
const componentMap = {
    User,
    FaceCheck,
    Instruction,
    Calibration,
    NewCalibration,
    Feeling,
    LinkSM,
    Profile,
    Block,
    Summary
};

// Map of prop injectors for special-case handling
const propInjectors = {
    Profile: (props, helpers) => ({
        ...props,
        setParticipantImgTimeline: helpers.setParticipantImgTimeline,
        setParticipantBioTimeline: helpers.setParticipantBioTimeline,
    }),
    User: (props, helpers) => ({
        ...props,
        setParticipantId: helpers.setParticipantId,
    }),
    Block: (props, helpers) => ({
        ...props,
        ...helpers.blockProps[props.blockPropsIndex],
    }),
    Summary: (props, helpers) => ({
        ...props,
        ...helpers.blockProps[props.blockPropsIndex],
    }),
    NewCalibration: (props) => ({
        ...props,
        points: props.points === "fourPoints" ? fourPoints : props.points === "ninePoints" ? ninePoints : props.points,
    }),
    Instruction: (props, helpers) => ({
        ...props,
        prev: helpers.prev,
        next: helpers.next,
        curr: { i: helpers.currScreen },
    }),
    Feeling: (props, helpers) => ({
        ...props,
        prev: helpers.prev,
        next: helpers.next,
        curr: { i: helpers.currScreen },
        loc: props.loc,
    }),
    LinkSM: (props, helpers) => ({
        ...props,
        prev: helpers.prev,
        next: helpers.next,
        curr: { i: helpers.currScreen },
    }),
};

export default function Timeline() {
    const { participantId, setParticipantId } = useParticipant();
    const [currScreen, setCurrScreen] = useState(0);
    const [participantImgTimeline, setParticipantImgTimeline] = useState(null);
    const [participantBioTimeline, setParticipantBioTimeline] = useState(null);
    const [blockProps, setBlockProps] = useState(trialProps());

    // Clamp navigation to valid range
    const goTo = (i) => {
        if (i < 0) i = 0;
        if (i >= timelineConfig.length) i = timelineConfig.length - 1;
        setCurrScreen(i);
    };
    const prev = (curr) => goTo(curr - 1);
    const next = (curr) => goTo(curr + 1);

    // Render a timeline step from config, using prop injectors for special cases
    function renderStep(step, i, helpers) {
        if (!step) return <div>Invalid timeline step (index {i})</div>;
        const Comp = componentMap[step.type];
        if (!Comp) return <div>Unknown component type: {step.type}</div>;
        let props = { ...step, curr: { i }, next: helpers.next, prev: helpers.prev };
        // Apply prop injector if exists
        if (propInjectors[step.type]) {
            props = propInjectors[step.type](props, { ...helpers, currScreen: i });
        }
        return <Comp key={i} {...props} />;
    }

    // Guard against out-of-bounds
    if (currScreen < 0 || currScreen >= timelineConfig.length) {
        return <div>End of timeline</div>;
    }
    // Pass all helpers needed for prop injection
    const helpers = {
        next,
        prev,
        setParticipantId,
        setParticipantImgTimeline,
        setParticipantBioTimeline,
        blockProps,
    };
    return renderStep(timelineConfig[currScreen], currScreen, helpers);
}