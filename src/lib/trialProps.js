import { impersonatorImgs } from '../assets/imgs'

// shuffle the items in an array randomly
function shuffleArray(array) {
    let currentIndex = array.length
    let temporaryValue, randomIndex
    // While there remain elements to shuffle
    while (0 !== currentIndex) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1
        // And swap it with the current element
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }
    return array
}

function trialProps() {
    const allData = require('../assets/impersonators.json')
    const blocks = allData.blocks, bios = allData.bios

    const lookupImp = (id) => {
        return {
            img: impersonatorImgs[id],
            bio: bios[id].bio,
            score: bios[id].mean_score,
            id: id
        }
    }

    const ratingOrd = shuffleArray(["m", "f"])

    const ratedOrd = shuffleArray([
        shuffleArray([{ gen: "f", maj: "acc" }, { gen: "f", maj: "rej" }]),
        shuffleArray([{ gen: "m", maj: "acc" }, { gen: "m", maj: "rej" }])
    ])

    const watchingProps = {
        blockInfo: { type: "watching", number: 1 },
        trials: blocks.watching.map(e => {
            return {
                rater: lookupImp(e.rater),
                ratee: lookupImp(e.ratee),
                watching: e.num_watching,
                score: e.score
            }
        })
    }

    const ratingProps = (gender, blockNum) => {
        return {
            blockInfo: {
                type: "rating",
                number: blockNum,
                gender: gender
            },
            trials: blocks.rating[gender].map(e => {
                return {
                    ratee: lookupImp(e.ratee),
                    watching: e.num_watching
                }
            })
        }
    }

    const ratedProps = (genMaj, blockNum) => {
        const gender = genMaj.gen, majority = genMaj.maj
        const allInfo = blocks.rated[gender][majority]
        return {
            blockInfo: {
                type: "rated",
                number: blockNum,
                gender: gender,
                majority: majority
            },
            trials: allInfo.trial.map(e => {
                return {
                    rater: lookupImp(e.rater),
                    watching: e.num_watching,
                    score: e.score
                }
            }),
            summaries: allInfo.summary.raters.map(e => {
                return {
                    participant: { score: allInfo.summary.ratee_mean_score },
                    left: lookupImp(allInfo.trial[e.raters[0]].rater),
                    right: lookupImp(allInfo.trial[e.raters[1]].rater),
                    watching: e.num_watching
                }
            })
        }
    }

    return [
        watchingProps,
        ratingProps(ratingOrd[0], 2),
        ratingProps(ratingOrd[1], 3),
        ratedProps(ratedOrd[0][0], 4),
        ratedProps(ratedOrd[0][1], 5),
        ratedProps(ratedOrd[1][0], 6),
        ratedProps(ratedOrd[1][1], 7)
    ]
}

export default trialProps