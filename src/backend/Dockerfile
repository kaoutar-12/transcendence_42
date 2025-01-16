FROM python:3.12
#copy the code to the container
COPY . /app

WORKDIR /app

#install the requirements
RUN pip3 install -r requirements.txt

RUN python3 manage.py makemigrations 

RUN python3 manage.py migrate

# COPY ./docker-conf/entrypoint.sh /entrypoint.sh

# RUN chmod +x docker-conf/entrypoint.sh

EXPOSE 8000

# ENTRYPOINT ["./docker-conf/entrypoint.sh"]

#run the backend server on port 8000
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
