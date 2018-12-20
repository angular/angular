#!/usr/bin/env bash

# Variables
readonly envHelpersPath="`dirname $0`/env-helpers.inc.sh";
readonly getCommitRangePath="`dirname $0`/get-commit-range.js";

# Load helpers and make them available everywhere (through `$BASH_ENV`).
source $envHelpersPath;
echo "source $envHelpersPath;" >> $BASH_ENV;


####################################################################################################
# Define PUBLIC environment variables for CircleCI.
####################################################################################################
# See https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables for more info.
####################################################################################################
setPublicVar PROJECT_ROOT "$(pwd)";
setPublicVar CI_AIO_MIN_PWA_SCORE "95";
# This is the branch being built; e.g. `pull/12345` for PR builds.
setPublicVar CI_BRANCH "$CIRCLE_BRANCH";
setPublicVar CI_COMMIT "$CIRCLE_SHA1";
# `CI_COMMIT_RANGE` will only be available when `CIRCLE_COMPARE_URL` is also available (or can be
# retrieved via `get-compare-url.js`), i.e. on push builds (a.k.a. non-PR, non-scheduled builds and
# rerun workflows of such builds). That is fine, since we only need it in push builds.
setPublicVar CI_COMMIT_RANGE "`[[ ${CIRCLE_PR_NUMBER:-false} != false ]] && echo "" || node $getCommitRangePath "$CIRCLE_BUILD_NUM" "$CIRCLE_COMPARE_URL"`";
setPublicVar CI_PULL_REQUEST "${CIRCLE_PR_NUMBER:-false}";
setPublicVar CI_REPO_NAME "$CIRCLE_PROJECT_REPONAME";
setPublicVar CI_REPO_OWNER "$CIRCLE_PROJECT_USERNAME";


####################################################################################################
# Define SECRET environment variables for CircleCI.
####################################################################################################
setSecretVar CI_SECRET_AIO_DEPLOY_FIREBASE_TOKEN "$AIO_DEPLOY_TOKEN";
setSecretVar CI_SECRET_PAYLOAD_FIREBASE_TOKEN "$ANGULAR_PAYLOAD_TOKEN";
# Defined in https://angular-team.slack.com/apps/A0F7VRE7N-circleci.
setSecretVar CI_SECRET_SLACK_CARETAKER_WEBHOOK_URL "$SLACK_CARETAKER_WEBHOOK_URL";


####################################################################################################
# Define SauceLabs environment variables for CircleCI.
####################################################################################################
# In order to have a meaningful SauceLabs badge on the repo page,
# the angular2-ci account is used only when pushing commits to master;
# in all other cases, the regular angular-ci account is used.
if [ "${CI_PULL_REQUEST}" = "false" ] && [ "${CI_REPO_OWNER}" = "angular" ] && [ "${CI_BRANCH}" = "master" ]; then
  setPublicVar SAUCE_USERNAME "angular2-ci";
  setSecretVar SAUCE_ACCESS_KEY "693ebc16208a-0b5b-1614-8d66-a2662f4e";
else
  setPublicVar SAUCE_USERNAME "angular-ci";
  setSecretVar SAUCE_ACCESS_KEY "9b988f434ff8-fbca-8aa4-4ae3-35442987";
fi
setPublicVar SAUCE_READY_FILE /tmp/angular/sauce-connect-ready-file.lock
setPublicVar SAUCE_PID_FILE /tmp/angular/sauce-connect-pid-file.lock
setPublicVar SAUCE_TUNNEL_IDENTIFIER "angular-${CIRCLE_BUILD_NUM}-${CIRCLE_NODE_INDEX}"
# Amount of seconds we wait for sauceconnect to establish a tunnel instance. In order to not
# acquire CircleCI instances for too long if sauceconnect failed, we need a connect timeout.
setPublicVar SAUCE_READY_FILE_TIMEOUT 120


# Source `$BASH_ENV` to make the variables available immediately.
source $BASH_ENV;
