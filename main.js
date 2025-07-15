window.onload = function () {
  const audio = document.getElementById("audio");
  if (!audio) {
    console.error("❌ Audio element not found!");
    return;
  }

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
  let darkMode = true;
  let hue = 0;

  let waveformArray;

  document.addEventListener("keydown", (e) => {
    if (e.key === "t") {
      darkMode = !darkMode;
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
    analyser.getByteTimeDomainData(waveformArray);

    const lowFreqRange = dataArray.slice(0, bufferLength / 4);
    const energy = lowFreqRange.reduce((sum, val) => sum + val, 0) / lowFreqRange.length;
    const threshold = 20;

    if (audio.paused || audio.volume === 0 || energy < threshold) return;

    // 🌈 Rainbow background (beat pulse sync)
    hue = (hue + energy * 0.05) % 360;
    const bgLightness = 10 + Math.min(energy * 0.8, 40); // Pulse brightness
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsl(${hue}, 100%, ${darkMode ? bgLightness : 100 - bgLightness}%)`);
    gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 100%, ${darkMode ? bgLightness + 5 : 100 - bgLightness - 5}%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) / 2;
    const bars = 64;

    pulse = 1 + energy / 100;
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

    // ❤️ ECG-style waveform at bottom
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = darkMode ? "#0f0" : "#090";
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 10;

    let xStep = canvas.width / waveformArray.length;
    for (let i = 0; i < waveformArray.length; i++) {
      let value = waveformArray[i];
      let y;

      if (value > 140) {
        // Sharp peak (heartbeat)
        y = canvas.height - 150;
      } else {
        // Flat line
        y = canvas.height - 80;
      }

      const x = i * xStep;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  audio.addEventListener("play", () => {
    if (!audioContext) setupAudioVisualizer();
  });

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
};
