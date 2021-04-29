from random import randint, uniform, sample, shuffle
from math import ceil, floor
from collections import Counter
import json

def randfloat(low, high):
    return round(uniform(low, high), 2)

def gen_rand(low, high, num, is_float=False):
    ret = []
    for _ in range(num):
        f = randfloat if is_float else randint
        ret.append(f(low, high))
    return ret

def gen_num_watchings(num_trials=15):
    low_range, high_range = (7, 15), (40, 60)  # inclusive
    l = gen_rand(*low_range, ceil(num_trials / 2)) + \
        gen_rand(*high_range, ceil(num_trials / 2))
    shuffle(l)
    return l[:num_trials]


def gen_scores(block_type, block_subtype=None):
    num_scores = {
        'watching': {'acc': 10, 'rej': 5, 'amb': 0},
        'rated': {
            'acc': {'acc': 10, 'rej': 3, 'amb': 2},
            'rej': {'acc': 3, 'rej': 10, 'amb': 2}
        }
    }

    for s in [num_scores['watching'], num_scores['rated']['acc'], num_scores['rated']['rej']]:
        assert(sum(s.values()) == 15)

    nums = num_scores[block_type]
    if block_subtype != None:
        nums = nums[block_subtype]

    l = gen_rand(3, 4, nums['acc']) + gen_rand(1, 2, nums['rej']) + gen_rand(0, 0, nums['amb'])
    shuffle(l)
    return l


def gen_summaries(block_subtype, participant_mean_score):
    num_mean_scores = {
        'acc': {'above': 5, 'below': 9},
        'rej': {'above': 9, 'below': 5}
    }

    for s in num_mean_scores.values():
        assert(sum(s.values()) == 14)

    order = list(range(15))
    shuffle(order)
    order = order[:14]
    ab = num_mean_scores[block_subtype]

    mean_scores = gen_rand(1, participant_mean_score, ab['below'], is_float=True) + \
        gen_rand(participant_mean_score, 4, ab['above'], is_float=True)
    shuffle(mean_scores)

    def make_summary(j): return {'ind': order[j], 'mean_score': mean_scores[j]}
    return [[make_summary(i), make_summary(i+1)] for i in range(0, 14, 2)]


def even_divide(dividend, divisor):
    q = floor(dividend / divisor)
    l = [q for _ in range(divisor)]
    m = dividend % divisor
    for i in sample(range(divisor), m):
        l[i] += 1
    return l


def gen_ids(breakdown, chosen_breakdowns):
    remaining_breakdown = breakdown.copy()
    for k in remaining_breakdown.keys():
        shuffle(remaining_breakdown[k])
    all_chosen = []
    for b in chosen_breakdowns:
        chosen = []
        for k, v in b.items():
            chosen.extend(remaining_breakdown[k][:v])
            remaining_breakdown[k] = remaining_breakdown[k][v:] if len(
                remaining_breakdown) > v else []
        shuffle(chosen)
        all_chosen.append(chosen)
    assert(all([len(v) == 0 for v in remaining_breakdown.values()]))
    shuffle(all_chosen)
    return all_chosen


