FROM python:3.12

# Copy the code to the container
COPY . /app

# Set the working directory
WORKDIR /app

# Install the requirements
RUN pip3 install -r requirements.txt

# Copy the entrypoint script and set executable permissions
COPY ./docker-conf/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port 8000
EXPOSE 8000

# Set the entrypoint for the container
ENTRYPOINT ["/entrypoint.sh"]

# Run the backend server on port 8000
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
