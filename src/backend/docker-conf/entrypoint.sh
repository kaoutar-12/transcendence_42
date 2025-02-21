#!/bin/sh
set -e

# sleep to db to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10
# Apply database migrations
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput
python3 manage.py collectstatic --noinput

exec "$@"