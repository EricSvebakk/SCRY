
# Use the official Python image
FROM python:3.11-slim

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
RUN pip install "uvicorn[standard]" gunicorn

# Copy project files into the container
COPY ./app /usr/src/app

# Expose the application port
EXPOSE 8000

# run prod
CMD exec gunicorn "main:app" \
    -k uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --worker-tmp-dir /dev/shm \
    --timeout 1800 \
    --keep-alive 5 \
    --log-level debug
    
# run dev
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--timeout-keep-alive", "1800"]