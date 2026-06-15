document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("dragstart", (e) => e.preventDefault());

  const cursor = document.getElementById("cursor");

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

  const card = document.getElementById("tilt-card");

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
  volume.style.setProperty("--fill", "50%");
  progress.style.setProperty("--fill", "0%");

  function formatTime(time) {
    if (!time || isNaN(time)) return "0:00";

    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60).toString().padStart(2, "0");

    return `${min}:${sec}`;
  }

  function updateVolumeIcon() {
    if (audio.muted || audio.volume === 0) {
      volumeIcon.className = "fa-solid fa-volume-xmark";
    } else if (audio.volume <= 0.33) {
      volumeIcon.className = "fa-solid fa-volume-off";
    } else if (audio.volume <= 0.66) {
      volumeIcon.className = "fa-solid fa-volume-low";
    } else {
      volumeIcon.className = "fa-solid fa-volume-high";
    }

    volume.style.setProperty("--fill", `${volume.value}%`);
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
    const percent = (audio.currentTime / audio.duration) * 100 || 0;

    progress.value = percent;
    progress.style.setProperty("--fill", `${percent}%`);

    current.textContent = formatTime(audio.currentTime);
  });

  progress.addEventListener("input", () => {
    if (!audio.duration) return;

    audio.currentTime = (progress.value / 100) * audio.duration;
    progress.style.setProperty("--fill", `${progress.value}%`);
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
