# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /src

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies (including ts-node and typescript)
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Expose the port on which your Hono app will run
EXPOSE 5000

# Start the Hono app using ts-node
CMD ["npx", "ts-node", "src/index.ts"]
