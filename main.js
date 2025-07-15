// 🎵 Beat Visualizer (v3 - Animated Circles)
const canvas = document.createElement("canvas");
canvas.id = "visualizerCanvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
let audioContext;
let analyser;
let sourceNode;
let dataArray;
let bufferLength;

function setupAudioVisualizer() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = 256;

  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  drawVisualizer();
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) / 2;
  const bars = 64;

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const barLength = dataArray[i] / 1.5;
    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * (radius + barLength);
    const y2 = centerY + Math.sin(angle) * (radius + barLength);

    ctx.strokeStyle = `hsl(${i * 6}, 100%, 50%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

audio.addEventListener("play", () => {
  if (!audioContext) setupAudioVisualizer();
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
