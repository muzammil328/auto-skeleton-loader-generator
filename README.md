# Auto Skeleton Loader Generator

> **Working name:** `auto-skeleton` — see [VERSION.md](./VERSION.md) for npm availability and roadmap.

Automatically generate skeleton loader components from existing JSX/TSX component structure. No more hand-writing skeleton markup that drifts out of sync with the real component.

## Install

```bash
npm install auto-skeleton-loader-generator
```

## Usage

### CLI

```bash
# Generate a skeleton file next to the source component
npx auto-skeleton generate ./src/components/UserCard.jsx
# → outputs UserCard.skeleton.jsx

# Custom output path
npx auto-skeleton generate ./UserCard.jsx -o ./skeletons/UserCardSkeleton.jsx
```

### Programmatic API

```ts
import { parseComponent, generateSkeleton } from 'auto-skeleton-loader-generator';

const result = parseComponent('./UserCard.jsx');
const code = generateSkeleton(result);
console.log(code);
```

## Supported Elements (v0.1)

| Element | Skeleton Shape |
|---------|---------------|
| `img` (avatar) | Circle (48×48) |
| `img` (default) | Rectangle |
| `p`, `span`, `h1`–`h6` | Line |
| `button` | Rectangle (100×36) |
| `div`, `section`, etc. | Block container |

## Try the Samples

```bash
npm install
npm run build
npm run generate -- samples/UserCard.jsx
npm run generate -- samples/ProductList.jsx
npm run generate -- samples/ArticlePreview.jsx

# Preview all generated skeletons in the browser
npm run demo
# → http://localhost:5173
```

**Styling:** v0.1 outputs plain CSS (embedded pulse animation). Tailwind output mode is planned for v0.2 — see [VERSION.md](./VERSION.md).

## Roadmap

See [VERSION.md](./VERSION.md) for the full vision, build phases, and current release notes.

## License

MIT
