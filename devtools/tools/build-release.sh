#!/usr/bin/env bash

# This script builds Angular DevTools inside a container using buildah.
# It creates a container, installs dependencies, copies the source code,
# runs the build, and extracts the extension zips.

set -euo pipefail

# Check for root privileges, required for some `buildah` features.
if [[ "$(id -u)" -ne 0 ]]; then
  echo "Please run with \`sudo\`."
  exit 1
fi

# The base container image to use.
readonly BASE_IMAGE="debian:trixie-slim"

# The directory inside the container where the repository will be copied.
readonly REPO_DIR="/devtools-repo"

# Create a new container from the base image.
# The --pull flag ensures we have the latest image.
echo "Pulling base image: \`${BASE_IMAGE}\`..."
readonly CONTAINER=$(buildah from --pull "${BASE_IMAGE}")
function cleanup {
  buildah rm "${CONTAINER}"
}
trap cleanup EXIT

# Copy the project source code into the container.
# We ignore .git and files from .gitignore to keep the container lean.
echo "Copying source code into the container..."
buildah copy --contextdir . --ignorefile .gitignore --exclude .git "${CONTAINER}" . "${REPO_DIR}"

# Build DevTools
echo "Building DevTools..."
buildah run "${CONTAINER}" -- bash -c "(cd \"${REPO_DIR}\" && ./devtools/tools/build-devtools.sh)"

# Extract build artifacts from the container.
echo "Extracting build artifacts..."

# Mount the container's filesystem.
readonly MOUNT_POINT=$(buildah mount "${CONTAINER}")
function unmount {
  buildah unmount "${CONTAINER}"
}
trap unmount EXIT

# Create the output directory on the host and copy the artifacts.
readonly USER_HOME="$(getent passwd "${SUDO_USER}" | cut -d : -f 6)"
cp -f "${MOUNT_POINT}${REPO_DIR}/devtools-chrome.zip" "${USER_HOME}/"
chown "${SUDO_USER}" "${USER_HOME}/devtools-chrome.zip"

cp -f "${MOUNT_POINT}${REPO_DIR}/devtools-firefox.zip" "${USER_HOME}/"
chown "${SUDO_USER}" "${USER_HOME}/devtools-firefox.zip"

echo ""
echo "✅ Angular DevTools build complete!"
echo "Artifacts are available at: ${USER_HOME}/devtools-chrome.zip and ${USER_HOME}/devtools-firefox.zip."
