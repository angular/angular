# Image metadata and config.
# Ideally, the Node.js version should match what we use on CI.
# See `executors > default-executor` in `.circleci/config.yml`.
FROM cimg/node:16.13-browsers


LABEL name="Angular dev environment" \
      description="This image can be used to create a dev environment for building Angular." \
      vendor="angular" \
      version="1.0"

EXPOSE 4000 4200 4433 5000 8080 9876


# Switch to `root` (CircleCI images use `circleci` as the user).
USER root


# Configure `Node.js`/`npm`.
RUN npm config --global set user root


# Go! (And keep going.)
CMD ["tail", "--follow", "/dev/null"]
