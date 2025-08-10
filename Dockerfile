# Use an official Node.js image
FROM node:18.17.1

WORKDIR /myapp

# Copy package files
# COPY package.json .
# COPY package-lock.json .

# Install dependencies
RUN npm install

EXPOSE 5000

# Copy the rest of the application files
COPY . .




# Specify the entry point for the container
CMD ["npm", "start"]
