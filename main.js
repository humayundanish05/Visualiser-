// 🎵 Beat Visualizer (v6 - All Effects: Bass + Pulse + Glow + Rotation + Theme + Waveform + BG)
const audio = document.getElementById("audio");
const canvas = document.createElement("canvas");
canvas.id = "visualizerCanvas";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");
let audioContext;
let analyser;
let sourceNode;
let dataArray;
let bufferLength;

let rotation = 0;
let pulse = 1;
let waveformArray;

let darkMode = true;

// 🌓 Theme toggle
document.addEventListener("keydown", (e) => {
  if (e.key === "t") {
    darkMode = !darkMode;
    document.body.style.background = darkMode ? "#000" : "#fff";
  }
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
  analyser.getByteTimeDomainData(waveformArray); // waveform data

  // Bass detection
  const lowFreqRange = dataArray.slice(0, bufferLength / 4);
  const energy = lowFreqRange.reduce((sum, val) => sum + val, 0) / lowFreqRange.length;
  const threshold = 20;

  if (energy < threshold || audio.paused || audio.volume === 0) return;

  // 🌀 Background blur effect
  ctx.fillStyle = darkMode ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) / 2;
  const bars = 64;

  // 🔊 Pulse effect
  pulse = 1 + energy / 100;

  // 🔁 Rotation effect
  rotation += 0.01;
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

  // 📈 Glowing heartbeat-style waveform with triangle spikes
ctx.beginPath();
ctx.lineWidth = 2.5;
ctx.strokeStyle = darkMode ? "#0f0" : "#070"; // green glow
ctx.shadowColor = ctx.strokeStyle;
ctx.shadowBlur = 20;

for (let i = 0; i < waveformArray.length; i++) {
  const x = (i / waveformArray.length) * canvas.width;

  // Triangle spikes like ECG monitor
  let y;
  if (waveformArray[i] > 140) {
    // Make a triangle spike
    y = (i % 4 === 0) 
      ? canvas.height - 180  // tip of spike
      : canvas.height - 100; // flat parts
  } else {
    y = canvas.height - 100; // flat line
  }

  if (i === 0) {
    ctx.moveTo(x, y);
  } else {
    ctx.lineTo(x, y); // use straight lines instead of curves
  }
}
ctx.stroke();
}
// ▶ Start visualizer on play
audio.addEventListener("play", () => {
  if (!audioContext) setupAudioVisualizer();
});

// 📱 Full screen responsive canvas
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
