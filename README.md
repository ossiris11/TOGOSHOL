# TOGOSHOL

Frontend site for TOGOSHOL: a local premium gaming PC brand for Veliky Novgorod.

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

Backend/API dev server:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev:server
```

## Build

```bash
npm run build
```

Production small-load run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run build
npm run start:prod
```

See `docs/PRODUCTION_RUNBOOK.md`.

## Product Data Import

Product data can be imported into `src/data/vkProducts.ts`.
The frontend does not use the external product source as a purchase flow. Product cards route users only to contact channels instead.

If importing from VK data, create a token with product access, then run:

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

- Sticky header with contacts
- Hero with PC visual and featured builds
- Product catalog with filters
- PC configurator
- Custom build section
- Why TOGOSHOL
- Trust conditions
- Order process
- Reviews / social proof
- FAQ
- Final CTA
- Footer

## Docs

- `00_README.md`–`08_QA_CHECKLIST.md`: original project specification
- `09_SITE_AUDIT_FIXES.md`: audit, fixes, and roadmap
- `docs/API_CONTRACT.md`: initial backend API contract draft
