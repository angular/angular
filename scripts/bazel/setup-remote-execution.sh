#!/bin/bash

# The script should immediately exit if any command in the script fails.
set -e

if [[ -z "${GCP_DECRYPT_TOKEN}" ]]; then
  echo "Please specify the \"GCP_DECRYPT_TOKEN\" environment variable when setting up remote " \
      "execution"
  exit 1
fi

# Decode the GCP token that is needed to authenticate the Bazel remote execution.
openssl aes-256-cbc -d -in scripts/bazel/gcp_token -md md5 -k ${GCP_DECRYPT_TOKEN} \
  -out $HOME/.gcp_rbe_credentials

# Update the project Bazel configuration to always use remote execution.
# Note: We add the remote config flag to the user bazelrc file that is not tracked
# by Git. This is necessary to avoid stamping builds with `.with-local-changes`.
echo "build --config=remote" >> .bazelrc.user
echo "build:remote --google_credentials=\"$HOME/.gcp_rbe_credentials\"" >> .bazelrc.user
