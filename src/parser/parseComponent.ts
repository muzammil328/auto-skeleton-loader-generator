import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import type { ParseResult, SkeletonNode } from '../index.js';
import type { SkeletonConfig } from '../config/defaults.js';
import { inferShape } from '../inference/inferShape.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse = (_traverse as any).default ?? _traverse;

const SUPPORTED_TAGS = new Set([
  'div', 'img', 'p', 'span',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'button', 'section', 'article', 'main',
  'header', 'footer', 'nav', 'ul', 'ol', 'li', 'label', 'a',
]);

function getAttrs(path: NodePath<t.JSXOpeningElement>): Record<string, string | undefined> {
  const attrs: Record<string, string | undefined> = {};

  for (const attr of path.node.attributes) {
    if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name)) continue;

    const name = attr.name.name;
    if (t.isStringLiteral(attr.value)) {
      attrs[name] = attr.value.value;
    } else if (t.isJSXExpressionContainer(attr.value) && t.isStringLiteral(attr.value.expression)) {
      attrs[name] = attr.value.expression.value;
    }
  }

  return attrs;
}

function getTagName(opening: t.JSXOpeningElement): string | null {
  if (t.isJSXIdentifier(opening.name)) {
    return opening.name.name;
  }
  return null;
}

function isUppercaseComponent(tag: string | null): boolean {
  return tag !== null && tag[0] === tag[0]?.toUpperCase() && tag[0] !== tag[0]?.toLowerCase();
}

function jsxToSkeletonNode(path: NodePath<t.JSXElement>, config?: SkeletonConfig): SkeletonNode | null {
  const tag = getTagName(path.node.openingElement);
  if (!tag || isUppercaseComponent(tag)) return null;

  const normalizedTag = tag.toLowerCase();
  if (!SUPPORTED_TAGS.has(normalizedTag)) return null;

  const attrs = getAttrs(path.get('openingElement') as NodePath<t.JSXOpeningElement>);
  const { shape, width, height } = inferShape(normalizedTag, attrs, config);

  const children: SkeletonNode[] = [];
  for (const child of path.node.children) {
    if (t.isJSXElement(child)) {
      const childPath = path.get('children').find(
        (p) => p.isJSXElement() && p.node === child,
      ) as NodePath<t.JSXElement> | undefined;

      if (childPath) {
        const childNode = jsxToSkeletonNode(childPath, config);
        if (childNode) children.push(childNode);
      }
    }
  }

  const hasTextChild = path.node.children.some(
    (c) => t.isJSXText(c) && c.value.trim().length > 0,
  );

  if (hasTextChild && (normalizedTag === 'div' || normalizedTag === 'span' || normalizedTag === 'p')) {
    return {
      shape: 'line',
      tag: normalizedTag,
      className: attrs.className,
      width: '100%',
      height: '16px',
      children: [],
    };
  }

  return {
    shape,
    tag: normalizedTag,
    className: attrs.className,
    width,
    height,
    children,
  };
}

function extractComponentName(ast: t.File, filePath: string): string {
  let name = basename(filePath, extname(filePath));

  traverse(ast, {
    ExportDefaultDeclaration(path: NodePath<t.ExportDefaultDeclaration>) {
      const decl = path.node.declaration;
      if (t.isFunctionDeclaration(decl) && decl.id) {
        name = decl.id.name;
      } else if (t.isIdentifier(decl)) {
        name = decl.name;
      }
    },
    ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>) {
      const decl = path.node.declaration;
      if (t.isFunctionDeclaration(decl) && decl.id) {
        name = decl.id.name;
      }
    },
  });

  return name;
}

function findRootJsx(ast: t.File, config?: SkeletonConfig): SkeletonNode[] {
  const nodes: SkeletonNode[] = [];

  traverse(ast, {
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      const arg = path.node.argument;
      if (!arg) return;

      if (t.isJSXElement(arg)) {
        const node = jsxToSkeletonNode(path.get('argument') as NodePath<t.JSXElement>, config);
        if (node) nodes.push(node);
      } else if (t.isJSXFragment(arg)) {
        for (const child of arg.children) {
          if (t.isJSXElement(child)) {
            const childPath = path.get('argument').get('children').find(
              (p: NodePath) => p.isJSXElement() && p.node === child,
            ) as NodePath<t.JSXElement> | undefined;

            if (childPath) {
              const node = jsxToSkeletonNode(childPath, config);
              if (node) nodes.push(node);
            }
          }
        }
      }
    },
  });

  return nodes;
}

export function parseComponent(filePath: string, config?: SkeletonConfig): ParseResult {
  const source = readFileSync(filePath, 'utf-8');
  const ext = extname(filePath).toLowerCase();

  const ast = parse(source, {
    sourceType: 'module',
    plugins: ext === '.tsx' || ext === '.jsx'
      ? ['jsx', 'typescript']
      : ['jsx'],
  });

  const componentName = extractComponentName(ast, filePath);
  const nodes = findRootJsx(ast, config);

  return {
    componentName,
    nodes,
    sourceFile: filePath,
  };
}
