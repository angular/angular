#!/usr/bin/env bash

# Variables
readonly projectDir=$(realpath "$(dirname ${BASH_SOURCE[0]})/..")
readonly envHelpersPath="$projectDir/.circleci/env-helpers.inc.sh";
readonly bashEnvCachePath="$projectDir/.circleci/bash_env_cache";

# Load helpers and make them available everywhere (through `$BASH_ENV`).
source $envHelpersPath;
echo "source $envHelpersPath;" >> $BASH_ENV;


####################################################################################################
# Define PUBLIC environment variables for CircleCI.
####################################################################################################
# See https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables for more info.
####################################################################################################
setPublicVar CI "$CI"
setPublicVar PROJECT_ROOT "$projectDir";
# This is the branch being built; e.g. `pull/12345` for PR builds.
setPublicVar CI_BRANCH "$CIRCLE_BRANCH";
setPublicVar CI_BUILD_URL "$CIRCLE_BUILD_URL";
setPublicVar CI_COMMIT "$CIRCLE_SHA1";
# `CI_COMMIT_RANGE` is only used on push builds (a.k.a. non-PR, non-scheduled builds and rerun
# workflows of such builds).
setPublicVar CI_GIT_BASE_REVISION "${CIRCLE_GIT_BASE_REVISION}";
setPublicVar CI_GIT_REVISION "${CIRCLE_GIT_REVISION}";
setPublicVar CI_COMMIT_RANGE "$CIRCLE_GIT_BASE_REVISION..$CIRCLE_GIT_REVISION";
setPublicVar CI_PULL_REQUEST "${CIRCLE_PR_NUMBER:-false}";
setPublicVar CI_REPO_NAME "$CIRCLE_PROJECT_REPONAME";
setPublicVar CI_REPO_OWNER "$CIRCLE_PROJECT_USERNAME";
setPublicVar CI_PR_REPONAME "$CIRCLE_PR_REPONAME";
setPublicVar CI_PR_USERNAME "$CIRCLE_PR_USERNAME";

####################################################################################################
# Decrypt GCP Credentials and store them as the Google default credentials.
####################################################################################################
mkdir -p "$HOME/.config/gcloud";
openssl aes-256-cbc -d -in "${projectDir}/.circleci/gcp_token" \
        -md md5 -k "$CIRCLE_PROJECT_REPONAME" -out "$HOME/.config/gcloud/application_default_credentials.json"
####################################################################################################
# Set bazel configuration for CircleCI runs.
####################################################################################################
cp "${projectDir}/.circleci/bazel.linux.rc" "$HOME/.bazelrc";

####################################################################################################
####################################################################################################
##                  Source `$BASH_ENV` to make the variables available immediately.               ##
##                  ***NOTE: This must remain the last action in this script***                   ##
####################################################################################################
####################################################################################################
source $BASH_ENV;
