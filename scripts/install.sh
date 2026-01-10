#!/bin/bash
set -e

echo "🚀 Oh My Claude - Installation Script"
echo ""

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Claude Code is installed
if ! command -v claude &> /dev/null; then
    echo "❌ Claude Code CLI not found."
    echo "   Install from: https://code.claude.com"
    exit 1
fi

echo "✅ Claude Code detected"

# Install the plugin globally
echo ""
echo "📦 Installing @oh-my-claude/plugin..."
npm install -g @oh-my-claude/plugin

# Install plugin in Claude Code
echo ""
echo "🔌 Registering plugin with Claude Code..."
claude plugin install oh-my-claude

# Check for language servers
echo ""
echo "🔍 Checking for language servers..."

check_lsp() {
    local cmd=$1
    local name=$2
    local install_cmd=$3

    if command -v "$cmd" &> /dev/null; then
        echo "  ✅ $name"
    else
        echo "  ⚠️  $name not found"
        echo "     Install: $install_cmd"
    fi
}

check_lsp "typescript-language-server" "TypeScript" "npm install -g typescript-language-server"
check_lsp "pylsp" "Python" "pip install python-lsp-server"
check_lsp "rust-analyzer" "Rust" "rustup component add rust-analyzer"
check_lsp "gopls" "Go" "go install golang.org/x/tools/gopls@latest"

echo ""
echo "✅ Installation complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Read: GETTING_STARTED.md"
echo "   2. Try: claude (then type 'ulw build something')"
echo "   3. Enjoy: Parallel orchestration magic ✨"
echo ""
echo "📖 Docs: https://github.com/[ORG]/oh-my-claude"
echo "💬 Help: https://github.com/[ORG]/oh-my-claude/issues"
