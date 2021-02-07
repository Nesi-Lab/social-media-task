import { useEasybase } from 'easybase-react';
import { useEffect } from 'react';

import { socialMediaImgs } from '../assets/imgs'
import { socialMediaText } from '../assets/text'
import { prevNext, addOrUpdateTable } from '../lib/utils'

function makeOption(socialMedia) {
    const img = socialMediaImgs[socialMedia]
    return (<div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
        <input type="checkbox" id={socialMedia} name={socialMedia} value={socialMedia} />
        <label htmlFor={socialMedia}><img src={img} style={{ width: "75px", margin: "10px" }} /></label>
        <input type="text" placeholder={socialMedia == "fb" ? "Email/phone" : "Username"} style={{ width: "180px" }} />
        <br />
    </div>)
}

export default function LinkSM(props) {
    const {
        Frame,
        sync,
        configureFrame,
        addRecord,
        isUserSignedIn
    } = useEasybase();

    const eb = {Frame: Frame, sync: sync, configureFrame: configureFrame}

    useEffect(() => {
        configureFrame({ tableName: "METADATA" })
        sync()
      }, [])
    
    async function save() {
        const checked = Object.keys(socialMediaImgs).filter(
            e => document.getElementById(e).checked
        )
        if (isUserSignedIn()) {
            if (!(await addRecord({
                insertAtEnd: true,
                newRecord: { name: "social-medias", value: checked.join(",") },
                tableName: "METADATA"
            })).success) { console.log("failed to add social media record") }
            if (!configureFrame({ tableName: "METADATA" }).success) {
                console.log("failed to configure frame")
            }
            if (!(await sync()).success) { console.log("failed to sync") }
        }
        // addOrUpdateTable("METADATA", "name", { name: "social-medias", value: checked.join(",") }, eb)
        // const r = await addRecord({ tableName: "METADATA", newRecord: {
        //     name: "social-medias",
        //     value: checked.join(",")
        //   } })
        // console.log(r)
        // sync()
        // console.log("h", Frame())
    }

    return (<div>
        {socialMediaText[0]}
        {Object.keys(socialMediaImgs).map(makeOption)}
        {socialMediaText[1]}
        {prevNext(props, save)}
    </div>)
}