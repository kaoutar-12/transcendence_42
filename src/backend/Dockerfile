FROM python:3.12

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=backend.settings \
    PYTHONPATH=/app \
    DEBUG=0


WORKDIR /app

RUN mkdir -p /app/static /app/media && \
    chmod 755 /app/static /app/media

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postgresql-client && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y curl

COPY requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt

COPY ./docker-conf/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["uvicorn", "backend.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--reload"]
