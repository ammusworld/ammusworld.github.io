# Project Setup Specification

## Overview

Initialize a Vite + React + TypeScript project configured for GitHub Pages deployment with pixel-art retro styling foundation.

## Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Dev Dependencies
```json
{
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.2.0",
  "typescript": "^5.3.0",
  "vite": "^5.0.0"
}
```

## Vite Configuration

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vsite/',  // GitHub repo name for Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
```

## TypeScript Configuration

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## GitHub Pages Deployment

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Global Styles Foundation

**File**: `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

:root {
  /* Color Palette */
  --pink-light: #FFB6C1;
  --pink-medium: #FF69B4;
  --pink-dark: #FF1493;
  --red-heart: #FF0000;
  --purple-soft: #DDA0DD;
  --green-grass: #228B22;
  --brown-dirt: #8B4513;
  --gray-stone: #696969;
  --white: #FFFFFF;
  --black: #000000;
  
  /* Pixel-perfect sizing */
  --tile-size: 32px;
  --sprite-size: 32px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--black);
}

body {
  font-family: 'Press Start 2P', cursive;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: none;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* CRT Scanline Effect Overlay */
.crt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 2px
  );
}

/* Pixel-perfect images */
img {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

## Entry Point

**File**: `src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## HTML Template

**File**: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Valentine's Day 💕</title>
    <meta name="description" content="A special Valentine's Day adventure" />
  </head>
  <body>
    <div id="root"></div>
    <div class="crt-overlay"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## npm Scripts

**File**: `package.json` (scripts section)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  }
}
```

## Success Criteria

### Automated Verification:
- [x] `npm install` completes without errors
- [x] `npm run dev` starts dev server successfully
- [x] `npm run build` produces `dist/` folder
- [x] TypeScript compiles without errors
- [x] Press Start 2P font loads correctly

### Manual Verification:
- [x] Page displays with pixel font
- [x] CRT scanline overlay visible
- [x] Black background applied
- [x] No console errors

## Implementation Order

1. Run `npm create vite@latest . -- --template react-ts`
2. Install dependencies
3. Configure vite.config.ts with base path
4. Set up global CSS with fonts and pixel rendering
5. Create GitHub Actions workflow
6. Test local build and preview
