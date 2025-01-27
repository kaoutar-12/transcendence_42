#!/bin/sh
set -e

export DJANGO_SUPERUSER_USERNAME="admin"
export DJANGO_SUPERUSER_EMAIL="admin@1337.ma"
export DJANGO_SUPERUSER_PASSWORD="Mr.R0bot@2024"

python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py collectstatic --noinput
python3 manage.py createsuperuser --noinput || true

exec "$@"