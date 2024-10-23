# Use an official Node runtime as a parent image
FROM node:20.13.1 as build

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY ./ /usr/src/app

# Install any needed packages specified in package.json
RUN npm install

# Build the React app
RUN npm run build

# Use nginx to serve the React app
FROM nginx:alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose port 80 to the outside
EXPOSE 80