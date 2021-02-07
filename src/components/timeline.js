import { useState, useEffect, useCallback } from "react"
import { useEasybase } from 'easybase-react';

import Instruction from './instruction'
import LinkSM from './linkSM'
import User from './user'
import LoadSM from './loadSM'
import ProfileImg from './profileImg'
import Feeling from './feeling'
import { trialProps } from '../lib/utils'
import Block from './block'


export default function Timeline() {

    const [currScreen, setCurrScreen] = useState(0)
    const [participantImg, setParticipantImg] = useState(null)
    const [participantBio, setParticipantBio] = useState(null)

    const prev = (c) => { setCurrScreen(c - 1) }
    const next = (c) => { setCurrScreen(c + 1) }

    const props = trialProps()

    const timeline = [
        (c) => <User next={next} curr={c.i} />,
        (c) => <Feeling loc="beginning" prev={prev} next={next} curr={c.i} />,
        (c) => <Instruction id="introText" ind="0" next={next} prev={prev} curr={c.i} />,
        (c) => <Instruction id="introText" ind="1" next={next} prev={prev} curr={c.i} />,
        // (c) => <LinkSM next={next} prev={prev} curr={c.i} />,
        // (c) => <LoadSM next={next} curr={c.i} />,
        (c) => <ProfileImg next={next} curr={c.i} setParticipantImg={setParticipantImg}/>,

        (c) => <Block next={next} curr={c} props={props[0]} />,
        (c) => <Block next={next} curr={c} props={props[1]} />,
        (c) => <Block next={next} curr={c} props={props[2]} />,
        (c) => <Block next={next} curr={c} props={props[3]} />,
        (c) => <Block next={next} curr={c} props={props[4]} />,
        (c) => <Block next={next} curr={c} props={props[5]} />,
        (c) => <Block next={next} curr={c} props={props[6]} />,
    ]
    return timeline[currScreen]({i: currScreen, img: participantImg, bio: participantBio})
}

