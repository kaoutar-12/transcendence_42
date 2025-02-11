#!/bin/sh
set -e

# sleep to db to be ready
echo "Waiting for PostgreSQL to be ready..."
python << END
import sys
import psycopg2
import os
import time

suggest_unrecoverable_after = 30
start = time.time()

while True:
    try:
        psycopg2.connect(
            dbname=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            host=os.environ['DB_HOST'],
            port=os.environ['DB_PORT'],
        )
        break
    except psycopg2.OperationalError as error:
        sys.stderr.write("Waiting for PostgreSQL to become available...\n")
        if time.time() - start > suggest_unrecoverable_after:
            sys.stderr.write("  This is taking longer than expected. The following exception may be helpful:\n")
            sys.stderr.write("  %s\n" % error)
    time.sleep(1)
END

python3 manage.py makemigrations game
python3 manage.py migrate
python3 manage.py collectstatic --noinput

exec "$@"