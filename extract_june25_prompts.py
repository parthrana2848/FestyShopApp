#!/usr/bin/env python3

import json
import os
from datetime import datetime
from pathlib import Path

# June 25 session IDs
session_ids = [
    '0850a6bd-6d76-45ef-b25e-413f6dd91df2',
    '0f38bf37-e0a3-40d2-8852-0d04c5a8d78d', 
    '441f083e-b4e2-45e4-ba23-14c333d6f9b3',
    '52cc72ca-87d7-45b8-9170-07de959653ca',
    '6d2a1240-453c-43c6-ac07-152cb09d796d',
    'b7513b60-9f0d-4438-93af-3df5b4a208aa',
    'c8f7acc7-e729-4d56-bcce-6c1913b85d33'
]

base_dir = '/Users/parth/Library/Application Support/Code/User/workspaceStorage/9acb502da7ed9bf879dd3d4cca708a11/GitHub.copilot-chat/debug-logs'

all_prompts = []

for session_id in session_ids:
    session_path = Path(base_dir) / session_id
    
    # Check for JSON files with messages
    for json_file in session_path.glob('*.json'):
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
                
                # Check various possible structures
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            # Check for user messages
                            if item.get('role') == 'user' and item.get('content'):
                                prompt = item['content']
                                all_prompts.append(f"### Session: {session_id[:8]}...\n- {prompt[:500]}{'...' if len(prompt) > 500 else ''}")
                            elif item.get('type') == 'user' and item.get('message'):
                                prompt = item['message']
                                all_prompts.append(f"### Session: {session_id[:8]}...\n- {prompt[:500]}{'...' if len(prompt) > 500 else ''}")
                
                # Direct user message
                elif isinstance(data, dict):
                    if data.get('role') == 'user' and data.get('content'):
                        prompt = data['content']
                        all_prompts.append(f"### Session: {session_id[:8]}...\n- {prompt[:500]}{'...' if len(prompt) > 500 else ''}")
                    elif data.get('messages'):
                        for msg in data.get('messages', []):
                            if msg.get('role') == 'user' and msg.get('content'):
                                prompt = msg['content']
                                all_prompts.append(f"### Session: {session_id[:8]}...\n- {prompt[:500]}{'...' if len(prompt) > 500 else ''}")
        except Exception as e:
            pass
    
    # Check for JSONL files
    jsonl_file = session_path / 'main.jsonl'
    if jsonl_file.exists():
        try:
            with open(jsonl_file, 'r') as f:
                for line in f:
                    try:
                        data = json.loads(line.strip())
                        # Look for various message structures
                        if 'attrs' in data and 'message' in data['attrs']:
                            if data['attrs'].get('role') == 'user':
                                prompt = data['attrs']['message']
                                all_prompts.append(f"### Session: {session_id[:8]}...\n- {prompt}")
                    except:
                        pass
        except Exception as e:
            pass

if all_prompts:
    print("## June 25, 2026\n")
    for prompt in all_prompts:
        print(prompt)
        print()
else:
    print("No prompts found in June 25 sessions")