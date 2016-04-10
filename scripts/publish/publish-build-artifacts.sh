#!/bin/bash
set -e -x


function publishRepo {
  LANG=$1
  ARTIFACTS_DIR=$2

  BUILD_BRANCH="builds-${LANG}"
  REPO_DIR="tmp/${BUILD_BRANCH}"

  echo "Pushing build artifacts to angular/$BUILD_BRANCH"

  # create local repo folder and clone build repo into it
  rm -rf $REPO_DIR
  mkdir -p $REPO_DIR
  (
    cd $REPO_DIR && \
    git init && \
    git remote add origin $REPO_URL && \
    git fetch origin $BUILD_BRANCH && \
    git checkout origin/$BUILD_BRANCH && \
    git checkout -b $BUILD_BRANCH
  )

  # copy over build artifacts into the repo directory
  rm -rf $REPO_DIR/*
  cp -R $ARTIFACTS_DIR/* $REPO_DIR/
  grep -v /typings/ .gitignore > $REPO_DIR/.gitignore
  echo `date` > $REPO_DIR/BUILD_INFO
  echo $SHA >> $REPO_DIR/BUILD_INFO

  (
    cd $REPO_DIR && \
    git config credential.helper "store --file=.git/credentials" && \
    echo "https://${GITHUB_TOKEN_ANGULAR}:@github.com" > .git/credentials && \
    git config user.name "${COMMITTER_USER_NAME}" && \
    git config user.email "${COMMITTER_USER_EMAIL}" && \
    git add --all && \
    git commit -m "${COMMIT_MSG}" && \
    git push origin $BUILD_BRANCH && \
    git tag "2.0.0-build.${SHORT_SHA}.${LANG}" && \
    git push origin --tags
  )
}


if [[ "$TRAVIS_REPO_SLUG" == "angular/angular" && \
      "$TRAVIS_PULL_REQUEST" == "false" && \
      "$MODE" == "build_only" ]]; then

  DART_BUILD_ARTIFACTS_DIR="dist/pub/angular2"
  JS_BUILD_ARTIFACTS_DIR="dist/npm/angular2"

  DART_BUILD_BRANCH="builds-dart"
  JS_BUILD_BRANCH="builds-js"

  REPO_URL="https://github.com/angular/angular.git"
  # Use the below URL for testing when using SSH authentication
  # REPO_URL="git@github.com:angular/angular.git"

  SHA=`git rev-parse HEAD`
  SHORT_SHA=`git rev-parse --short HEAD`
  COMMIT_MSG=`git log --oneline | head -n1`
  COMMITTER_USER_NAME=`git --no-pager show -s --format='%cN' HEAD`
  COMMITTER_USER_EMAIL=`git --no-pager show -s --format='%cE' HEAD`

  scripts/publish/npm_prepare.sh angular2
  publishRepo "js" "${JS_BUILD_ARTIFACTS_DIR}"

  scripts/publish/pub_prepare.sh angular2
  publishRepo "dart" "${DART_BUILD_ARTIFACTS_DIR}"
  echo "Finished publishing build artifacts"

else
  echo "Not building the upstream/master branch, build artifacts won't be published."
fi
