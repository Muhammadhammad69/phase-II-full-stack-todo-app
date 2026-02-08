#!/usr/bin/env python3
"""
shadcn UI Component Manager
Provides programmatic access to shadcn UI operations
"""

import json
import subprocess
import sys
import os
from pathlib import Path

def run_shadcn_command(args):
    """Run a shadcn CLI command and return the result."""
    try:
        cmd = ["npx", "shadcn@latest"] + args
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {' '.join(cmd)}")
        print(f"Error: {e.stderr}")
        return None
    except FileNotFoundError:
        print("Error: npx command not found. Make sure Node.js and npm are installed.")
        return None

def load_config():
    """Load the components.json configuration file."""
    config_path = Path("components.json")
    if config_path.exists():
        with open(config_path, 'r') as f:
            return json.load(f)
    return None

def show_config():
    """Display the current shadcn UI configuration."""
    config = load_config()
    if config:
        print("Current shadcn UI Configuration:")
        print(json.dumps(config, indent=2))
    else:
        print("No components.json found. shadcn UI may not be initialized in this project.")

def init_project():
    """Initialize shadcn UI in the current project."""
    print("Initializing shadcn UI in current project...")
    result = run_shadcn_command(["init"])
    if result:
        print(result)

def add_components(components):
    """Add specified components to the project."""
    if not components:
        print("Error: No components specified to add.")
        return

    print(f"Adding components: {', '.join(components)}")
    result = run_shadcn_command(["add"] + components)
    if result:
        print(result)

def list_components():
    """List available components."""
    print("Listing available components...")
    result = run_shadcn_command(["list"])
    if result:
        print(result)

def search_components(query):
    """Search for components matching the query."""
    if not query:
        print("Error: No search query specified.")
        return

    print(f"Searching for components matching '{query}'...")
    result = run_shadcn_command(["search", query])
    if result:
        print(result)

def main():
    if len(sys.argv) < 2:
        print("shadcn UI Component Manager")
        print("Usage:")
        print("  python shadcn-manager.py init          - Initialize shadcn UI in current project")
        print("  python shadcn-manager.py add [comp]    - Add specific component(s)")
        print("  python shadcn-manager.py list          - Show available components")
        print("  python shadcn-manager.py search [q]    - Search for components")
        print("  python shadcn-manager.py config        - Show current configuration")
        return

    command = sys.argv[1]

    if command == "init":
        init_project()
    elif command == "add":
        components = sys.argv[2:] if len(sys.argv) > 2 else []
        add_components(components)
    elif command == "list":
        list_components()
    elif command == "search":
        query = sys.argv[2] if len(sys.argv) > 2 else ""
        search_components(query)
    elif command == "config":
        show_config()
    else:
        print(f"Unknown command: {command}")
        print("Available commands: init, add, list, search, config")

if __name__ == "__main__":
    main()