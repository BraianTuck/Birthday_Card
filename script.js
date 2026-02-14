const bgAudio = document.getElementById("bgAudio");
const musicToggle = document.getElementById("musicToggle");

if (bgAudio && musicToggle) {
  bgAudio.volume = 0.9;
  bgAudio.autoplay = true;
  bgAudio.playsInline = true;

  const setMusicState = (isPlaying) => {
    musicToggle.classList.toggle("is-playing", isPlaying);
    if (isPlaying && bgAudio.muted) {
      musicToggle.textContent = "Activar sonido";
      musicToggle.setAttribute("aria-label", "Activar sonido");
      return;
    }

    musicToggle.textContent = isPlaying ? "Pausar musica" : "Play musica";
    musicToggle.setAttribute("aria-label", isPlaying ? "Pausar musica" : "Reproducir musica");
  };

  const playMusic = async () => {
    try {
      await bgAudio.play();
      setMusicState(true);
      return true;
    } catch (error) {
      setMusicState(false);
      return false;
    }
  };

  musicToggle.addEventListener("click", async () => {
    if (bgAudio.paused) {
      bgAudio.muted = false;
      await playMusic();
      return;
    }

    if (bgAudio.muted) {
      bgAudio.muted = false;
      setMusicState(true);
      return;
    }

    bgAudio.pause();
  });

  bgAudio.addEventListener("play", () => setMusicState(true));
  bgAudio.addEventListener("pause", () => setMusicState(false));
  bgAudio.addEventListener("volumechange", () => setMusicState(!bgAudio.paused));

  const enableOnFirstInteraction = () => {
    const unlockAudio = () => {
      bgAudio.muted = false;
      playMusic();
    };

    document.addEventListener(
      "pointerdown",
      unlockAudio,
      { once: true },
    );

    document.addEventListener(
      "keydown",
      unlockAudio,
      { once: true },
    );
  };

  const initAutoplay = async () => {
    bgAudio.muted = false;
    const started = await playMusic();
    if (started) {
      return;
    }

    bgAudio.muted = true;
    await playMusic();

    window.setTimeout(() => {
      bgAudio.muted = false;
      if (bgAudio.paused) {
        playMusic();
      }
    }, 350);

    enableOnFirstInteraction();
  };

  bgAudio.addEventListener(
    "canplaythrough",
    () => {
      playMusic();
    },
    { once: true },
  );

  window.addEventListener(
    "load",
    () => {
      playMusic();
    },
    { once: true },
  );

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && bgAudio.paused) {
      playMusic();
    }
  });

  setMusicState(false);
  initAutoplay();
}

const rsvpForm = document.getElementById("rsvpForm");

if (rsvpForm) {
  const submitButton = rsvpForm.querySelector('button[type="submit"]');
  const popup = document.getElementById("rsvpPopup");
  const popupTitle = document.getElementById("rsvpPopupTitle");
  const popupText = document.getElementById("rsvpPopupText");
  const popupMood = document.getElementById("rsvpPopupMood");
  const popupCloseTriggers = popup ? popup.querySelectorAll("[data-popup-close]") : [];

  const openPopup = (variant, title, text, mood) => {
    if (!popup || !popupTitle || !popupText || !popupMood) {
      return;
    }

    popup.className = "rsvp-popup";
    popup.classList.add(`rsvp-popup--${variant}`);
    popupTitle.textContent = title;
    popupText.textContent = text;
    popupMood.textContent = mood;
    popup.removeAttribute("hidden");
  };

  const closePopup = () => {
    if (!popup) {
      return;
    }

    popup.setAttribute("hidden", "");
    popup.className = "rsvp-popup";
  };

  popupCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", closePopup);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && popup && !popup.hasAttribute("hidden")) {
      closePopup();
    }
  });

  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formAction = rsvpForm.dataset.formAction || "";
    const entryName = rsvpForm.dataset.entryName || "";
    const entryAttendance = rsvpForm.dataset.entryAttendance || "";
    const entryNote = rsvpForm.dataset.entryNote || "";

    if (!formAction || !entryName || !entryAttendance || !entryNote) {
      openPopup("error", "Ups", "Falta configurar los identificadores del formulario de Google.", "!");
      return;
    }

    const name = document.getElementById("guestName").value.trim();
    const attendance = document.getElementById("attendance").value;
    const note = document.getElementById("guestNote").value.trim();
    const payload = new URLSearchParams();

    payload.append(entryName, name || "Sin nombre");
    payload.append(entryAttendance, attendance);
    payload.append(entryNote, note);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      await fetch(formAction, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });

      rsvpForm.reset();

      if (attendance === "Si") {
        openPopup("happy", "Siiii", `${name || "Genia"}! Te esperamos para romper la pista.`, ":)");
      } else {
        openPopup("sad", "Ayy no", `${name || "Que pena"}... te vamos a extranar un monton.`, ":(");
      }
    } catch (error) {
      openPopup("error", "No se pudo enviar", "Intenta de nuevo en un rato.", "!");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar confirmacion";
      }
    }
  });
}

