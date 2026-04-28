// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  // 1. 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 2. 畫布的背景顏色設定為 #e7c6ff
  background('#e7c6ff');

  // 3. 計算擷取影像的寬高，為畫布的 50%
  let vw = width * 0.5;
  let vh = height * 0.5;
  // 計算影像置中所需的 x 與 y 座標
  let x = (width - vw) / 2;
  let y = (height - vh) / 2;

  // 在置中位置畫出縮放後的影像
  image(video, x, y, vw, vh);

  // Ensure at least one hand is detected
  if (hands.length > 0 && video.width > 0) {
    // 計算辨識節點的縮放比例，以對齊縮放過後的影片
    let scaleX = vw / video.width;
    let scaleY = vh / video.height;

    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          // 將節點座標位移並套用縮放比例，讓圓點精準畫在手部上
          circle(x + keypoint.x * scaleX, y + keypoint.y * scaleY, 16);
        }
      }
    }
  }
}

function windowResized() {
  // 當瀏覽器視窗大小改變時，重新調整全螢幕畫布的尺寸
  resizeCanvas(windowWidth, windowHeight);
}
