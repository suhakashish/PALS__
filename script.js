"use strict";

// ------------------------------------
// 1. SAMPLE DATA FOR THE DEMO
// ------------------------------------

const sampleChat = `Aarav: Good morning everyone, our project review is tomorrow at 11 AM.
Priya: I will finish the UI today.
Aarav: @Alex, please prepare the presentation slides by 6 PM today.
Rahul: Anyone want to get coffee later?
Meera: We decided to use HTML, CSS and JavaScript for the demo.
Aarav: The final review is tomorrow. Everyone must bring their completed part.
Priya: The UI is ready. Please test it before the meeting.
Rahul: IMPORTANT: Submit the final project report by Friday.
Meera: @Alex, can you check the slides once they are ready?
Aarav: Correction: the review has moved from 11 AM to 2 PM tomorrow.
Rahul: Thanks everyone!`;


// ------------------------------------
// 2. CONNECT HTML ELEMENTS
// ------------------------------------

const userName = document.getElementById("userName");
const chatInput = document.getElementById("chatInput");
const sampleBtn = document.getElementById("sampleBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const clearBtn = document.getElementById("clearBtn");
const charCount = document.getElementById("charCount");
const status = document.getElementById("status");
const results = document.getElementById("results");


// ------------------------------------
// 3. BUTTONS AND INPUT EVENTS
// ------------------------------------

sampleBtn.addEventListener("click", () => {
  userName.value = "Alex";
  chatInput.value = sampleChat;
  updateCharacterCount();
  status.textContent = "Sample conversation loaded.";
});

chatInput.addEventListener("input", updateCharacterCount);

analyzeBtn.addEventListener("click", analyzeConversation);

clearBtn.addEventListener("click", () => {
  results.hidden = true;
  status.textContent = "Report cleared.";
});

function updateCharacterCount() {
  const count = chatInput.value.length;
  charCount.textContent = `${count} characters`;
}


// ------------------------------------
// 4. NORMALIZE TEXT
// ------------------------------------

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-");
}


// ------------------------------------
// 5. DETECT PERSONAL MENTIONS
// ------------------------------------

function isPersonalMessage(text, name) {
  if (!name.trim()) return false;

  const message = normalize(text);
  const person = normalize(name.trim());

  // Match @Alex, Alex, or phrases like "you need to"
  const escapedName = person.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const namePattern = new RegExp(
    `(^|[^a-z0-9])@?${escapedName}([^a-z0-9]|$)`,
    "i"
  );

  const directYouPattern =
    /\b(you need to|you must|you should|you have to|your task|assigned to you|can you|please prepare|please submit)\b/i;

  return namePattern.test(message) || directYouPattern.test(message);
}


// ------------------------------------
// 6. DETECT TASKS AND ACTION WORDS
// ------------------------------------

