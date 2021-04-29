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
        if (!(id in bios)) {
            throw `${id} not in bios`
        }
        return {
            img: impersonatorImgs[id],
            bio: bios[id].bio,
            id: id
        }
    }

    const ratingOrd = shuffleArray(["1", "2"])

    const ratedOrd = shuffleArray([
        shuffleArray([{ subnum: "1", maj: "acc" }, { subnum: "1", maj: "rej" }]),
        shuffleArray([{ subnum: "2", maj: "acc" }, { subnum: "2", maj: "rej" }])
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

    const ratingProps = (subnum, blockNum) => {
        return {
            blockInfo: {
                type: "rating",
                number: blockNum,
                subnum: subnum
            },
            trials: blocks.rating[subnum].map(e => {
                return {
                    ratee: lookupImp(e.ratee),
                    watching: e.num_watching
                }
            })
        }
    }

    const ratedProps = (subnumMaj, blockNum) => {
        const subnum = subnumMaj.subnum, majority = subnumMaj.maj
        const allInfo = blocks.rated[subnum][majority]
        const lookupSumImp = p => { return {...lookupImp(allInfo.trial[p.ind].rater), mean_score: p.mean_score} }
        return {
            blockInfo: {
                type: "rated",
                number: blockNum,
                subnum: subnum,
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
                    left: lookupSumImp(e[0]),
                    right: lookupSumImp(e[1]),
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