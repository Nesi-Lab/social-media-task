# Connect: The Social Media Game Experimental Task

**⚠ This app is a work in progress. ⚠**

* [About](#about)
* [Softwares](#softwares)
* [File structure](#file-structure)
* [Usage and deployment](#usage-and-deployment)
* [Data organization](#data-organization)
* [Randomization](#randomization)
* [WebGazer accuracy](#webgazer-accuracy)
* [Terms and definitions](#terms-and-definitions)

# About

This is an app designed as a experimental tool for a psychology study conducted by Dr. Jacqueline Nesi at Brown University and Lifespan Hospital Network. It was built from 2020-2021 by Julia Windham. 

Thanks to:
* The [WebGazer](https://webgazer.cs.brown.edu/) team from the Brown Human-Computer Interaction team and Pomona College
* The [Brown Center for Computation and Visualization](https://ccv.brown.edu/)

# Softwares

* React Javascript app
* Frontend bootstrapped from [Create React App](https://github.com/facebook/create-react-app), using functional components
* [Express](https://expressjs.com/) server serving one root page and endpoints for writing to the database
* [PostgreSQL](https://www.postgresql.org/) database set up for use with [Heroku's PostgreSQL](https://www.heroku.com/postgres) integration
* Deployment on local or [Heroku](https://heroku.com/)

This app does *not* use [jsPsych](https://www.jspsych.org/) but it is built to be similar to it.

# File structure

This highlights the most important files: there exist others as well that do not normally need to be modified.

```
task/
|-- public/
|   |-- index.html                  <-- actual HTML served by the main page
|   |-- webgazer.js                 <-- full WebGazer source file, modified slightly from the published source code to work with React
|-- src/
|   |-- assets/
|   |   |-- impersonator-images/    <-- images of fake Connect users where the filename is the impersonator's id
|   |   |-- src-images/             <-- images used to style the app
|   |   |-- tutorial-images/        <-- images used for the tutorials in sequential order
|   |   |-- images.js               <-- assembles all images; update this when adding new images
|   |   |-- impersonators.json      <-- ordering and values for each trial and bios for impersonators
|   |   |-- text.js                 <-- HTML fragments for any textual instructions or descriptions
|   |-- components/                 <-- all screens for the app
|   |   |-- timeline.js             <-- outlines the order of components; controls all other components
|   |   |-- block.js                <-- the main part of the experiment
|   |   |-- summary.js              <-- similar to a block, but for summary blocks
|   |   |-- calibration.js          <-- a series of screens to calibrate WebGazer by clicking dots
|   |   |-- faceCheck.js            <-- view and correct how the camera sees you
|   |   |-- feeling.js              <-- two screens for rating how you feel
|   |   |-- instruction.js          <-- any basic instruction or text screen, including tutorial screens
|   |   |-- linkSM.js               <-- select and appear to connect to other social medias
|   |   |-- profile.js              <-- a series of screens to create a bio and profile picture
|   |   |-- user.js                 <-- sets the participant's id
|   |-- lib/
|   |   |-- trialProps.js           <-- randomly creates the order of blocks
|   |   |-- utils.js                <-- helper functions including navigation between screens and writing data
|   |-- App.js                      <-- main App component and handling of WebGazer setup and data writing
|   |-- index.css                   <-- all the styling for the app
|-- package.json
|-- server.js                       <-- Express server with database connection and all GET or POST request handling
|-- randomize_impersonators.py      <-- Script to generate the randomized aspects of impersonators.json (not run unless manually)
```
# Version
### Version 0
### Version 1
### Version 2
- Changed back to 9 point 5 click calibration as opposed to moving dot
- Moved the calibration back to the front of the program to ensure that it works early on
- Spread squares out more
- Increased size of outer blue square
- Fixed some text
- Added text reminding users to keep their head still
# Usage and deployment

## Current deployment

This app is currently running on [https://social-media-game.herokuapp.com/](https://social-media-game.herokuapp.com/)`. 

## Usage

Most importantly, this task is designed to take about 25-30 minutes and stays on the same webpage the entire time. **Refreshing the webpage or going back to the previous page while in the middle of the task will save the data generated, but you will have to start the task over.** Use only the "Previous" and "Next" buttons provided at the bottom of page (if you don't see those, that's on purpose: wait a few seconds or follow the instructions given).

Because it uses WebGazer and it is for a specific study, there are several things to check before using this app:

1. Sit with your head facing directly at the screen and do not move too much, especially not toward or away from the screen
2. Sit in a well-lit room and try to reduce glare by not being backlit
3. Make sure you have plenty of charge on your computer, or plug it in (the eye tracking component can consume a lot of power)
4. Use `https`, not `http`
5. Use Chrome, ideally on a Mac
6. Keep the Chrome window large and do not resize it during the task
7. Allow the app to use your webcam (if you have previously blocked access, you can enable it by clicking the icon of a camera with a red "x" on the right of Chrome's search/URL bar -- for more, see [here](https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DDesktop&hl=en))
8. If the app has been open awhile and idle, the WebGazer capability may unmount: refresh before getting started
9. If you navigate away from the app in the middle of the task, data will stop being collected, but the trials will continue, so only do so if necessary and if you are not in a section that moves automatically

## How to run locally

1. Make sure that `package.json` > `"scripts"` > `"start"` is set as `"react-scripts start"`
2. In one terminal, navigate to the root directory and run `npm start` to start the frontend (if you haven't previously, first run `npm install`)
3. In another terminal, navigate to the root directory and run `node server.js` to start the backend (skip if not writing to the database)
4. Visit [http://localhost:3000/](http://localhost:3000/) to see the app, and use the server terminal to monitor the server

## How to deploy on Heroku

1. Make sure that `package.json` > `"scripts"` > `"start"` is set as `"node server.js"`
2. Commit and push to your git repo
3. If you haven't already, create a Heroku app and attach your repo to it using either the CLI or web interface
4. Deploy your app on Heroku in the CLI or web interface (this will create an optimized production build of the app and then start the server)
5. Visit your Heroku app's link to see the app, and use Heroku's logs to monitor the server

# Data organization

The PostgreSQL database has a schema of four tables:

  * `metadata`
    * `participant_id` (string)
    * `timestamp` (timestamptz): use to pick latest data if participants go back and change data
    * `name` (string): the data's label
    * `value` (string): the data's value
  * `feelings`
    * `participant_id` (string)
    * `timestamp` (timestamptz): when the participant has finished choosing all the feelings
    * `afraid` (int): how much the participant feels afraid from 0 ("not at all") to 100 ("a lot")
    * `annoyed` (int): how much the participant feels annoyed from 0 ("not at all") to 100 ("a lot")
    * ...
    * `scared` (int): how much the participant feels scared from 0 ("not at all") to 100 ("a lot")
  * `trials`
    * `participant_id` (string)
    * `timestamp` (timestamptz): the end of the trial, after anticipation, feedback, and potentially interpretation screens
    * `block` (int): the block number in order, from 1 to 7 inclusive
    * `type` (string): "watching" | "rating" | "rated"
    * `subnum` (string): "1" | "2" | null (has no meaning attached to it but differentiates between blocks)
    * `majority` (string): "acc" | "rej" | null
    * `rater_id` (string): id of rater (can be `participant_id` if block type is "rating")
    * `ratee_id` (string): id of person being rated (can be `participant_id` if block type is "rated")
    * `num_watching` (int): the number of people viewing the trial
    * `score` (int): the rating, from 1 (worst) to 4 (best) inclusive (or 0 if there is no rating provided, which only happens in block type "rated")
    * `interpretation_score` (int): only in block type "rated", how much the participant thinks the rater wants to be friends with them from 0 ("not at all") to 100 ("a lot")
  * `eye_tracking`
    * `participant_id` (string)
    * `screen` (string): a description of the general type and specific screen that the participant was looking at 
    * `timestamp0` (timestamptz): the timestamp at which the estimate (`x0`, `y0`) is generated
    * `x0` (int): the second's first x coordinate estimate in pixels
    * `y0` (int): the second's first y coordinate estimate in pixels
    * `timestamp1` (timestamptz): the timestamp at which the estimate (`x1`, `y1`) is generated
    * `x1` (int): the second's second x coordinate estimate in pixels
    * `y1` (int): the second's second y coordinate estimate in pixels
    * ...
    * `timestamp19` (timestamptz): the timestamp at which the estimate (`x19`, `y19`) is generated, almost 1 second after `timestamp0`
    * `x19` (int): the second's second x coordinate estimate in pixels
    * `y19` (int): the second's second y coordinate estimate in pixels

# Randomization

As specifically laid out in `randomize_impersonators.py`, most randomization of the task (order of impersonators, scores assigned to the participant, number of people watching) occurs once and is used the same for each participant. Then, for each participant, there is a different randomization that takes place in `src/lib/trialProps.js`.

## What's the same for every participant

### Impersonator appearence randomization

Each impersonator appears twice in the task, once in the first 3 blocks and once in the last 4 blocks (the "rated" blocks). Each of the 60 participants' location within either the first or second half of the task is randomly picked for a block to fulfill these four block criteria:

|                | white | black | hispanic | asian | total |
| :---           | :---  | :---  | :---     | :---  | :---  |
| **girl**       | 4     | 1     | 1        | 1     | 7     |
| **boy**        | 4     | 1     | 2        | 0     | 7     |
| **non-binary** | 1     | 0     | 0        | 0     | 1     |
| **total**      | 9     | 2     | 3        | 1     | 15     |

|                | white | black | hispanic | asian | total |
| :---           | :---  | :---  | :---     | :---  | :---  |
| **girl**       | 5     | 1     | 1        | 0     | 7     |
| **boy**        | 4     | 1     | 1        | 1     | 7     |
| **non-binary** | 1     | 0     | 0        | 0     | 1     |
| **total**      | 10    | 2     | 2        | 1     | 15     |

|                | white | black | hispanic | asian | total |
| :---           | :---  | :---  | :---     | :---  | :---  |
| **girl**       | 5     | 1     | 1        | 1     | 8     |
| **boy**        | 5     | 1     | 1        | 0     | 7     |
| **non-binary** | 0     | 0     | 0        | 0     | 0     |
| **total**      | 10    | 2     | 2        | 1     | 15     |
  
|                | white | black | hispanic | asian | total |
| :---           | :---  | :---  | :---     | :---  | :---  |
| **girl**       | 4     | 1     | 2        | 0     | 7     |
| **boy**        | 5     | 1     | 1        | 1     | 8     |
| **non-binary** | 0     | 0     | 0        | 0     | 0     |
| **total**      | 9     | 2     | 3        | 1     | 15     |


These breakdowns were selected by hand to meet the following criteria: 
* each breakdown has 15 impersonators
* each breakdown has an even split of gender (+/- 1 person)
* each breakdown has a proportional split of race (+/- 1 person)

So, for example, a non-binary impersonator has a 50% likelihood of being in the first block, a 50% likelihood of the second, and 0% in the last two. 

Once these random blocks assignments are created twice (for the first and second halves of the task), the order of these four block impersonator assignments are shuffled both between each other and within. 

### Randomization of the number of people watching an event

For any block or any summary, half of the trials are given a random low number generated uniformly between 7 and 15 people, and the other half are given a random high number generated uniformly between 40 and 60. 

If there are an uneven number of trials (all except summary blocks are 15 trials), whether they have an extra low or extra high value is randomly determined.

### Score randomization

For each type of block where the participant does not select their own score, we designate some number of trials to be "accepting", meaning the score value is randomized between 3 or 4 with equal likelihood. We also designate some number to be "rejecting" (either 1 or 2 with equal likelihood) and some to be "ambiguous" (meaning no rating is provided to the participant).

Specifically, we use these number of trials:

| block type                  | accepting | rejecting | ambiguous | total | 
| :---                        | :---      | :---      | :---      | :---  |
| watching                    | 10        | 5         | 0         | 15       |
| rated (acceptance-majority) | 10        | 3         | 2         | 15       |
| rated (rejection-majority)  | 3         | 10        | 2         | 15       |

Once the appropriate randomized values for each trial in a block have been generated, the ordering of the trials in the block is randomized.

### Summary randomization

For the summary screens of either an "acceptance-majority" or "rejection-majority" "rated" block, only 14 rather than 15 of that block's impersonators are displayed since they are displayed in pairs. The list of 15 impersonators is randomized and the first 14 of those are paired off in order, leaving the last one out. 

The mean scores for these 14 are generated separately, in the same way as a trial's impersonator and score are generated separately. We designate some of the mean scores to be uniformly selected between 1 and the participant's mean score in that block (i.e. lower than the participant) and some to be uniformly selected between the participant's mean score and 4 (i.e. higher than the participant). 

Specifically, we choose this many of these for each block type:

| block type                  | above participant | below participant |
| :---                        | :---              | :---              |
| rated (acceptance-majority) | 5                 | 9                 |
| rated (rejection-majority)  | 9                 | 5                 |

Once the appropriate mean scores have been generated, the ordering of them is randomized.

## What's different for each participant

### Block ordering randomization

The two "rating" blocks' order is shuffled so that either has an equal chance of appearing before the other.

The four "rated" blocks' order is similarly shuffled. Within the labeling of "acceptance-majority 1" (a1), "rejection-majority 1" (r1), "acceptance-majority 2" (a2), and "rejection-majority 2" (r2), the "1" blocks' order are shuffled, then the "2" blocks' order are shuffled, then the ordering of "1" and "2" are shuffled. Essentially, this means that it is equally likely to have any of these orderings:
* a1, r1, a2, r2
* r1, a1, a2, r2
* a1, r1, r2, a2
* r1, a1, r2, a2
* a2, r2, a1, r1
* a2, r2, r1, a1
* r2, a2, a1, r1
* r2, a2, r1, a1

# WebGazer accuracy

All WebGazer predictions recorded are `x` and `y` coordinates measured in pixels. The origin of this coordinate system is in the top left of the screen, so `x` moves left to right and `y` moves top to bottom. The width and height of the screen (maximum values of `x` and `y`) are recorded in the `metadata` table.

The accuracy of WebGazer's eye-tracking predictions is calculated at intervals throughout the task after calibration. The participant is asked to stare at a dot, and 50 predictions are taken (about 2.5 seconds' worth). For each prediction, the Euclidean distance between the prediction and the true location of the dot is calculated in pixels. The prediction's accuracy is defined as `100 - (euclidean_distance * 2 / browser_window_height * 100)` (if the Euclidean distance is greater than half of the browser window height, the accuracy is 0). 

This accuracy measure is assigning a value between 0 and 100 where 0 means that the prediction was as far away as the distance from the dot to the edge of the screen (or further), and 100 means that the distance between the prediction and the dot was zero or very small.

The overall accuracy is defined as the mean of all the 50 predictions' accuracy measures. 

# Terms and definitions

| term                        | definition |
| :---                        | :--- |
| anticipation screen         | a rating event before any score has been selected (3 seconds or however long the participant takes) | 
| bio                         | a string of several attributes of a person combined with pipes (i.e. "|") and one of a handful of emojis | 
| block                       | a series of 15 trials which can be a "watching" block, a "rating" block of either female or male impersonators, or a "rated" block of either female or male impersonators and either mostly acceptance (positive) or rejection (negative) scores | 
| feedback screen             | a rating event after a score has been selected and displayed (1 second if the participant chose the score; 6 seconds otherwise) | 
| impersonator                | a fake Connect user who rates and is rated by the participant and other impersonators | 
| interpretation screen       | a screen after each rating event in a "rated" block where the participant indicates how much they think their rater wants to be friends with them | 
| majority                    | the type of "rated" block which is either "acc" for acceptance (10/15 of the scores are 3 or 4) or "rej" for rejection (10/15 of the scores are 1 or 2) | 
| participant                 | a user of the app | 
| person                      | either the participant or an impersonator | 
| profile                     | a person's combination of profile picture and bio, often displayed together  | 
| rated block                 | a block where impersonators rate the participant | 
| rating block                | a block where the participant rates impersonators | 
| score                       | a value assigned by one person to another, ranging from 1 (negative) to 4 (positive) inclusively; in a "rated" block, this can also be an ambiguous score stating "no rating provided" | 
| screen                      | everything that is displayed at any given time; may change automatically or when the participant uses navigation buttons "previous" or "next" if available | 
| summary anticipation screen | part of a summary trial where profile images are shown but not average scores (3 seconds) | 
| summary block               | a set of 15 summary trials following each "rated" block | 
| summary feedback screen     | part of a summary trial where people's profile images and their recieved average scores are shown (6 seconds) | 
| summary trial               | a set of a summary anticipation and a summary feedback screen where two impersonators and the participant's profile images are displayed | 
| trial                       | a rating interaction between impersonators and the participant involving an anticipation screen, a feedback screen, and possibly an interpretation screen | 
| tutorial                    | screens with images of an example of the game and explanatory text | 
| user                        | see "participant" | 
| watching block              | a block where impersonators rate each other the the participant watches | 
| WebGazer                    | the modified package used for eye tracking |