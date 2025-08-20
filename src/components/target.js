export default function Target(props) {

    console.log('Target render - size:', props.size, 'x:', props.x, 'y:', props.y, 'isShrinking:', props.isShrinking); // Debug log

    const realX = (props.x * window.innerWidth) - 25; // Adjusted for 50px wrapper
    const realY = (props.y * window.innerHeight) - 25; // Adjusted for 50px wrapper
    const dotStyle = {
        transform: `translate(${realX}px, ${realY}px)`,
        transition: 'transform 1s ease-in-out',
    };

    // const smallDotSize = props.size * SMALL_DOT_RATIO
    const realXSmall = (props.x * window.innerWidth) - 6; // Adjusted for 12px wrapper
    const realYSmall = (props.y * window.innerHeight) - 6; // Adjusted for 12px wrapper
    const smallDotStyle = {
        transform: `translate(${realXSmall}px, ${realYSmall}px)`,
        transition: 'transform 1s ease-in-out',
    };

    return (
        <div>
            <div
                className="target-wrapper"
                style={dotStyle}
            >
                <div className={`target ${props.isSmall ? 'small' : ''}`} />
            </div>
            <div
                className="smalltarget-wrapper"
                style={smallDotStyle}
            >
                <div className={`smalltarget ${props.isSmall ? 'small' : ''}`} />
            </div>
        </div>
    );
}
