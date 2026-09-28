#!/usr/bin/env node

/**
 * Prompt History Logger
 * Automatically extracts user prompts from VS Code Copilot session logs
 * and appends them to PROMPT_HISTORY.md
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const CONFIG = {
  logBaseDir: path.join(
    os.homedir(),
    'Library/Application Support/Code/User/workspaceStorage/9acb502da7ed9bf879dd3d4cca708a11/GitHub.copilot-chat/debug-logs'
  ),
  outputFile: path.join(__dirname, '../PROMPT_HISTORY.md'),
  lastProcessedFile: path.join(__dirname, '../.last-prompt-sync'),
};

/**
 * Get the last processed timestamp
 */
function getLastProcessedTime() {
  try {
    if (fs.existsSync(CONFIG.lastProcessedFile)) {
      const timestamp = fs.readFileSync(CONFIG.lastProcessedFile, 'utf-8').trim();
      return new Date(timestamp);
    }
  } catch (error) {
    console.warn('Could not read last processed time:', error.message);
  }
  return new Date(0); // Return epoch if no record
}

/**
 * Update the last processed timestamp
 */
function updateLastProcessedTime(timestamp) {
  fs.writeFileSync(CONFIG.lastProcessedFile, timestamp.toISOString());
}

/**
 * Extract prompts from a session directory
 */
function extractPromptsFromSession(sessionDir, sessionId) {
  const prompts = [];
  
  try {
    const files = fs.readdirSync(sessionDir);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(sessionDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      try {
        const data = JSON.parse(content);
        
        // Look for user messages in various possible structures
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach(msg => {
            if (msg.role === 'user' && msg.content) {
              prompts.push({
                content: msg.content,
                timestamp: data.timestamp || new Date().toISOString(),
              });
            }
          });
        }
        
        // Alternative structure
        if (data.role === 'user' && data.content) {
          prompts.push({
            content: data.content,
            timestamp: data.timestamp || new Date().toISOString(),
          });
        }
        
        // Check for prompt field directly
        if (data.prompt) {
          prompts.push({
            content: data.prompt,
            timestamp: data.timestamp || new Date().toISOString(),
          });
        }
      } catch (parseError) {
        // Skip invalid JSON files
      }
    }
  } catch (error) {
    console.warn(`Error processing session ${sessionId}:`, error.message);
  }
  
  return prompts;
}

/**
 * Get new sessions since last run
 */
function getNewSessions(lastProcessedTime) {
  const sessions = [];
  
  try {
    if (!fs.existsSync(CONFIG.logBaseDir)) {
      console.error('Log directory not found:', CONFIG.logBaseDir);
      return sessions;
    }
    
    const sessionDirs = fs.readdirSync(CONFIG.logBaseDir);
    
    for (const sessionId of sessionDirs) {
      const sessionPath = path.join(CONFIG.logBaseDir, sessionId);
      const stats = fs.statSync(sessionPath);
      
      if (stats.isDirectory() && stats.mtime > lastProcessedTime) {
        sessions.push({
          id: sessionId,
          path: sessionPath,
          mtime: stats.mtime,
        });
      }
    }
  } catch (error) {
    console.error('Error reading session directories:', error.message);
  }
  
  return sessions.sort((a, b) => a.mtime - b.mtime);
}

/**
 * Format prompts for markdown
 */
function formatPromptsToMarkdown(sessionPrompts) {
  let markdown = '';
  
  for (const session of sessionPrompts) {
    const date = new Date(session.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    markdown += `\n## ${date}\n\n`;
    markdown += `### Session: ${session.id.substring(0, 8)}...\n`;
    
    for (const prompt of session.prompts) {
      // Clean up newlines and format (no truncation)
      let content = prompt.content;
      content = content.replace(/\n+/g, '\n  ');
      markdown += `- ${content}\n`;
    }
  }
  
  return markdown;
}

/**
 * Append new prompts to the history file
 */
function appendToHistoryFile(newContent) {
  if (!newContent.trim()) {
    console.log('No new prompts to add.');
    return;
  }
  
  try {
    // Read existing content
    let existingContent = '';
    if (fs.existsSync(CONFIG.outputFile)) {
      existingContent = fs.readFileSync(CONFIG.outputFile, 'utf-8');
    } else {
      existingContent = '# User Prompts History\n\n';
    }
    
    // Append new content
    const updatedContent = existingContent + newContent;
    fs.writeFileSync(CONFIG.outputFile, updatedContent);
    
    console.log('✅ Prompt history updated successfully!');
  } catch (error) {
    console.error('Error updating history file:', error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Checking for new prompts...\n');
  
  const lastProcessedTime = getLastProcessedTime();
  console.log(`Last processed: ${lastProcessedTime.toISOString()}\n`);
  
  const newSessions = getNewSessions(lastProcessedTime);
  
  if (newSessions.length === 0) {
    console.log('No new sessions found.');
    return;
  }
  
  console.log(`Found ${newSessions.length} new session(s)\n`);
  
  const allSessionPrompts = [];
  
  for (const session of newSessions) {
    const prompts = extractPromptsFromSession(session.path, session.id);
    
    if (prompts.length > 0) {
      allSessionPrompts.push({
        id: session.id,
        timestamp: session.mtime,
        prompts: prompts,
      });
      console.log(`  ✓ Session ${session.id.substring(0, 8)}: ${prompts.length} prompt(s)`);
    }
  }
  
  if (allSessionPrompts.length > 0) {
    const markdown = formatPromptsToMarkdown(allSessionPrompts);
    appendToHistoryFile(markdown);
    updateLastProcessedTime(new Date());
  } else {
    console.log('\nNo prompts found in new sessions.');
  }
}

// Run the script
main();
