# Step 1: Use the Node.js LTS version as the base image
FROM node:18

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json files from the 'server' directory to the container
COPY package*.json ./

# Step 4: Install the dependencies inside the container
RUN npm install

# Step 5: Copy the rest of the application code from the 'server' directory to the container
COPY . .

# Step 6: Expose the application port
EXPOSE 5000

# Step 7: Define the command to run the application
CMD ["npm", "start"]

