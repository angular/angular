#!/usr/bin/env bash

set -x -u -e -o pipefail

# Setup environment
readonly thisDir=$(cd $(dirname $0); pwd)

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
  REPO_DIR="$(pwd)/tmp/${BUILD_REPO}"
  REPO_URL="https://github.com/angular/${BUILD_REPO}.git"

  if [ -n "${CREATE_REPOS:-}" ]; then
    curl -u "$ORG:$TOKEN" https://api.github.com/user/repos \
         -d '{"name":"'$BUILD_REPO'", "auto_init": true}'
  fi

  echo "Pushing build artifacts to ${ORG}/${BUILD_REPO}"

  # create local repo folder and clone build repo into it
  rm -rf $REPO_DIR
  mkdir -p ${REPO_DIR}

  echo "Starting cloning process of ${REPO_URL} into ${REPO_DIR}.."

  (
    if [[ $(git ls-remote --heads ${REPO_URL} ${BRANCH}) ]]; then
      echo "Branch ${BRANCH} already exists. Cloning that branch."
      git clone ${REPO_URL} ${REPO_DIR} --depth 1 --branch ${BRANCH}

      cd ${REPO_DIR}
      echo "Cloned repository and switched into the repository directory (${REPO_DIR})."
    else
      echo "Branch ${BRANCH} does not exist on ${BUILD_REPO} yet."
      echo "Cloning default branch and creating branch '${BRANCH}' on top of it."

      git clone ${REPO_URL} ${REPO_DIR} --depth 1
      cd ${REPO_DIR}

      echo "Cloned repository and switched into directory. Creating new branch now.."

      git checkout -b ${BRANCH}
    fi
  )

  # Unshallow the repo manually so that it doesn't trigger a push failure.
  # This is generally unsafe, however we immediately remove all of the files from within
  # the repo on the next line, so we should be able to safely treat the entire repo
  # contents as an atomic piece to be pushed.
  rm $REPO_DIR/.git/shallow

  # copy over build artifacts into the repo directory
  rm -rf $REPO_DIR/*
  cp -R $ARTIFACTS_DIR/* $REPO_DIR/

  if [[ ${CI} ]]; then
    (
      # The file ~/.git_credentials is created in /.circleci/config.yml
      cd $REPO_DIR && \
      git config credential.helper "store --file=$HOME/.git_credentials"
    )
  fi
  echo `date` > $REPO_DIR/BUILD_INFO
  echo $SHA >> $REPO_DIR/BUILD_INFO
  echo 'This file is used by the npm/yarn_install rule to detect APF. See https://github.com/bazelbuild/rules_nodejs/issues/927' > $REPO_DIR/ANGULAR_PACKAGE

  (
    cd $REPO_DIR && \
    git config user.name "${COMMITTER_USER_NAME}" && \
    git config user.email "${COMMITTER_USER_EMAIL}" && \
    git add --all && \
    git commit -m "${COMMIT_MSG}" --quiet && \
    git tag "${BUILD_VER}" --force && \
    git push origin "${BRANCH}" --tags --force
  )
}

# Publish all individual packages from packages-dist.
function publishPackages {
  GIT_SCHEME=$1
  PKGS_DIST=$2
  BRANCH=$3
  BUILD_VER=$4

  for dir in $PKGS_DIST/*/
  do
    if [[ ! -f "$dir/package.json" ]]; then
      # Only publish directories that contain a `package.json` file.
      echo "Skipping $dir, it does not contain a package to be published."
      continue
    fi

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

    publishRepo "${COMPONENT}" "${JS_BUILD_ARTIFACTS_DIR}"
  done

  echo "Finished publishing build artifacts"
}

function publishAllBuilds() {
  GIT_SCHEME="$1"

  SHA=`git rev-parse HEAD`
  COMMIT_MSG=`git log --oneline -1`
  COMMITTER_USER_NAME=`git --no-pager show -s --format='%cN' HEAD`
  COMMITTER_USER_EMAIL=`git --no-pager show -s --format='%cE' HEAD`
  PACKAGES_DIST="$(pwd)/dist/packages-dist"

  local shortSha=`git rev-parse --short HEAD`
  local latestTag=`getLatestTag`

  publishPackages $GIT_SCHEME $PACKAGES_DIST $CUR_BRANCH "${latestTag}+${shortSha}"
}

# See docs/DEVELOPER.md for help
CUR_BRANCH=${CI_BRANCH:-$(git symbolic-ref --short HEAD)}
if [ $# -gt 0 ]; then
  ORG=$1
  publishAllBuilds "ssh"
else
  ORG="angular"
  publishAllBuilds "http"
fi
