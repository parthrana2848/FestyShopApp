# 📝 Automated Prompt History System

Your FeshShopApp project now has an automated system to save all your prompts to `PROMPT_HISTORY.md`.

## 🚀 How to Use

### Option 1: Manual Update (Recommended)
Run this command whenever you want to save recent prompts:

```bash
npm run update-prompts
```

This will extract all new prompts from your VS Code Copilot session logs and append them to `PROMPT_HISTORY.md`.

### Option 2: VS Code Task
1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "Tasks: Run Task"
3. Select "Update Prompt History"

### Option 3: Auto-Update (Background)
For automatic updates every 5 minutes:

1. Press `Cmd+Shift+P` → "Tasks: Run Task"
2. Select "Auto-Update Prompt History (Watch)"
3. This runs in the background and auto-saves prompts

**Note**: Requires `watch` command (install via `brew install watch` on macOS)

## 📂 Files Created

1. **`scripts/update-prompt-history.js`** - The extraction script
2. **`.vscode/tasks.json`** - VS Code tasks for easy execution
3. **`.copilot-instructions.md`** - Instructions for Copilot to help maintain the log
4. **`.last-prompt-sync`** - Tracks last sync time (auto-generated)

## 🔧 How It Works

1. The script scans your VS Code Copilot debug logs at:
   ```
   ~/Library/Application Support/Code/User/workspaceStorage/.../GitHub.copilot-chat/debug-logs/
   ```

2. Extracts user prompts from new sessions since the last run

3. Appends them to `PROMPT_HISTORY.md` in chronological order

4. Saves a timestamp in `.last-prompt-sync` to avoid duplicates

## 📋 Best Practices

- **Run weekly**: `npm run update-prompts` once a week to keep your history current
- **Before important milestones**: Capture prompts before major releases
- **After intensive sessions**: Save your thought process after complex debugging

## 🎯 Quick Start

Try it now:
```bash
npm run update-prompts
```

You should see output like:
```
🔍 Checking for new prompts...
Last processed: [date]
Found X new session(s)
  ✓ Session abc123: 5 prompt(s)
✅ Prompt history updated successfully!
```

---

**Tip**: Add `.last-prompt-sync` to your `.gitignore` if you don't want to track sync times in version control.
