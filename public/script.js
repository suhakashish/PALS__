
const userNameInput = document.getElementById("userName");
const chatInput = document.getElementById("chatInput");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const buttonText = document.getElementById("buttonText");
const buttonIcon = document.getElementById("buttonIcon");
const charCount = document.getElementById("charCount");
const statusEl = document.getElementById("status");
const results = document.getElementById("results");
const summaryText = document.getElementById("summaryText");
const taskList = document.getElementById("taskList");
const deadlineList = document.getElementById("deadlineList");
const decisionList = document.getElementById("decisionList");

const sampleChat = `Aarav: Our project review is tomorrow at 11 AM.
Priya: I finished the login page.
Aarav: @Alex, please prepare the presentation slides by 6 PM today.
Meera: We decided to use HTML, CSS and JavaScript for the demo.
Priya: The UI is ready. Please test it before the meeting.
Rahul: IMPORTANT: Submit the final project report by Friday.
Meera: @Alex, can you check the slides once they are ready?
Aarav: Correction: the review has moved from 11 AM to 2 PM tomorrow.
Rahul: Thanks everyone!`;

function setStatus(message, kind = "info") {
  statusEl.textContent = message;
  statusEl.dataset.kind = kind;
}

function updateCharacterCount() {
  charCount.textContent =
    `${chatInput.value.length.toLocaleString()} / 30,000 characters`;
}

sampleBtn.addEventListener("click", () => {
  chatInput.value = sampleChat;
  updateCharacterCount();
  setStatus("Sample conversation loaded. Ready to analyze.");
  chatInput.focus();
});

clearBtn.addEventListener("click", () => {
  chatInput.value = "";
  updateCharacterCount();
  setStatus("Conversation cleared.");
  chatInput.focus();
});

chatInput.addEventListener("input", updateCharacterCount);

document.getElementById("backToInputBtn").addEventListener("click", () => {
  document.querySelector(".input-card").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
  chatInput.focus({ preventScroll: true });
});

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderEmpty(container, message) {
  container.replaceChildren(createElement("p", "empty-state", message));
}

function addChip(parent, text, className = "meta-chip") {
  if (!text || text === "Not specified") return;

  parent.appendChild(createElement("span", className, text));
}

function addEvidence(parent, evidence) {
  if (!evidence) return;
  parent.appendChild(createElement("p", "item-evidence", `Evidence: ${evidence}`));
}

function renderTasks(tasks) {
  taskList.replaceChildren();

  if (!tasks.length) {
    renderEmpty(taskList, "No specific tasks were identified in this conversation.");
    return;
  }

  for (const task of tasks) {
    const card = createElement("article", "result-item");
    card.appendChild(createElement("h4", "item-title", task.title || "Untitled task"));

    const meta = createElement("div", "item-meta");
    addChip(meta, task.owner ? `Owner: ${task.owner}` : "");
    addChip(meta, task.deadline ? `Due: ${task.deadline}` : "");

    if (task.priority) {
      const priority = task.priority.toLowerCase().replace(/[^a-z]/g, "");
      const knownPriorities = ["urgent", "high", "normal", "low"];
      const safePriority = knownPriorities.includes(priority) ? priority : "";
      addChip(
        meta,
        `Priority: ${task.priority}`,
        safePriority ? `priority-chip priority-${safePriority}` : "priority-chip"
      );
    }

    card.appendChild(meta);
    addEvidence(card, task.evidence);
    taskList.appendChild(card);
  }
}

function renderDeadlines(deadlines) {
  deadlineList.replaceChildren();

  if (!deadlines.length) {
    renderEmpty(deadlineList, "No specific deadlines or events were identified.");
    return;
  }

  for (const item of deadlines) {
    const card = createElement("article", "result-item");
    card.appendChild(createElement("h4", "item-title", item.item || "Untitled event"));

    const meta = createElement("div", "item-meta");
    addChip(meta, item.date);
    addChip(meta, item.status);
    card.appendChild(meta);

    addEvidence(card, item.evidence);
    deadlineList.appendChild(card);
  }
}

function renderDecisions(decisions) {
  decisionList.replaceChildren();

  if (!decisions.length) {
    renderEmpty(decisionList, "No clear decisions or updates were identified.");
    return;
  }

  for (const item of decisions) {
    const card = createElement("article", "result-item");
    card.appendChild(
      createElement("h4", "item-title", item.decision || "Untitled decision")
    );

    const meta = createElement("div", "item-meta");
    addChip(meta, item.status);
    card.appendChild(meta);

    addEvidence(card, item.evidence);
    decisionList.appendChild(card);
  }
}

function renderReport(data) {
  summaryText.textContent = data.summary || "No summary was returned.";

  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const deadlines = Array.isArray(data.deadlines) ? data.deadlines : [];
  const decisions = Array.isArray(data.decisions) ? data.decisions : [];

  document.getElementById("taskCount").textContent = tasks.length;
  document.getElementById("deadlineCount").textContent = deadlines.length;
  document.getElementById("decisionCount").textContent = decisions.length;

  renderTasks(tasks);
  renderDeadlines(deadlines);
  renderDecisions(decisions);

  document.getElementById("reportMeta").textContent =
    `Generated ${new Date().toLocaleString()}`;

  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

analyzeBtn.addEventListener("click", async () => {
  const conversation = chatInput.value.trim();
  const userName = userNameInput.value.trim();

  if (!conversation) {
    setStatus("Paste a conversation or load the sample first.", "error");
    chatInput.focus();
    return;
  }

  if (conversation.length > 30000) {
    setStatus("Please keep the conversation under 30,000 characters.", "error");
    return;
  }

  analyzeBtn.disabled = true;
  buttonIcon.textContent = "◌";
  buttonText.textContent = "Analyzing conversation...";
  setStatus("Gemini is reviewing tasks, deadlines, and decisions. Please wait.");

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation, userName })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status}).`);
    }

    renderReport(data);
    setStatus("Your catch-up report is ready!", "success");
  } catch (error) {
    console.error("CatchUp AI error:", error);
    setStatus(
      `${error.message} Make sure the Node.js server is running at localhost:3000.`,
      "error"
    );
  } finally {
    analyzeBtn.disabled = false;
    buttonIcon.textContent = "✦";
    buttonText.textContent = "Analyze conversation";
  }
});

updateCharacterCount();