function isTaskMessage(text) {
  const taskPattern =
    /\b(please|must|need to|have to|should|submit|prepare|finish|complete|create|build|fix|check|review|test|send|upload|bring|assigned|action item|todo|to-do|don't forget|remember to|responsible for)\b/i;

  return taskPattern.test(text);
}


// ------------------------------------
// 7. DETECT DEADLINES AND MEETINGS
// ------------------------------------

function isDeadlineMessage(text) {
  const pattern =
    /\b(today|tonight|tomorrow|deadline|due|by \d|by [a-z]+day|before|after|at \d{1,2}(:\d{2})?\s*(am|pm)?|meeting|review|submission|submit by|eod|end of day|next week|next month|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;

  return pattern.test(text);
}


// ------------------------------------
// 8. DETECT DECISIONS AND UPDATES
// ------------------------------------

function isDecisionMessage(text) {
  const pattern =
    /\b(decided|decision|agreed|confirmed|finalized|finalised|changed|change of plan|correction|moved to|rescheduled|updated|will use|going with|chosen|approved|rejected|cancelled|canceled|ready|completed|finished|blocked|postponed)\b/i;

  return pattern.test(text);
}


// ------------------------------------
// 9. SCORE MESSAGE IMPORTANCE
// ------------------------------------

function scoreMessage(text, name) {
  const message = normalize(text);
  let score = 0;
  const reasons = [];

  if (isPersonalMessage(text, name)) {
    score += 4;
    reasons.push("Personal mention or instruction");
  }

  if (/\b(urgent|asap|immediately|important|critical|must)\b/i.test(message)) {
    score += 4;
    reasons.push("Urgency indicator");
  }

  if (isTaskMessage(text)) {
    score += 2;
    reasons.push("Action required");
  }

  if (isDeadlineMessage(text)) {
    score += 2;
    reasons.push("Time-sensitive information");
  }

  if (isDecisionMessage(text)) {
    score += 2;
    reasons.push("Decision or project update");
  }

  if (/\b(final|mandatory|cannot miss|required)\b/i.test(message)) {
    score += 2;
    reasons.push("High importance");
  }

  let priority = "Normal";

  if (score >= 8) {
    priority = "Urgent";
  } else if (score >= 5) {
    priority = "High";
  }

  return { score, priority, reasons };
}


// ------------------------------------
// 10. SAFE DISPLAY HELPERS
// ------------------------------------

function addText(parent, tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;

  if (className) {
    element.className = className;
  }

  parent.appendChild(element);
  return element;
}

function clearElement(element) {
  element.replaceChildren();
}

function showEmpty(element, message) {
  clearElement(element);
  addText(element, "p", message, "empty-state");
}

function renderItems(element, items, emptyMessage) {
  clearElement(element);

  if (items.length === 0) {
    showEmpty(element, emptyMessage);
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "result-item";

    const top = document.createElement("div");
    top.className = "item-top";

    const tag = document.createElement("span");
    tag.className = "tag " +
      (item.priority === "Urgent"
        ? "tag-urgent"
        : item.priority === "High"
          ? "tag-high"
          : "tag-normal");

    tag.textContent = item.priority;
    top.appendChild(tag);

    const type = document.createElement("span");
    type.className = "item-meta";
    type.textContent = item.category;
    top.appendChild(type);

    card.appendChild(top);

    addText(card, "p", item.text, "item-text");

    if (item.reasons.length > 0) {
      addText(
        card,
        "p",
        "Why flagged: " + item.reasons.join(", "),
        "item-meta"
      );
    }

    element.appendChild(card);
  });
}


// ------------------------------------
// 11. GENERATE THE CATCH-UP REPORT
// ------------------------------------

function analyzeConversation() {
  const rawText = chatInput.value.trim();
  const name = userName.value.trim();

  if (!rawText) {
    status.textContent = "Please paste a conversation first.";
    results.hidden = true;
    chatInput.focus();
    return;
  }

  // Split one message per line.
  const lines = rawText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const messages = lines.map((line, index) => {
    // Supports "Name: message" and plain text lines.
    const separator = line.indexOf(":");

    const sender = separator > 0
      ? line.slice(0, separator).trim()
      : "Unknown sender";

    const text = separator > 0
      ? line.slice(separator + 1).trim()
      : line;

    const scoring = scoreMessage(text, name);

    return {
      id: index + 1,
      sender,
      text,
      score: scoring.score,
      priority: scoring.priority,
      reasons: scoring.reasons,
      personal: isPersonalMessage(text, name),
      task: isTaskMessage(text),
      deadline: isDeadlineMessage(text),
      decision: isDecisionMessage(text)
    };
  });

  // Avoid presenting blank lines as meaningful messages.
  const meaningful = messages.filter(message => message.text);

  const urgentItems = meaningful
    .filter(message =>
      message.priority === "Urgent" ||
      (message.personal && message.score >= 5)
    )
    .sort((a, b) => b.score - a.score);

  const tasks = meaningful.filter(message =>
    message.task && message.personal
  );

  const deadlines = meaningful.filter(message =>
    message.deadline
  );

  const decisions = meaningful.filter(message =>
    message.decision
  );

  const priorityCount = meaningful.filter(message =>
    message.priority === "Urgent" ||
    message.priority === "High"
  ).length;

  // Create a brief extractive summary using key messages.
  const keyMessages = meaningful
    .filter(message =>
      message.score >= 4 ||
      message.decision ||
      message.personal
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const summaryElement = document.getElementById("summary");
  clearElement(summaryElement);

  if (keyMessages.length > 0) {
    summaryElement.textContent =
      `Scanned ${meaningful.length} messages. ` +
      keyMessages.map(message => message.text).join(" ");
  } else {
    summaryElement.textContent =
      `Scanned ${meaningful.length} messages. ` +
      "No strong priority signals were detected. " +
      "Review the conversation for context.";
  }

  document.getElementById("messageCount").textContent =
    meaningful.length;

  document.getElementById("priorityCount").textContent =
    priorityCount;

  document.getElementById("taskCount").textContent =
    tasks.length;

  renderItems(
    document.getElementById("urgentList"),
    urgentItems.slice(0, 8),
    "No strongly urgent messages detected."
  );

  renderItems(
    document.getElementById("taskList"),
    tasks.slice(0, 8),
    "No personal tasks detected. Check your name and the original messages."
  );

  renderItems(
    document.getElementById("deadlineList"),
    deadlines.slice(0, 8).map(item => ({
      ...item,
      category: "Deadline or meeting"
    })),
    "No obvious dates or meeting references detected."
  );

  renderItems(
    document.getElementById("decisionList"),
    decisions.slice(0, 8).map(item => ({
      ...item,
      category: "Decision or update"
    })),
    "No obvious decisions or status updates detected."
  );

  // Suggest next actions based on the highest-priority tasks.
  const nextList = document.getElementById("nextList");
  clearElement(nextList);

  const nextActions = tasks
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (nextActions.length === 0) {
    addText(
      nextList,
      "li",
      "Review the highlighted messages and confirm whether any action is needed."
    );
  } else {
    nextActions.forEach(task => {
      addText(nextList, "li", task.text);
    });
  }

  results.hidden = false;
  status.textContent =
    "Analysis complete. All processing was performed in this browser.";

  results.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


// Initialize the character count.
updateCharacterCount();