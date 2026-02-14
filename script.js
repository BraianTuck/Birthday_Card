const bgAudio = document.getElementById("bgAudio");
const musicToggle = document.getElementById("musicToggle");

if (bgAudio && musicToggle) {
  bgAudio.volume = 0.9;
  bgAudio.loop = false;
  bgAudio.setAttribute("playsinline", "");
  bgAudio.setAttribute("webkit-playsinline", "");
  let initialPlayDone = false;

  const setMusicState = (isPlaying) => {
    musicToggle.classList.toggle("is-playing", isPlaying);
    musicToggle.textContent = isPlaying ? "Pausar musica" : "Play musica";
    musicToggle.setAttribute("aria-label", isPlaying ? "Pausar musica" : "Reproducir musica");
  };

  // Chrome Android necesita estos eventos específicos como gesto válido
  const interactionEvents = ["click", "touchend", "pointerup", "keydown"];

  const removeInteractionListeners = () => {
    interactionEvents.forEach((evt) =>
      document.removeEventListener(evt, onFirstInteraction, true),
    );
  };

  const addInteractionListeners = () => {
    interactionEvents.forEach((evt) =>
      document.addEventListener(evt, onFirstInteraction, true),
    );
  };

  // Reproducir directamente sin async/await para no perder el gesto del usuario
  const onFirstInteraction = (e) => {
    if (initialPlayDone) {
      removeInteractionListeners();
      return;
    }

    // Ignorar si el click fue en el botón de música (tiene su propio handler)
    if (e && e.target && e.target.closest && e.target.closest("#musicToggle")) {
      return;
    }

    initialPlayDone = true;
    removeInteractionListeners();

    // Usar .play() con .then()/.catch() directo (NO async/await)
    // para mantener la cadena del gesto de usuario en Chrome Android
    bgAudio.play()
      .then(() => {
        setMusicState(true);
      })
      .catch(() => {
        // Si aún falla, reintentar en el siguiente gesto
        initialPlayDone = false;
        addInteractionListeners();
        setMusicState(false);
      });
  };

  const tryAutoplay = () => {
    if (initialPlayDone) return;

    // Intentar reproducir automáticamente
    bgAudio.play()
      .then(() => {
        initialPlayDone = true;
        setMusicState(true);
      })
      .catch(() => {
        // Autoplay bloqueado: esperar al primer gesto del usuario
        setMusicState(false);
        addInteractionListeners();
      });
  };

  musicToggle.addEventListener("click", () => {
    if (bgAudio.paused) {
      initialPlayDone = true;
      removeInteractionListeners();
      bgAudio.muted = false;
      bgAudio.play()
        .then(() => setMusicState(true))
        .catch(() => setMusicState(false));
      return;
    }

    bgAudio.pause();
    setMusicState(false);
  });

  bgAudio.addEventListener("play", () => setMusicState(true));
  bgAudio.addEventListener("pause", () => setMusicState(false));

  // Intentar autoplay cuando la página termine de cargar
  if (document.readyState === "complete") {
    tryAutoplay();
  } else {
    window.addEventListener("load", tryAutoplay, { once: true });
  }

  setMusicState(false);
}

const rsvpForm = document.getElementById("rsvpForm");

if (rsvpForm) {
  const submitButton = rsvpForm.querySelector('button[type="submit"]');
  const popup = document.getElementById("rsvpPopup");
  const popupTitle = document.getElementById("rsvpPopupTitle");
  const popupText = document.getElementById("rsvpPopupText");
  const popupImage = document.getElementById("rsvpPopupImage");
  const popupCloseTriggers = popup ? popup.querySelectorAll("[data-popup-close]") : [];

  const openPopup = (variant, title, text, imageSrc, imageAlt) => {
    if (!popup || !popupTitle || !popupText || !popupImage) {
      return;
    }

    popup.className = "rsvp-popup";
    popup.classList.add(`rsvp-popup--${variant}`);
    popupTitle.textContent = title;
    popupText.textContent = text;

    if (imageSrc) {
      popupImage.src = `${imageSrc}?v=2`;
      popupImage.alt = imageAlt || "";
      popupImage.hidden = false;
    } else {
      popupImage.hidden = true;
      popupImage.removeAttribute("src");
      popupImage.alt = "";
    }

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
      openPopup("error", "Ups", "Falta configurar los identificadores del formulario de Google.");
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
        openPopup("happy", "Siiii", `${name || "Genia"}! Te esperamos para romper la pista.`, "imagenes/Si.png", "Confirmacion positiva");
      } else {
        openPopup("sad", "Ayy no", `${name || "Que pena"}... te vamos a extrañar un montón.`, "imagenes/No.png", "Confirmacion negativa");
      }
    } catch (error) {
      openPopup("error", "No se pudo enviar", "Intenta de nuevo en un rato.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar confirmacion";
      }
    }
  });
}

