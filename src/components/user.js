import { useState, useEffect } from "react"

import { userID, loadingText } from '../assets/text'
import { prevNext, setTimezone } from '../lib/utils'

const loadingSecs = 5

export default function User(props) {
  const [usernameValue, setUsernameValue] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    props.curr.wg.screen.screen = "user"
  }, [])

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false)
        setTimezone("America/New_York")
      }, 1000 * loadingSecs)
      // Clear timeout if the component is unmounted
      return () => clearTimeout(timer)
    }
  }, [loading, setLoading])

  if (loading) {
    return loadingText
  } else {
    return (
      <div>
        {userID}
        <input type="text" className="sign-in" value={usernameValue} onChange={
          e => setUsernameValue(e.target.value)
        } />
        { usernameValue === "" ? null : prevNext(props, async () => {
          props.setParticipantId(usernameValue)
          console.log(`id: ${usernameValue}`)
        })}
      </div>
    )
  }
}