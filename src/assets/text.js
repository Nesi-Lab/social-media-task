import { loading, logo } from './imgs'

export const userID = (<p style={{textAlign: "center"}}>Participant ID</p>)

const loadingImg = (<img src={loading} alt="loading gif" className="loading-gif" />)

export const loadingText = (<div style={{textAlign: "center"}}>
    {loadingImg}
    <p>Loading...</p>
    </div>)

export const introText = [
    (<div style={{textAlign: "center"}}>
        <img src={logo} alt="logo" class="logo"/>
        <h1>Welcome to <b>Connect</b>.</h1>
        <h1>Connect is a game about how people form first impressions online.</h1>
    </div>),

    (<div>
        <h1>Here’s how it works...</h1>
        <p>Connect is a live simulation game. People are participating <i>right now</i> at multiple sites throughout Rhode Island.</p>
        <p>Connect will search your social media networks to see if anyone you know is participating right now.</p>
        <p>On Connect, you will give your first impressions of other people and they will give their first impressions of you.</p>
        <p>Let's get started!</p>
    </div>),

    (<div>
        <h1>Here's how it works.</h1>
        <p>Connect users participating right now will be randomly paired with each other.</p>
        <p>There will be multiple rounds of the game.</p>
        <p>In each round, users will be providing their first impressions of the people they are paired with.</p>
    </div>)
]

export const socialMediaText = [
    (<p style={{textAlign: "left"}}>Please enter your phone number and check any social media sites you use. <b>Connect</b> will search your contacts to see if anyone you know is participating...</p>),
    
    (<p style={{ color: "red", textAlign: "left" }}>Remember: Connect is totally private. We will <i>never</i> access your personal information, post anything on your account, or notify your contacts.</p>),
    
    (<div>
        <p>There are a total of <span style={{ color: "lightgreen", fontSize: "larger" }}>68</span> users on Connect.</p>
        <p>You have <span style={{ color: "lightgreen", fontSize: "larger" }}>3</span> friends on Connect right now!</p>
        <p>You have <span style={{ color: "lightgreen", fontSize: "larger" }}>15</span> friends-of-friends on Connect right now!</p>
        <p>Connect will randomly pair users with each other. You may or may not be paired up with friends or friends-of-friends.</p>
    </div>)
]

