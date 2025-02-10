
# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json for dependency installation
COPY package*.json ./

ARG NEXT_PUBLIC_BACKEND_ENDPOINT

ENV NEXT_PUBLIC_BACKEND_ENDPOINT=$NEXT_PUBLIC_BACKEND_ENDPOINT

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js app
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
# CMD ["npm", "start"]
CMD ["npm", "run", "dev"]
