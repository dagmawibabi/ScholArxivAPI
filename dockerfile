# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /src

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install all dependencies (production + dev for build)
RUN npm install

# Copy the rest of the application code
COPY . .

# Run TypeScript build to transpile .ts to .js
RUN npm run build

# Expose the port on which your Hono app will run
EXPOSE 5000

# Start the app using Node.js to run the JavaScript output
CMD ["node", "src/index.js"]
