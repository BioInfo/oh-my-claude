#!/bin/bash
# Launch Claude Code with isolated configuration for testing oh-my-claude

set -e

# Create isolated test directory
TEST_DIR="${HOME}/.claude-test"
mkdir -p "${TEST_DIR}"

echo "🧪 Launching Claude Code in isolated test environment"
echo "   Config: ${TEST_DIR}"
echo "   Plugin: oh-my-claude"
echo ""

# Set environment variables for isolated Claude Code
export CLAUDE_CONFIG_DIR="${TEST_DIR}"
export CLAUDE_HOME="${TEST_DIR}"

# Link oh-my-claude plugin
echo "Building and linking oh-my-claude..."
npm run build
npm link

# Launch Claude Code with isolated config
echo ""
echo "Starting Claude Code (isolated)..."
echo "Type 'exit' to return to normal environment"
echo ""

# Start Claude Code with isolated environment
claude "$@"

# Cleanup instructions
echo ""
echo "✨ Test session complete"
echo "   Your main Claude Code config is unchanged"
echo "   Test config: ${TEST_DIR}"
echo "   To clean up: rm -rf ${TEST_DIR}"