export const profileText = [
    (<h1 style={{ textAlign: "left", fontWeight: "bold" }}>Time to create your profile!</h1>),

    (<div style={{ flex: "auto" }}>
        <p style={{ textAlign: "left" }}>Please upload a photo of yourself.</p>
        <p style={{ textAlign: "left" }}>Other people participating in Connect will see your photo.</p>
    </div>),

    (<p>How much do you like this photo? <span style={{color: "red"}}>(Other people won’t see your answer)</span></p>),

    (<div style={{ flex: "auto" }}>
        <p style={{ textAlign: "left" }}>Fill out this quick *personality quiz* so other teens on Connect can get to know you!</p>
        <p style={{ textAlign: "left" }}>Each question should be answered with just ONE or TWO words.</p>
    </div>),

    (<p>Your bio is:</p>),

    (<p style={{fontSize: "x-large"}}>How much does this bio represent who you are? <br /><span style={{color: "red"}}>(Other people won’t see your answer)</span></p>),

    (<h1>You're all set!</h1>)
]

export const faceCheckText = (<p>Please ensure that your face is centered and clearly visible and that the box is <span style={{color: "#32CD32"}}>green</span>. Try your best not to move too much, especially not closer or further from the screen. This helps us get accurate data.</p>)

export const calibrationText = [
    (<p>Make sure your screen is set up the way you want. From here on, make sure that you do not resize your screen.</p>),
    (<div>
        <p>The following screen will calibrate your eye movements.</p>
        <p>You will see a series of <span style={{color: "red"}}>red</span> buttons. Click on each button 5 times while looking at the button, until it turns <span style={{color: "#ffee00"}}>yellow</span>.</p>
        <p>Always follow the mouse with your eyes.</p>
        </div>),
    (<p>To finish calibrating your eye tracking, the next screen will have a <span style={{color: "#ffee00"}}>yellow</span> dot. Please don't move your mouse and stare at this dot for 5 seconds.</p>),
    (<p style={{textAlign: "center"}}>All set!</p>),
    (<p>The next screen will have a <span style={{color: "#ffee00"}}>yellow</span> dot. Please don't move your mouse and stare at this dot for 5 seconds.</p>),
]

export const bioQuestions = {
    word: "One word that describes you:",
    activity: "One thing you like to do in your free time:",
    place: "One place you’d like to travel to in the future:",
    artist: "One artist you’re listening to right now:",
    color: "Your favorite color:",
    emoji: "Pick one emoji:"
}

export const emojis = ["🙃","🐳","✨","🎉","🌸","🏆","😻","🌎"]

// the variable names like "town" in "info.town" correspond to the ids in bioQuestions
// export const makeBio = (info) => (<span><i>{info.show} </i>{info.emoji}<i> {info.activity}</i></span>)
// export const makeBioPlain = (info) => `${info.show} ${info.emoji} ${info.activity}`
export const makeBioPlain = (info) => [info.word, info.activity, info.place, info.artist, info.color].join("  |  ") + " " + info.emoji
export const makeBio = (info) => (<span>{makeBioPlain(info)}</span>)

export const feelingInstruction = [(<div>
    <p>Throughout the task, you will be instructed to rate how you feel.</p>
    <p style={{ color: "red" }}>This information will be completely private. Only the researchers will see your ratings.</p>
</div>)]

export const feelingText = (<div style={{fontSize: "smaller"}}>
    <p>Here are a number of words that describe different feelings and emotions.</p>
    <p>Please indicate how much you feel this way <i>right now</i>, in the present moment.</p>
    <p style={{ color: "red" }}>This information is completely private. Only the researchers will see your ratings.</p>
</div>)

export const feelingList = ["Excited", "Upset", "Included", "Excluded", "Mad", "Worried", "Relaxed", "Sad", "Happy", "Unpopular", "Popular", "Embarrassed", "Bored", "Proud"]

export const rateText = (<p style={{ backgroundColor: "#3C3C3C", borderRadius: "10px", padding: "10px", marginTop: "30px", fontSize: "25px" }}>
    How much would you like to be friends with this person?
</p>)

export const interpretationText = (<div>
    <h1>How much does this person want to be friends with you?</h1>
    <p style={{color: "red"}}>This information won't be seen by other users.</p>
    </div>)

export const watchText = {
    withYou: (n) => (<p style={{ marginTop: "10px" }}><b>You</b> and <br /><span style={{ fontSize: "50px" }}><b>{n}</b></span><br /> other people are watching</p>),
    withoutYou: (n) => (<p style={{ marginTop: "20px", fontSize: "larger" }}><span style={{ fontSize: "50px" }}><b>{n}</b></span><br /> people are <br />watching</p>),
    summary: (n) => [
        (<p style={{ fontSize: "60px" }}><b>{n}</b></p>),
        (<span style={{ textAlign: "left" }}>people are <br />watching</span>)
    ]
}

export const tutorialText = [
    (<h1 style={{textAlign: "left"}}>Here's how it will look...</h1>)
]

export const blockBeginningText = [
    (<div>
        <h1>Let’s get started!</h1>
        <p>In Round 1, Connect will randomly select you to view others’ ratings, so you can see what’s happening in the game.</p>
    </div>),
        
    (<div>
        <h1>Great job!</h1>
        <p>In Round 2, you’re the rater!</p>
        <p>Connect will randomly pair you with other users, and you will rate how much you think you’d like to be friends with them.</p>
    </div>),

    (<div>
        <h1>Now it’s your turn!</h1>
        <p>In Round 3, you’ll get to see what other users think of you!</p>
        <p>Connect will randomly pair you with other users, and they will rate how much they’d like to be friends with you.</p>
    </div>),
    
    (<h1>Let's get started!</h1>)
]

export const betweenBlocksText = [
    (<h1>Let's continue.</h1>)
]

export const endingText = [
    (<h1>You're all done.</h1>)
]

export const beforeSummaryText = [
    (<h1>See how you did compared to other Connect users!</h1>),
    (<div style={{textAlign: "center"}}>
        {loadingImg}
        <p>Calculating average scores...</p>
    </div>)
]

export const sliderLabels = [
    (<span style={{ fontSize: "smaller", textAlign: "left" }}>Not at all</span>),
    (<span style={{ fontSize: "smaller", textAlign: "center" }}>Somewhat</span>),
    (<span style={{ fontSize: "smaller", textAlign: "right" }}>A lot</span>)
]