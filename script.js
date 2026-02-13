const rsvpForm = document.getElementById("rsvpForm");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const hostPhone = (rsvpForm.dataset.whatsapp || "").replace(/\D/g, "");
    if (!hostPhone) {
      alert("Configura un numero en data-whatsapp para enviar confirmaciones.");
      return;
    }

    const name = document.getElementById("guestName").value.trim();
    const count = document.getElementById("guestsCount").value;
    const note = document.getElementById("guestNote").value.trim();

    const messageLines = [
      "Hola! Quiero confirmar asistencia al cumple.",
      `Nombre: ${name || "Sin nombre"}`,
      `Cantidad: ${count}`,
      "Fecha: 23 de agosto",
      "Horario: 22:00 - 2:30",
      "Lugar: Kaplan Centro",
    ];

    if (note) {
      messageLines.push(`Mensaje: ${note}`);
    }

    const message = encodeURIComponent(messageLines.join("\n"));
    const url = `https://wa.me/${hostPhone}?text=${message}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });
}
