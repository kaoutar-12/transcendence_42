FROM python:3.12

WORKDIR /app
COPY . /app/

ENV DJANGO_SETTINGS_MODULE=backend.settings
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV debug=1
RUN pip3 install -r requirements.txt \
    && pip3 install channels channels-redis

EXPOSE 8000

COPY ./docker-conf/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN mkdir -p /app/static /app/media

ENTRYPOINT ["/entrypoint.sh"]

CMD ["uvicorn", "backend.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--reload"]
