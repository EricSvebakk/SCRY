
# Use the official Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY ./requirements.txt /usr/src/app/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --upgrade -r /usr/src/app/requirements.txt

ARG FRONTEND_ENDPOINT

ENV FRONTEND_ENDPOINT=${FRONTEND_ENDPOINT}

# Copy project files into the container
COPY ./app /usr/src/app

# Expose the application port
EXPOSE 8000

# Run the application
# CMD ["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
# CMD [ "fastapi", "run", "app/main.py", "--port", "8000" ]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--timeout-keep-alive", "1800"]

