import { useEasybase } from 'easybase-react';
import { useState, useEffect } from "react"

import { userID } from '../assets/text'
import { prevNext } from '../lib/utils'

const universalPassword = "socialmedia"

export default function User(props) {
  const [usernameValue, setUsernameValue] = useState("")
  const [userAttributes, setUserAttributes] = useState(null)

  const {
    isUserSignedIn,
    signIn,
    signOut,
    signUp,
    getUserAttributes,
    setUserAttribute
  } = useEasybase();


  useEffect(() => {
    getUserAttributes().then(setUserAttributes)
  }, [setUserAttributes, getUserAttributes])

  async function signInUp() {
    const signInResponse = await signIn(usernameValue, universalPassword)
    if (!signInResponse.success) {
      const signUpResponse = await signUp(usernameValue, universalPassword)
      console.log("signed up with response:", signUpResponse)
    } else {
      console.log("signed in with response:", signInResponse)
    }
    setUserAttribute('id', usernameValue)
  }

  if (isUserSignedIn()) {
    if (userAttributes === null) {
      return (<p>Loading...</p>)
    } else {
      return (
        <div style={{textAlign: "center"}}>
          <p>Signed in as participant {userAttributes.id}.</p>
          <button style={{display:"inline"}} onClick={_ => signOut()}>Sign Out</button>
          { prevNext(props)}
        </div>
      )
    }
  } else {
    return (
      <div>
        {userID}
<<<<<<< HEAD
        <input type="text" className="sign-in" value={usernameValue} onChange={
=======
        <input type="text" style={{display: "block", margin: "0 auto"}} value={usernameValue} onChange={
>>>>>>> 85ffff948fae1777abb270de117790bad1aa3008
          e => setUsernameValue(e.target.value)
        } />
        { prevNext(props, signInUp)}
      </div>
    )
  }
}