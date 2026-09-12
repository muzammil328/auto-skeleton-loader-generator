import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadConfig, findConfigFile } from '../src/config/loadConfig.js';
import { DEFAULT_CONFIG, mergeConfig, validateConfig } from '../src/config/defaults.js';

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'auto-skeleton-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

function write(relPath: string, contents: unknown): string {
  const full = join(root, relPath);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, typeof contents === 'string' ? contents : JSON.stringify(contents), 'utf-8');
  return full;
}

describe('loadConfig', () => {
  it('falls back to defaults when no config file exists', () => {
    const { config, filePath } = loadConfig({ cwd: root });

    expect(filePath).toBeNull();
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('merges an rc file over the defaults', () => {
    write('.auto-skeletonrc', { style: 'tailwind', theme: { baseColor: '#111' } });

    const { config } = loadConfig({ cwd: root });

    expect(config.style).toBe('tailwind');
    expect(config.theme.baseColor).toBe('#111');
    // untouched fields keep their defaults
    expect(config.theme.highlightColor).toBe(DEFAULT_CONFIG.theme.highlightColor);
    expect(config.output.suffix).toBe('.skeleton');
  });

  it('walks up from a nested directory', () => {
    write('.auto-skeletonrc', { output: { suffix: '.loading' } });
    mkdirSync(join(root, 'src', 'components'), { recursive: true });

    const { config, filePath } = loadConfig({ cwd: join(root, 'src', 'components') });

    expect(filePath).toBe(join(root, '.auto-skeletonrc'));
    expect(config.output.suffix).toBe('.loading');
  });

  it('reads the autoSkeleton key from package.json', () => {
    write('package.json', { name: 'app', autoSkeleton: { style: 'tailwind' } });

    const { config, filePath } = loadConfig({ cwd: root });

    expect(filePath).toBe(join(root, 'package.json'));
    expect(config.style).toBe('tailwind');
  });

  it('ignores a package.json without the autoSkeleton key', () => {
    write('package.json', { name: 'app' });

    expect(findConfigFile(root)).toBeNull();
  });

  it('prefers an rc file over package.json in the same directory', () => {
    write('.auto-skeletonrc', { output: { suffix: '.rc' } });
    write('package.json', { name: 'app', autoSkeleton: { output: { suffix: '.pkg' } } });

    expect(loadConfig({ cwd: root }).config.output.suffix).toBe('.rc');
  });

  it('prefers an explicit configPath over the search', () => {
    write('.auto-skeletonrc', { output: { suffix: '.near' } });
    const explicit = write('custom.json', { output: { suffix: '.explicit' } });

    expect(loadConfig({ cwd: root, configPath: explicit }).config.output.suffix).toBe('.explicit');
  });

  it('throws when an explicit configPath is missing', () => {
    expect(() => loadConfig({ cwd: root, configPath: join(root, 'nope.json') })).toThrow(/not found/);
  });

  it('throws on malformed JSON, naming the file', () => {
    write('.auto-skeletonrc', '{ "style": ');

    expect(() => loadConfig({ cwd: root })).toThrow(/Invalid JSON/);
  });

  it('throws on an unknown style mode', () => {
    write('.auto-skeletonrc', { style: 'sass' });

    expect(() => loadConfig({ cwd: root })).toThrow(/"style" must be one of/);
  });

  it('accepts a directory path that is actually a file', () => {
    const file = write('src/UserCard.jsx', 'export default () => null;');
    write('.auto-skeletonrc', { output: { suffix: '.sk' } });

    expect(loadConfig({ cwd: file }).config.output.suffix).toBe('.sk');
  });
});

describe('validateConfig', () => {
  it('rejects non-objects', () => {
    expect(() => validateConfig([], 'test')).toThrow(/expected an object/);
  });

  it('rejects a shape rule that is neither a shape name nor an object', () => {
    expect(() => validateConfig({ shapes: { img: 42 } }, 'test')).toThrow(/shapes\["img"\]/);
  });

  it('accepts a bare shape name', () => {
    expect(() => validateConfig({ shapes: { img: 'rectangle' } }, 'test')).not.toThrow();
  });
});

describe('mergeConfig', () => {
  it('does not mutate the base config', () => {
    mergeConfig(DEFAULT_CONFIG, { theme: { baseColor: '#000' } });

    expect(DEFAULT_CONFIG.theme.baseColor).toBe('#e0e0e0');
  });

  it('merges dark theme fields over the base dark theme', () => {
    const withDark = mergeConfig(DEFAULT_CONFIG, {
      theme: { dark: { baseColor: '#1f2937', highlightColor: '#374151' } },
    });
    const overridden = mergeConfig(withDark, { theme: { dark: { baseColor: '#000' } } });

    expect(overridden.theme.dark).toEqual({ baseColor: '#000', highlightColor: '#374151' });
  });

  it('clears the dark theme when set to null', () => {
    const withDark = mergeConfig(DEFAULT_CONFIG, {
      theme: { dark: { baseColor: '#1f2937', highlightColor: '#374151' } },
    });

    expect(mergeConfig(withDark, { theme: { dark: null } }).theme.dark).toBeNull();
  });
});
