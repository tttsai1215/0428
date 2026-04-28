// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let webglSupported = false;
let modelStatusMsg = "準備載入模型...";
let bubbles = []; // 儲存水泡的陣列

// 檢查瀏覽器是否支援 WebGL
function checkWebGL() {
  try {
    let canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
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

  // 檢查 WebGL 支援度
  webglSupported = checkWebGL();

  if (webglSupported) {
    modelStatusMsg = "模型載入中...";
    // 改在 setup 中載入模型，透過 callback 獲取載入成功的狀態
    handPose = ml5.handPose({ flipped: true }, modelLoaded);
  } else {
    modelStatusMsg = "裝置不支援 WebGL，無法載入模型";
  }
}

function modelLoaded() {
  modelStatusMsg = "模型載入成功！";
  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  // 2. 畫布的背景顏色設定為 #e7c6ff
  background('#e7c6ff');

  // 在畫布左上方顯示指定文字
  fill(0);
  textSize(24);
  textAlign(LEFT, TOP);
  text("123456789陳OO文字", 20, 20);

  // 在畫布上方顯示 WebGL 支援度與模型載入狀態
  fill(0);
  textSize(20);
  textAlign(CENTER, TOP);
  let webglText = webglSupported ? "WebGL: 支援" : "WebGL: 不支援";
  text(`${webglText} | 狀態: ${modelStatusMsg}`, width / 2, 20);

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
        // 定義手指節點的連線群組
        let fingers = [
          [0, 1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
          [13, 14, 15, 16],
          [17, 18, 19, 20]
        ];

        // 依據左右手設定連線顏色與粗細
        if (hand.handedness == "Left") {
          stroke(255, 0, 255);
        } else {
          stroke(255, 255, 0);
        }
        strokeWeight(4);

        // 繪製手指骨架的連線
        for (let finger of fingers) {
          for (let i = 0; i < finger.length - 1; i++) {
            let p1 = hand.keypoints[finger[i]];
            let p2 = hand.keypoints[finger[i + 1]];
            // 套用影像置中位移 (x, y) 與縮放比例 (scaleX, scaleY) 畫線
            line(
              x + p1.x * scaleX, y + p1.y * scaleY,
              x + p2.x * scaleX, y + p2.y * scaleY
            );
          }
        }

        // Loop through keypoints and draw circles
        let fingertips = [4, 8, 12, 16, 20]; // 定義要產生水泡的指尖節點編號
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          // 計算實際在畫布上的 x, y 座標
          let px = x + keypoint.x * scaleX;
          let py = y + keypoint.y * scaleY;
          
          // 將節點座標位移並套用縮放比例，讓圓點精準畫在手部上
          circle(px, py, 16);

          // 針對指尖節點 (4, 8, 12, 16, 20)，機率性地產生水泡
          if (fingertips.includes(i) && random(1) < 0.15) {
            bubbles.push({
              x: px,
              y: py,
              r: random(6, 15), // 水泡半徑
              speed: random(2, 6), // 上升速度
              popY: py - random(100, 350), // 水泡破裂的 Y 座標高度
              wobble: random(0, TWO_PI) // 左右搖晃的起始相位
            });
          }
        }
      }
    }
  }

  // 更新並繪製所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    
    // 水泡往上飄，並加上左右微微搖晃的效果
    b.y -= b.speed;
    b.x += sin(b.wobble) * 1.5;
    b.wobble += 0.1;
    
    // 繪製水泡
    push();
    stroke(255, 255, 255, 180);
    strokeWeight(2);
    fill(150, 200, 255, 80); // 微微透藍
    circle(b.x, b.y, b.r * 2);
    // 畫出水泡上的亮點反光
    noStroke();
    fill(255, 255, 255, 220);
    circle(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.5);
    pop();
    
    // 若水泡到達指定的破裂高度，或超出畫布上方，則將其破掉 (從陣列中移除)
    if (b.y < b.popY || b.y < -b.r * 2) {
      bubbles.splice(i, 1);
    }
  }
}

function windowResized() {
  // 當瀏覽器視窗大小改變時，重新調整全螢幕畫布的尺寸
  resizeCanvas(windowWidth, windowHeight);
}
