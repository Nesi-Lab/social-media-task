export const userID = (<p>Participant ID</p>)

export const introText = [
    (<div>
        <h1 style={{ textAlign: "center" }}>Welcome to <b>Connect</b>.</h1>
        <h1 style={{ textAlign: "center" }}>Connect is a game about how people form first impressions online.</h1>
    </div>),

    (<div>
        <h1 style={{ textAlign: "left" }}>Here’s how it works...</h1>
        <p style={{ textAlign: "left" }}>Connect is a live simulation game. People are participating <i>right now</i> at multiple sites throughout Rhode Island.</p>
        <p style={{ textAlign: "left" }}>Connect will search your social media networks to see if anyone you know is participating right now.</p>
        <p style={{ textAlign: "left" }}>On Connect, you will give your first impressions of other people and they will give their first impressions of you.</p>
        <p style={{ textAlign: "center" }}>Let's get started!</p>

    </div>)
]

export const socialMediaText = [
    (<p style={{ textAlign: "left" }}>Please check any social media sites you use. <b>Connect</b> will search your contacts to see if anyone you know is participating...</p>),
    (<p style={{ textAlign: "left", color: "red" }}>Remember: Connect is totally private. We will <i>never</i> access your personal information, post anything on your account, or notify your contacts.</p>),
    (<div>
        <p style={{ textAlign: "left" }}>There are a total of <span style={{ color: "lightgreen", fontSize: "larger" }}>53</span> users on Connect.</p>
        <p style={{ textAlign: "left" }}> You have <span style={{ color: "lightgreen", fontSize: "larger" }}>3</span> friends on Connect right now!</p>
        <p style={{ textAlign: "left" }}>You have <span style={{ color: "lightgreen", fontSize: "larger" }}>15</span> friends-of-friends on Connect right now!</p>
    </div>),
]

export const profileText = [
    (<h1 style={{ textAlign: "left", fontWeight: "bold" }}>Time to create your profile!</h1>),
    (<div style={{ flex: "auto" }}>
        <p style={{ textAlign: "left" }}>Please upload a photo of yourself.</p>
        <p style={{ textAlign: "left" }}>Other people participating in Connect will see your photo.</p>
    </div>),
    (<p style={{ textAlign: "left" }}>How much do you like this photo? (Other people won’t see your answer)</p>)

]

export const feelingText = (<div>
    <p>Here are a number of words that describe different feelings and emotions.</p>
    <p>Please indicate how much you feel this way <i>right now</i>, in the present moment.</p>
    <p style={{ color: "red" }}>This information is completely private. Only the researchers will see your ratings.</p>
</div>)

export const feelingList = ["Joyful", "Miserable", "Cheerful", "Mad", "Afraid", "Happy", "Sad", "Scared", "Lively", "Anxious", "Embarrassed", "Proud", "Annoyed"]

export const rateText = (<p style={{ backgroundColor: "#3C3C3C", borderRadius: "10px", padding: "10px", marginTop: "30px" }}>
    How much would you like to be friends with this person?
</p>)

export const interpretationText = (<h1>How much does this person want to be friends with you?</h1>)

export const watchText = {
    withYou: (n) => (<p style={{ marginTop: "10px" }}><b>You</b> and <br /><span style={{ fontSize: "50px" }}><b>{n}</b></span><br /> other people are watching</p>),
    withoutYou: (n) => (<p style={{ marginTop: "20px", fontSize: "larger" }}><span style={{ fontSize: "50px" }}><b>{n}</b></span><br /> people are <br />watching</p>),
    summary: (n) => [
        (<p style={{ fontSize: "60px"}}><b>{n}</b></p>),
        (<span style={{ textAlign: "left"}}>people are <br />watching</span>)
    ]
}