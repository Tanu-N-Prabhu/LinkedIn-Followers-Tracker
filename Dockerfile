# Use the official Python base image (version 3.9)
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Expose the application port (if your Flask app uses port 5000)
EXPOSE 5000

# Set the entry point for the app
CMD ["python3", "backend/app.py"]
