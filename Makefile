COMPOSE_FILE := docker-compose.yml

backend:
	cd src && docker-compose up --build backend

db:
	cd src && docker-compose up db

frontend:
	cd src && docker-compose up --build frontend

stop:
	cd src && docker-compose down

clean: stop
	cd src && docker-compose down -v
	docker system prune -af
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true

re: clean all

all: db backend frontend