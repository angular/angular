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
  -out $HOME/.gcp_credentials

# Set the "GOOGLE_APPLICATION_CREDENTIALS" environment variable. It should point to the GCP credentials
# file. Bazel will then automatically picks up the credentials from that variable.
# https://docs.bazel.build/versions/main/command-line-reference.html#flag--google_default_credentials
# https://cloud.google.com/docs/authentication/production.
if [[ ! -z "${BASH_ENV}" ]]; then
  # CircleCI uses the `BASH_ENV` variable for environment variables.
  echo "export GOOGLE_APPLICATION_CREDENTIALS=${HOME}/.gcp_credentials" >> ${BASH_ENV}
elif [[ ! -z "${GITHUB_ENV}" ]]; then
  # Github actions use the `GITHUB_ENV` variable for environment variables.
  echo "GOOGLE_APPLICATION_CREDENTIALS=${HOME}/.gcp_credentials" >> ${GITHUB_ENV}
fi

# Update the project Bazel configuration to always use remote execution.
# Note: We add the remote config flag to the user bazelrc file that is not tracked
# by Git. This is necessary to avoid stamping builds with `.with-local-changes`.
echo "build --config=remote" >> .bazelrc.user
