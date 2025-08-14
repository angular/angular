#!/usr/bin/env bash

set -euo pipefail

readonly IMAGE="angular-devtools-build"
readonly CONTAINER="angular-devtools"

# Build Angular DevTools and delete the image when the script completes.
sudo podman build . -t "${IMAGE}" \
    -f devtools/tools/release/Containerfile \
    --ignorefile devtools/tools/release/.containerignore
function rm_image {
    sudo podman image rm -f "${IMAGE}" > /dev/null
}
trap rm_image EXIT

# Start the container in an infinite loop and kill it when the script completes.
sudo podman run --name "${CONTAINER}" --replace --detach "localhost/${IMAGE}:latest" sleep infinity
function kill_container {
    sudo podman kill "${CONTAINER}" > /dev/null
    rm_image
}
trap kill_container EXIT

# Extract the files.
sudo podman cp "${CONTAINER}:/angular/devtools-chrome.zip" .
sudo podman cp "${CONTAINER}:/angular/devtools-firefox.zip" .

echo ""
echo "✅ Angular DevTools build complete!"
echo "Artifacts are available at: \"$(realpath .)/devtools-{chrome,firefox}.zip\""
