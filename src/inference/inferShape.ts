import type { SkeletonShape } from '../index.js';

const TEXT_TAGS = new Set(['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'a']);
const CONTAINER_TAGS = new Set(['div', 'section', 'article', 'main', 'header', 'footer', 'nav', 'ul', 'ol', 'li']);
const BUTTON_TAGS = new Set(['button']);
const IMAGE_TAGS = new Set(['img']);

const HEADING_HEIGHTS: Record<string, string> = {
  h1: '32px',
  h2: '28px',
  h3: '24px',
  h4: '20px',
  h5: '18px',
  h6: '16px',
};

export function inferShapeFromTag(tag: string): SkeletonShape {
  const normalized = tag.toLowerCase();

  if (IMAGE_TAGS.has(normalized)) return 'circle';
  if (TEXT_TAGS.has(normalized)) return 'line';
  if (BUTTON_TAGS.has(normalized)) return 'rectangle';
  if (CONTAINER_TAGS.has(normalized)) return 'block';

  return 'block';
}

export function inferShape(tag: string, attrs: Record<string, string | undefined>): {
  shape: SkeletonShape;
  width?: string;
  height?: string;
} {
  const shape = inferShapeFromTag(tag);
  const normalized = tag.toLowerCase();
  const result: { shape: SkeletonShape; width?: string; height?: string } = { shape };

  if (TEXT_TAGS.has(normalized)) {
    result.height = HEADING_HEIGHTS[normalized] ?? '16px';
    result.width = attrs.className?.includes('short') ? '60%' : '100%';
  }

  if (IMAGE_TAGS.has(normalized)) {
    const isAvatar = attrs.className?.includes('avatar') || attrs.className?.includes('rounded-full');
    result.shape = isAvatar ? 'circle' : 'rectangle';
    result.width = isAvatar ? '48px' : '100%';
    result.height = isAvatar ? '48px' : '120px';
  }

  if (BUTTON_TAGS.has(normalized)) {
    result.width = '100px';
    result.height = '36px';
  }

  return result;
}
