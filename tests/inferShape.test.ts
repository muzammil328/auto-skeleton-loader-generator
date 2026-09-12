import { describe, it, expect } from 'vitest';
import { inferShape, inferShapeFromTag } from '../src/inference/inferShape.js';
import type { SkeletonConfig } from '../src/config/defaults.js';
import { DEFAULT_CONFIG, mergeConfig } from '../src/config/defaults.js';

describe('inferShapeFromTag', () => {
  it('maps img to circle by default', () => {
    expect(inferShapeFromTag('img')).toBe('circle');
  });

  it('maps text tags to line', () => {
    expect(inferShapeFromTag('p')).toBe('line');
    expect(inferShapeFromTag('span')).toBe('line');
    expect(inferShapeFromTag('h1')).toBe('line');
    expect(inferShapeFromTag('h3')).toBe('line');
  });

  it('maps button to rectangle', () => {
    expect(inferShapeFromTag('button')).toBe('rectangle');
  });

  it('maps div to block', () => {
    expect(inferShapeFromTag('div')).toBe('block');
  });
});

describe('inferShape', () => {
  it('detects avatar images as circles', () => {
    const result = inferShape('img', { className: 'avatar rounded-full' });
    expect(result.shape).toBe('circle');
    expect(result.width).toBe('48px');
    expect(result.height).toBe('48px');
  });

  it('detects regular images as rectangles', () => {
    const result = inferShape('img', { className: 'cover-image' });
    expect(result.shape).toBe('rectangle');
    expect(result.width).toBe('100%');
    expect(result.height).toBe('120px');
  });

  it('applies heading-specific heights', () => {
    expect(inferShape('h1', {}).height).toBe('32px');
    expect(inferShape('h3', {}).height).toBe('24px');
    expect(inferShape('p', {}).height).toBe('16px');
  });

  it('applies short width for short class', () => {
    const result = inferShape('span', { className: 'short' });
    expect(result.width).toBe('60%');
  });

  it('sets button dimensions', () => {
    const result = inferShape('button', {});
    expect(result.shape).toBe('rectangle');
    expect(result.width).toBe('100px');
    expect(result.height).toBe('36px');
  });
});

describe('inferShape with config overrides', () => {
  const withShapes = (shapes: SkeletonConfig['shapes']): SkeletonConfig =>
    mergeConfig(DEFAULT_CONFIG, { shapes });

  it('is unchanged when the config has no shape rules', () => {
    expect(inferShape('img', { className: 'avatar' }, DEFAULT_CONFIG)).toEqual(
      inferShape('img', { className: 'avatar' }),
    );
  });

  it('overrides a shape by bare tag name', () => {
    const result = inferShape('button', {}, withShapes({ button: 'block' }));

    expect(result.shape).toBe('block');
    // fields the rule does not name fall through to built-in inference
    expect(result.width).toBe('100px');
  });

  it('overrides only the fields the rule names', () => {
    const result = inferShape('h1', {}, withShapes({ h1: { height: '40px' } }));

    expect(result.shape).toBe('line');
    expect(result.width).toBe('100%');
    expect(result.height).toBe('40px');
  });

  it('matches tag.hint keys against className', () => {
    const config = withShapes({
      'img.thumb': { shape: 'rectangle', width: '64px', height: '64px' },
    });

    expect(inferShape('img', { className: 'thumb' }, config)).toEqual({
      shape: 'rectangle',
      width: '64px',
      height: '64px',
    });
  });

  it('ignores a tag.hint rule when the hint is absent', () => {
    const config = withShapes({ 'img.thumb': { shape: 'rectangle' } });

    expect(inferShape('img', { className: 'avatar' }, config).shape).toBe('circle');
  });

  it('lets a hint rule win over a bare tag rule', () => {
    const config = withShapes({
      img: { shape: 'block' },
      'img.avatar': { shape: 'circle' },
    });

    expect(inferShape('img', { className: 'avatar rounded-full' }, config).shape).toBe('circle');
  });

  it('ignores rules for a different tag', () => {
    const config = withShapes({ span: { shape: 'block' } });

    expect(inferShape('p', {}, config).shape).toBe('line');
  });
});
