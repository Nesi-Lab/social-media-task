import { useState } from "react"

import Instruction from './instruction'
import LinkSM from './linkSM'
import User from './user'
import Profile from './profile'
import Feeling from './feeling'
import { trialProps } from '../lib/utils'
import Block from './block'
import CorsCheck from './corsCheck'
// import SetupWebgazer from './wg'

export default function Timeline() {

    const [currScreen, setCurrScreen] = useState(0)
    const [participantImgTimeline, setParticipantImgTimeline] = useState(null)
    const [participantBioTimeline, setParticipantBioTimeline] = useState(null)
    const [participantId, setParticipantId] = useState(null)

    const prev = (c) => { setCurrScreen(c - 1) }
    const next = (c) => { setCurrScreen(c + 1) }

    const props = trialProps()

    const timeline = [

        ///////////////
        // BEGINNING //
        ///////////////

        // setup
        (c) => <User next={next} curr={c} setParticipantId={setParticipantId} />,
        (c) => <CorsCheck prev={prev} next={next} curr={c} />,
        // (c) => <SetupWebgazer next={next} curr={c} />,
        (c) => <Feeling loc="beginning" prev={prev} next={next} curr={c} />,

        // // first set of instructions
        (c) => <Instruction id="introText" ind="0" next={next} prev={prev} curr={c} />,
        (c) => <Instruction id="introText" ind="1" next={next} prev={prev} curr={c} />,

        // // social media pages
        (c) => <LinkSM next={next} prev={prev} curr={c} />,

        // bio setup
        (c) => <Profile next={next} curr={c} setParticipantImgTimeline={setParticipantImgTimeline} setParticipantBioTimeline={setParticipantBioTimeline} />,

        //////////////
        // WATCHING //
        //////////////

        // beginning tutorial images
        (c) => <Instruction id="introText" ind="2" next={next} prev={prev} curr={c} />,
        (c) => <Instruction id="tutorialText" ind="0" img="0" next={next} prev={prev} curr={c} />,
        (c) => <Instruction id="tutorialText" ind="0" img="1" next={next} prev={prev} curr={c} />,
        (c) => <Instruction id="tutorialText" ind="0" img="2" next={next} prev={prev} curr={c} />,
        (c) => <Instruction id="tutorialText" ind="0" img="3" next={next} prev={prev} curr={c} />,
        (c) => <Instruction id="tutorialText" ind="0" img="4" next={next} prev={prev} curr={c} />,
        (c) => <Instruction id="tutorialText" ind="0" img="5" next={next} prev={prev} curr={c} />,

        // // getting started screen
        (c) => <Instruction id="blockBeginningText" ind="0" next={next} prev={prev} curr={c} />,

        // // content
        (c) => <Block next={next} curr={c} props={props[0]} />,

        ////////////
        // RATING //
        ////////////

        // getting started screen
        (c) => <Instruction id="blockBeginningText" ind="1" next={next} curr={c} />,

        // content
        (c) => <Block next={next} curr={c} props={props[1]} />,
        (c) => <Instruction id="betweenBlocksText" ind="0" next={next} curr={c} />,
        (c) => <Block next={next} curr={c} props={props[2]} />,

        ///////////
        // RATED //
        ///////////

        // getting started screen
        (c) => <Instruction id="blockBeginningText" ind="2" next={next} curr={c} />,

        // rated tutorial images
        (c) => <Instruction id="tutorialText" ind="0" img="6" next={next} prev={prev} curr={c} />,
        (c) => <Instruction id="tutorialText" ind="0" img="7" next={next} prev={prev} curr={c} />,
        (c) => <Instruction id="tutorialText" ind="0" img="8" next={next} prev={prev} curr={c} />,

        // content
        (c) => <Block next={next} curr={c} props={props[3]} />,
        (c) => <Instruction id="betweenBlocksText" ind="0" next={next} curr={c} />,
        (c) => <Block next={next} curr={c} props={props[4]} />,
        (c) => <Instruction id="betweenBlocksText" ind="0" next={next} curr={c} />,
        (c) => <Block next={next} curr={c} props={props[5]} />,
        (c) => <Instruction id="betweenBlocksText" ind="0" next={next} curr={c} />,
        (c) => <Block next={next} curr={c} props={props[6]} />,

        // ending
        (c) => <Instruction id="endingText" ind="0" curr={c} />,
    ]
    return timeline[currScreen]({ i: currScreen, img: participantImgTimeline, bio: participantBioTimeline, id: participantId })
}

