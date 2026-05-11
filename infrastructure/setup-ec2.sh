#!/bin/bash
set -e

echo "=== KipKap Badge EC2 Setup ==="

# Update system
apt-get update -y
apt-get install -y python3.11 python3.11-venv python3-pip nginx certbot python3-certbot-nginx git

# Clone repository
if [ ! -d "/home/ubuntu/kipkapbadge" ]; then
  git clone https://github.com/YOUR_ORG/kipkapbadge.git /home/ubuntu/kipkapbadge
  chown -R ubuntu:ubuntu /home/ubuntu/kipkapbadge
fi

# Setup backend
cd /home/ubuntu/kipkapbadge/backend
sudo -u ubuntu python3.11 -m venv venv
sudo -u ubuntu bash -c "source venv/bin/activate && pip install -r requirements.txt"

# Copy env template
if [ ! -f .env ]; then
  cp .env.example .env
  echo ">>> IMPORTANT: Edit /home/ubuntu/kipkapbadge/backend/.env with real credentials"
fi

# Run migrations
sudo -u ubuntu bash -c "source venv/bin/activate && alembic upgrade head"

# Setup nginx
cp /home/ubuntu/kipkapbadge/infrastructure/nginx.conf /etc/nginx/sites-available/kipkap
ln -sf /etc/nginx/sites-available/kipkap /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Setup systemd service
cp /home/ubuntu/kipkapbadge/infrastructure/kipkap.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable kipkap
systemctl start kipkap

echo "=== Setup complete ==="
echo "Next steps:"
echo "  1. Edit /home/ubuntu/kipkapbadge/backend/.env"
echo "  2. Run: sudo certbot --nginx -d api.yourdomain.com"
echo "  3. Verify: curl http://localhost:8000/health"
