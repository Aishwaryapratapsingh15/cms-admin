# Deploying cms-admin to a Linux VPS

This app is deployed as a Docker container behind nginx (nginx runs directly on
the VPS, not in Docker). The container only listens on `127.0.0.1:3012` (host
port — 3000 was already taken by another service on this VPS; the app still
runs on 3000 *inside* the container) — nginx is the only thing exposed to the
internet, terminating TLS and reverse-proxying to the app.

## 1. One-time server setup

SSH into the VPS, then install Docker and nginx if not already present:

```bash
sudo apt update
sudo apt install -y nginx git

# Docker (official convenience script)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# log out and back in for the group change to take effect
```

Verify:

```bash
docker --version
docker compose version
nginx -v
```

## 2. Clone the repo

Already done — the repo lives at `/var/www/eice_cms_web` on this VPS:

```bash
cd /var/www/eice_cms_web
```

(If setting this up fresh elsewhere: `git clone <your-repo-url> /var/www/eice_cms_web`.)

## 3. Create the production env file

This file is **not** committed to git (`.env*` is gitignored) — create it
directly on the server:

```bash
cd /var/www/eice_cms_web
nano .env
```

```env
API_URL=https://eiceapi.eicetechnology.com/api/v1
NODE_ENV=production
```

Add any other server-only secrets your backend/actions need the same way.
Never prefix a secret with `NEXT_PUBLIC_` — that inlines it into the
client-side JS bundle and makes it publicly readable.

## 4. Build and run the container

```bash
docker compose build
docker compose up -d
```

Check it's healthy:

```bash
docker compose ps
docker compose logs -f cms-admin
curl -I http://127.0.0.1:3012/login   # expect HTTP 200
```

The container restarts automatically on crash or VPS reboot
(`restart: unless-stopped` in `docker-compose.yml`).

## 5. Configure nginx

The example config is already set up for `eiceblog.eicetechnology.com`:

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/cms-admin
sudo ln -s /etc/nginx/sites-available/cms-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Before this works, point the domain's DNS `A` record at this VPS's IP if you
haven't already.

At this point the site is live over plain HTTP. Confirm
`http://eiceblog.eicetechnology.com` loads the login page before moving to
HTTPS.

## 6. Enable HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d eiceblog.eicetechnology.com
```

Certbot edits the nginx config to add the `443` block and HTTP→HTTPS redirect,
and sets up auto-renewal (`systemctl status certbot.timer`).

Once HTTPS is confirmed working, double check `proxy.ts`'s cookie handling:
cookies are set with `secure: true` in production, so login will only work
over HTTPS — this is expected and correct.

## 7. Deploying updates

```bash
cd /var/www/eice_cms_web
git pull
docker compose build
docker compose up -d
```

This does a brief restart (a few seconds of downtime while the new container
starts). `docker compose up -d` only recreates the container if the image
changed, so `git pull` with no relevant changes is a no-op.

To watch it come back up:

```bash
docker compose logs -f cms-admin
```

## 8. Rolling back

If a deploy breaks something:

```bash
git log --oneline -5     # find the last good commit
git checkout <commit-sha>
docker compose build
docker compose up -d
```

Then `git checkout main` (or your default branch) once you've fixed the issue,
so the next `git pull` doesn't fight with a detached HEAD.

## 9. Useful commands

```bash
docker compose logs -f cms-admin     # tail app logs
docker compose restart cms-admin     # restart without rebuilding
docker compose down                  # stop and remove the container
docker system prune -f               # clean up old dangling images after a few deploys
```

## Notes

- **Single container, no load balancing.** If you later run multiple
  containers behind nginx, see the "Multi-Server Deployments" section of
  Next.js's self-hosting docs (`node_modules/next/dist/docs/01-app/02-guides/self-hosting.md`)
  for the `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` and `deploymentId` settings
  needed to keep Server Actions and asset versioning consistent across
  instances.
- **`.env` lives only on the server.** It's read at container startup, not
  baked into the image at build time — the same image can be reused for
  staging by swapping this file's contents.
- **Local dev is unaffected.** `.env.local` keeps pointing at your local
  backend; none of this changes how `npm run dev` works.
