#!/usr/bin/env tsx
/**
 * Interactive Plugin Test Script
 * Tests oh-my-claude plugin initialization and basic functionality
 */

import { initializePlugin, shutdownPlugin, handleMessage, executeTool } from '../src/plugin.js';

async function main() {
  console.log('🚀 Oh My Claude - Interactive Plugin Test\n');

  // Initialize plugin
  console.log('1. Initializing plugin...');
  const plugin = await initializePlugin({
    projectRoot: process.cwd(),
    userConfig: {
      lsp: { enabled: false }, // Disable LSP for faster testing
    },
  });

  console.log('\n2. Testing keyword detection...');

  // Test ultrawork keyword
  const ultraworkResult = await handleMessage(plugin, {
    role: 'user',
    content: 'ulw build a new feature',
  });

  if (ultraworkResult.inject) {
    console.log('✅ Ultrawork keyword detected');
    console.log(`   Mode: ${ultraworkResult.metadata?.orchestrationMode}`);
  } else {
    console.log('❌ Ultrawork keyword NOT detected');
  }

  // Test @plan keyword
  const planResult = await handleMessage(plugin, {
    role: 'user',
    content: '@plan create authentication system',
  });

  if (planResult.inject) {
    console.log('✅ Planning keyword detected');
    console.log(`   Mode: ${planResult.metadata?.orchestrationMode}`);
  } else {
    console.log('❌ Planning keyword NOT detected');
  }

  console.log('\n3. Testing grep tool...');
  try {
    const grepResult = await executeTool(plugin, 'grep_search', {
      pattern: 'export',
      path: 'src',
    });
    console.log(`✅ Grep found ${Array.isArray(grepResult) ? grepResult.length : 0} results`);
  } catch (error) {
    console.log(`❌ Grep failed: ${error}`);
  }

  console.log('\n4. Testing find_files tool...');
  try {
    const findResult = await executeTool(plugin, 'find_files', {
      pattern: '*.ts',
      path: 'src',
    });
    console.log(`✅ Found ${Array.isArray(findResult) ? findResult.length : 0} TypeScript files`);
  } catch (error) {
    console.log(`❌ Find files failed: ${error}`);
  }

  console.log('\n5. Listing registered tools...');
  const tools = plugin.tools.list();
  console.log(`✅ ${tools.length} tools registered:`);
  for (const tool of tools) {
    console.log(`   - ${tool.name} (${tool.category})`);
  }

  console.log('\n6. Listing registered hooks...');
  const hooks = plugin.hooks.list();
  console.log(`✅ ${hooks.length} hooks active:`);
  for (const hook of hooks) {
    console.log(`   - ${hook.name} (${hook.event}, priority: ${hook.priority || 100})`);
  }

  // Shutdown
  console.log('\n7. Shutting down plugin...');
  await shutdownPlugin(plugin);

  console.log('\n✨ All tests complete!\n');
}

main().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
