# HowToSetup — Advix

Advix is a frontend-only Next.js 16 / React 19 / TypeScript / Tailwind CSS 4
website with Three.js (React Three Fiber), Framer Motion, GSAP and Lenis.

## Requirements
- Node.js 20.9 or newer
- npm 10 or newer
- Git

## 1. Local development
```bash
git clone https://github.com/DeepMondal78/ADVIX.git
cd ADVIX
cp .env.example .env.local
npm install
npm run dev
```
Open http://localhost:3000

## 2. Production build
```bash
npm run build
npm start
```

## 3. Deploy on a VPS (Ubuntu + PM2 + Nginx)
```bash
# Install Node.js 20+, Nginx and PM2
sudo apt update && sudo apt install -y nginx
sudo npm install -g pm2

# Get the code and build
git clone https://github.com/DeepMondal78/ADVIX.git
cd ADVIX
cp .env.example .env.local   # edit values
npm install
npm run build

# Run
pm2 start npm --name advix -- start
pm2 save && pm2 startup
```
Nginx reverse proxy (`/etc/nginx/sites-available/advix`):
```nginx
server {
  listen 80;
  server_name your-domain.com;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}
```
Enable it with `sudo ln -s /etc/nginx/sites-available/advix /etc/nginx/sites-enabled/`,
then `sudo nginx -t && sudo systemctl reload nginx`. Add HTTPS with `sudo certbot --nginx`.

## 4. Deploy with Docker
Uses the `Dockerfile` in the repo root and `output: "standalone"` in `next.config.ts`.
```bash
docker build -t advix .
docker run -d -p 3000:3000 --env-file .env.local --name advix advix
```
Open http://localhost:3000

## 5. Database
Not applicable. Advix is frontend-only and has no database.

## 6. First admin login
Not applicable. Advix has no backend, admin panel, authentication or
user roles.

## 7. Branding changes
- Logo, favicon and images: replace files in `public/`
- Site title and description: `src/app/layout.tsx` (metadata)
- Colors and fonts: `src/app/globals.css`
- Text content: the components under `src/`