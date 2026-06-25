# 💣 git-ai-cli (v1.0.0)

`git-ai` is a lightweight global CLI tool that analyzes your staged git changes and generates clean, production-ready **Conventional Commit** messages using AI.

---

# 🔥 Features

* 🧠 **Smart Context**
  Analyzes your current staged `git diff` together with your latest commit history to generate commit messages that match your repository style.

* 📋 **Auto Clipboard**
  Automatically copies the generated commit message directly to your clipboard.

* ⚙️ **Global Configuration**
  Stores your configuration globally in your home directory so it works across all projects.

* 🛠️ **Smart Fallback System**
  If the API fails or your network goes offline, the tool generates a smart local fallback message based on your code changes.

* 🛑 **Safe Diff Truncation**
  Prevents huge diffs from consuming unnecessary API tokens.

* 🌍 **Cross Platform Support**
  Works on Windows, macOS, and Linux.

---

# 📋 Prerequisites

Before installing, make sure you have:

* Node.js `v18.0.0` or higher
* Git installed and configured

---

# 🛠️ Installation

## Local Development

Clone the repository and link it globally:

```bash
npm install
npm link
```

After that, you can use:

```bash
git-ai
```

from anywhere on your machine.

---

# 🚀 Usage

## 1. Stage your changes

```bash
git add .
```

## 2. Generate your AI commit message

```bash
git-ai
```

On the very first run, the tool will ask for your OpenRouter API key and automatically save it globally.

---

# ✨ Example

## Input Changes

```diff
+ Added dark mode support
+ Updated settings screen UI
+ Refactored theme provider
```

## Generated Commit Message

```bash
feat(settings): add dark mode support and refactor theme handling
```

---

# 📋 Commit Workflow

After generating the message:

```bash
git commit -m "paste-message-here"
```

Or simply paste directly from your clipboard.

---

# ⚙️ Global Configuration

The tool automatically creates a global config file:

```bash
~/.git-ai.config.json
```

Example configuration:

```json
{
  "model": "openai/gpt-4o-mini",
  "autoCommit": false,
  "clipboard": true,
  "dryRun": false
}
```

## Configuration Options

| Option       | Description                                    |
| ------------ | ---------------------------------------------- |
| `model`      | OpenRouter model to use                        |
| `autoCommit` | Automatically run `git commit`                 |
| `clipboard`  | Copy generated message to clipboard            |
| `dryRun`     | Generate message without copying or committing |

---

# 🧠 How It Works

```text
git diff --staged
        ↓
Git history context
        ↓
AI Prompt Generation
        ↓
OpenRouter API
        ↓
Conventional Commit Message
```

---

# 🛡️ Smart Fallback

If the API request fails, `git-ai` automatically generates a local fallback message such as:

```bash
feat(ui): update user interface components
```

or

```bash
fix: resolve issues in codebase
```

---

# 🗂️ Project Structure

```text
git-ai-cli/
├── bin/
│   └── cli.js
├── package.json
└── README.md
```

---

# 🌟 GitHub Repository

https://github.com/MoAbdullahConQ/git-ai-cli

---

# 📄 License

This project is open-source and licensed under the **MIT License**.

---
<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/MoAbdullahConQ">Muhammed Abdullah</a></sub>
</div>
