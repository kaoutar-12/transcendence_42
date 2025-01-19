#!/bin/sh

# Set environment variables for the superuser
export DJANGO_SUPERUSER_USERNAME="admin"
export DJANGO_SUPERUSER_EMAIL="admin@1337.ma"
export DJANGO_SUPERUSER_PASSWORD="Mr.R0bot@2024"
# Wait for the database to be ready (optional but recommended for Docker containers)
# You can use `wait-for-it`, `dockerize`, or a similar tool for this.

# Run migrations and create the superuser
python3 manage.py makemigrations
python3 manage.py migrate

# Create superuser (no input required)
python3 manage.py createsuperuser --noinput || true  # Ignore the error if the superuser already exists

# Execute the main command (whatever was passed to the container)
exec "$@"
