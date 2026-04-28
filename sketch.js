let video;
let classifier;
let label = '模型載入中...'; // 儲存辨識結果標籤

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  video = createCapture(VIDEO);
  // 隱藏預設的 HTML 影片元素，因為我們只要在畫布上繪製它
  video.hide();

  // 使用 ml5.js 載入 MobileNet 影像分類模型
  classifier = ml5.imageClassifier('MobileNet', video, modelReady);
}

function modelReady() {
  // 模型準備就緒後開始辨識
  classifier.classify(gotResult);
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // 取得信心度最高（第一名）的辨識結果
  label = results[0].label;
  // 繼續不斷地進行下一次辨識
  classifier.classify(gotResult);
}

function draw() {
  // 設定畫布背景顏色為 #e7c6ff
  background('#e7c6ff');
  
  // 計算影像的寬高，為畫布寬高的 50%
  let videoWidth = width * 0.5;
  let videoHeight = height * 0.5;
  
  // 計算置中的 x, y 座標
  let x = (width - videoWidth) / 2;
  let y = (height - videoHeight) / 2;
  
  // 在畫布上繪製攝影機影像
  image(video, x, y, videoWidth, videoHeight);

  // 顯示影像辨識的結果
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('辨識結果: ' + label, width / 2, y + videoHeight + 40);
}

function windowResized() {
  // 當視窗縮放時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}