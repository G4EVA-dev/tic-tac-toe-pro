# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Create an environment file with default settings
RUN echo "PORT=5000\n\
DB_HOST=postgres\n\
DB_PORT=5432\n\
DB_NAME=tictactoe\n\
DB_USER=postgres\n\
DB_PASSWORD=postgres\n\
CLIENT_URL=http://localhost:3000" > .env

# Expose the port your app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "server.js"]