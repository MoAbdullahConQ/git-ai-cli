#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync, spawnSync } from "child_process";
import os from "os";

// --- GLOBAL CONFIGURATION ---
// Define global config path in the user's home directory to make it accessible across all projects.
const CONFIG_PATH = path.join(os.homedir(), ".git-ai.config.json");

// --- HELPER FUNCTIONS ---

// Helper to execute shell commands safely and return the output.
function run(cmd) {
    try { 
        return execSync(cmd, { stdio: "pipe" }).toString(); 
    } catch { 
        return ""; 
    }
}

// Copies text to clipboard based on the operating system (Windows, Mac, Linux).
function copyToClipboard(text) {
    try {
        const platform = os.platform();
        if (platform === "win32") {
            execSync("clip", { input: text });
        } else if (platform === "darwin") {
            execSync("pbcopy", { input: text });
        } else {
            execSync("xclip -selection clipboard", { input: text });
        }
        return true; 
    } catch { 
        console.log("⚠️ Could not copy to clipboard automatically.");
        return false; 
    }
}

// Returns a smart fallback commit message if the AI API call fails, analyzing the diff keywords.
function getSmartFallback(diffText) {
    const lowerDiff = diffText.toLowerCase();
    if (lowerDiff.includes("color") || lowerDiff.includes("style") || lowerDiff.includes("view") || lowerDiff.includes("widget")) {
        return "feat(ui): update user interface components";
    }
    if (lowerDiff.includes("fix") || lowerDiff.includes("bug") || lowerDiff.includes("error") || lowerDiff.includes("crash")) {
        return "fix: resolve issues in codebase";
    }
    return "chore: update code changes";
}

// --- GIT DATA COLLECTION ---

// Get staged changes while excluding heavy or automatically updated lockfiles (Cross-platform safe).
const diff = run('git diff --staged -- . ":!package-lock.json" ":!yarn.lock" ":!pnpm-lock.yaml"');

if (!diff.trim()) {
    console.log("❌ No staged changes. Run: git add .");
    process.exit(0);
}

// Get the last 7 commit messages to give the AI context about the project's commit style.
const history = run("git log --oneline -n 7");

// --- LOAD CONFIGURATION ---

// Initialize default configurations.
let config = { model: "openai/gpt-4o-mini", autoCommit: false, clipboard: true, dryRun: false };

// Load global config if exists, otherwise create a default one in the home directory.
if (fs.existsSync(CONFIG_PATH)) {
    try {
        config = { ...config, ...JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) };
    } catch (e) {
        console.log("⚠️ Failed to parse global config, using defaults.");
    }
} else {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
}

// Priority is given to Environment Variable for security, then falls back to config file.
const apiKey = process.env.OPENROUTER_API_KEY || config.apiKey;

if (!apiKey || apiKey.includes("YOUR_KEY")) {
    console.log("❌ API Key is missing.");
    console.log(`💡 Please set OPENROUTER_API_KEY env variable or add "apiKey" inside: ${CONFIG_PATH}`);
    process.exit(1);
}

// --- SMART TRUNCATION ---

// Split diff into lines and truncate intelligently to stay safely under token limits (Max 3000 chars).
const lines = diff.split("\n");
let truncatedDiff = "";
let charCount = 0;
for (const line of lines) {
    if (charCount + line.length > 3000) { 
        truncatedDiff += "\n... [Diff truncated for size] ..."; 
        break; 
    }
    truncatedDiff += line + "\n";
    charCount += line.length + 1;
}

// Construct the AI prompt focusing strictly on returning raw text in Conventional Commits format.
const prompt = `
You are an expert software engineer.
Write ONE clean, concise commit message in Conventional Commits format based on the changes.

Previous commits for style context:
${history}

Current changes:
${truncatedDiff}

Return ONLY the raw commit message text. No markdown, no quotes.
`;

// --- API CALL ---

async function generate() {
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            signal: AbortSignal.timeout(15000), // 15 seconds timeout
            headers: { 
                "Authorization": `Bearer ${apiKey}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                model: config.model, 
                messages: [{ role: "user", content: prompt }] 
            }),
        });
        const data = await res.json();
        return data?.choices?.[0]?.message?.content?.trim();
    } catch (error) {
        console.error("⚠️ API Error, using smart fallback message.");
        return getSmartFallback(diff); // Use smart fallback on failure
    }
}

// --- EXECUTION FLOW ---

console.log("🔄 Generating commit message...");
const message = await generate();

if (!message) {
    console.log("❌ Failed to generate message");
    process.exit(1);
}

console.log("\n🧠 Commit Message:\n");
console.log(`"${message}"`);

// Handle action routing based on config flags (Dry Run, Auto Commit, or Clipboard).
if (config.dryRun) {
    console.log("\n✨ Dry run mode: Commit message generated but no actions taken.");
} else if (config.autoCommit) {
    console.log("\n🚀 Committing changes automatically...");
    // Using spawnSync with array arguments protects against shell injection and multiline crashes.
    const commitProcess = spawnSync("git", ["commit", "-m", message], { stdio: "inherit" });
    if (commitProcess.status === 0) {
        console.log("✅ Committed successfully!");
    } else {
        console.log("❌ Git commit failed.");
    }
} else if (config.clipboard !== false) {
    const success = copyToClipboard(message);
    if (success) {
        console.log("\n📋 Copied to clipboard! You can now paste and commit.");
    }
}