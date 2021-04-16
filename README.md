# Connect: The Social Media Game Experimental Task

**⚠ This app is a work in progress. ⚠**

* [About](#about)
* [Softwares](#softwares)
* [File structure](#file-structure)
* [Deployment](#deployment)
* [Data organization](#data-organization)
* [Terms and definitions](#terms-and-definitions)

## About

This is an app designed as a experimental tool for a psychology study conducted by Dr. Jacqueline Nesi at Brown University and Lifespan Hospital Network. It was built from 2020-2021 by Julia Windham. 

Thanks to:
* The [Webgazer](https://webgazer.cs.brown.edu/) team from the Brown Human-Computer Interaction team and Pomona College
* The [Brown Center for Computation and Visualization](https://ccv.brown.edu/)

## Softwares

* React Javascript app
* Frontend bootstrapped from [Create React App](https://github.com/facebook/create-react-app), using functional components
* [Express](https://expressjs.com/) server serving one root page and endpoints for writing to the database
* [PostgreSQL](https://www.postgresql.org/) database set up for use with [Heroku's PostgreSQL](https://www.heroku.com/postgres) integration
* Deployment on local or [Heroku](https://heroku.com/)

This app does *not* use [jsPsych](https://www.jspsych.org/) but it is built to be similar to it.

## File structure

This highlights the most important files: there exist others as well that do not normally need to be modified.

```
task/
|-- public/
|   |-- index.html                  <-- actual HTML served by the main page
|   |-- webgazer.js                 <-- full Webgazer file, modified slightly from the published source code to work with React
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
|   |   |-- calibration.js          <-- a series of screens to calibrate Webgazer by clicking dots
|   |   |-- faceCheck.js            <-- view and correct how the camera sees you
|   |   |-- feeling.js              <-- two screens for rating how you feel
|   |   |-- instruction.js          <-- any basic instruction or text screen, including tutorial screens
|   |   |-- linkSM.js               <-- select and appear to connect to other social medias
|   |   |-- profile.js              <-- a series of screens to create a bio and profile picture
|   |   |-- user.js                 <-- sets the participant's id
|   |-- lib/
|   |   |-- trialProps.js           <-- randomly creates the order of blocks
|   |   |-- utils.js                <-- helper functions including navigation between screens and writing data
|   |-- App.js                      <-- main App component and handling of Webgazer setup and data writing
|   |-- index.css                   <-- all the styling for the app
|-- package.json
|-- server.js                       <-- Express server with database connection and all GET or POST request handling
```

## Deployment

### Locally

1. Make sure that `package.json` > `"scripts"` > `"start"` is set as `"react-scripts start"`
2. In one terminal, navigate to the root directory and run `npm start` to start the frontend
3. In another terminal, navigate to the root directory and run `node server.js` to start the backend (skip if not writing to the database)
4. Visit `http://localhost:3000/` to see the app, and use the server terminal to monitor the server

### On Heroku

1. Make sure that `package.json` > `"scripts"` > `"start"` is set as `"node server.js"`
2. Commit and push to your git repo
3. If you haven't already, create a Heroku app and attach your repo to it using either the CLI or web interface
4. Deploy your app on Heroku in the CLI or web interface (this will create an optimized production build of the app and then start the server)
5. Visit your Heroku app's link to see the app, and use Heroku's logs to monitor the server

## Data organization

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
    * `gender` (string): "f" | "m" | null
    * `majority` (string): "acc" | "rej" | null
    * `rater_id` (string): id of rater (can be `participant_id` if block type is "rating")
    * `ratee_id` (string): id of person being rated (can be `participant_id` if block type is "rated")
    * `num_watching` (int): the number of people viewing the trial
    * `score` (int): the rating, from 1 (worst) to 4 (best) inclusive (or 0 if there is no rating provided, which only happens in block type "rated")
    * `interpretation_score` (int): only in block type "rated", how much the participant thinks the rater wants to be friends with them from 0 ("not at all") to 100 ("a lot")
  * `eye_tracking`
    * `participant_id` (string)
    * `screen` (TODO): TODO
    * `timestamp0` (int): the timestamp at which the estimate (`x0`, `y0`) is generated
    * `x0` (int): the second's first x coordinate estimate in pixels
    * `y0` (int): the second's first y coordinate estimate in pixels
    * `timestamp1` (int): the timestamp at which the estimate (`x1`, `y1`) is generated
    * `x1` (int): the second's second x coordinate estimate in pixels
    * `y1` (int): the second's second y coordinate estimate in pixels
    * ...
    * `timestamp19` (int): the timestamp at which the estimate (`x19`, `y19`) is generated, almost 1 second after `timestamp0`
    * `x19` (int): the second's second x coordinate estimate in pixels
    * `y19` (int): the second's second y coordinate estimate in pixels

## Terms and definitions

| term | definition |
| :--- | :--- |
| anticipation screen | a rating event before any score has been selected (3 seconds or however long the participant takes) | 
| bio | a string of several attributes of a person combined with pipes (i.e. "|") and one of a handful of emojis | 
| block | a series of 15 trials which can be a "watching" block, a "rating" block of either female or male impersonators, or a "rated" block of either female or male impersonators and either mostly acceptance (positive) or rejection (negative) scores | 
| feedback screen | a rating event after a score has been selected and displayed (1 second if the participant chose the score; 6 seconds otherwise) | 
| impersonator | a fake Connect user who rates and is rated by the participant and other impersonators | 
| interpretation screen | a screen after each rating event in a "rated" block where the participant indicates how much they think their rater wants to be friends with them | 
| majority | the type of "rated" block which is either "acc" for acceptance (10/15 of the scores are 3 or 4) or "rej" for rejection (10/15 of the scores are 1 or 2) | 
| participant | a user of the app | 
| person | either the participant or an impersonator | 
| profile | a person's combination of profile picture and bio, often displayed together  | 
| rated block | a block where impersonators rate the participant | 
| rating block | a block where the participant rates impersonators | 
| score | a value assigned by one person to another, ranging from 1 (negative) to 4 (positive) inclusively; in a "rated" block, this can also be an ambiguous score stating "no rating provided" | 
| screen | everything that is displayed at any given time; may change automatically or when the participant uses navigation buttons "previous" or "next" if available | 
| summary anticipation screen | part of a summary trial where profile images are shown but not average scores (3 seconds) | 
| summary block | a set of 15 summary trials following each "rated" block | 
| summary feedback screen | part of a summary trial where profile images and corresponding average scores are shown (6 seconds) | 
| summary trial | a set of a summary anticipation and a summary feedback screen where two impersonators and the participant's profile images are displayed | 
| trial | a rating interaction between impersonators and the participant involving an anticipation screen, a feedback screen, and possibly an interpretation screen | 
| tutorial | screens with images of an example of the game and explanatory text | 
| user | see "participant" | 
| watching block | a block where impersonators rate each other the the participant watches | 
| Webgazer | the modified package used for eye tracking |