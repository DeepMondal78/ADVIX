# Advix

Advix is a modern, animated, **frontend-only** company/agency website with
responsive sections, 3D visuals and smooth scrolling.

**Live demo:** https://advix-xi.vercel.app/

## Tech Stack

- Next.js 16 (App Router) and React 19
- TypeScript
- Tailwind CSS 4
- Three.js (React Three Fiber) for 3D visuals
- Framer Motion and GSAP for animation
- Lenis for smooth scrolling

## Architecture

Advix is a client-facing Next.js website with no backend API, no database,
no admin panel and no user accounts.

- There are **no data-mutating endpoints** (no `src/app/api` routes, no
  server actions), so authentication and role-based access control do not
  apply.
- All content is static and bundled with the frontend source in `src/`.
- No secrets are required to run the project. `.env.example` only holds a
  public site URL.

## Project Structure

```
public/        Static assets (images, icons, models)
src/           Application source (pages, layouts, components)
.env.example   Environment variables with placeholder values
Dockerfile     Production container build
HowToSetup.md  Full installation guide (local, VPS, Docker)
CHANGELOG.md   Version history
```

## Quick Start

```bash
git clone https://github.com/DeepMondal78/ADVIX.git
cd ADVIX
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start the development server   |
| `npm run build` | Create a production build      |
| `npm start`     | Run the production build       |
| `npm run lint`  | Run ESLint                     |

## Deployment

See [HowToSetup.md](./HowToSetup.md) for step-by-step instructions to deploy
on a VPS (PM2 + Nginx) or with Docker.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).