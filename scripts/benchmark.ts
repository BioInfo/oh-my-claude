/**
 * Performance Benchmarks
 * Measures grep speedup, parallel execution, and tool performance
 */

import { grep, findFiles, getGrepStats } from '../src/tools/grep/index.js';
import { execFileNoThrow } from '../src/utils/execFileNoThrow.js';

interface BenchmarkResult {
  name: string;
  duration: number;
  results: number;
  tool: string;
}

async function benchmark(
  name: string,
  fn: () => Promise<unknown>
): Promise<BenchmarkResult> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  let resultsCount = 0;
  if (Array.isArray(result)) {
    resultsCount = result.length;
  }

  return {
    name,
    duration: Math.round(duration),
    results: resultsCount,
    tool: name.includes('ripgrep') ? 'ripgrep' : 'grep',
  };
}

async function main() {
  console.log('🏃 Oh My Claude - Performance Benchmarks\n');

  const stats = await getGrepStats();
  console.log('Available Tools:');
  console.log(`  Ripgrep: ${stats.hasRipgrep ? '✅' : '❌'}`);
  console.log(`  fd: ${stats.hasFd ? '✅' : '❌'}`);
  console.log(`  Recommended: ${stats.recommended}\n`);

  const results: BenchmarkResult[] = [];

  // Benchmark 1: Simple pattern search
  console.log('📊 Benchmark 1: Simple pattern search');
  results.push(
    await benchmark('grep - pattern search', async () => {
      return grep({ pattern: 'function', path: 'src' });
    })
  );

  // Benchmark 2: Case-insensitive search
  console.log('📊 Benchmark 2: Case-insensitive search');
  results.push(
    await benchmark('grep - case insensitive', async () => {
      return grep({ pattern: 'FUNCTION', path: 'src', ignoreCase: true });
    })
  );

  // Benchmark 3: Type-filtered search (if ripgrep available)
  if (stats.hasRipgrep) {
    console.log('📊 Benchmark 3: Type-filtered search (TypeScript only)');
    results.push(
      await benchmark('ripgrep - type filter', async () => {
        return grep({ pattern: 'export', path: 'src', type: 'ts' });
      })
    );
  }

  // Benchmark 4: File finding
  console.log('📊 Benchmark 4: File finding');
  results.push(
    await benchmark('find_files', async () => {
      return findFiles('*.ts', 'src');
    })
  );

  // Benchmark 5: Ripgrep vs standard grep (if both available)
  if (stats.hasRipgrep) {
    console.log('📊 Benchmark 5: Ripgrep vs standard grep comparison');

    const ripgrepResult = await benchmark('ripgrep direct', async () => {
      const result = await execFileNoThrow('rg', [
        '--json',
        'function',
        'src',
      ]);
      return result.stdout.split('\n').filter(Boolean);
    });

    const standardGrepResult = await benchmark('grep direct', async () => {
      const result = await execFileNoThrow('grep', [
        '-r',
        'function',
        'src',
      ]);
      return result.stdout.split('\n').filter(Boolean);
    });

    results.push(ripgrepResult, standardGrepResult);

    const speedup = Math.round(
      standardGrepResult.duration / ripgrepResult.duration
    );
    console.log(`\n⚡ Speedup: ${speedup}x faster with ripgrep\n`);
  }

  // Display results
  console.log('\n📈 Results Summary:\n');
  console.log('┌─────────────────────────────┬──────────┬──────────┬──────────┐');
  console.log('│ Benchmark                   │ Duration │ Results  │ Tool     │');
  console.log('├─────────────────────────────┼──────────┼──────────┼──────────┤');

  for (const result of results) {
    const name = result.name.padEnd(27);
    const duration = `${result.duration}ms`.padStart(8);
    const count = result.results.toString().padStart(8);
    const tool = result.tool.padEnd(8);
    console.log(`│ ${name} │ ${duration} │ ${count} │ ${tool} │`);
  }

  console.log('└─────────────────────────────┴──────────┴──────────┴──────────┘');

  // Performance recommendations
  console.log('\n💡 Recommendations:\n');

  if (!stats.hasRipgrep) {
    console.log('  ⚠️  Install ripgrep for 10-100x faster searching:');
    console.log('     brew install ripgrep  # macOS');
    console.log('     apt-get install ripgrep  # Ubuntu');
  } else {
    console.log('  ✅ Ripgrep detected - optimal performance enabled');
  }

  if (!stats.hasFd) {
    console.log('\n  ⚠️  Install fd for faster file finding:');
    console.log('     brew install fd  # macOS');
    console.log('     apt-get install fd-find  # Ubuntu');
  } else {
    console.log('  ✅ fd detected - optimal file finding enabled');
  }

  console.log('\n✨ Benchmark complete\n');
}

main().catch(console.error);
