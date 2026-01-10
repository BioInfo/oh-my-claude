# Testing Oh My Claude

Complete guide for testing the oh-my-claude plugin in different environments.

## Quick Test (Recommended)

Test all plugin functionality without Claude Code:

```bash
npm run test:plugin
```

This runs an interactive test that validates:
- Plugin initialization
- Keyword detection (ulw, @plan)
- Tool execution (grep, find_files)
- Hook registration
- Boulder state management

## Option 1: Local Testing (With Claude Code)

Test with the actual Claude Code installation:

### Prerequisites

- Claude Code CLI installed
- Node.js 18+
- oh-my-claude built

### Steps

```bash
# Build the plugin
npm run build

# Link globally for Claude Code to find
npm link

# Start Claude Code with plugin loaded
claude --plugin oh-my-claude

# Inside Claude session, test keywords:
# > ulw build authentication
# > @plan refactor database
```

### Expected Behavior

When you type `ulw` or `@plan`, you should see:

```
The Oh-My-Claude Council is at your command.

[ORCHESTRATION MODE: ULTRAWORK]
Keyword detected: ulw
...
```

## Option 2: Docker Testing

Test in isolated environment without affecting your system:

### Launch Docker Test Environment

```bash
cd .claude-standalone

# Build and run interactively
docker-compose run --rm oh-my-claude bash
```

### Inside Docker Container

```bash
# Navigate to plugin
cd /oh-my-claude

# Run all tests
npm test

# Run interactive plugin test
npm run test:plugin

# Run benchmarks
npm run benchmark

# Test on example project
cd /workspace/example
ls -la
```

### Automated Docker Testing

Run tests without interactive shell:

```bash
# From project root
cd .claude-standalone
docker-compose run --rm oh-my-claude bash -c "cd /oh-my-claude && npm test && npm run test:plugin"
```

## Option 3: Unit Tests

Run the full test suite:

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Files

- `src/config/index.test.ts` - Configuration loading
- `src/state/boulder.test.ts` - State persistence
- `src/hooks/keyword-detector.test.ts` - Keyword detection
- `src/plugin.test.ts` - Plugin integration
- `src/tools/grep/index.test.ts` - Grep functionality
- `src/utils/execFileNoThrow.test.ts` - Command execution

## Option 4: Manual Integration Testing

Test individual components programmatically:

```typescript
import { initializePlugin, handleMessage } from '@oh-my-claude/plugin';

// Initialize
const plugin = await initializePlugin({
  projectRoot: '/path/to/project',
});

// Test keyword detection
const result = await handleMessage(plugin, {
  role: 'user',
  content: 'ulw build feature',
});

console.log(result.inject); // Should show orchestration instructions
```

## Benchmarks

Test performance characteristics:

```bash
npm run benchmark
```

Expected results with ripgrep:
- Grep operations: 3-9ms
- File finding: <5ms
- 10-100x faster than standard grep

## Troubleshooting

### "Plugin not found"

```bash
# Check if globally linked
npm list -g @oh-my-claude/plugin

# Re-link if needed
npm link
```

### "LSP tools not working"

LSP requires language servers installed:

```bash
# TypeScript
npm install -g typescript-language-server

# Python
pip install python-lsp-server

# Check in plugin test
npm run test:plugin
```

### Docker container won't start

```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
```

### Tests failing

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
npm test
```

## CI/CD Testing

For automated testing in CI:

```bash
# Install dependencies
npm ci

# Build
npm run build

# Run all checks
npm run type-check
npm test
npm run test:plugin
```

## Performance Testing

Compare performance with/without ripgrep:

```bash
# With ripgrep (recommended)
brew install ripgrep fd
npm run benchmark

# Without ripgrep (fallback)
# Uninstall temporarily to test fallback
# Expect 10-100x slower results
```

## Expected Test Output

### npm run test:plugin

```
🚀 Oh My Claude - Interactive Plugin Test

1. Initializing plugin...
[Oh My Claude] The Oh-My-Claude Council stands ready.
[Oh My Claude] 4 tools registered
[Oh My Claude] 3 hooks active

2. Testing keyword detection...
✅ Ultrawork keyword detected
   Mode: ultrawork
✅ Planning keyword detected
   Mode: planning

3. Testing grep tool...
✅ Grep found 36 results

4. Testing find_files tool...
✅ Found 22 TypeScript files

5. Listing registered tools...
✅ 4 tools registered:
   - ast_grep_search (ast)
   - ast_grep_replace (ast)
   - grep_search (grep)
   - find_files (grep)

6. Listing registered hooks...
✅ 3 hooks active:
   - keyword-detector (message, priority: 5)
   - completion-enforcer (idle, priority: 1)
   - boulder-resume (session-start, priority: 10)

7. Shutting down plugin...
[Oh My Claude] The Oh-My-Claude Council rests.

✨ All tests complete!
```

### npm test

```
✓ src/config/index.test.ts  (4 tests)
✓ src/hooks/keyword-detector.test.ts  (6 tests)
✓ src/state/boulder.test.ts  (7 tests)
✓ src/plugin.test.ts  (8 tests)
✓ src/tools/grep/index.test.ts  (5 tests | 1 skipped)
✓ src/utils/execFileNoThrow.test.ts  (6 tests)

Test Files  6 passed (6)
     Tests  35 passed | 1 skipped (36)
```

## Next Steps

After successful testing:

1. **Local Development:** Use `npm run dev` for watch mode
2. **Integration:** Test with real Claude Code sessions
3. **Performance:** Run benchmarks to validate speed improvements
4. **Deployment:** Ready for npm publish once Claude Code plugin marketplace is available

## Support

- **Issues:** https://github.com/justinbjohnson/oh-my-claude/issues
- **Discussions:** https://github.com/justinbjohnson/oh-my-claude/discussions
