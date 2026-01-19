#!/bin/bash
# shadcn UI Helper Script
# Provides common shadcn UI operations

show_help() {
    echo "shadcn UI Helper Script"
    echo "Usage:"
    echo "  $0 init          - Initialize shadcn UI in current project"
    echo "  $0 add [comp]    - Add specific component(s)"
    echo "  $0 list          - Show available components"
    echo "  $0 info          - Show current configuration"
    echo ""
    echo "Examples:"
    echo "  $0 init"
    echo "  $0 add button input dialog"
    echo "  $0 add \\* # (to add all components)"
}

case "$1" in
    "init")
        echo "Initializing shadcn UI in current project..."
        echo "Running: npx shadcn@latest init"
        npx shadcn@latest init
        ;;
    "add")
        if [ $# -lt 2 ]; then
            echo "Error: Please specify component(s) to add"
            echo "Usage: $0 add [component1] [component2] ..."
            exit 1
        fi

        shift  # Remove 'add' from arguments
        echo "Adding components: $*"
        echo "Running: npx shadcn@latest add $*"
        npx shadcn@latest add "$@"
        ;;
    "list")
        echo "Listing available components..."
        echo "Running: npx shadcn@latest list"
        npx shadcn@latest list
        ;;
    "info")
        if [ -f "components.json" ]; then
            echo "Current shadcn UI configuration (components.json):"
            cat components.json | jq '.' 2>/dev/null || echo "components.json found but could not parse (jq required)"
        else
            echo "No components.json found in current directory"
            echo "shadcn UI may not be initialized in this project"
        fi
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac