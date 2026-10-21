#!/usr/bin/env bash
# Build the site and publish a fixed copy to the folder the nginx container serves (deploy/nginx.conf).
# Usage: scripts/deploy.sh            (DEPLOY_DIR defaults to ~/portfolio-deploy/site)
set -euo pipefail
cd "$(dirname "$0")/.."
DEPLOY_DIR="${DEPLOY_DIR:-$HOME/portfolio-deploy/site}"
PORT="${PORT:-4323}"
IMAGE="nginx:1.28.0-alpine"

npm run build
mkdir -p "$DEPLOY_DIR"
rsync -a --delete dist/ "$DEPLOY_DIR/"
cp deploy/nginx.conf "$(dirname "$DEPLOY_DIR")/nginx.conf"

if ! docker ps --format '{{.Names}}' | grep -qx portfolio-web; then
  docker rm -f portfolio-web >/dev/null 2>&1 || true
  docker run -d --name portfolio-web --restart unless-stopped -p "$PORT:80" \
    -v "$DEPLOY_DIR:/usr/share/nginx/html:ro" \
    -v "$(dirname "$DEPLOY_DIR")/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
    "$IMAGE" >/dev/null
else
  docker exec portfolio-web nginx -s reload
fi
echo "deployed $(git rev-parse --short HEAD) to $DEPLOY_DIR, served on :$PORT"
