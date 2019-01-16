#!/bin/bash

if [[ -z "${GCP_DECRYPT_TOKEN}" ]]; then
  echo "Please specify the \"GCP_DECRYPT_TOKEN\" environment variable when setting up remote " \
      "execution"
  exit 1
fi

# Decode the GCP token that is needed to authenticate the Bazel remote execution.
openssl aes-256-cbc -d -in .circleci/gcp_token -k ${GCP_DECRYPT_TOKEN} \
  -out /home/circleci/.gcp_credentials

# Export the "GOOGLE_APPLICATION_CREDENTIALS" variable that should refer to the GCP credentials
# file. Bazel automatically picks up the credentials from that variable.
# https://github.com/bazelbuild/bazel/blob/master/third_party/grpc/include/grpc/grpc_security.h#L134-L137
echo "export GOOGLE_APPLICATION_CREDENTIALS=/home/circleci/.gcp_credentials" >> $BASH_ENV

# Update the global Bazel configuration to always use remote execution.
sudo bash -c "echo 'build --config=remote' >> /etc/bazel.bazelrc"
