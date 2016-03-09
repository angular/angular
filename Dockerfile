# EXPERIMENTAL Docker support for angular2 build process.
# Build with: docker build -t $USER/angular:$(git rev-list -n 1 HEAD) .
FROM node:5.7.1
MAINTAINER Alex Eagle

# Don't run as root. bower complains, and it is less secure.
RUN useradd -ms /bin/bash ngbuilder

# Copy only the shrinkwrapped dependencies
COPY npm-shrinkwrap.json /home/ngbuilder/
WORKDIR /home/ngbuilder
# This install command results in a cachable node_modules directory
RUN npm install --silent

COPY . /home/ngbuilder/
# https://docs.docker.com/engine/reference/builder/#copy
# All new files and directories are created with a UID and GID of 0.
RUN chown -R ngbuilder:ngbuilder /home/ngbuilder
USER ngbuilder
ENV HOME /home/ngbuilder

RUN npm run postinstall
RUN npm run build
