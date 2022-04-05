export default function Target(props) {

    const realX = (props.x * window.innerWidth) - 20
    const realY = (props.y * window.innerHeight) - 20
    const dotStyle = {
        backgroundColor: 'red',
        transform: `translate(${realX}px, ${realY}px) scale(${props.size})`,

    };

    // const smallDotSize = props.size * SMALL_DOT_RATIO
    const realXSmall = (props.x * window.innerWidth) - 5
    const realYSmall = (props.y * window.innerHeight) - 5
    const smallDotStyle = {
        backgroundColor: 'white',
        transform: `translate(${realXSmall}px, ${realYSmall}px) scale(${props.size})`,
    }
    // console.log("Dot Syle: ", dotStyle)

    return (
    <div>
    <div 
        className="target"
        style={dotStyle}
    />
    <div
        className="smalltarget"
        style={smallDotStyle}
    />
    </div>

    
    );
}