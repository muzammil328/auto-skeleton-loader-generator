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
export { generateSkeleton, generateSkeletonFile, resolveOutputPath } from './generator/generateSkeleton.js';

export type {
  StyleMode,
  ShapeRule,
  ThemeConfig,
  ThemeDarkConfig,
  OutputConfig,
  SkeletonConfig,
  SkeletonConfigInput,
} from './config/defaults.js';
export { DEFAULT_CONFIG, STYLE_MODES, mergeConfig, validateConfig, toShapeRule } from './config/defaults.js';
export type { LoadConfigOptions, LoadConfigResult } from './config/loadConfig.js';
export { loadConfig, findConfigFile, CONFIG_FILE_NAMES, PACKAGE_JSON_KEY } from './config/loadConfig.js';
