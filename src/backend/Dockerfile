FROM python:3.12

WORKDIR /app
COPY . /app/

ENV DJANGO_SETTINGS_MODULE=backend.settings
ENV PYTHONPATH=/app

RUN pip3 install -r requirements.txt \
    && pip3 install daphne channels channels-redis

EXPOSE 8000

COPY ./docker-conf/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]
