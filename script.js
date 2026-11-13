document.querySelectorAll("[data-lead-form]").forEach((leadForm) => {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!leadForm.reportValidity()) return;

    const details = new FormData(leadForm);
    const formStatus = leadForm.querySelector(".form-status");
    const submitButton = leadForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    // Show loading state
    formStatus.textContent = "Sending...";
    formStatus.style.color = "";
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch(leadForm.action, {
        method: "POST",
        body: details,
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        formStatus.textContent = "Thank you! We have received your enquiry and will get back to you soon.";
        formStatus.style.color = "#10b981";
        leadForm.reset();
      } else {
        throw new Error(data.message || "Failed to send enquiry");
      }
    } catch (error) {
      console.error("Error:", error);
      formStatus.textContent = "Sorry, there was an error sending your enquiry. Please try again or call us directly.";
      formStatus.style.color = "#ef4444";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
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
