# TOGOSHOL

Frontend landing for TOGOSHOL: a local premium gaming PC brand for Veliky Novgorod.

## Stack

- React
- TypeScript
- Vite
- CSS

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## VK Products Import

Products are imported from VK Market into `src/data/vkProducts.ts`.

Create a VK token with market access, then run:

```bash
VK_TOKEN=your_token npm run import:vk
```

On Windows PowerShell:

```powershell
$env:VK_TOKEN="your_token"
npm run import:vk
Remove-Item Env:VK_TOKEN
```

Do not commit real tokens. Use `.env.example` only as a template.

## Current Frontend Sections

- Sticky header with city selector
- Hero with PC visual and featured builds
- Full VK product catalog
- PC configurator
- Why TOGOSHOL
- Order process
- Final CTA
- Footer

## Docs

- `00_README.md`–`08_QA_CHECKLIST.md`: original project specification
- `09_SITE_AUDIT_FIXES.md`: audit, fixes, and roadmap
- `docs/API_CONTRACT.md`: initial backend API contract draft
