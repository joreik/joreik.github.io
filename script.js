document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dragstart", (e) => {
    e.preventDefault();
  });

  const isMobile = false;

  const cursor = document.getElementById("cursor");

  if (cursor && !isMobile) {
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

  const card = document.getElementById("tilt-card");

  if (card && !isMobile) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      const mouseX = (x / rect.width) * 100;
      const mouseY = (y / rect.height) * 100;

      card.style.setProperty("--mouse-x", `${mouseX}%`);
      card.style.setProperty("--mouse-y", `${mouseY}%`);

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

  const audio = document.getElementById("audio");
  const playPause = document.getElementById("playPause");
  const progress = document.getElementById("progress");
  const current = document.getElementById("current");
  const duration = document.getElementById("duration");
  const volume = document.getElementById("volume");
  const volumeIcon = document.getElementById("volumeIcon");
  const volumeButton = document.getElementById("volumeButton");
  const enterScreen = document.getElementById("enter-screen");

  let previousVolume = 0.5;
  let entered = false;

  audio.volume = 0.5;

  function formatTime(time) {
    if (!time || isNaN(time)) return "0:00";

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60).toString().padStart(2, "0");

    return `${min}:${sec}`;
  }

  function updateVolumeIcon() {
    volumeIcon.classList.remove("volume-muted", "volume-low", "volume-medium", "volume-high");

    if (audio.muted || audio.volume === 0) {
      volumeIcon.classList.add("volume-muted");
    } else if (audio.volume <= 0.33) {
      volumeIcon.classList.add("volume-low");
    } else if (audio.volume <= 0.66) {
      volumeIcon.classList.add("volume-medium");
    } else {
      volumeIcon.classList.add("volume-high");
    }
  }

  async function playAudio() {
    try {
      await audio.play();
      playPause.innerHTML = `<i class="fa-solid fa-pause"></i>`;
    } catch (err) {
      console.error("Audio play error:", err);
      playPause.innerHTML = `<i class="fa-solid fa-play"></i>`;
    }
  }

  async function enterSite() {
    if (entered) return;
    entered = true;

    await playAudio();

    enterScreen.classList.add("hidden");

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

  audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("canplaythrough", () => {
    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    progress.value = (audio.currentTime / audio.duration) * 100 || 0;
    current.textContent = formatTime(audio.currentTime);
  });

  progress.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (progress.value / 100) * audio.duration;
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
      volume.value = audio.volume * 100;
    } else {
      previousVolume = audio.volume;
      audio.muted = true;
      volume.value = 0;
    }

    updateVolumeIcon();
  });

  updateVolumeIcon();
});
