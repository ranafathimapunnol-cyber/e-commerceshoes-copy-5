#!/bin/bash
echo "🚀 Starting deployment..."

export DJANGO_SUPERUSER_USERNAME=ranafathimaadmin
export DJANGO_SUPERUSER_EMAIL=admin@gmail.com
export DJANGO_SUPERUSER_PASSWORD=ranafathima123

python3 manage.py migrate
python3 manage.py auto_createsuperuser
python3 manage.py collectstatic --noinput

echo "✅ Deployment complete!"
echo "🔐 Login: http://your-server-ip/admin/"
echo "   Username: ranafathimaadmin"
echo "   Password: ranafathima123"
