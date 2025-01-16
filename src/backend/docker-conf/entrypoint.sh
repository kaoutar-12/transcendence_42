#!/bin/sh

# Set environment variables for the superuser
export DJANGO_SUPERUSER_USERNAME=admin
export DJANGO_SUPERUSER_EMAIL=admin@1337.ma
export DJANGO_SUPERUSER_PASSWORD=pass

# Create superuser
python3 manage.py createsuperuser --noinput


# Execute the main command passed to the container
exec "$@"
