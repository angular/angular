#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


# Don't deploy if not running against angular/angular
# TODO(i): because we don't let deploy to run outside of angular/angular folks can't use their
#   private travis build to deploy anywhere. This is likely ok, but this means that @alexeagle's
#   fancy setup to publish ES2015 packages to github -build repos no longer works. This is ok
#   since with flat modules we'll have this feature built-in. We should still go and remove
#   stuff that Alex put in for this from publish-build-artifacts.sh
if [[ ${CIRCLE_PROJECT_USERNAME} == "angular" ]] &&
   [[ ${CIRCLE_PROJECT_REPONAME} == "angular" ]]; then
  echo "Skipping deploy because this is not angular/angular."
  exit 0
fi

# Don't deploy if this is a PR build
if [ -z "$CIRCLE_PULL_REQUEST" ]; then
  travisFoldStart "deploy.packages"
    ${thisDir}/publish-build-artifacts.sh
  travisFoldEnd "deploy.packages"
else
  echo "Skipping deploy because this is a PR build."
fi

travisFoldStart "deploy.aio"
(
  cd ${CIRCLE_WORKING_DIRECTORY}/aio
  yarn deploy-production
)
travisFoldEnd "deploy.aio"
