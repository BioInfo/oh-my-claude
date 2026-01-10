# oh-my-claude Standalone Environment
# Isolated Claude Code + oh-my-claude for testing without affecting main installation

FROM ubuntu:24.04

LABEL maintainer="Justin Johnson"
LABEL description="Claude Code with oh-my-claude plugin pre-installed"

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    nodejs \
    npm \
    ripgrep \
    fd-find \
    jq \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Create workspace
WORKDIR /workspace

# Copy oh-my-claude source
COPY ../ /oh-my-claude/

# Build and test oh-my-claude
RUN cd /oh-my-claude && \
    npm install && \
    npm run build && \
    npm test

# Install language servers for LSP testing
RUN npm install -g \
    typescript-language-server \
    vscode-langservers-extracted \
    yaml-language-server

RUN pip3 install python-lsp-server --break-system-packages

# Setup test environment
ENV OH_MY_CLAUDE_DEBUG=true

# Copy example project for testing
COPY examples/typescript-project /workspace/example

# Entry point - run tests and benchmarks
CMD ["bash", "-c", "cd /oh-my-claude && echo '🚀 oh-my-claude Test Environment' && echo '' && npm test && echo '' && npm run benchmark"]
