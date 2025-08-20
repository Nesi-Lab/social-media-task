import { sliderLabels } from '../assets/text';
import Button from '../components/Button';
import { x, check, logo, loading, eye, upThumb, downThumb } from '../assets/imgs';

export function prevNext(props, save = null) {
    async function onPrev() {
        try {
            if (save && typeof save === 'function') {
                await save();
            }
            props.prev();
        } catch (error) {
            console.error('Error in save function:', error);
            props.prev();
        }
    }
    async function onNext() {
        try {
            if (save && typeof save === 'function') {
                await save();
            }
            props.next();
        } catch (error) {
            console.error('Error in save function:', error);
            props.next();
        }
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
                    disabled={!props.next || props.disableNext}
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

// Function to extract all image URLs from block data for preloading
export function extractAllImageUrls(blockProps) {
    const imageUrls = new Set();
    
    // Add static images used throughout the app
    const staticImages = [
        x,
        check,
        logo,
        loading,
        eye,
        upThumb,
        downThumb
    ];
    staticImages.forEach(img => imageUrls.add(img));
    
    // Add tutorial images
    const tutorialImages = require('../assets/imgs').tutorialImgs;
    tutorialImages.forEach(img => imageUrls.add(img));
    
    // Add social media images
    const socialMediaImages = Object.values(require('../assets/imgs').socialMediaImgs);
    socialMediaImages.forEach(img => imageUrls.add(img));
    
    // Extract images from all blocks
    blockProps.forEach(block => {
        if (block.trials) {
            block.trials.forEach(trial => {
                if (trial.rater?.img) imageUrls.add(trial.rater.img);
                if (trial.ratee?.img) imageUrls.add(trial.ratee.img);
            });
        }
        
        // Also check summaries if they exist
        if (block.summaries) {
            block.summaries.forEach(summary => {
                if (summary.left?.img) imageUrls.add(summary.left.img);
                if (summary.right?.img) imageUrls.add(summary.right.img);
            });
        }
    });
    
    return Array.from(imageUrls);
}

// Function to preload all images (now just for browser cache)
export function preloadAllImages(imageUrls) {
    console.log(`Preloading ${imageUrls.length} images for browser cache...`);
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
};
