#!/usr/bin/env bash

# Variables
readonly projectDir=$(realpath "$(dirname ${BASH_SOURCE[0]})/..")
readonly envHelpersPath="$projectDir/.circleci/env-helpers.inc.sh";

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
setSecretVar SAUCE_ACCESS_KEY "f4bf7c639c5a-c6bb-d6a4-a4b5-800aa111";
# TODO(josephperrott): Remove environment variables once all saucelabs tests are via bazel method.
setPublicVar SAUCE_LOG_FILE /tmp/angular/sauce-connect.log
setPublicVar SAUCE_READY_FILE /tmp/angular/sauce-connect-ready-file.lock
setPublicVar SAUCE_PID_FILE /tmp/angular/sauce-connect-pid-file.lock
setPublicVar SAUCE_TUNNEL_IDENTIFIER "angular-framework-${CIRCLE_BUILD_NUM}-${CIRCLE_NODE_INDEX}"
# Amount of seconds we wait for sauceconnect to establish a tunnel instance. In order to not
# acquire CircleCI instances for too long if sauceconnect failed, we need a connect timeout.
setPublicVar SAUCE_READY_FILE_TIMEOUT 120

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
echo "export CI_PULL_REQUEST=\"${CI_PULL_REQUEST}\";" >> $bazelVarEnv
echo "export CI_REPO_NAME=\"${CI_REPO_NAME}\";" >> $bazelVarEnv
echo "export CI_REPO_OWNER=\"${CI_REPO_OWNER}\";" >> $bazelVarEnv
echo "export CI_SECRET_PAYLOAD_FIREBASE_TOKEN=\"${CI_SECRET_PAYLOAD_FIREBASE_TOKEN}\";" >> $bazelVarEnv

####################################################################################################
# Platform-specific environment setup (which can leverage the base variables from here)
####################################################################################################

# Conditionally, load additional environment settings based on the current VM
# operating system running. We detect Windows by checking for `%AppData%`.
if [[ -n "${APPDATA}" ]]; then
  source ${projectDir}/.circleci/env.windows.sh
else
  source ${projectDir}/.circleci/env.linux.sh
fi
