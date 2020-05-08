#!/usr/bin/env bash

set -eux -o pipefail
exec 3>&1

echo -e "\n\n[`date`] - Updating the preview server..."

# Input
readonly HOST_REPO_DIR=$1
readonly HOST_SECRETS_DIR=$2
readonly HOST_BUILDS_DIR=$3
readonly HOST_LOCALCERTS_DIR=$4
readonly HOST_LOGS_DIR=$5

# Constants
readonly PROVISIONAL_TAG=provisional
readonly PROVISIONAL_IMAGE_NAME=aio-builds:$PROVISIONAL_TAG
readonly LATEST_IMAGE_NAME=aio-builds:latest
readonly CONTAINER_NAME=aio

# Run
(
  cd "$HOST_REPO_DIR"

  readonly lastDeployedCommit=$(git rev-parse HEAD)
  echo "Currently at commit $lastDeployedCommit."

  # Pull latest master from origin.
  git pull origin master

  # Do not update the server unless files inside `aio-builds-setup/` have changed
  # or the last attempt failed (identified by the provisional image still being around).
  readonly relevantChangedFilesCount=$(git diff --name-only $lastDeployedCommit...HEAD | grep -P "^aio/aio-builds-setup/" | wc -l)
  readonly lastAttemptFailed=$(sudo docker image ls | grep "$PROVISIONAL_TAG" >> /dev/fd/3 && echo "true" || echo "false")
  if [[ $relevantChangedFilesCount -eq 0 ]] && [[ "$lastAttemptFailed" != "true" ]]; then
    echo "Skipping update because no relevant files have been touched."
    exit 0
  fi

  # Create and verify a new docker image.
  aio/aio-builds-setup/scripts/create-image.sh "$PROVISIONAL_IMAGE_NAME" --no-cache
  readonly imageVerified=$(sudo docker run --dns 127.0.0.1 --rm --volume $HOST_SECRETS_DIR:/aio-secrets:ro "$PROVISIONAL_IMAGE_NAME" /bin/bash -c "aio-init && aio-health-check && aio-verify-setup" >> /dev/fd/3 && echo "true" || echo "false")

  if [[ "$imageVerified" != "true" ]]; then
    echo "Failed to verify new docker image. Aborting update!"
    exit 1
  fi

  # Remove the old container and replace the docker image.
  sudo docker stop "$CONTAINER_NAME" || true
  sudo docker rm "$CONTAINER_NAME" || true
  sudo docker rmi "$LATEST_IMAGE_NAME" || true
  sudo docker tag "$PROVISIONAL_IMAGE_NAME" "$LATEST_IMAGE_NAME"
  sudo docker rmi "$PROVISIONAL_IMAGE_NAME"

  # Create and start a docker container based on the new image.
  sudo docker run \
      --detach \
      --dns 127.0.0.1 \
      --name "$CONTAINER_NAME" \
      --publish 80:80 \
      --publish 443:443 \
      --restart unless-stopped \
      --volume $HOST_SECRETS_DIR:/aio-secrets:ro \
      --volume $HOST_BUILDS_DIR:/var/www/aio-builds \
      --volume $HOST_LOCALCERTS_DIR:/etc/ssl/localcerts:ro \
      --volume $HOST_LOGS_DIR:/var/log/aio \
      "$LATEST_IMAGE_NAME"

  echo "The new docker image has been successfully deployed."
)
