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
    git tag "${BUILD_VER}" && \
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

  local shortSha=`git rev-parse --short HEAD`
  local latestTag=`getLatestTag`

  publishPackages $GIT_SCHEME dist/packages-dist $CUR_BRANCH "${latestTag}+${shortSha}"

  # don't publish ivy builds on non-master branch
  if [[ "${CI_BRANCH-}" == "master" ]]; then
    publishPackages $GIT_SCHEME dist/packages-dist-ivy-aot "${CUR_BRANCH}-ivy-aot" "${latestTag}-ivy-aot+${shortSha}"
  fi
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
