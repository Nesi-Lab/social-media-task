import { useEasybase } from 'easybase-react';
import { useState, useEffect } from "react"

import { userID, loadingText } from '../assets/text'
import { prevNext } from '../lib/utils'

const universalPassword = "socialmedia"
const loadingSecs = 1

export default function User(props) {
  const [usernameValue, setUsernameValue] = useState("")
  const [userAttributes, setUserAttributes] = useState(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    props.curr.wgLogs.push({ timestamp: Date.now(), id: "start-user", usernameValue: usernameValue, userAttributes: userAttributes })
  }, [])

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000 * loadingSecs)
      // Clear timeout if the component is unmounted
      return () => clearTimeout(timer)
    }
  }, [loading, setLoading])

  async function alreadySignedIn() {
    props.setParticipantId(userAttributes.id)
  }

  async function signInUp() {
    const signInResponse = await signIn(usernameValue, universalPassword)
    if (!signInResponse.success) {
      const signUpResponse = await signUp(usernameValue, universalPassword)
      console.log("signed up with response:", signUpResponse)
    } else {
      console.log("signed in with response:", signInResponse)
    }
    setUserAttribute('id', usernameValue)
    props.setParticipantId(usernameValue)
    props.curr.wgLogs.push({ timestamp: Date.now(), id: "end-user", usernameValue: usernameValue, userAttributes: userAttributes })
  }

  if (loading) {
    return loadingText
  } else {
    if (isUserSignedIn()) {
      if (userAttributes === null) {
        return loadingText
      } else {
        return (
          <div style={{ textAlign: "center" }}>
            <p>Signed in as participant {userAttributes.id}.</p>
            <button style={{ display: "inline" }} onClick={_ => signOut()}>Sign Out</button>
            { prevNext(props, alreadySignedIn)}
          </div>
        )
      }
    } else {
      return (
        <div>
          {userID}
          <input type="text" className="sign-in" value={usernameValue} onChange={
            e => setUsernameValue(e.target.value)
          } />
          { prevNext(props, signInUp)}
        </div>
      )
    }
  }
}