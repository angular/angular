####################################################################################################
# Decrypt GCP Credentials and store them as the Google default credentials.
####################################################################################################
mkdir -p "$HOME/.config/gcloud";
openssl aes-256-cbc -d -in "${PROJECT_ROOT}/.circleci/gcp_token" \
        -md md5 -k "$CIRCLE_PROJECT_REPONAME" -out "$HOME/.config/gcloud/application_default_credentials.json"

####################################################################################################
# Set bazel configuration for CircleCI runs.
####################################################################################################
cp "${PROJECT_ROOT}/.circleci/bazel.linux.rc" "$HOME/.bazelrc";
