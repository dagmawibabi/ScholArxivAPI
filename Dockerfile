# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application code to the container
COPY . .

# Expose the port the app runson
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "run", "dev"]
