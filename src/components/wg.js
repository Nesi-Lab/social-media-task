import { useState } from "react"

export default function SetupWebgazer(props) {

    async function setup() {
        const webgazer = require('webgazer').default
        webgazer.params.showVideoPreview = true;
        await webgazer.setRegression("ridge")
            .setGazeListener((gazeData, elapsedTime) => {
                console.log({ ...gazeData, elapsedTime: elapsedTime })
            })
        console.log(webgazer)

        webgazer.showVideo(true)
        webgazer.showFaceOverlay(true)
        webgazer.showFaceFeedbackBox(true)
        webgazer.showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
        webgazer.params.applyKalmanFilter = true /* Kalman Filter defaults to on. Can be toggled by user. */
        webgazer.params.showVideoPreview = true
        webgazer.params.showGazeDot = true;
        setWg(webgazer)
        // .setTracker("TFFacemesh")
        // use this instead of gazeListener: webgazer.getCurrentPrediction()
        // console.log(webgazer.isReady())
    }

    const [wg, setWg] = useState(null)


    if (!wg) {
        setup()
    } else {
        console.log(wg)
    }

    if (!wg) {
        return (<p>Loading...</p>)
    } else {
        console.log(wg.getCurrentPrediction())
        return (<canvas id="plotting_canvas" style={{margin: "0px", cursor: "crosshair", width: window.innerWidth, height: window.innerHeight, position: "fixed"}}></canvas>)
    }
}


// {/* <canvas id="plotting_canvas" width="500" height="500" style="cursor:crosshair;"></canvas>
// <div class="calibrationDiv">
//     <input type="button" class="Calibration" id="Pt1"></input>
//     <input type="button" class="Calibration" id="Pt2"></input>
//     <input type="button" class="Calibration" id="Pt3"></input>
//     <input type="button" class="Calibration" id="Pt4"></input>
//     <input type="button" class="Calibration" id="Pt5"></input>
//     <input type="button" class="Calibration" id="Pt6"></input>
//     <input type="button" class="Calibration" id="Pt7"></input>
//     <input type="button" class="Calibration" id="Pt8"></input>
//     <input type="button" class="Calibration" id="Pt9"></input>
// </div>

//     /**
//  * Load this function when the index page starts.
// * This function listens for button clicks on the html page
// * checks that all buttons have been clicked 5 times each, and then goes on to measuring the precision
// */
// $(document).ready(function(){
//     // ClearCanvas();
//     // helpModalShow();
//        $(".Calibration").click(function(){ // click event on the calibration buttons

//         var id = $(this).attr('id');

//         if (!CalibrationPoints[id]){ // initialises if not done
//           CalibrationPoints[id]=0;
//         }
//         CalibrationPoints[id]++; // increments values

//         if (CalibrationPoints[id]==5){ //only turn to yellow after 5 clicks
//           $(this).css('background-color','yellow');
//           $(this).prop('disabled', true); //disables the button
//           PointCalibrate++;
//         }else if (CalibrationPoints[id]<5){
//           //Gradually increase the opacity of calibration points when click to give some indication to user.
//           var opacity = 0.2*CalibrationPoints[id]+0.2;
//           $(this).css('opacity',opacity);
//         }

//         //Show the middle calibration point after all other points have been clicked.
//         if (PointCalibrate == 8){
//           $("#Pt5").show();
//         }

//         if (PointCalibrate >= 9){ // last point is calibrated
//               //using jquery to grab every element in Calibration class and hide them except the middle point.
//               $(".Calibration").hide();
//               $("#Pt5").show();

//               // clears the canvas
//               var canvas = document.getElementById("plotting_canvas");
//               canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

//               // notification for the measurement process
//               swal({
//                 title: "Calculating measurement",
//                 text: "Please don't move your mouse & stare at the middle dot for the next 5 seconds. This will allow us to calculate the accuracy of our predictions.",
//                 closeOnEsc: false,
//                 allowOutsideClick: false,
//                 closeModal: true
//               }).then( isConfirm => {

//                   // makes the variables true for 5 seconds & plots the points
//                   $(document).ready(function(){

//                     store_points_variable(); // start storing the prediction points

//                     sleep(5000).then(() => {
//                         stop_storing_points_variable(); // stop storing the prediction points
//                         var past50 = webgazer.getStoredPoints(); // retrieve the stored points
//                         var precision_measurement = calculatePrecision(past50);
//                         var accuracyLabel = "<a>Accuracy | "+precision_measurement+"%</a>";
//                         document.getElementById("Accuracy").innerHTML = accuracyLabel; // Show the accuracy in the nav bar.
//                         swal({
//                           title: "Your accuracy measure is " + precision_measurement + "%",
//                           allowOutsideClick: false,
//                           buttons: {
//                             cancel: "Recalibrate",
//                             confirm: true,
//                           }
//                         }).then(isConfirm => {
//                             if (isConfirm){
//                               //clear the calibration & hide the last middle button
//                               ClearCanvas();
//                             } else {
//                               //use restart function to restart the calibration
//                               document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
//                               webgazer.clearData();
//                               ClearCalibration();
//                               ClearCanvas();
//                               ShowCalibrationPoint();
//                             }
//                         });
//                     });
//                   });
//               });
//             }
//       });
//   });

//     function ShowCalibrationPoint() {
//         $(".Calibration").show();
//         $("#Pt5").hide(); // initially hides the middle button
//       }

//       wg.clearData()
//       CalibrationPoints = {};
//       PointCalibrate = 0; */}

// console.log(document.getElementById("plotting_canvas"))