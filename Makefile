# to do

# build & run the application 
all:

# build & run the database
db:

# build & run the backend:
backend:
	docker build -t backend:latest ./src/backend
	docker run -d -p 8000:8000 backend:latest
# build & run the frontend:
frontend:
	docker build -t frontend:latest ./src/frontend
	docker run -d -p 3000:3000 frontend:latest
# build & run the ngnix:
ngnix:

# stop application
stop:
	docker stop $(docker ps -a -q)
# stop & clean
clean:
	docker stop $(docker ps -a -q)
	docker rm $(docker ps -a -q)
# stop, clean & all
re: clean all
