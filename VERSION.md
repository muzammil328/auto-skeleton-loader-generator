# Auto Skeleton Loader Generator — Version History

---

## Vision

### Working Name

**auto-skeleton** — check npm availability before publishing.

> **Note:** As of September 2026, the name `auto-skeleton` is **taken on npm** (v1.4.12). Consider alternatives such as `@your-scope/auto-skeleton`, `auto-skeleton-gen`, or `skeleton-from-component` before publishing.

---

### Problem

Every existing skeleton-loader package (`react-loading-skeleton`, `react-content-loader`, `ngx-skeleton-loader`, etc.) requires developers to **manually write skeleton markup** that mirrors their real component — matching every div, image, and text block by hand. This is repetitive and gets out of sync whenever the real component changes.

**No maintained package currently scans an existing component's structure and auto-generates a matching skeleton for it.**

---

### Idea

A tool/package that:

1. **Parses** a component file (JSX/TSX/HTML) using an AST parser (e.g. Babel or SWC).
2. **Detects** structural elements — text blocks, images, buttons, containers, lists.
3. **Infers** matching skeleton shapes (line, circle, rectangle, block) based on element type and size.
4. **Outputs** a ready-to-use skeleton component or a wrapped HOC that renders the skeleton automatically while data loads.

#### Target API

```jsx
import { withSkeleton } from 'auto-skeleton';
import UserCard from './UserCard';

export default withSkeleton(UserCard);
```

```bash
npx auto-skeleton generate ./src/components/UserCard.jsx
# → outputs UserCard.skeleton.jsx
```

---

### Why It's Different

| Existing packages | This idea |
|---|---|
| Manual skeleton markup per component | Skeleton generated automatically from real component's structure |
| Have to keep skeleton in sync manually | Regenerate skeleton anytime the component changes |
| Framework-specific (React-only, Angular-only) | Can start React-first, expand via AST parsing to Vue/Svelte later |

---

### Build Phases

#### Phase 1 — MVP
- [x] CLI: `auto-skeleton generate <file>`
- [x] Support basic JSX elements: `div`, `img`, `p`, `span`, `h1`–`h6`, `button`
- [x] Output a static skeleton component (no runtime magic yet)

#### Phase 2
- [ ] `withSkeleton()` HOC for automatic runtime swapping (loading state → real component)
- [ ] Config file for customizing shape mapping (e.g. treat all `<img>` as circles vs rectangles)
- [ ] Theming support (colors, animation speed, dark mode)

#### Phase 3
- [ ] Framework support: Vue, Svelte
- [ ] VS Code extension: right-click a component → "Generate Skeleton"
- [ ] Watch mode: auto-regenerate skeleton when source component changes

---

### Key Technical Challenges

- **AST traversal accuracy** — conditional rendering, mapped lists, dynamic children
- **Reasonable shape inference** — deciding what "looks like" text vs image vs button
- **Keeping output components lightweight** — no heavy runtime dependency

---

### Tech Stack

| Layer | Choice |
|---|---|
| AST parsing | `@babel/parser` + `@babel/traverse` |
| Language | TypeScript throughout |
| CLI | `commander` |
| Testing | Vitest |
| Styling (v0.1) | Plain CSS (embedded in generated output) |
| Styling (planned) | Optional Tailwind CSS output mode |

---

### Styling — CSS vs Tailwind

| | Plain CSS (v0.1) | Tailwind CSS (planned) |
|---|---|---|
| **How it works** | Generator injects a `<style>` block with pulse animation classes (`.skeleton`, `.skeleton-line`, etc.) | Generator outputs Tailwind utility classes (`animate-pulse`, `bg-gray-200`, `rounded-full`, etc.) |
| **Dependency** | Zero — works in any React project | Requires Tailwind in the target project |
| **Customization** | Edit generated CSS or override classes | Uses your `tailwind.config` theme tokens |
| **Dark mode** | Manual CSS media queries (Phase 2) | `dark:bg-gray-700` utilities (Phase 2) |

**v0.1 default:** plain CSS — no Tailwind setup needed. Generated skeletons are self-contained and copy-paste ready.

**Phase 2 plan:** add `--style tailwind` flag or `.auto-skeletonrc` option:

```bash
npx auto-skeleton generate ./UserCard.jsx --style tailwind
# → outputs Tailwind classes instead of embedded CSS
```

