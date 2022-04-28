#!/bin/bash

# Script to publish the build artifacts to a GitHub repository.
# Builds will be automatically published once new changes are made to the repository.

# The script should immediately exit if any command in the script fails.
set -e

# Go to the project root directory
cd $(dirname ${0})/../..

if [ -z ${MATERIAL2_BUILDS_TOKEN} ]; then
  echo "Error: No access token for GitHub could be found." \
       "Please set the environment variable 'MATERIAL2_BUILDS_TOKEN'."
  exit 1
fi

# Release packages that need to published as snapshots.
PACKAGES=(
  cdk
  cdk-experimental
  material
  material-experimental
  material-moment-adapter
  # material-luxon-adapter TODO(crisbeto): enable this once we have a builds repo
  # material-date-fns-adapter TODO(crisbeto): enable this once we have a builds repo
  google-maps
  youtube-player
)

# Command line arguments.
COMMAND_ARGS=${*}

# Function to publish artifacts of a package to Github.
#   @param ${1} Name of the package
#   @param ${2} Repository name of the package.
publishPackage() {
  packageName=${1}
  packageRepo=${2}

  buildDir="$(pwd)/dist/releases/${packageName}"
  buildVersion=$(node -pe "require('./package.json').version")
  branchName=${CIRCLE_BRANCH:-'main'}

  commitSha=$(git rev-parse --short HEAD)
  commitAuthorName=$(git --no-pager show -s --format='%an' HEAD)
  commitAuthorEmail=$(git --no-pager show -s --format='%ae' HEAD)
  commitMessage=$(git log --oneline -n 1)

  buildVersionName="${buildVersion}-sha-${commitSha}"
  buildTagName="${branchName}-${commitSha}"
  buildCommitMessage="${branchName} - ${commitMessage}"

  repoUrl="https://github.com/angular/${packageRepo}.git"
  repoDir="tmp/${packageRepo}"

  echo "Starting publish process of ${packageName} for ${buildVersionName} into ${branchName}.."

  # Prepare cloning the builds repository
  rm -rf ${repoDir}
  mkdir -p ${repoDir}

  echo "Starting cloning process of ${repoUrl} into ${repoDir}.."

  if [[ $(git ls-remote --heads ${repoUrl} ${branchName}) ]]; then
    echo "Branch ${branchName} already exists. Cloning that branch."
    git clone ${repoUrl} ${repoDir} --depth 1 --branch ${branchName}

    cd ${repoDir}
    echo "Cloned repository and switched into the repository directory (${repoDir})."
  else
    echo "Branch ${branchName} does not exist on ${packageRepo} yet."
    echo "Cloning default branch and creating branch '${branchName}' on top of it."

    git clone ${repoUrl} ${repoDir} --depth 1
    cd ${repoDir}

    echo "Cloned repository and switched into directory. Creating new branch now.."

    git checkout -b ${branchName}
  fi

  # Copy the build files to the repository
  rm -rf ./*
  cp -r ${buildDir}/* ./

  echo "Removed everything from ${packageRepo}#${branchName} and added the new build output."

  if [[ $(git ls-remote origin "refs/tags/${buildTagName}") ]]; then
    echo "Skipping publish because tag is already published"
    exit 0
  fi

  echo "Updated the build version in every file to include the SHA of the latest commit."

  # Prepare Git for pushing the artifacts to the repository.
  git config user.name "${commitAuthorName}"
  git config user.email "${commitAuthorEmail}"
  git config credential.helper "store --file=.git/credentials"

  echo "https://${MATERIAL2_BUILDS_TOKEN}:@github.com" > .git/credentials

  echo "Git configuration has been updated to match the last commit author. Publishing now.."

  git add -A
  git commit --allow-empty -m "${buildCommitMessage}"
  git tag "${buildTagName}"
  git push origin ${branchName} --tags --force

  echo "Published package artifacts for ${packageName}#${buildVersionName} into ${branchName}"
}

for packageName in "${PACKAGES[@]}"; do
  # Publish artifacts of the current package. Run publishing in a sub-shell to avoid
  # working directory changes.
  (publishPackage ${packageName} "${packageName}-builds")
done
