#!/bin/bash
set -e -x


function publishRepo {
  COMPONENT=$1
  ARTIFACTS_DIR=$2

  BUILD_REPO="${COMPONENT}-builds"
  REPO_DIR="tmp/${BUILD_REPO}"

  if [ -n "$CREATE_REPOS" ]; then
    curl -u "$ORG:$TOKEN" https://api.github.com/user/repos \
         -d '{"name":"'$BUILD_REPO'", "auto_init": true}'
  fi

  echo "Pushing build artifacts to ${ORG}/${BUILD_REPO}"

  # create local repo folder and clone build repo into it
  rm -rf $REPO_DIR
  mkdir -p $REPO_DIR
  (
    cd $REPO_DIR && \
    git init && \
    git remote add origin $REPO_URL && \
    git fetch origin master --depth=1 && \
    git checkout origin/master && \
    git checkout -b master
  )

  # copy over build artifacts into the repo directory
  rm -rf $REPO_DIR/*
  cp -R $ARTIFACTS_DIR/* $REPO_DIR/

  # Replace $$ANGULAR_VESION$$ with the build version.
  BUILD_VER="2.0.0-${SHORT_SHA}"
  if [[ ${TRAVIS} ]]; then
    find $REPO_DIR/ -type f -name package.json -print0 | xargs -0 sed -i "s/\\\$\\\$ANGULAR_VERSION\\\$\\\$/${BUILD_VER}/g"

    # Find umd.js and umd.min.js
    UMD_FILES=$(find $REPO_DIR/ -type f -name "*.umd*.js" -print)
    for UMD_FILE in ${UMD_FILES}; do
      sed -i "s/\\\$\\\$ANGULAR_VERSION\\\$\\\$/${BUILD_VER}/g" ${UMD_FILE}
    done

    (
      cd $REPO_DIR && \
      git config credential.helper "store --file=.git/credentials" && \
      echo "https://${GITHUB_TOKEN_ANGULAR}:@github.com" > .git/credentials
    )
  fi
  echo `date` > $REPO_DIR/BUILD_INFO
  echo $SHA >> $REPO_DIR/BUILD_INFO

  (
    cd $REPO_DIR && \
    git config user.name "${COMMITTER_USER_NAME}" && \
    git config user.email "${COMMITTER_USER_EMAIL}" && \
    git add --all && \
    git commit -m "${COMMIT_MSG}" && \
    git tag "${BUILD_VER}" && \
    git push origin master --tags --force
  )
}

# Publish all individual packages from packages-dist.
function publishPackages {
  for dir in dist/packages-dist/*/ dist/tools/@angular/tsc-wrapped
  do
    COMPONENT="$(basename ${dir})"

    # Replace _ with - in component name.
    COMPONENT="${COMPONENT//_/-}"
    JS_BUILD_ARTIFACTS_DIR="${dir}"

    if [[ "$1" == "ssh" ]]; then
      REPO_URL="git@github.com:${ORG}/${COMPONENT}-builds.git"
    elif [[ "$1" == "http" ]]; then
      REPO_URL="https://github.com/${ORG}/${COMPONENT}-builds.git"
    else
      die "Don't have a way to publish to scheme $1"
    fi
    SHA=`git rev-parse HEAD`
    SHORT_SHA=`git rev-parse --short HEAD`
    COMMIT_MSG=`git log --oneline | head -n1`
    COMMITTER_USER_NAME=`git --no-pager show -s --format='%cN' HEAD`
    COMMITTER_USER_EMAIL=`git --no-pager show -s --format='%cE' HEAD`

    publishRepo "${COMPONENT}" "${JS_BUILD_ARTIFACTS_DIR}"
  done

  echo "Finished publishing build artifacts"
}

# See DEVELOPER.md for help
if [ $# -gt 0 ]; then
  ORG=$1
  publishPackages "ssh"
elif [[ \
    "$TRAVIS_REPO_SLUG" == "angular/angular" && \
    "$TRAVIS_PULL_REQUEST" == "false" && \
    "$CI_MODE" == "e2e" ]]; then
  ORG="angular"
  publishPackages "http"
else
  echo "Not building the upstream/master branch, build artifacts won't be published."
fi
