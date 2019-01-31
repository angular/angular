#!/usr/bin/env bash

# Load helpers and make them available everywhere (through `$BASH_ENV`).
readonly envHelpersPath="`dirname $0`/env-helpers.inc.sh";
source $envHelpersPath;
echo "source $envHelpersPath;" >> $BASH_ENV;


####################################################################################################
# Define PUBLIC environment variables for CircleCI.
####################################################################################################
setPublicVar PROJECT_ROOT "$(pwd)";
setPublicVar CI_AIO_MIN_PWA_SCORE "95";
# This is the branch being built; e.g. `pull/12345` for PR builds.
setPublicVar CI_BRANCH "$CIRCLE_BRANCH";
setPublicVar CI_COMMIT "$CIRCLE_SHA1";
# `CI_COMMIT_RANGE` will only be available when `CIRCLE_COMPARE_URL` is also available,
# i.e. on push builds (a.k.a. non-PR builds). That is fine, since we only need it in push builds.
setPublicVar CI_COMMIT_RANGE "$(sed -r 's|^.*/([0-9a-f]+\.\.\.[0-9a-f]+)$|\1|i' <<< ${CIRCLE_COMPARE_URL:-})";
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
setPublicVar SAUCE_CONNECT_VERSION "4.5.3";
setPublicVar SAUCE_READY_FILE /tmp/angular/sauce-connect-ready-file.lock
setPublicVar SAUCE_PID_FILE /tmp/angular/sauce-connect-pid-file.lock
setPublicVar SAUCE_TUNNEL_IDENTIFIER "angular-${CIRCLE_BUILD_NUM}-${CIRCLE_NODE_INDEX}"
# In order to have a meaningful SauceLabs badge on the repo page,
# the angular2-ci account is used only when pushing commits to master;
# in all other cases, the regular angular-ci account is used.
if [ "${CI_PULL_REQUEST}" = "false" ] && [ "${CI_BRANCH}" = "master" ]; then
  setPublicVar SAUCE_USERNAME "angular2-ci";
  setSecretVar SAUCE_ACCESS_KEY "e4f2662a-66d8-4161-b5b0-a80261cbe396"
else
  setPublicVar SAUCE_USERNAME "angular-ci";
  setSecretVar SAUCE_ACCESS_KEY "78924453-3ea4-4aa8-acbf-8ff434f889b9"
fi


# Source `$BASH_ENV` to make the variables available immediately.
source $BASH_ENV;
