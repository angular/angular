#!/usr/bin/env bash

set -x -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)
source ${thisDir}/_travis-fold.sh


# Find the most recent tag that is reachable from the current commit.
# This is shallow clone of the repo, so we might need to fetch more commits to
# find the tag.
function getLatestTag {
  local depth=`git log --oneline | wc -l`
  local latestTag=`git describe --tags --abbrev=0 || echo NOT_FOUND`

  while [ "$latestTag" == "NOT_FOUND" ]; do
    # Avoid infinite loop.
    if [ "$depth" -gt "1000" ]; then
      echo "Error: Unable to find the latest tag." 1>&2
      exit 1;
    fi

    # Increase the clone depth and look for a tag.
    depth=$((depth + 50))
    git fetch --depth=$depth
    latestTag=`git describe --tags --abbrev=0 || echo NOT_FOUND`
  done

  echo $latestTag;
}

function publishRepo {
  COMPONENT=$1
  ARTIFACTS_DIR=$2

  BUILD_REPO="${COMPONENT}-builds"
  REPO_DIR="tmp/${BUILD_REPO}"

  if [ -n "${CREATE_REPOS:-}" ]; then
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
    # use the remote branch if it exists
    if git ls-remote --exit-code origin ${BRANCH}; then
      git fetch origin ${BRANCH} --depth=1 && \
      git checkout origin/${BRANCH}
    fi
    git checkout -b "${BRANCH}"
  )

  # copy over build artifacts into the repo directory
  rm -rf $REPO_DIR/*
  cp -R $ARTIFACTS_DIR/* $REPO_DIR/

  # Replace $$ANGULAR_VERSION$$ with the build version.
  BUILD_VER="${LATEST_TAG}+${SHORT_SHA}"
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
      # SECURITY CRITICAL: DO NOT use shell to expand vars since it could be logged and leaked.
      node -e "console.log('https://'+process.env.GITHUB_TOKEN_ANGULAR+':@github.com')" > .git/credentials
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
    git push origin "${BRANCH}" --tags --force
  )
}

# Publish all individual packages from packages-dist.
function publishPackages {
  GIT_SCHEME=$1
  PKGS_DIST=$2
  BRANCH=$3

  for dir in $PKGS_DIST/*/ dist/tools/@angular/tsc-wrapped
  do
    COMPONENT="$(basename ${dir})"

    # Replace _ with - in component name.
    COMPONENT="${COMPONENT//_/-}"
    JS_BUILD_ARTIFACTS_DIR="${dir}"

    if [[ "$GIT_SCHEME" == "ssh" ]]; then
      REPO_URL="git@github.com:${ORG}/${COMPONENT}-builds.git"
    elif [[ "$GIT_SCHEME" == "http" ]]; then
      REPO_URL="https://github.com/${ORG}/${COMPONENT}-builds.git"
    else
      die "Don't have a way to publish to scheme $GIT_SCHEME"
    fi
    SHA=`git rev-parse HEAD`
    SHORT_SHA=`git rev-parse --short HEAD`
    COMMIT_MSG=`git log --oneline -1`
    COMMITTER_USER_NAME=`git --no-pager show -s --format='%cN' HEAD`
    COMMITTER_USER_EMAIL=`git --no-pager show -s --format='%cE' HEAD`
    LATEST_TAG=`getLatestTag`

    publishRepo "${COMPONENT}" "${JS_BUILD_ARTIFACTS_DIR}"
  done

  echo "Finished publishing build artifacts"
}

# See docs/DEVELOPER.md for help
CUR_BRANCH=${TRAVIS_BRANCH:-$(git symbolic-ref --short HEAD)}
if [ $# -gt 0 ]; then
  ORG=$1
  publishPackages "ssh" dist/packages-dist $CUR_BRANCH
  if [[ -e dist/packages-dist-es2015 ]]; then
    publishPackages "ssh" dist/packages-dist-es2015 ${CUR_BRANCH}-es2015
  fi

elif [[ \
    "$TRAVIS_REPO_SLUG" == "angular/angular" && \
    "$TRAVIS_PULL_REQUEST" == "false" && \
    "$CI_MODE" == "e2e" ]]; then
  ORG="angular"
  publishPackages "http" dist/packages-dist $CUR_BRANCH
  if [[ -e dist/packages-dist-es2015 ]]; then
    publishPackages "http" dist/packages-dist-es2015 ${CUR_BRANCH}-es2015
  fi

else
  echo "Not building the upstream/${CUR_BRANCH} branch, build artifacts won't be published."
fi