def gen_json_blocks():
    # this creates the part of the json called 'blocks'
    participant_mean_score_ranges = {'acc': (2.5, 3.5), 'rej': (1.5, 2.5)}

    impersonator_ids = ['W - 31g', 'B - 36b', 'W - 69o', 'W - 21g', 'W - 28b',
                        'H - 50g', 'W - 34b', 'W - 30g', 'W - 27b', 'B - 38g',
                        'W - 18b', 'W - 29g', 'H - 43b', 'W - 19b', 'W - 25g',
                        'W - 2b', 'B - 44b', 'W - 20g', 'B - 54g', 'W - 47b',
                        'W - 14g', 'W - 66b', 'B - 49g', 'W - 15b', 'W - 16g',
                        'H - 57g', 'W - 45b', 'W - 48b', 'H - 12g', 'W - 11g',
                        'W - 33b', 'H - 68b', 'A - 24g', 'W - 74b', 'H - 13g',
                        'W - 8g', 'H - 73b', 'W - 994b', 'W - 6g', 'B - 72b',
                        'W - 5g', 'A - 991b', 'W - 75b', 'W - 23g', 'W - 4g',
                        'H - 51g', 'W - 9g', 'H - 999b', 'W - 70o', 'W - 997b',
                        'B - 35g', 'W - 995b', 'W - 993b', 'W - 22g', 'W - 998b',
                        'A - 46g', 'B - 992b', 'W - 3g', 'A - 996b', 'W - 1g']

    breakdown = {}
    for race in ['W', 'B', 'H', 'A']:
        for gender in ['g', 'b', 'o']:
            breakdown[(race, gender)] = list(
                filter(lambda i: i[0] == race and i[-1] == gender, impersonator_ids))

    # these breakdowns were selected by hand to meet the following criteria:
    #  - each breakdown has 15 impersonators
    #  - each breakdown has an even split of gender (+/- 1)
    #  - each breakdown has a proportional split of race (+/- 1)

    chosen_breakdowns = [
        {
            ('W', 'g'): 4, ('B', 'g'): 1, ('H', 'g'): 1, ('A', 'g'): 1,
            ('W', 'b'): 5, ('B', 'b'): 1, ('H', 'b'): 1, ('A', 'b'): 0,
            ('W', 'o'): 1, ('B', 'o'): 0, ('H', 'o'): 0, ('A', 'o'): 0
        },
        {
            ('W', 'g'): 5, ('B', 'g'): 1, ('H', 'g'): 1, ('A', 'g'): 0,
            ('W', 'b'): 4, ('B', 'b'): 1, ('H', 'b'): 1, ('A', 'b'): 1,
            ('W', 'o'): 1, ('B', 'o'): 0, ('H', 'o'): 0, ('A', 'o'): 0
        },
        {
            ('W', 'g'): 5, ('B', 'g'): 1, ('H', 'g'): 1, ('A', 'g'): 1,
            ('W', 'b'): 5, ('B', 'b'): 1, ('H', 'b'): 1, ('A', 'b'): 0,
            ('W', 'o'): 0, ('B', 'o'): 0, ('H', 'o'): 0, ('A', 'o'): 0
        },
        {
            ('W', 'g'): 4, ('B', 'g'): 1, ('H', 'g'): 2, ('A', 'g'): 0,
            ('W', 'b'): 5, ('B', 'b'): 1, ('H', 'b'): 1, ('A', 'b'): 1,
            ('W', 'o'): 0, ('B', 'o'): 0, ('H', 'o'): 0, ('A', 'o'): 0
        }
    ]

    for i, t_all in enumerate([['W', 'B', 'H', 'A'], ['g', 'b', 'o']]):
        for t in t_all:
            l = [sum([kv[1] for kv in list(filter(lambda kv: kv[0][i] == t, b.items()))])
                 for b in chosen_breakdowns]
            assert(max(l) - min(l) < 2)

    for rg in breakdown.keys():
        assert(sum([b[rg] for b in chosen_breakdowns]) == len(breakdown[rg]))

    early_ids, rated_ids = gen_ids(breakdown, chosen_breakdowns), gen_ids(
        breakdown, chosen_breakdowns)

    ret =  {
        'watching': [{'rater': early_ids[0][i], 'ratee': early_ids[1][i], 'score': sc, 'num_watching': nw} for sc, nw, i in zip(gen_scores('watching'), gen_num_watchings(), range(15))],
        'rating': {str(i + 1): [{'ratee': early_ids[i+2][j], 'num_watching': nw} for nw, j in zip(gen_num_watchings(), range(15))] for i in range(2)},
        'rated': {str(i + 1): {ar: {
            'trial': [{'rater': rated_ids[i + 2*(1 if ar == 'acc' else 0)][j], 'score': sc, 'num_watching': nw} for sc, nw, j in zip(gen_scores('rated', ar), gen_num_watchings(), range(15))],
            'summary': {
                'ratee_mean_score': randfloat(*participant_mean_score_ranges[ar]),
                'raters': []
            }
        } for ar in ['acc', 'rej']} for i in range(2)}
    }

    for i in ['1', '2']:
        for ar in ['acc', 'rej']:
            summary = ret['rated'][i][ar]['summary']
            summary['raters'] = gen_summaries(ar, summary['ratee_mean_score'])
    return ret

with open('src/assets/new.json', 'w+') as f:
    json.dump(gen_json_blocks(), f)