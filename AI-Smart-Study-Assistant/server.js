
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const OLLAMA_URL = "http://127.0.0.1:11434";
const MODEL = "llama3.2:3b";

// Check local AI connection
app.get("/api/status", async (_req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);

    if (!response.ok) {
      throw new Error("Ollama is not responding");
    }

    const data = await response.json();

    const modelAvailable = data.models?.some(
      model =>
        model.name === MODEL ||
        model.name.startsWith(MODEL + ":")
    );

    res.json({
      configured: Boolean(modelAvailable),
      provider: "Ollama",
      model: MODEL
    });

  } catch (error) {
    res.json({
      configured: false,
      provider: "Ollama",
      message: "Start Ollama on your computer."
    });
  }
});

// AI Tutor, Notes and Quiz
app.post("/api/study", async (req, res) => {
  try {
    const {
      mode,
      topic,
      language = "English",
      level = "Beginner"
    } = req.body || {};

    const allowed = ["tutor", "notes", "quiz"];

    if (
      !allowed.includes(mode) ||
      typeof topic !== "string" ||
      !topic.trim()
    ) {
      return res.status(400).json({
        error: "Choose a valid study tool and enter a topic."
      });
    }

    const instructions = {
      tutor: `
Teach the topic clearly.
Use simple language.
Explain the main idea step by step.
Include one short example when useful.
Finish with a brief recap.
`,

      notes: `
Create exam-friendly notes.
Use a clear title and short headings.
Include important definitions and key points.
Avoid unnecessary explanations.
`,

      quiz: `
Create exactly 5 multiple-choice questions.
Give four options labelled A, B, C and D.
Put the answer key after all questions.
Give a short explanation for each answer.
`
    };

    const prompt = `
You are AI Smart Study Assistant, a friendly and accurate study teacher.

STUDENT LEVEL: ${level}
RESPONSE LANGUAGE: ${language}
TOPIC: ${topic.trim()}

TASK:
${instructions[mode]}

IMPORTANT RESPONSE RULES:
1. Follow the student's requested answer length exactly.
2. If the student asks for 2 lines, give only 2 short lines.
3. If the student asks for 5 points, give exactly 5 points.
4. If no length is specified, keep the answer concise.
5. Do not add unnecessary introductions or conclusions.
6. Use beginner-friendly language.
7. Never invent facts.
8. Answer the actual question, not unrelated topics.
`;

    // Limit generated output to improve speed
    const tokenLimit = {
      tutor: 180,
      notes: 300,
      quiz: 450
    };

    const response = await fetch(
      `${OLLAMA_URL}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          prompt,
          stream: false,
          keep_alive: "10m",
          options: {
            temperature: 0.3,
            num_predict: tokenLimit[mode],
            num_ctx: 2048
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama error:", errorText);
      throw new Error("Ollama could not generate a response.");
    }

    const data = await response.json();

    res.json({
      answer:
        data.response?.trim() ||
        "No response returned. Please try again."
    });

  } catch (error) {
    console.error("Local AI request failed:", error);

    res.status(500).json({
      error: "Local AI is unavailable. Make sure Ollama is running and llama3.2:3b is installed."
    });
  }
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(
    `AI Smart Study Assistant running at http://localhost:${port}`
  );

  console.log("AI engine: Ollama (Llama 3.2 3B)");
});
