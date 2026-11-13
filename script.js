document.querySelectorAll("[data-lead-form]").forEach((leadForm) => {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!leadForm.reportValidity()) return;

    const details = new FormData(leadForm);
    const message = [
      "Hi Novus, I'd like to understand what my plant can save with AGVs/AMRs.",
      `Name: ${details.get("name")}`,
      `Company: ${details.get("company")}`,
      `Phone: ${details.get("phone")}`,
      `Work email: ${details.get("email")}`,
    ].join("\n");
    const whatsappUrl = `https://wa.me/919311078767?text=${encodeURIComponent(message)}`;
    const sendLink = document.createElement("a");

    sendLink.href = whatsappUrl;
    sendLink.target = "_blank";
    sendLink.rel = "noopener noreferrer";
    sendLink.textContent = "Open WhatsApp to review and send your message";
    const formStatus = leadForm.querySelector(".form-status");
    formStatus.replaceChildren(
      document.createTextNode("Your message is ready. Your details have not been sent yet."),
      document.createElement("br"),
      sendLink,
    );
    sendLink.focus();
  });
});

document.querySelectorAll("[data-video-toggle]").forEach((toggle) => {
  const videoCard = toggle.closest(".video-card");
  const video = videoCard?.querySelector("video");
  const status = videoCard?.querySelector(".video-status");

  if (!videoCard || !video || !status) {
    throw new Error("Video toggle requires a video card, video, and status element.");
  }

  const syncPlaybackState = () => {
    const isPlaying = !video.paused && !video.ended;
    videoCard.classList.toggle("is-playing", isPlaying);
    toggle.setAttribute("aria-label", isPlaying ? "Pause video" : "Play video");
    toggle.setAttribute("aria-pressed", String(isPlaying));
  };

  toggle.addEventListener("click", async () => {
    status.textContent = "";
    if (video.paused || video.ended) {
      try {
        await video.play();
      } catch {
        status.textContent = "Video playback couldn't start. Try the video controls again.";
      }
    } else {
      video.pause();
    }
    syncPlaybackState();
  });

  video.addEventListener("play", syncPlaybackState);
  video.addEventListener("pause", syncPlaybackState);
  video.addEventListener("ended", syncPlaybackState);
  video.addEventListener("error", () => {
    status.textContent = "The video couldn't be loaded. Please try again later.";
  });
  syncPlaybackState();
});