---

### Next Steps (Original Plan)

- [x] Validate name availability on npm
- [x] Build Phase 1 CLI prototype on 2–3 sample components
- [ ] Test shape-inference accuracy manually before automating further
- [ ] Publish v0.1 to npm, gather feedback via GitHub issues

---

## Current Version

### v0.1.0 — Phase 1 MVP

**Release date:** September 2, 2026  
**Status:** Initial prototype — CLI + static skeleton generation

#### What's Included

| Feature | Status |
|---|---|
| `auto-skeleton generate <file>` CLI command | ✅ |
| JSX/TSX AST parsing via Babel | ✅ |
| Shape inference for text, images, buttons, containers | ✅ |
| Static skeleton component output (`.skeleton.jsx`) | ✅ |
| Built-in CSS pulse animation in generated output | ✅ |
| Programmatic API (`parseComponent`, `generateSkeleton`) | ✅ |
| Sample components (`UserCard`, `ProductList`, `ArticlePreview`) | ✅ |
| Unit tests for shape inference logic | ✅ |

#### Supported Elements

| HTML/JSX Tag | Inferred Shape | Default Size |
|---|---|---|
| `img` with `avatar` / `rounded-full` class | Circle | 48 × 48 px |
| `img` (default) | Rectangle | 100% × 120 px |
| `p`, `span` | Line | 100% × 16 px |
| `h1` – `h6` | Line | 100% × tag-specific height |
| `button` | Rectangle | 100 × 36 px |
| `div`, `section`, `article`, etc. | Block (container) | Inherits children |

#### Usage

```bash
# Install dependencies and build
npm install
npm run build

# Generate skeleton from a component
npx auto-skeleton generate ./samples/UserCard.jsx
# → creates samples/UserCard.skeleton.jsx

# Run tests
npm test
```

#### Viewing Samples

Samples are JSX source files — they can't be opened directly in a browser. Two ways to preview:

**1. Live demo (recommended)**

```bash
npm install
npm run build
npm run demo
# → opens http://localhost:5173 with all 3 skeleton previews
```

**2. Generate + inspect output**

```bash
npm run build
npm run generate -- samples/UserCard.jsx
npm run generate -- samples/ProductList.jsx
npm run generate -- samples/ArticlePreview.jsx
# → open the generated *.skeleton.jsx files in samples/
```

| Sample source | Generated skeleton | What it shows |
|---|---|---|
| `samples/UserCard.jsx` | `samples/UserCard.skeleton.jsx` | Avatar circle + text lines + button |
| `samples/ProductList.jsx` | `samples/ProductList.skeleton.jsx` | Section heading + list container |
| `samples/ArticlePreview.jsx` | `samples/ArticlePreview.skeleton.jsx` | Header, cover image, excerpt, button |

The demo app imports the generated `.skeleton.jsx` files and renders them with a pulse animation (plain CSS, no Tailwind required).

#### Known Limitations (v0.1)

- **No runtime HOC** — `withSkeleton()` is planned for Phase 2
- **No config file** — shape mapping is hardcoded
- **Plain CSS only** — no Tailwind output mode yet; generated files embed their own `<style>` block
- **No theming** — generated skeleton uses default gray pulse animation
- **Mapped lists ignored** — `{items.map(...)}` inside JSX is not expanded; only static structure is parsed
- **Custom components skipped** — uppercase JSX tags (e.g. `<UserAvatar />`) are not traversed
- **Single return statement** — only the first `return` JSX tree in a component is analyzed

#### npm Name Status

| Name | Available? |
|---|---|
| `auto-skeleton` | ❌ Taken (v1.4.12) |
| `auto-skeleton-loader` | ❌ Taken |
| `auto-skeleton-loader-generator` | ✅ Available (current workspace name) |

---

### Upcoming — v0.2.0 (Phase 2 Preview)

Planned features:

- `withSkeleton(Component, options?)` HOC
- `.auto-skeletonrc` config for custom shape mappings
- `--style tailwind` output mode (Tailwind utility classes instead of embedded CSS)
- Theme tokens (color, animation speed, border radius)
- Dark mode variant in generated CSS / Tailwind `dark:` classes

---

*This file is the single source of truth for project vision and version history. Update the "Current Version" section with each release.*
