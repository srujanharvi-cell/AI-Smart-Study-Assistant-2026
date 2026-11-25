# AI Smart Study Assistant

A beginner-friendly student learning app with:
- Gemini-powered AI Tutor, exam Notes, and MCQ Quiz
- YouTube lesson search by topic, language, and level
- A simple study task list saved in the browser

## Requirements
Install Node.js (LTS), then open this folder in VS Code or a terminal.

## Run locally
1. Open a terminal in this project folder.
2. Run `npm install`
3. Copy `.env.example` and rename the copy to `.env`.
4. Get a Gemini API key from https://aistudio.google.com/app/apikey
5. Put the key after `GEMINI_API_KEY=` in `.env`. Keep this file private; never upload it to GitHub.
6. Run `npm start`
7. Open http://localhost:3000

If you have not added a Gemini API key, the website still opens, but AI Tutor/Notes/Quiz will show a clear setup message. The YouTube search and study task list work without the key.

## Important
YouTube suggestions open real YouTube search results; this starter does not claim to verify or endorse individual channels. Verify lesson quality and syllabus relevance yourself.
