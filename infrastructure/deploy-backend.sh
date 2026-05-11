#!/bin/bash
set -e
cd /home/ubuntu/kipkapbadge
git pull origin main
cd backend
source venv/bin/activate
pip install -r requirements.txt --quiet
alembic upgrade head
sudo systemctl restart kipkap
echo "Backend deployed successfully"
