# oh-my-claude

**Multi-agent orchestration plugin for Claude Code**

Transform sequential execution into parallel orchestration with persistent state management.

---

## The Promise

**"Type `ulw build X` and walk away. When you come back, it's done."**

---

## Features

✅ **Plugin Architecture** - Official Claude Code plugin (not just agents/hooks)
✅ **LSP Integration** - 11 LSP tools for refactoring, navigation, diagnostics
✅ **AST-Grep** - Structural code search/replace across 25+ languages
✅ **Boulder State** - Persistent execution state survives crashes
✅ **Keyword Activation** - `ulw` → instant orchestration mode
✅ **Completion Enforcement** - Agents never stop mid-task
✅ **Enhanced Grep** - ripgrep/fd integration for 5-10x faster search

---

## Quick Install

**Note:** Awaiting Claude Code plugin marketplace. For now, install from source:

```bash
# Clone and build
git clone https://github.com/[ORG]/oh-my-claude.git
cd oh-my-claude
npm install
npm run build

# Link globally
npm link

# Documentation
npm test          # Run tests
npm run benchmark # Performance benchmarks
```

**Requirements:**
- Node.js 18+
- Claude Code CLI
- Optional: ripgrep, fd for 10-100x faster searching

---

## Usage

### Simple Mode

```bash
claude
> ulw build user authentication with OAuth
```

Agent automatically:
1. Spawns 3 background exploration agents
2. Creates comprehensive todo list
3. Delegates to specialists (frontend, architect, etc.)
4. Updates boulder state continuously
5. Completes ALL steps before stopping

### Planning Mode

```bash
> @plan "Migrate authentication to NextAuth"
```

Seer agent:
1. Interviews you about requirements
2. Pathfinders codebase
3. Creates detailed plan in `.keepers/plans/nextauth.md`
4. Hands off to Warden for execution

---

## What Makes This Different?

| Feature | Stock Claude Code | oh-my-claude |
|---------|-------------------|--------------|
| Execution | Sequential (file-by-file) | Parallel (3+ agents) |
| State | Session-only | Persistent (.keepers/boulder.json) |
| Completion | Stops at 70% | Forces 100% |
| LSP | None | 11 tools (hover, rename, etc.) |
| Keywords | None | `ulw` activates orchestration |
| Grep | Standard | ripgrep (5-10x faster) |

---

## The Five Agents

| Agent | Model | Specialization |
|-------|-------|----------------|
| **Seer** | Opus | Strategic planning, requirements |
| **Warden** | Sonnet | Orchestration, never stops |
| **Sage** | Opus | Architecture, debugging |
| **Chronicler** | Sonnet | Documentation, research |
| **Pathfinder** | Haiku | Fast file discovery |

---

## Examples

**UI Feature:**
```
> ulw add dark mode toggle to settings
```
→ Warden delegates to frontend-developer (Gemini)
→ Creates component, updates all dependent files
→ Tests in isolation
→ ✅ Complete

**Complex Refactor:**
```
> @plan "Split monolith into microservices"
```
→ Seer interviews about approach
→ Creates 30-step plan
→ Warden executes over multiple sessions
→ Boulder state tracks progress
→ ✅ All 30 steps done

---

## Docker Standalone

Test without affecting your main Claude Code:

```bash
docker run -it \
  -v $(pwd):/workspace \
  -e ANTHROPIC_API_KEY=your-key \
  oh-my-claude/standalone
```

---

## Documentation

- **[PRD.md](PRD.md)** - Product requirements and roadmap
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and components
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Developer setup and contribution guide
- **[docs/ultra-think-oh-my-claude-analysis.md](docs/ultra-think-oh-my-claude-analysis.md)** - Deep architectural analysis
- **[docs/oh-my-claude-quickstart.md](docs/oh-my-claude-quickstart.md)** - Copy-paste setup guide
- **[docs/oh-my-claude-summary.md](docs/oh-my-claude-summary.md)** - Executive summary

---

## Credits & Inspiration

**Heavily inspired by:**

- **[oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)** by code-yeongyu
  - The original orchestration philosophy ($24K token investment)
  - Multi-agent coordination patterns

- **[oh-my-claude-sisyphus](https://github.com/Yeachan-Heo/oh-my-claude-sisyphus)** by Yeachan-Heo
  - LSP client implementation (ported with attribution)
  - AST-grep integration
  - Hook patterns

**oh-my-claude differentiates via:**
- Official plugin architecture (not just agents/hooks)
- Enhanced boulder state persistence
- Docker standalone environment
- Extended documentation and examples

---

## Philosophy

**Three Pillars:**

1. **Orchestration > Implementation**
   - Agents delegate, not do everything themselves
   - Specialization beats generalization

2. **Persistence > Memory**
   - State survives crashes
   - Multi-day work supported

3. **Completion > Iteration**
   - Never stop with incomplete work
   - "Done" means verified, not hoped

---

## Status

**Current:** Pre-Release (v0.1.0)

**Completed:**
- ✅ Phase 1: Plugin skeleton + LSP tools (11 tools)
- ✅ Phase 2: Boulder state + orchestration (registries, hooks)
- ✅ Phase 3: Polish + Docker (docs, examples, benchmarks)
- 🚧 Phase 4: Community release (awaiting plugin marketplace)

**Test Results:**
- 35 tests passing, 1 skipped
- Docker standalone validated
- Benchmarks: 3-9ms grep operations with ripgrep

See [PRD.md](PRD.md) for detailed roadmap.

---

## License

MIT

---

## Contributing

See [DEVELOPMENT.md](DEVELOPMENT.md) for developer setup.

**Before PR:**
- [ ] Tests pass
- [ ] Types check
- [ ] Docs updated
- [ ] No security issues

---

## Support & Resources

- **Issues:** https://github.com/[ORG]/oh-my-claude/issues
- **Discussions:** https://github.com/[ORG]/oh-my-claude/discussions
- **Claude Code Docs:** https://docs.claude.com/claude-code
- **Messages API:** https://docs.anthropic.com/claude/reference/messages
- **Agent SDK:** https://github.com/anthropics/anthropic-sdk-typescript

---

**Built with ❤️ to make Claude Code unstoppable**
