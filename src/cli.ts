#!/usr/bin/env node

import { Command } from 'commander';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { parseComponent } from './parser/parseComponent.js';
import { generateSkeletonFile } from './generator/generateSkeleton.js';
import { loadConfig } from './config/loadConfig.js';

// Read from package.json so `--version` cannot drift from the published version.
const { version } = createRequire(import.meta.url)('../package.json') as { version: string };

const program = new Command();

program
  .name('auto-skeleton')
  .description('Auto-generate skeleton loader components from JSX/TSX structure')
  .version(version);

program
  .command('generate')
  .description('Generate a skeleton component from a source component file')
  .argument('<file>', 'Path to the JSX/TSX component file')
  .option('-o, --output <path>', 'Output file path (default: <Component>.skeleton.jsx)')
  .option('-c, --config <path>', 'Path to a config file (default: nearest .auto-skeletonrc)')
  .action((file: string, options: { output?: string; config?: string }) => {
    const filePath = resolve(file);

    if (!existsSync(filePath)) {
      console.error(`Error: File not found: ${filePath}`);
      process.exit(1);
    }

    const ext = filePath.toLowerCase();
    if (!ext.endsWith('.jsx') && !ext.endsWith('.tsx') && !ext.endsWith('.js')) {
      console.error('Error: Only .jsx, .tsx, and .js files are supported in v0.1');
      process.exit(1);
    }

    try {
      const { config, filePath: configPath } = loadConfig({
        cwd: dirname(filePath),
        configPath: options.config,
      });

      const result = parseComponent(filePath, config);
      const outPath = generateSkeletonFile(
        result,
        options.output ? resolve(options.output) : undefined,
        config,
      );

      console.log(`✓ Generated skeleton: ${outPath}`);
      console.log(`  Component: ${result.componentName}Skeleton`);
      console.log(`  Elements detected: ${countNodes(result.nodes)}`);
      if (configPath) console.log(`  Config: ${configPath}`);
    } catch (err) {
      console.error('Error generating skeleton:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

function countNodes(nodes: { children: unknown[] }[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children as { children: unknown[] }[]), 0);
}

program.parse();
