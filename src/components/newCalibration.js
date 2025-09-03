import { useState, useEffect, useRef, useCallback } from 'react';
import Instruction from './instruction';
import Target from './target';
import { useWriteData } from '../hooks/useWriteData';
import { useWebgazer } from './WebgazerContext';
import { useScreen } from './ScreenContext';
import { useParticipant } from './ParticipantContext';

const NUM_SAMPLES = 5;
const PUASE_TIME = 2000;
const COLLECT_INTERVAL = 200;
const NORMAL_DOT_SIZE = 1;
const NUM_TEST_POINTS = 5;
const TIME = 1000;

const AnimationState = {
    Shrinking: "SHRINKING",
    Moving: "MOVING",
    Collecting: "COLLECTING"
};

export default function NewCalibration(props) {

    const [done, setDone] = useState(false);
    const [regressed, setRegressed] = useState(false);
    const [counter, setCounter] = useState(0);
    const [dotSize, setDotSize] = useState(NORMAL_DOT_SIZE);
    const [animState, setAnimState] = useState(AnimationState.Moving); // Start with moving
    const [testing, setTesting] = useState([]);
    const [isSmall, setIsSmall] = useState(false);
    const [dotLoc, setDotLoc] = useState({ x: 0, y: 0 }); // Start in top left

    const timeRef = useRef();
    const numSamples = useRef();
    const shrinkIntervalRef = useRef();
    const collectIntervalRef = useRef();

    const wg = useWebgazer();
    const { setScreen } = useScreen();
    const { participantId } = useParticipant();

    // Use the custom hook for automatic timestamp handling
    const writeDataWithTimestamp = useWriteData();

    // Set screen for logging
    useEffect(() => {
        if (props.test) {
            setScreen("accuracy");
        } else {
            setScreen("calibration");

            if (participantId) {
                writeDataWithTimestamp("metadata", {
                    name: "screen-width",
                    value: window.innerWidth
                }, participantId);
                writeDataWithTimestamp("metadata", {
                    name: "screen-height",
                    value: window.innerHeight
                }, participantId);
            }

            wg.clearData();
        }
    }, [props.test, participantId, writeDataWithTimestamp, wg]);

    /**
     * Computes the accuracy of webgazer given a set of prediction and ground truth points
     */
    function computeAccuracy() {
        let sum = 0;
        testing.forEach(item => {
            const errorX = item.x - item.realX;
            const errorY = item.y - item.realY;
            const error = Math.sqrt(errorX ** 2 + errorY ** 2);
            sum = sum + error;
        });
        return sum / testing.length;
    }

    /**
     * Move to the next point using CSS transitions
     */
    const moveToNextPoint = useCallback(() => {
        if (counter < props.points.length) {
            const point = props.points[counter];
            setDotLoc({ x: point[0], y: point[1] });
            setIsSmall(false); // Reset to normal size when moving
            setDotSize(NORMAL_DOT_SIZE);

            // Wait for CSS transition to complete, then pause, then start collection
            setTimeout(() => {
                // Pause for a moment at the position before shrinking
                setTimeout(() => {
                    setIsSmall(true); // Set the dot to small size
                    setAnimState(AnimationState.Collecting);
                }, 500); // 500ms pause at the position
            }, TIME);
        }
    }, [counter, props.points, TIME]);

    /**
     * Handle collection phase
     */
    const startCollection = useCallback(() => {
        timeRef.current = Date.now();
        numSamples.current = 0;

        collectIntervalRef.current = setInterval(() => {
            const timestamp = Date.now();
            const realX = props.points[counter][0] * window.innerWidth;
            const realY = props.points[counter][1] * window.innerHeight;
            const gap = timestamp - timeRef.current;

            // Calibration
            if (!props.test && gap / COLLECT_INTERVAL > numSamples.current + 2 && numSamples.current < NUM_SAMPLES) {
                wg.recordScreenPosition(realX, realY);
                numSamples.current = numSamples.current + 1;

            // Testing
            } else if (props.test && gap / COLLECT_INTERVAL > numSamples.current + 2 && numSamples.current < NUM_TEST_POINTS) {
                const pred = wg.getCurrentPrediction();

                if (pred) {
                    pred.then(value => {
                        if (value && value.x && value.y) {
                            setTesting(prev => [...prev, { x: value.x, y: value.y, realX: realX, realY: realY }]);
                        }
                    });
                }
                numSamples.current = numSamples.current + 1;
            }

            // Done pausing
            if (gap >= PUASE_TIME) {
                clearInterval(collectIntervalRef.current);
                setCounter(counter + 1);
                setDotSize(NORMAL_DOT_SIZE);
                setAnimState(AnimationState.Moving);
            }
        }, COLLECT_INTERVAL);
    }, [counter, props.points, props.test, wg, PUASE_TIME, COLLECT_INTERVAL, NUM_SAMPLES, NUM_TEST_POINTS]);

    // Monitor dotSize changes
    useEffect(() => {
        console.log('dotSize changed to:', dotSize);
    }, [dotSize]);

    // Handle animation state changes
    useEffect(() => {
        console.log('Animation state changed to:', animState); // Debug log
        if (done) {
            return;
        }

        if (animState === AnimationState.Moving) {
            console.log('Starting move to next point'); // Debug log
            moveToNextPoint();
        } else if (animState === AnimationState.Collecting) {
            console.log('Starting collection'); // Debug log
            startCollection();
        }
    }, [animState, moveToNextPoint, startCollection, done]);

    // Handle counter changes
    useEffect(() => {
        if (!done && counter === props.points.length) {
            setDone(true);

            // If this was a test, compute the accuracy
            if (props.test) {
                const acc = computeAccuracy();
                console.log("acc:", acc);
                writeDataWithTimestamp("metadata", {
                    name: `calibration-accuracy${props.loc ? '-' + props.loc : ''}`,
                    value: acc.toString()
                }, participantId);

            // If this was a calibration, train the model
            } else {
                setTimeout(() => {
                    console.log("Regressing");
                    const model = wg.getRegression()[0];
                    model.train();
                    setRegressed(true);
                }, 0);
            }
        }
    }, [counter, done, props.test, props.loc, participantId, wg, writeDataWithTimestamp]);

    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (collectIntervalRef.current) {
                clearInterval(collectIntervalRef.current);
            }
        };
    }, []);

    if (!done) {
        return (
            <div>
                <Target x={dotLoc.x} y={dotLoc.y} size={dotSize} isSmall={isSmall}/>
            </div>
        );
    } else if (!regressed && !props.test) {
        return (<div><p style={{ textAlign: "center" }}>Please wait...</p></div>);
    } else {
        if (props.test) {
            return (<Instruction id="calibrationText" ind="3" next={props.next} prev={props.prev} curr={props.curr} />);
        } else {
            return (<Instruction id="calibrationText" ind="2" next={props.next} prev={props.prev} curr={props.curr} />);
        }
    }
}
