# SCRY - Single-Cell Rendering & Yield

SCRY is a web-based application designed to make downstream scRNA-seq-analysis more accessible. The application maps established Scanpy methods to an intuitive interface, enabling non-technical users to perform clustering, visualization, and annotation of single-cell datasets concurrently. The goal of this system is to reduce the overhead required to compute singl-cell results by offering a solution to researchers that does not require coding knowledge to use.

SCRY is meant to be deployed using Docker Compose, requiring minimal configuration to begin using the application.

# Getting Started

1. Install Docker

2. Clone the SCRY-repository

3. Create an environment-file inside the base-folder of the repository containing the configuration details for your instance

4. Run `sudo docker-compose build` to build the application

5. Run `sudo docker-compose up -d` to start the application

6. Open the application through your web-browser using the host-address

## Example configuration

Example .env file. Placeholders `[placeholder]` must be replaced with the appropriate value.
```.env
HOST='[HOST IP or DOMAIN]'
SCHEME='[HTTP or HTTPS]'
PASSKEY='[PASSKEY]'

BACKEND_PATH='/backend'
FRONTEND_ENDPOINT='${SCHEME}://${HOST}'
BACKEND_ENDPOINT='${SCHEME}://${HOST}${BACKEND_PATH}'
```

# Architecture

This is a high-level abstraction of the architecture used for the application. 

<img width="2103" height="1563" alt="scry_architecture_5" src="https://github.com/user-attachments/assets/28cfb33b-8b6d-402a-a489-ea1db7b67ac0" />

# Thesis reference

A link to the related thesis will appear here once it is uploaded to the UiO DUO-archive.
