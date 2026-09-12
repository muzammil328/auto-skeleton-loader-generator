import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { SkeletonConfig, SkeletonConfigInput } from './defaults.js';
import { DEFAULT_CONFIG, mergeConfig, validateConfig } from './defaults.js';

export const CONFIG_FILE_NAMES = ['.auto-skeletonrc', '.auto-skeletonrc.json'] as const;

/** The `package.json` key checked when no rc file is found. */
export const PACKAGE_JSON_KEY = 'autoSkeleton';

export interface LoadConfigOptions {
  /** Directory to start searching from. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Explicit config file path — skips the search and throws if missing. */
  configPath?: string;
}

export interface LoadConfigResult {
  config: SkeletonConfig;
  /** Path the config came from, or `null` when defaults were used. */
  filePath: string | null;
}

function parseJson(filePath: string): unknown {
  const raw = readFileSync(filePath, 'utf-8');

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function readRcFile(filePath: string): SkeletonConfigInput {
  return validateConfig(parseJson(filePath), filePath);
}

function readPackageJson(filePath: string): SkeletonConfigInput | null {
  const pkg = parseJson(filePath);

  if (typeof pkg !== 'object' || pkg === null) return null;

  const section = (pkg as Record<string, unknown>)[PACKAGE_JSON_KEY];
  if (section === undefined) return null;

  return validateConfig(section, `${filePath} (${PACKAGE_JSON_KEY})`);
}

/**
 * Walks up from `startDir` looking for a config file. Returns the first hit:
 * an rc file beats a `package.json` key in the same directory.
 */
export function findConfigFile(startDir: string): string | null {
  let dir = resolve(startDir);

  for (;;) {
    for (const name of CONFIG_FILE_NAMES) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) return candidate;
    }

    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath) && readPackageJson(pkgPath) !== null) return pkgPath;

    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Resolves configuration for a run, merging the first file found over
 * {@link DEFAULT_CONFIG}. Precedence: `configPath` → nearest rc file →
 * `package.json#autoSkeleton` → defaults.
 */
export function loadConfig(options: LoadConfigOptions = {}): LoadConfigResult {
  const { cwd = process.cwd(), configPath } = options;

  if (configPath) {
    const filePath = resolve(configPath);

    if (!existsSync(filePath)) {
      throw new Error(`Config file not found: ${filePath}`);
    }

    const input = filePath.endsWith('package.json')
      ? readPackageJson(filePath)
      : readRcFile(filePath);

    return { config: mergeConfig(DEFAULT_CONFIG, input), filePath };
  }

  const startDir = existsSync(cwd) && statSync(cwd).isFile() ? dirname(cwd) : cwd;
  const found = findConfigFile(startDir);

  if (!found) {
    return { config: mergeConfig(DEFAULT_CONFIG, null), filePath: null };
  }

  const input = found.endsWith('package.json') ? readPackageJson(found) : readRcFile(found);

  return { config: mergeConfig(DEFAULT_CONFIG, input), filePath: found };
}
