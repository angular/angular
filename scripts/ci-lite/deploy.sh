#!/usr/bin/env bash

set -u -e -o pipefail

# Setup environment
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/_travis_fold.sh
source ${TRAVIS_BUILD_DIR}/scripts/ci-lite/env.sh


# Don't deploy if not running against angular/angular and not a PR
# TODO(i): because we don't let deploy to run outside of angular/angular folks can't use their
#   private travis build to deploy anywhere. This is likely ok, but this means that @alexeagle's
#   fancy setup to publish ES2015 packages to github -build repos no longer works. This is ok
#   since with megamodules we'll have this feature built-in. We should still go and remove
#   stuff that Alex put in for this from publish-build-artifacts.sh
if [[ ${TRAVIS_REPO_SLUG} != "angular/angular" || ${TRAVIS_PULL_REQUEST} != "false" ]]; then
  echo "Skipping deploy to staging because this is a PR build."
  exit 0
fi


case ${CI_MODE} in
  e2e)
    travisFoldStart "deploy.packages"
      ./scripts/publish/publish-build-artifacts.sh
    travisFoldEnd "deploy.packages"
    ;;
  aio)
    # aio deploy is setup only from master to aio-staging.firebaseapp.com for now
    if [[ ${TRAVIS_BRANCH} == "master" ]]; then
      travisFoldStart "deploy.aio"
      (
        cd ${TRAVIS_BUILD_DIR}/aio
        yarn run deploy-staging
      )
      travisFoldEnd "deploy.aio"
    fi
    ;;
esac
