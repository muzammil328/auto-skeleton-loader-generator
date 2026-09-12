import type { SkeletonShape } from '../index.js';

export type StyleMode = 'css' | 'tailwind';

/** Overrides for a single tag or `tag.className-hint` key. Only the fields present are applied. */
export interface ShapeRule {
  shape?: SkeletonShape;
  width?: string;
  height?: string;
}

export interface ThemeDarkConfig {
  baseColor: string;
  highlightColor: string;
}

export interface ThemeConfig {
  baseColor: string;
  highlightColor: string;
  borderRadius: string;
  animationDuration: string;
  dark: ThemeDarkConfig | null;
}

export interface OutputConfig {
  /** Inserted before the extension: `UserCard` + suffix + `.jsx`. */
  suffix: string;
  /** Write skeletons here instead of next to the source. Relative paths resolve from cwd. */
  dir: string | null;
}

export interface SkeletonConfig {
  style: StyleMode;
  output: OutputConfig;
  theme: ThemeConfig;
  /** Keys are `tag` or `tag.hint`, where `hint` is matched against the element's className. */
  shapes: Record<string, SkeletonShape | ShapeRule>;
}

/** The shape a config file may take — every field optional. */
export interface SkeletonConfigInput {
  style?: StyleMode;
  output?: Partial<OutputConfig>;
  theme?: Partial<Omit<ThemeConfig, 'dark'>> & { dark?: Partial<ThemeDarkConfig> | null };
  shapes?: Record<string, SkeletonShape | ShapeRule>;
}

export const STYLE_MODES: readonly StyleMode[] = ['css', 'tailwind'];

export const DEFAULT_CONFIG: SkeletonConfig = {
  style: 'css',
  output: {
    suffix: '.skeleton',
    dir: null,
  },
  theme: {
    baseColor: '#e0e0e0',
    highlightColor: '#f0f0f0',
    borderRadius: '4px',
    animationDuration: '1.5s',
    dark: null,
  },
  shapes: {},
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validates a raw config object, throwing on anything that would silently
 * misbehave later (a typo'd style mode, a shape rule that isn't an object).
 */
export function validateConfig(input: unknown, source = 'config'): SkeletonConfigInput {
  if (!isPlainObject(input)) {
    throw new Error(`${source}: expected an object, received ${Array.isArray(input) ? 'an array' : typeof input}`);
  }

  const { style, output, theme, shapes } = input;

  if (style !== undefined && !STYLE_MODES.includes(style as StyleMode)) {
    throw new Error(`${source}: "style" must be one of ${STYLE_MODES.join(', ')} — received ${JSON.stringify(style)}`);
  }

  if (output !== undefined && !isPlainObject(output)) {
    throw new Error(`${source}: "output" must be an object`);
  }

  if (theme !== undefined && !isPlainObject(theme)) {
    throw new Error(`${source}: "theme" must be an object`);
  }

  if (shapes !== undefined) {
    if (!isPlainObject(shapes)) {
      throw new Error(`${source}: "shapes" must be an object`);
    }

    for (const [key, rule] of Object.entries(shapes)) {
      const valid = typeof rule === 'string'
        ? ['line', 'circle', 'rectangle', 'block'].includes(rule)
        : isPlainObject(rule);

      if (!valid) {
        throw new Error(
          `${source}: shapes["${key}"] must be a shape name or an object — received ${JSON.stringify(rule)}`,
        );
      }
    }
  }

  return input as SkeletonConfigInput;
}

/** Merges a partial config over a base, one level deep for `output`/`theme`/`shapes`. */
export function mergeConfig(base: SkeletonConfig, input?: SkeletonConfigInput | null): SkeletonConfig {
  if (!input) return { ...base, output: { ...base.output }, theme: { ...base.theme }, shapes: { ...base.shapes } };

  const dark = input.theme?.dark === undefined
    ? base.theme.dark
    : input.theme.dark === null
      ? null
      : { ...(base.theme.dark ?? { baseColor: '', highlightColor: '' }), ...input.theme.dark };

  return {
    style: input.style ?? base.style,
    output: { ...base.output, ...input.output },
    theme: { ...base.theme, ...input.theme, dark },
    shapes: { ...base.shapes, ...input.shapes },
  };
}

/** Normalizes a shape rule, which may be written as a bare shape name. */
export function toShapeRule(rule: SkeletonShape | ShapeRule): ShapeRule {
  return typeof rule === 'string' ? { shape: rule } : rule;
}
