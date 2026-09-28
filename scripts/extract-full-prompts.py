#!/usr/bin/env python3
"""
Extract complete, untruncated user prompts from Copilot session logs
"""
import json
import os
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Session IDs with their dates
SESSIONS = [
    ("e8f94af7-c980-4c52-8f81-61f089d367c6", "2026-06-23"),
    ("1796ed8c-1f6e-47c4-985d-59d8e85345bb", "2026-06-22"),
    ("67f390ed-da98-41c8-b5b3-c7445cc169d6", "2026-06-22"),
    ("6dbffc19-20be-48a7-8302-fa4d342e5b2f", "2026-06-19"),
    ("929993ec-57f3-4e34-ba06-eb8ee2308bba", "2026-06-18"),
    ("38f82cdd-a1ad-4d1f-9af9-4635b92829bf", "2026-06-18"),
    ("afbceeb1-a698-46a2-be70-433050c9b3c7", "2026-06-17"),
    ("d654424d-3600-468f-89ef-b676063c0aef", "2026-06-17"),
    ("d813c02b-3d82-4e88-a1fd-dd53a85fa8c9", "2026-06-17"),
    ("e0581bd1-39ed-4d38-955d-897041620640", "2026-06-17"),
    ("b00037f6-5727-4216-baa7-bebdce2e807d", "2026-06-16"),
    ("9cf190b9-c267-4621-9eb9-35012e9f1e36", "2026-06-15"),
    ("4987d925-8702-4471-970e-af001623cab4", "2026-06-08"),
    ("b92181d9-cd4a-4ca7-affe-87e3174e342e", "2026-06-08"),
    ("66abf8db-f218-446a-98b4-643cb8529bf0", "2026-06-08"),
    ("699d8ea6-c474-4c4c-b0f0-06ac0e14fab5", "2026-06-04"),
    ("09cc1ae4-0844-4c0b-82d3-b01b779f1fd4", "2026-06-04"),
    ("1fe79292-1e33-445e-98f6-439404c869e9", "2026-06-03"),
    ("f9c40aa8-c6a9-4163-acbb-b5ef96dbff80", "2026-06-03"),
    ("b768ccfc-c5a5-4fab-8166-f4ffa8861d37", "2026-06-03"),
]

def extract_user_prompts_from_session(session_dir):
    """Extract all user prompts from a session's main.jsonl file"""
    main_log = session_dir / "main.jsonl"
    
    if not main_log.exists():
        print(f"Warning: {main_log} not found")
        return []
    
    prompts = []
    
    try:
        with open(main_log, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    
                    # Look for user prompts in various locations
                    # Check if this is a request with user prompt
                    if entry.get('type') == 'request':
                        request = entry.get('request', {})
                        
                        # Extract prompt from userMessage
                        if 'userMessage' in request:
                            user_msg = request['userMessage']
                            if isinstance(user_msg, str):
                                prompts.append(user_msg)
                            elif isinstance(user_msg, dict):
                                # Check for text content
                                if 'text' in user_msg:
                                    prompts.append(user_msg['text'])
                                elif 'prompt' in user_msg:
                                    prompts.append(user_msg['prompt'])
                        
                        # Check messages array
                        if 'messages' in request:
                            for msg in request['messages']:
                                if isinstance(msg, dict) and msg.get('role') == 'user':
                                    # Extract content
                                    content = msg.get('content', '')
                                    if isinstance(content, str) and content.strip():
                                        prompts.append(content)
                                    elif isinstance(content, list):
                                        # Handle structured content
                                        text_parts = []
                                        for part in content:
                                            if isinstance(part, dict):
                                                if part.get('type') == 'text':
                                                    text_parts.append(part.get('text', ''))
                                                elif 'text' in part:
                                                    text_parts.append(part['text'])
                                        if text_parts:
                                            prompts.append(''.join(text_parts))
                    
                    # Also check for standalone user messages
                    if entry.get('role') == 'user':
                        content = entry.get('content', '')
                        if isinstance(content, str) and content.strip():
                            prompts.append(content)
                            
                except json.JSONDecodeError:
                    continue
                except Exception as e:
                    print(f"Error processing line: {e}")
                    continue
    
    except Exception as e:
        print(f"Error reading {main_log}: {e}")
        return []
    
    return prompts

def main():
    base_dir = Path.home() / "Library/Application Support/Code/User/workspaceStorage/9acb502da7ed9bf879dd3d4cca708a11/GitHub.copilot-chat/debug-logs"
    
    if not base_dir.exists():
        print(f"Error: Session logs directory not found: {base_dir}")
        return
    
    # Group sessions by date
    sessions_by_date = defaultdict(list)
    
    for session_id, date_str in SESSIONS:
        session_dir = base_dir / session_id
        
        if not session_dir.exists():
            print(f"Warning: Session directory not found: {session_id}")
            continue
        
        print(f"Processing session: {session_id} ({date_str})")
        prompts = extract_user_prompts_from_session(session_dir)
        
        if prompts:
            sessions_by_date[date_str].append({
                'session_id': session_id,
                'prompts': prompts
            })
            print(f"  Found {len(prompts)} prompts")
        else:
            print(f"  No prompts found")
    
    # Generate markdown
    output_lines = ["# User Prompts History (June 3-23, 2026)\n"]
    output_lines.append("*Complete, untruncated conversation history extracted from Copilot session logs*\n")
    
    # Sort dates in reverse chronological order
    sorted_dates = sorted(sessions_by_date.keys(), reverse=True)
    
    for date_str in sorted_dates:
        # Format date header
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        date_header = date_obj.strftime("%B %d, %Y")
        output_lines.append(f"\n## {date_header}\n")
        
        # Add sessions for this date
        for session_data in sessions_by_date[date_str]:
            session_id = session_data['session_id']
            prompts = session_data['prompts']
            
            # Truncate session ID for display
            short_id = session_id[:8] + "..."
            output_lines.append(f"\n### Session: {short_id}\n")
            
            # Add all prompts - COMPLETELY UNTRUNCATED
            for prompt in prompts:
                # Clean up the prompt text but don't truncate
                clean_prompt = prompt.strip()
                if clean_prompt:
                    # Indent multi-line prompts properly
                    lines = clean_prompt.split('\n')
                    if len(lines) == 1:
                        output_lines.append(f"- {lines[0]}\n")
                    else:
                        output_lines.append(f"- {lines[0]}\n")
                        for line in lines[1:]:
                            output_lines.append(f"  {line}\n")
    
    # Write to file
    output_file = Path("/Users/parth/Documents/Projects/PROMPT_HISTORY.md")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)
    
    print(f"\n✅ Successfully generated {output_file}")
    print(f"Total dates: {len(sorted_dates)}")
    total_prompts = sum(len(s['prompts']) for sessions in sessions_by_date.values() for s in sessions)
    print(f"Total prompts: {total_prompts}")

if __name__ == "__main__":
    main()
