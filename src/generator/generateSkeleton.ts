import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, basename, extname, resolve } from 'node:path';
import type { ParseResult, SkeletonNode } from '../index.js';
import type { SkeletonConfig } from '../config/defaults.js';
import { DEFAULT_CONFIG } from '../config/defaults.js';

const SKELETON_CSS = `
.skeleton {
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  border-radius: 4px;
}
.skeleton-circle {
  border-radius: 50%;
}
.skeleton-line {
  border-radius: 4px;
  margin-bottom: 8px;
}
.skeleton-rectangle {
  border-radius: 8px;
}
.skeleton-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`.trim();

function shapeToClass(shape: SkeletonNode['shape']): string {
  switch (shape) {
    case 'circle': return 'skeleton skeleton-circle';
    case 'line': return 'skeleton skeleton-line';
    case 'rectangle': return 'skeleton skeleton-rectangle';
    case 'block': return 'skeleton-block';
  }
}

function nodeToJsx(node: SkeletonNode, indent: number): string {
  const pad = '  '.repeat(indent);
  const cls = shapeToClass(node.shape);
  const styleParts: string[] = [];

  if (node.width) styleParts.push(`width: '${node.width}'`);
  if (node.height) styleParts.push(`height: '${node.height}'`);

  const styleAttr = styleParts.length > 0
    ? ` style={{ ${styleParts.join(', ')} }}`
    : '';

  if (node.shape === 'block' && node.children.length > 0) {
    const childJsx = node.children
      .map((c) => nodeToJsx(c, indent + 1))
      .join('\n');

    return `${pad}<div className="${cls}"${styleAttr}>\n${childJsx}\n${pad}</div>`;
  }

  if (node.children.length > 0) {
    const childJsx = node.children
      .map((c) => nodeToJsx(c, indent + 1))
      .join('\n');

    return `${pad}<div className="${cls}"${styleAttr}>\n${childJsx}\n${pad}</div>`;
  }

  return `${pad}<div className="${cls}"${styleAttr} />`;
}

export function generateSkeleton(result: ParseResult): string {
  const { componentName, nodes } = result;
  const skeletonName = `${componentName}Skeleton`;

  const body = nodes.length > 0
    ? nodes.map((n) => nodeToJsx(n, 2)).join('\n')
    : '    <div className="skeleton skeleton-block" style={{ width: \'100%\', height: \'100px\' }} />';

  return `import React from 'react';

const skeletonStyles = \`${SKELETON_CSS}\`;

export function ${skeletonName}() {
  return (
    <>
      <style>{skeletonStyles}</style>
${body}
    </>
  );
}

export default ${skeletonName};
`;
}

/** Resolves where a skeleton is written: explicit path, then config, then next to the source. */
export function resolveOutputPath(
  result: ParseResult,
  outputPath?: string,
  config: SkeletonConfig = DEFAULT_CONFIG,
): string {
  if (outputPath) return resolve(outputPath);

  const ext = extname(result.sourceFile);
  const base = basename(result.sourceFile, ext);
  const dir = config.output.dir ? resolve(config.output.dir) : dirname(result.sourceFile);

  return join(dir, `${base}${config.output.suffix}${ext}`);
}

export function generateSkeletonFile(
  result: ParseResult,
  outputPath?: string,
  config: SkeletonConfig = DEFAULT_CONFIG,
): string {
  const content = generateSkeleton(result);
  const outPath = resolveOutputPath(result, outputPath, config);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, content, 'utf-8');

  return outPath;
}
