# to do

# build & run the application 
all:

# build & run the database
db:

# build & run the backend:
backend:
	docker build -t backend:latest ./src/backend
	-docker stop backend-container || true
	-docker rm backend-container || true
	docker run -it --name backend-container -p 8000:8000 -v $(PWD)/src/backend:/app backend:latest


# build & run the frontend:
frontend:
	docker build -t frontend:latest ./src/frontend
	docker run -it -p 3000:3000 -v $(PWD)/src/frontend:/app -v /app/node_modules frontend:latest

# build & run the ngnix:
ngnix:

# stop application
stop:
	docker stop $(shell docker ps -a -q)
# stop & clean
clean:
	docker rm -f $(shell docker ps -a -q)

# stop, clean & all
re: clean all

# 	docker run -it -p 3000:3000 -v C:\xampp\htdocs\transcendence_42\src\frontend:\app -v /app/node_modules frontend:latest

#