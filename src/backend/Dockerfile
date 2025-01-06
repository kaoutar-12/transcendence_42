FROM python:3.12
#copy the code to the container
COPY . /app

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set environment variables for admin user
ENV DJANGO_SUPERUSER_USERNAME=admin
ENV DJANGO_SUPERUSER_EMAIL=admin@1337.ma
ENV DJANGO_SUPERUSER_PASSWORD=pass

#install the requirements
RUN pip3 install -r requirements.txt

RUN python3 manage.py makemigrations 

RUN python3 manage.py migrate


# Create Django admin user
RUN python manage.py createsuperuser --noinput \
    --username $DJANGO_SUPERUSER_USERNAME \
    --email $DJANGO_SUPERUSER_EMAIL


EXPOSE 8000

#run the backend server on port 8000
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]