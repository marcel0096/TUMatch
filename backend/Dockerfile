# Use an official Node runtime as a parent image
FROM node:20.13.1

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app

COPY ./ /usr/src/app

# Install any needed packages specified in package.json
RUN npm install

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run index.js when the container launches
CMD ["node", "index.js"]