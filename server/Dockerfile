# Use a compatible Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker's caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
