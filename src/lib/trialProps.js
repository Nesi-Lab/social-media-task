import { impersonatorImgs } from '../assets/imgs';

// shuffle the items in an array randomly
function shuffleArray(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;
    // While there remain elements to shuffle
    while (0 !== currentIndex) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function trialProps() {
    const allData = require('../assets/impersonators.json');
    const blocks = allData.blocks, bios = allData.bios;

    const lookupImp = (id) => {
        if (!(id in bios)) {
            throw `${id} not in bios`;
        }
        return {
            img: impersonatorImgs[id],
            bio: bios[id],
            id: id
        };
    };

    // Randomly choose one acceptance and one rejection block
    const ratedOrd = shuffleArray([
        shuffleArray([{ subnum: "1", maj: "acc" }, { subnum: "1", maj: "rej" }]),
        shuffleArray([{ subnum: "2", maj: "acc" }, { subnum: "2", maj: "rej" }])
    ]);

    const watchingProps = {
        blockInfo: { type: "watching", number: 1 },
        trials: blocks.watching.map(e => {
            return {
                rater: lookupImp(e.rater),
                ratee: lookupImp(e.ratee),
                watching: e.num_watching,
                score: e.score
            };
        })
    };

    const ratingProps = (blockNum) => {
        return {
            blockInfo: {
                type: "rating",
                number: blockNum,
                subnum: "1"
            },
            trials: blocks.rating["1"].map(e => {
                return {
                    ratee: lookupImp(e.ratee),
                    watching: e.num_watching
                };
            })
        };
    };

    const ratedProps = (subnumMaj, blockNum) => {
        const subnum = subnumMaj.subnum, majority = subnumMaj.maj;
        const allInfo = blocks.rated[subnum][majority];
        const lookupSumImp = p => { return { ...lookupImp(allInfo.trial[p.ind].rater), score: p.mean_score }; };
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
                };
            }),
            summaries: [{
                participant: { score: allInfo.summary.ratee_mean_score },
                raters: allInfo.summary.raters.flatMap(e => e.raters.map(rater => lookupSumImp(rater))),
                watching: allInfo.summary.raters[0].num_watching
            }]
        };
    };

    return [
        watchingProps,
        ratingProps(2),
        ratedProps(ratedOrd[0][0], 3),
        ratedProps(ratedOrd[0][1], 4)
    ];
}

export default trialProps;
