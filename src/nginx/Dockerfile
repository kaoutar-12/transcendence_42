FROM nginx:alpine

RUN apk add --no-cache openssl
RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout /etc/nginx/ssl/private.key \
	-out /etc/nginx/ssl/certificate.crt \
	-subj "/C=MO/L=Khouribga/O=1337/CN=localhost"
COPY nginx.conf /etc/nginx/nginx.conf