document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dragstart", (e) => e.preventDefault());

  const audio = document.getElementById("audio");
  const playPause = document.getElementById("playPause");
  const progress = document.getElementById("progress");
  const current = document.getElementById("current");
  const duration = document.getElementById("duration");
  const volume = document.getElementById("volume");
  const volumeIcon = document.getElementById("volumeIcon");
  const volumeButton = document.getElementById("volumeButton");
  const enterScreen = document.getElementById("enter-screen");

  const cursor = document.getElementById("cursor");
  const card = document.getElementById("tilt-card");

  let previousVolume = 0.5;
  let entered = false;

  audio.volume = 0.5;
  volume.value = 50;

  progress.style.setProperty("--fill", "0%");
  volume.style.setProperty("--fill", "50%");

  if (cursor) {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      currentX += (mouseX - currentX) * 0.35;
      currentY += (mouseY - currentY) * 0.35;

      cursor.style.left = currentX + "px";
      cursor.style.top = currentY + "px";

      requestAnimationFrame(animateCursor);
    }

    animateCursor();
  }

  if (card) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;

      card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
      card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);

      card.style.transform = `
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(1.01)
      `;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    });
  }

  function formatTime(time) {
    if (!time || isNaN(time)) return "0:00";

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60).toString().padStart(2, "0");

    return `${min}:${sec}`;
  }

  function volumeSvg(level) {
    const waves = {
      muted: "",
      low: `<path d="M16 9C17 10.2 17 13.8 16 15"/>`,
      medium: `
        <path d="M16 9C17 10.2 17 13.8 16 15"/>
        <path d="M19 7C21 10 21 14 19 17"/>
      `,
      high: `
        <path d="M16 9C17 10.2 17 13.8 16 15"/>
        <path d="M19 7C21 10 21 14 19 17"/>
        <path d="M22 5C25 9 25 15 22 19"/>
      `
    };

    const muteX = `
      <path d="M18 9L24 15"/>
      <path d="M24 9L18 15"/>
    `;

    return `
      <svg viewBox="0 0 28 24" width="22" height="22" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9V15H8L14 20V4L8 9H3Z" fill="white" stroke="white"/>
        ${level === "muted" ? muteX : waves[level]}
      </svg>
    `;
  }

  function updateVolumeIcon() {
    let level;

    if (audio.muted || audio.volume === 0) {
      level = "muted";
    } else if (audio.volume <= 0.33) {
      level = "low";
    } else if (audio.volume <= 0.66) {
      level = "medium";
    } else {
      level = "high";
    }

    volumeIcon.className = "";
    volumeIcon.innerHTML = volumeSvg(level);
    volume.style.setProperty("--fill", `${volume.value}%`);
  }

  function updateProgress() {
    const percent = audio.duration
      ? (audio.currentTime / audio.duration) * 100
      : 0;

    progress.value = percent;
    progress.style.setProperty("--fill", `${percent}%`);

    current.textContent = formatTime(audio.currentTime);
    duration.textContent = formatTime(audio.duration);
  }

  async function playAudio() {
    try {
      await audio.play();

      playPause.innerHTML = `<i class="fa-solid fa-pause"></i>`;
      updateProgress();
    } catch (err) {
      console.error("Audio play error:", err);
      playPause.innerHTML = `<i class="fa-solid fa-play"></i>`;
    }
  }

  async function enterSite() {
    if (entered) return;
    entered = true;

    enterScreen.classList.add("hidden");

    await playAudio();

    setTimeout(() => {
      enterScreen.style.display = "none";
    }, 450);
  }

  enterScreen.addEventListener("click", enterSite);

  document.addEventListener("keydown", () => {
    if (!entered) enterSite();
  });

  playPause.addEventListener("click", () => {
    if (audio.paused) {
      playAudio();
    } else {
      audio.pause();
      playPause.innerHTML = `<i class="fa-solid fa-play"></i>`;
    }
  });

  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("durationchange", updateProgress);
  audio.addEventListener("canplay", updateProgress);
  audio.addEventListener("timeupdate", updateProgress);

  progress.addEventListener("input", () => {
    if (!audio.duration) return;

    audio.currentTime = (progress.value / 100) * audio.duration;
    updateProgress();
  });

  volume.addEventListener("input", () => {
    audio.muted = false;
    audio.volume = volume.value / 100;

    if (audio.volume > 0) {
      previousVolume = audio.volume;
    }

    updateVolumeIcon();
  });

  volumeButton.addEventListener("click", () => {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      audio.volume = previousVolume || 0.5;
      volume.value = Math.round(audio.volume * 100);
    } else {
      previousVolume = audio.volume;
      audio.muted = true;
      volume.value = 0;
    }

    updateVolumeIcon();
  });

  updateProgress();
  updateVolumeIcon();
});
