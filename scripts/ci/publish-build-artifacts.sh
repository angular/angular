#!/bin/bash
set -e -x

DART_BUILD_ARTIFACTS_DIR="dist/dart/angular2"
JS_BUILD_ARTIFACTS_DIR="dist/js/prod/es5/angular2"

DART_BUILD_BRANCH="builds-dart"
JS_BUILD_BRANCH="builds-js"

REPO_URL="https://github.com/angular/angular.git"
# Use the below URL for testing when using SSH authentication
# REPO_URL="git@github.com:angular/angular.git"

SHA=`git rev-parse HEAD`
SHORT_SHA=`git rev-parse --short HEAD`
COMMIT_MSG=`git log --oneline | head -n1`

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
  cp .gitignore $REPO_DIR/
  echo `date` > $REPO_DIR/BUILD_INFO
  echo $SHA >> $REPO_DIR/BUILD_INFO

  (
    cd $REPO_DIR && \
    git add --all && \
    git commit -m "${COMMIT_MSG}" && \
    git push origin $BUILD_BRANCH && \
    git tag "2.0.0-build.${SHORT_SHA}.${LANG}" && \
    git push origin --tags
  )
}

if [ "$TRAVIS_REPO_SLUG" = "angular/angular" && "$MODE" == "build_only" ]; then
  publishRepo "js" "${JS_BUILD_ARTIFACTS_DIR}"
  publishRepo "dart" "${DART_BUILD_ARTIFACTS_DIR}"
  echo "Finished publishing build artifacts"
fi
