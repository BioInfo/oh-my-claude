# Docker Standalone Environment

Isolated testing environment for Oh My Claude without affecting your main installation.

## Quick Start

```bash
# Build and run tests automatically
docker-compose up --build

# Or build separately
docker-compose build

# Run tests
docker-compose up

# Enter the container for manual testing
docker-compose run oh-my-claude bash

# Inside container, run benchmarks
cd /oh-my-claude
npm run benchmark
```

## What's Included

- Ubuntu 24.04 base
- Node.js 20.x
- ripgrep (fast searching)
- fd (fast file finding)
- Oh My Claude plugin (pre-installed)
- Example TypeScript project

## Testing Workflow

1. **Build and enter container:**
   ```bash
   docker-compose up -d
   docker-compose exec oh-my-claude bash
   ```

2. **Navigate to example project:**
   ```bash
   cd /workspace/examples/typescript-project
   ```

3. **Test Oh My Claude features:**
   ```bash
   # Test grep functionality
   npx oh-my-claude grep "function.*User"

   # Test file finding
   npx oh-my-claude find "*.ts"

   # Test LSP (if servers installed)
   npx oh-my-claude lsp hover src/index.ts 10 5
   ```

4. **Clean up:**
   ```bash
   docker-compose down
   ```

## Persistent Data

The `.keepers/` directory is mounted as a Docker volume, so:
- Boulder state persists across container restarts
- Plans are saved
- Work can be resumed

## Rebuild After Changes

```bash
# Rebuild after code changes
docker-compose build --no-cache

# Restart
docker-compose restart
```

## Advanced Usage

### Run Tests in Container

```bash
docker-compose exec oh-my-claude npm test
```

### Install LSP Servers

```bash
docker-compose exec oh-my-claude bash -c "
  npm install -g typescript-language-server
  pip3 install python-lsp-server
"
```

### Mount Your Own Project

Edit `docker-compose.yml`:

```yaml
volumes:
  - /path/to/your/project:/workspace/project
  - test-data:/workspace/.keepers
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs

# Remove and rebuild
docker-compose down -v
docker-compose build --no-cache
```

### Permission issues

```bash
# Enter as root
docker-compose exec -u root oh-my-claude bash

# Fix permissions
chown -R $(id -u):$(id -g) /workspace
```

## Notes

- This environment is for **testing only**
- Not suitable for production use
- Claude Code CLI is a placeholder (update when available)
- State is isolated from your main system
