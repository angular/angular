# Image metadata and config.
# Ideally, the Node.js version should match what we use on CI.
FROM cimg/node:22.21.1-browsers@sha256:eee8ed828d5a54196456a86ac6872c43325acad54e59632261e23b486c458992

LABEL name="Angular dev environment" \
  description="This image can be used to create a dev environment for building Angular." \
  vendor="angular" \
  version="1.0"

EXPOSE 4200 4201 4205 4206 9876

# Switch to `root`.
USER root

# Go! (And keep going.)
CMD ["tail", "--follow", "/dev/null"]
