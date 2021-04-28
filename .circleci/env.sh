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
setPublicVar CI_AIO_MIN_PWA_SCORE "95";
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
# Define "lazy" PUBLIC environment variables for CircleCI.
# (I.e. functions to set an environment variable when called.)
####################################################################################################
createPublicVarSetter CI_STABLE_BRANCH "\$(npm info @angular/core dist-tags.latest | sed -r 's/^\\s*([0-9]+\\.[0-9]+)\\.[0-9]+.*$/\\1.x/')";


####################################################################################################
# Define SECRET environment variables for CircleCI.
####################################################################################################
setSecretVar CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN "$AIO_DEPLOY_TOKEN";
setSecretVar CI_SECRET_PAYLOAD_FIREBASE_TOKEN "$ANGULAR_PAYLOAD_TOKEN";


####################################################################################################
# Define SauceLabs environment variables for CircleCI.
####################################################################################################
setPublicVar SAUCE_USERNAME "angular-framework";
setSecretVar SAUCE_ACCESS_KEY "0c731274ed5f-cbc9-16f4-021a-9835e39f";
# TODO(josephperrott): Remove environment variables once all saucelabs tests are via bazel method.
setPublicVar SAUCE_LOG_FILE /tmp/angular/sauce-connect.log
setPublicVar SAUCE_READY_FILE /tmp/angular/sauce-connect-ready-file.lock
setPublicVar SAUCE_PID_FILE /tmp/angular/sauce-connect-pid-file.lock
setPublicVar SAUCE_TUNNEL_IDENTIFIER "angular-framework-${CIRCLE_BUILD_NUM}-${CIRCLE_NODE_INDEX}"
# Amount of seconds we wait for sauceconnect to establish a tunnel instance. In order to not
# acquire CircleCI instances for too long if sauceconnect failed, we need a connect timeout.
setPublicVar SAUCE_READY_FILE_TIMEOUT 120


####################################################################################################
# Define environment variables for the `angular/components` repo unit tests job.
####################################################################################################
# We specifically use a directory within "/tmp" here because we want the cloned repo to be
# completely isolated from angular/angular in order to avoid any bad interactions between
# their separate build setups. **NOTE**: When updating the temporary directory, also update
# the `save_cache` path configuration in `config.yml`
setPublicVar COMPONENTS_REPO_TMP_DIR "/tmp/angular-components-repo"
setPublicVar COMPONENTS_REPO_URL "https://github.com/angular/components.git"
setPublicVar COMPONENTS_REPO_BRANCH "master"
# **NOTE**: When updating the commit SHA, also update the cache key in the CircleCI `config.yml`.
setPublicVar COMPONENTS_REPO_COMMIT "09e68db8ed5b1253f2fe38ff954ef0df019fc25a"


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
# Create shell script in /tmp for Bazel actions to access CI envs without
# busting the cache. Used by payload-size.sh script in integration tests.
####################################################################################################
readonly bazelVarEnv="/tmp/bazel-ci-env.sh"
echo "# Setup by /.circle/env.sh" > $bazelVarEnv
echo "export PROJECT_ROOT=\"${PROJECT_ROOT}\";" >> $bazelVarEnv
echo "export CI_BRANCH=\"${CI_BRANCH}\";" >> $bazelVarEnv
echo "export CI_BUILD_URL=\"${CI_BUILD_URL}\";" >> $bazelVarEnv
echo "export CI_COMMIT=\"${CI_COMMIT}\";" >> $bazelVarEnv
echo "export CI_COMMIT_RANGE=\"${CI_COMMIT_RANGE}\";" >> $bazelVarEnv
echo "export CI_PULL_REQUEST=\"${CI_PULL_REQUEST}\";" >> $bazelVarEnv
echo "export CI_REPO_NAME=\"${CI_REPO_NAME}\";" >> $bazelVarEnv
echo "export CI_REPO_OWNER=\"${CI_REPO_OWNER}\";" >> $bazelVarEnv
echo "export CI_SECRET_PAYLOAD_FIREBASE_TOKEN=\"${CI_SECRET_PAYLOAD_FIREBASE_TOKEN}\";" >> $bazelVarEnv

####################################################################################################
####################################################################################################
##                  Source `$BASH_ENV` to make the variables available immediately.               ##
##                  ***NOTE: This must remain the last action in this script***               ##
####################################################################################################
####################################################################################################
source $BASH_ENV;
