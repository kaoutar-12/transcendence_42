FROM postgres:15

COPY ./init.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_DB=djangodb
ENV POSTGRES_USER=djangouser
ENV POSTGRES_PASSWORD=djangopass