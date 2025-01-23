#!/bin/sh
set -e

export DJANGO_SUPERUSER_USERNAME="admin"
export DJANGO_SUPERUSER_EMAIL="admin@1337.ma"
export DJANGO_SUPERUSER_PASSWORD="Mr.R0bot@2024"

python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py createsuperuser --noinput || true

cd /app
python3 -m daphne -b 0.0.0.0 -p 8000 backend.asgi:application