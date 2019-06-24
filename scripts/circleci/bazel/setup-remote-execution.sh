#!/bin/bash

# The script should immediately exit if any command in the script fails.
set -e

if [[ -z "${GCP_DECRYPT_TOKEN}" ]]; then
  echo "Please specify the \"GCP_DECRYPT_TOKEN\" environment variable when setting up remote " \
      "execution"
  exit 1
fi

# Decode the GCP token that is needed to authenticate the Bazel remote execution.
openssl aes-256-cbc -d -in .circleci/gcp_token -md md5 -k ${GCP_DECRYPT_TOKEN} \
  -out $HOME/.gcp_credentials

# Export the "GOOGLE_APPLICATION_CREDENTIALS" variable that should refer to the GCP credentials
# file. Bazel automatically picks up the credentials from that variable.
# https://github.com/bazelbuild/bazel/blob/master/third_party/grpc/include/grpc/grpc_security.h#L134-L137
echo "export GOOGLE_APPLICATION_CREDENTIALS=$HOME/.gcp_credentials" >> $BASH_ENV

# Update the CircleCI Bazel configuration to always use remote execution.
echo "build --config=remote" >> .circleci/bazel.rc

# Only upload locally built results to the cache if we are running already commited code.
if [[ -n "${CIRCLE_PR_NUMBER}" ]]; then
  echo "build --remote_upload_local_results=false" >> .circleci/bazel.rc
else
  echo "build --remote_upload_local_results=true" >> .circleci/bazel.rc
fi
