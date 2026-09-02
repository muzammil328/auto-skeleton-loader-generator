export type SkeletonShape = 'line' | 'circle' | 'rectangle' | 'block';

export interface SkeletonNode {
  shape: SkeletonShape;
  tag: string;
  className?: string;
  width?: string;
  height?: string;
  children: SkeletonNode[];
}

export interface ParseResult {
  componentName: string;
  nodes: SkeletonNode[];
  sourceFile: string;
}

export { parseComponent } from './parser/parseComponent.js';
export { inferShape, inferShapeFromTag } from './inference/inferShape.js';
export { generateSkeleton, generateSkeletonFile } from './generator/generateSkeleton.js';
