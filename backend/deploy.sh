#!/bin/bash
echo "🚀 Starting deployment..."

# Set credentials
export DJANGO_SUPERUSER_USERNAME=ranafathimaadmin
export DJANGO_SUPERUSER_EMAIL=admin@gmail.com
export DJANGO_SUPERUSER_PASSWORD=ranafathima123

# Build React frontend (frontend is sibling folder)
echo "📦 Building React frontend..."
cd ../frontend
npm install
npm run build
cd ../backend

# Django setup
echo "🐍 Setting up Django..."
python3 manage.py migrate
python3 manage.py auto_createsuperuser
python3 manage.py collectstatic --noinput

echo "✅ Deployment complete!"
echo "🔐 Login: http://your-server-ip/admin/"
echo "   Username: ranafathimaadmin"
echo "   Password: ranafathima123"
