const quiz = document.getElementById("estimateQuiz");
const quizContent = document.getElementById("quizContent");
const startButton = document.getElementById("startEstimateQuiz");
const leadNotificationStatus = document.getElementById("leadNotificationStatus");
const caseStudyDownloadNotice = document.getElementById("caseStudyDownloadNotice");

if (leadNotificationStatus && new URLSearchParams(window.location.search).get("notification") === "email-failed") {
  leadNotificationStatus.hidden = false;
  leadNotificationStatus.textContent = "Your enquiry was saved, but the email notification to our team could not be sent. Please contact us on WhatsApp if you need a prompt response.";
  leadNotificationStatus.style.color = "#b42318";
}

if (caseStudyDownloadNotice && new URLSearchParams(window.location.search).get("download") === "case-study") {
  caseStudyDownloadNotice.hidden = false;
}

if (quiz && quizContent && startButton) {
  const questions = [
    {
      title: "What do you want to move?",
      subtitle: "So we match the robot to your load.",
      name: "material",
      options: [
        "Parts and kits to the line",
        "Trolleys and carts",
        "Pallets",
        "Heavy or custom loads",
        "Not sure yet",
      ],
    },
    {
      title: "What is the heaviest load per trip?",
      subtitle: "So we size the robot right. We build custom AGVs for 10 tonnes and more.",
      name: "loadWeight",
      options: ["Under 250 kg", "250 kg to 1 tonne", "1 to 2 tonnes", "2 to 10 tonnes", "Above 10 tonnes"],
    },
    {
      title: "Roughly how many trips per shift?",
      subtitle: "This tells us how many robots you may need.",
      name: "tripsPerShift",
      options: ["Under 50", "50 to 200", "More than 200", "Not sure"],
    },
    {
      title: "How many shifts do you run?",
      subtitle: "More shifts usually means faster payback.",
      name: "shifts",
      options: ["1 shift", "2 shifts", "3 shifts or 24/7"],
    },
    {
      title: "Where is your plant?",
      subtitle: "Tap your region and add your city, so we can plan your site visit and connect you with the right team.",
      name: "region",
      options: ["North India", "West India", "South India", "East India", "Outside India"],
      location: true,
    },
    {
      title: "When would you like robots running?",
      subtitle: "So we can plan your pilot slot.",
      name: "timeline",
      options: ["Within 3 months", "3 to 6 months", "6 to 12 months", "Just exploring"],
    },
    {
      title: "Where is the budget today?",
      subtitle: "So we suggest the right starting point.",
      name: "budget",
      options: ["Approved", "Planned for this year", "Building the business case", "Not yet discussed"],
    },
    {
      title: "What is your role in the decision?",
      subtitle: "So we send you the right level of detail.",
      name: "decisionRole",
      options: ["I decide or approve", "I recommend to management", "I am researching for my team"],
    },
  ];

  const answers = readSessionValue("novusEstimateAnswers", {});
  const leadDetails = readSessionValue("novusLeadDetails", {});
  let currentQuestion = 0;

  function readSessionValue(key, fallback) {
    try {
      const value = sessionStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn("Could not read saved estimate details.", error);
      return fallback;
    }
  }

  function saveAnswers() {
    try {
      sessionStorage.setItem("novusEstimateAnswers", JSON.stringify(answers));
    } catch (error) {
      console.warn("Could not save estimate answers for this session.", error);
    }
  }

  function saveQuestionInputs() {
    if (questions[currentQuestion].location) {
      answers.city = document.getElementById("quizCity").value.trim();
      saveAnswers();
    }
  }

  function startQuiz() {
    document.body.classList.add("is-quiz-active");
    quiz.hidden = false;
    currentQuestion = 0;
    renderQuestion();
    window.scrollTo(0, 0);
  }

  function returnToThankYou() {
    quiz.hidden = true;
    document.body.classList.remove("is-quiz-active");
    startButton.focus();
  }

  function goToNextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion += 1;
      renderQuestion();
      return;
    }
    renderResult();
  }

  function renderQuestion() {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const choices = question.options.map((option) => {
      const selected = answers[question.name] === option;
      return `<button class="quiz-option${selected ? " is-selected" : ""}" type="button" data-option="${option}" aria-pressed="${selected}">${option}</button>`;
    }).join("");

    quizContent.innerHTML = `
      <div class="quiz-topline">
        <span>Question ${currentQuestion + 1} of ${questions.length}</span>
        <button class="quiz-link" type="button" data-action="skip-rest">Skip the rest</button>
      </div>
      <div class="quiz-progress" role="progressbar" aria-label="Estimate questions completed" aria-valuemin="0" aria-valuemax="8" aria-valuenow="${currentQuestion + 1}">
        <span style="width: ${progress}%"></span>
      </div>
      <div class="quiz-question">
        <h1>${question.title}</h1>
        <p>${question.subtitle}</p>
        <div class="quiz-options">${choices}</div>
        ${question.location ? `
          <div class="quiz-location">
            <label for="quizCity">City <span>(optional)</span></label>
            <input id="quizCity" name="city" type="text" placeholder="For example, Pune" value="${escapeAttribute(answers.city || "")}">
            <button class="quiz-continue" type="button" data-action="continue">Continue</button>
          </div>
        ` : ""}
      </div>
      <nav class="quiz-bottomline" aria-label="Question navigation">
        <button class="quiz-link" type="button" data-action="back">Back</button>
        <button class="quiz-link" type="button" data-action="skip-question">Skip this question</button>
      </nav>
    `;

    quizContent.querySelectorAll("[data-option]").forEach((button) => {
      button.addEventListener("click", () => {
        if (question.location) {
          saveQuestionInputs();
        }
        answers[question.name] = button.dataset.option;
        saveAnswers();

        if (question.location) {
          renderQuestion();
          const cityInput = document.getElementById("quizCity");
          cityInput.value = answers.city || "";
          return;
        }

        goToNextQuestion();
      });
    });

    quizContent.querySelector('[data-action="back"]').addEventListener("click", () => {
      saveQuestionInputs();
      if (currentQuestion === 0) {
        returnToThankYou();
        return;
      }
      currentQuestion -= 1;
      renderQuestion();
    });

    quizContent.querySelector('[data-action="skip-question"]').addEventListener("click", () => {
      saveQuestionInputs();
      goToNextQuestion();
    });

    quizContent.querySelector('[data-action="skip-rest"]').addEventListener("click", () => {
      saveQuestionInputs();
      renderResult();
    });

    const continueButton = quizContent.querySelector('[data-action="continue"]');
    if (continueButton) {
      continueButton.addEventListener("click", () => {
        answers.city = document.getElementById("quizCity").value.trim();
        saveAnswers();
        goToNextQuestion();
      });
    }
  }

  function getRecommendation() {
    const recommendations = {
      "Parts and kits to the line": "Carry AMRs for assembly line feeding",
      "Trolleys and carts": "Tugger AMRs for trolley and cart movement",
      "Pallets": "Pallet-handling AMRs for material transfer",
      "Heavy or custom loads": "A custom AGV or AMR application review",
      "Not sure yet": "An application review to match the robot to your load",
    };
    return recommendations[answers.material] || "An application review to identify the best-fit robot";
  }

  function renderResult() {
    quizContent.innerHTML = `
      <div class="quiz-result">
        <p class="eyebrow">YOUR STARTING POINT</p>
        <h1>Here is where your plant could begin.</h1>
        <p>Our engineer will bring a full savings estimate built on these answers to the call. These suggestions are preliminary and will be validated against your routes and loads.</p>
        <div class="quiz-recommendations">
          <div class="quiz-recommendation">
            <span>RECOMMENDED ROBOT</span>
            <strong id="quizRobotRecommendation"></strong>
          </div>
          <div class="quiz-recommendation">
            <span>SUGGESTED PILOT</span>
            <strong>A focused pilot on one high-value route or cell; fleet size depends on your routes and workload.</strong>
          </div>
          <div class="quiz-recommendation">
            <span>ON YOUR CALL</span>
            <p>We will walk through your routes and loads, and give you a cost and payback estimate.</p>
          </div>
        </div>
        <form class="quiz-submit-form" action="https://script.google.com/macros/s/AKfycbyGZuKzw6u-hlAxqdrgE3rL6Lob7vT1vwFMKGKp9duS1wE0IlXEbTaT1Q8yu6vKO3Nz/exec" method="POST">
          ${questions.map((question) => `<input type="hidden" name="${question.name}" value="${escapeAttribute(answers[question.name] || "")}">`).join("")}
          <input type="hidden" name="city" value="${escapeAttribute(answers.city || "")}">
          <input type="hidden" name="recommendedRobot" value="${escapeAttribute(getRecommendation())}">
          ${Object.entries(leadDetails).map(([name, value]) => `<input type="hidden" name="lead_${escapeAttribute(name)}" value="${escapeAttribute(value)}">`).join("")}
          <div class="quiz-contact">
            <div>
              <h2>Want to talk sooner?</h2>
              <p>Send your answers to our team or share a photo of the route you want to automate.</p>
            </div>
            <div class="quiz-contact-actions">
              <button class="quiz-continue" type="submit">Email my answers to Novus</button>
              <a class="quiz-link" href="https://wa.me/919311078767?text=Hi%20Novus%20Hi-Tech%2C%20I%27m%20interested%20in%20AGV%20and%20AMR%20solutions%20for%20my%20plant.%20I%20found%20you%20through%20your%20Mobile%20Robotics%20landing%20page." target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
            </div>
          </div>
          <p class="quiz-submit-status" role="status" aria-live="polite"></p>
        </form>
        <button class="quiz-link quiz-result-back" type="button" data-action="back">Back to questions</button>
      </div>
    `;

    quizContent.querySelector("#quizRobotRecommendation").textContent = getRecommendation();
    quizContent.querySelector('[data-action="back"]').addEventListener("click", () => {
      currentQuestion = questions.length - 1;
      renderQuestion();
    });
    quizContent.querySelector(".quiz-submit-form").addEventListener("submit", sendAnswers);
  }

  async function sendAnswers(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector(".quiz-submit-status");
    const originalText = button.textContent;
    let submissionSaved = false;
    let savedButtonText = "Answers sent";

    button.disabled = true;
    button.textContent = "Sending...";
    status.textContent = "";
    status.classList.remove("is-error");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "The estimate submission could not be processed.");
      }

      submissionSaved = true;
      if (data.emailSent === false) {
        savedButtonText = "Answers saved";
        status.textContent = "Your answers were saved, but the email notification to our team could not be sent. Please contact us on WhatsApp if you need a prompt response.";
      } else {
        status.textContent = "Thanks — your answers have been sent to our team.";
      }
      try {
        sessionStorage.removeItem("novusEstimateAnswers");
        sessionStorage.removeItem("novusLeadDetails");
      } catch (error) {
        console.warn("Could not clear saved estimate details.", error);
      }
    } catch (error) {
      console.error("Could not send estimate answers.", error);
      status.textContent = "We couldn’t send your answers. Please try again or contact us on WhatsApp.";
      status.classList.add("is-error");
    } finally {
      button.disabled = submissionSaved;
      button.textContent = submissionSaved ? savedButtonText : originalText;
    }
  }

  function escapeAttribute(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  startButton.addEventListener("click", startQuiz);
}
