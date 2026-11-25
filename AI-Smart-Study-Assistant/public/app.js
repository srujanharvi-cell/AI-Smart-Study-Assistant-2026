
// ========================================
// AI SMART STUDY ASSISTANT
// Complete Frontend JavaScript
// ========================================

let mode = "tutor";

const $ = (id) => document.getElementById(id);

// ========================================
// 1. AI TUTOR, NOTES AND QUIZ TABS
// ========================================

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(tab => {
      tab.classList.remove("active");
    });

    button.classList.add("active");
    mode = button.dataset.mode;

    $("generateBtn").textContent =
      mode === "tutor"
        ? "Generate learning help →"
        : mode === "notes"
          ? "Generate exam notes →"
          : "Create practice quiz →";
  });
});

// ========================================
// 2. GEMINI API CONNECTION STATUS
// ========================================

async function checkStatus() {
  const status = $("apiStatus");

  try {
    const response = await fetch("/api/status");

    if (!response.ok) {
      throw new Error("Status check failed");
    }

    const data = await response.json();

    if (data.configured) {
      status.textContent = "✦ Gemini AI Connected";
      status.style.background = "#e8f8ee";
      status.style.color = "#16834a";
    } else {
      status.textContent = "Gemini API Key Needed";
      status.style.background = "#fff4df";
      status.style.color = "#9a6500";
    }

  } catch (error) {
    status.textContent = "Server Connection Error";
    status.style.background = "#fff0f0";
    status.style.color = "#c0392b";
  }
}

// ========================================
// 3. AI LEARNING CONTENT GENERATOR
// ========================================

$("studyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = $("generateBtn");

  btn.disabled = true;
  btn.textContent = "Working...";

  $("resultWrap").hidden = true;

  try {
    const response = await fetch("/api/study", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        mode: mode,
        topic: $("topic").value.trim(),
        language: $("language").value,
        level: $("level").value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    $("result").textContent = data.answer;

    $("resultTitle").textContent =
      mode === "tutor"
        ? "AI Tutor Explanation"
        : mode === "notes"
          ? "Your Exam Notes"
          : "Practice Quiz";

    $("resultWrap").hidden = false;

  } catch (error) {
    $("result").textContent = error.message;
    $("resultTitle").textContent = "Unable to Generate";
    $("resultWrap").hidden = false;

  } finally {
    btn.disabled = false;

    btn.textContent =
      mode === "tutor"
        ? "Generate learning help →"
        : mode === "notes"
          ? "Generate exam notes →"
          : "Create practice quiz →";
  }
});

// ========================================
// 4. COPY AI GENERATED CONTENT
// ========================================

$("copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(
      $("result").textContent
    );

    $("copyBtn").textContent = "Copied";

    setTimeout(() => {
      $("copyBtn").textContent = "Copy";
    }, 1200);

  } catch (error) {
    $("copyBtn").textContent = "Select text to copy";
  }
});

// ========================================
// 5. YOUTUBE LEARNING SEARCH
// ========================================

$("youtubeBtn").addEventListener("click", () => {
  const topic = $("videoTopic").value.trim();

  if (!topic) {
    $("videoTopic").focus();
    return;
  }

  const query =
    `${topic} ${$("videoLanguage").value} ${$("videoLevel").value} tutorial`;

  const url =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(query);

  window.open(url, "_blank", "noopener");
});

// ========================================
// 6. DAILY STUDY PLANNER
// ========================================

let tasks = [];

try {
  const savedTasks = JSON.parse(
    localStorage.getItem("studyTasks") || "[]"
  );

  if (Array.isArray(savedTasks)) {
    tasks = savedTasks.filter(task =>
      task &&
      typeof task.text === "string" &&
      typeof task.done === "boolean"
    );
  }

} catch (error) {
  tasks = [];
}

// Display tasks
function renderTasks() {
  $("taskList").innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.done;

    check.addEventListener("change", () => {
      tasks[index].done = check.checked;
      saveTasks();
    });

    const span = document.createElement("span");
    span.textContent = task.text;

    if (task.done) {
      span.className = "done";
    }

    const del = document.createElement("button");
    del.textContent = "×";
    del.className = "small-button";
    del.setAttribute("aria-label", "Delete task");

    del.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
    });

    li.append(check, span, del);

    $("taskList").append(li);
  });

  const completed = tasks.filter(task => task.done).length;

  $("taskCount").textContent =
    `${completed} of ${tasks.length} tasks completed. Saved in this browser.`;
}

// Save tasks
function saveTasks() {
  try {
    localStorage.setItem(
      "studyTasks",
      JSON.stringify(tasks)
    );

    renderTasks();

  } catch (error) {
    $("taskCount").textContent =
      "Unable to save tasks in this browser.";
  }
}

// Add a new task
$("taskForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const text = $("taskInput").value.trim();

  if (text) {
    tasks.push({
      text: text,
      done: false
    });

    $("taskInput").value = "";

    saveTasks();
  }
});

// Show saved tasks
renderTasks();

// ========================================
// 7. PREMIUM PLAN PREVIEW
// ========================================


const premiumBtn = $("premiumBtn");
const premiumMessage = $("premiumMessage");

if (premiumBtn && premiumMessage) {
  premiumBtn.addEventListener("click", () => {
    premiumMessage.hidden = false;

    premiumMessage.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    premiumBtn.textContent = "Premium Preview Active ✓";
    premiumBtn.disabled = true;
  });
}

// ========================================
// 8. START GEMINI CONNECTION CHECK
// ========================================

checkStatus();
