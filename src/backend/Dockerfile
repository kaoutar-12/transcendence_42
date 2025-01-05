FROM ubuntu:20.04

#install python3
RUN apt-get update -y && apt-get install -y python3 python3-pip

#copy the code to the container
COPY . /app

WORKDIR /app

#install the requirements
RUN pip3 install -r requirements.txt

EXPOSE 8000

#run the backend server on port 8000
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]