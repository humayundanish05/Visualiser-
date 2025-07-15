const audio = document.getElementById("audio");
const canvas = document.getElementById("visualizerCanvas");
const ctx = canvas.getContext("2d");
const volumeSlider = document.getElementById("volumeSlider");

let audioContext, analyser, sourceNode, dataArray, waveformArray, bufferLength;
let rotation = 0;
let darkMode = true;

// Theme toggle
document.addEventListener("keydown", (e) => {
  if (e.key === "t") {
    darkMode = !darkMode;
    document.body.style.background = darkMode ? "#000" : "#fff";
  }
});

// Volume control
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

function setupAudioVisualizer() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  sourceNode = audioContext.createMediaElementSource(audio);
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);
  analyser.fftSize = 256;

  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
  waveformArray = new Uint8Array(analyser.fftSize);

  drawVisualizer();
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  analyser.getByteFrequencyData(dataArray);
  analyser.getByteTimeDomainData(waveformArray);

  // Beat detection
  const lowFreqRange = dataArray.slice(0, bufferLength / 4);
  const energy = lowFreqRange.reduce((sum, val) => sum + val, 0) / lowFreqRange.length;
  const beat = energy > 15 && audio.volume > 0 && !audio.paused;

  // Background pulse
  ctx.fillStyle = beat
    ? (darkMode ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)")
    : (darkMode ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)");
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) / 2;
  const bars = 64;

  // Rotation and pulse
  rotation += 0.01;
  const pulse = 1 + energy / 100;

  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);
  ctx.translate(-centerX, -centerY);

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const barLength = dataArray[i] / 1.5 * pulse;

    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * (radius + barLength);
    const y2 = centerY + Math.sin(angle) * (radius + barLength);

    ctx.strokeStyle = `hsl(${i * 6}, 100%, 50%)`;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 20;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.restore();

  // Heartbeat-style waveform (triangle spikes)
  ctx.beginPath();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = darkMode ? "#0f0" : "#070";
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 20;

  for (let i = 0; i < waveformArray.length; i++) {
    const x = (i / waveformArray.length) * canvas.width;

    const y = (beat && i % 10 === 0)
      ? canvas.height - 180 // spike
      : canvas.height - 100; // flat

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

// Start visualizer on audio play
audio.addEventListener("play", () => {
  if (!audioContext) setupAudioVisualizer();
});

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
