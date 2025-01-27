COMPOSE_FILE := docker-compose.yml

backend:
	cd src && docker-compose up --build backend

db:
	cd src && docker-compose up db

frontend:
	# docker build -t frontend:latest ./src/frontend
	# -docker stop frontend-container || true
	# -docker rm frontend-container || true
	# docker run -it -p 3000:3000 --name frontend-container -v $(PWD)/src/frontend:/app -v /app/node_modules -v /app/.next frontend:latest
	cd src && docker-compose up --build frontend

stop:
	cd src && docker-compose down

clean: stop
	cd src && docker-compose down -v
	docker system prune -af
	docker volume rm $$(docker volume ls -q) 2>/dev/null || true

re: clean all

all: db backend frontend