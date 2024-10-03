# Use the official Node.js image as a base
FROM node:14

# Set the working directory
WORKDIR /usr/src/

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port (adjust as necessary)
EXPOSE 5000

# Command to run the application
CMD ["npm", "run", "start"]
