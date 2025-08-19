import { sliderLabels } from '../assets/text';
import Button from '../components/Button';

export function prevNext(props, save = (async function () { })) {
    async function onPrev() {
        save().then(() => props.prev(props.curr.i));
    }
    async function onNext() {
        save().then(() => props.next(props.curr.i));
    }

    // Check if prev/next should be shown based on config
    const showPrev = props.showPrev !== false;
    const showNext = props.showNext !== false;
    
    // If neither button should be shown, return null
    if (!showPrev && !showNext) {
        return null;
    }

    return (
        <div className="prev-next" style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '32px 0' }}>
            {showPrev && (
                <Button
                    variant="secondary"
                    style={{ minWidth: 120 }}
                    onClick={onPrev}
                    disabled={!props.prev}
                >
                    Previous
                </Button>
            )}
            {showNext && (
                <Button
                    variant="primary"
                    style={{ minWidth: 120 }}
                    onClick={onNext}
                    disabled={props.disableNext}
                >
                    Next
                </Button>
            )}
        </div>
    );
}

const labels = (<div className="slider-labels">
    {sliderLabels}
</div>);

export function slider(name) {
    return (<div>
        <input type="range" id={name} min="1" max="100" defaultValue="50" className="slider" />
        {labels}
    </div>);
}

export function multiSlider(names, update) {
    const range = (name) => [
        (<label htmlFor={name}>{name}</label>),
        (<input type="range" id={name} min="1" max="100" key={name} value={names[name]} onChange={update} className="slider" />)
    ];
    return (<div className="multi-slider">
        <span></span> {labels}
        {Object.keys(names).map(range)}
        <span></span> {labels}
    </div>);
}

// export function getTime(date = null) {
//     const today = date ? date : new Date()
//     let h = today.getHours()
//     let m = today.getMinutes()
//     if (h < 10) { h = "0" + h }
//     if (m < 10) { m = "0" + m }
//     return h + ":" + m
// }

export async function writeData(table, data, participant_id) {
    if (participant_id == null) {
        console.log(`not writing data to ${table} because no participant ID yet or bad participant ID`);
        return;
    }
    data["participant_id"] = participant_id.toString();
    for (const k in data) {
        if (typeof data[k] === 'string' || data[k] instanceof String) {
            data[k] = "'" + data[k] + "'";
        } else if (data[k] == null) {
            delete data[k];
        }
    }
    if (table !== "eye_tracking") { data["timestamp"] = "NOW()"; }
    const response = await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: table, data: data }),
    });
    const body = await response.text();
    console.log(body);
}

export async function setTimezone(tz) {
    const response = await fetch('/settz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({tz: tz}),
    });
    const body = await response.text();
    console.log(body);
}