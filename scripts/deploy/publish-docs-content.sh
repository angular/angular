#!/bin/bash

# Publish material2 docs assets to the material2-docs-content repo
# material.angular.io will pull from this assets repo to get the latest docs

# The script should immediately exit if any command in the script fails.
set -e

cd "$(dirname $0)/../../"

if [ -z ${MATERIAL2_BUILDS_TOKEN} ]; then
  echo "Error: No access token for GitHub could be found." \
       "Please set the environment variable 'MATERIAL2_BUILDS_TOKEN'."
  exit 1
fi

# Path to the project directory.
projectPath="$(pwd)"

# Path to the directory that contains the generated docs output.
docsDistPath="${projectPath}/dist/docs"

# Path to the cloned docs-content repository.
docsContentPath="${projectPath}/tmp/material2-docs-content"

# Path to the release output of the Bazel "@angular/material-examples" NPM package.
examplesPackagePath="$(bazel info bazel-bin)/src/material-examples/npm_package"

# Git clone URL for the material2-docs-content repository.
docsContentRepoUrl="https://github.com/angular/material2-docs-content"

# Current version of Angular Material from the package.json file
buildVersion=$(node -pe "require('./package.json').version")

# Name of the branch that is currently being deployed.
branchName=${CIRCLE_BRANCH:-'master'}

# Additional information about the last commit for docs-content commits.
commitSha=$(git rev-parse --short HEAD)
commitAuthorName=$(git --no-pager show -s --format='%an' HEAD)
commitAuthorEmail=$(git --no-pager show -s --format='%ae' HEAD)
commitMessage=$(git log --oneline -n 1)
commitTag="${buildVersion}-${commitSha}"

# Note that we cannot store the commit SHA in its own version segment
# as it will not comply with the semver specification. For example:
# 1.0.0-00abcdef will break since the SHA starts with zeros. To fix this,
# we create a new version segment with the following format: "1.0.0-sha-00abcdef".
# See issue: https://jubianchi.github.io/semver-check/#/^8.0.0/8.2.2-0462599
buildVersionName="${buildVersion}-sha-${commitSha}"
buildTagName="${branchName}-${commitSha}"
buildCommitMessage="${branchName} - ${commitMessage}"

echo "Starting deployment of the docs-content for ${buildVersionName} in ${branchName}"

# Remove the docs-content repository if the directory exists
rm -Rf ${docsContentPath}

echo "Starting cloning process of ${docsContentRepoUrl} into ${docsContentPath}.."

if [[ $(git ls-remote --heads ${docsContentRepoUrl} ${branchName}) ]]; then
  echo "Branch ${branchName} already exists. Cloning that branch."
  git clone ${docsContentRepoUrl} ${docsContentPath} --depth 1 --branch ${branchName}

  cd ${docsContentPath}
  echo "Cloned repository and switched into the repository directory (${docsContentPath})."
else
  echo "Branch ${branchName} does not exist yet."
  echo "Cloning default branch and creating branch '${branchName}' on top of it."

  git clone ${docsContentRepoUrl} ${docsContentPath} --depth 1
  cd ${docsContentPath}

  echo "Cloned repository and switched into directory. Creating new branch now.."

  git checkout -b ${branchName}
fi

# Remove everything inside of the docs-content repository.
rm -Rf ${docsContentPath}/*

echo "Removed everything from the docs-content repository. Copying package output.."

# Copy the package output to the docs-content repository.
cp -R ${examplesPackagePath}/* ${docsContentPath}

# Update permissions for the copied "npm_package". Bazel makes these files readonly
# in the "bazel-out", but for publishing, they should be writable. Also it's necessary
# in order to be able to update the "package.json" version
chmod -R u+w ${docsContentPath}

echo "Successfully copied package output into the docs-content repository."

if [[ $(git ls-remote origin "refs/tags/${buildTagName}") ]]; then
  echo "Skipping publish of docs-content because tag is already published. Exiting.."
  exit 0
fi

# Replace the version in every file recursively with a more specific version that also includes
# the SHA of the current build job. Normally this "sed" call would just replace the version
# placeholder, but the version placeholders have been replaced by "npm_package" already.
sed -i "s/${buildVersion}/${buildVersionName}/g" $(find . -type f -not -path '*\/.*')

# Setup the Git configuration
git config user.name "$commitAuthorName"
git config user.email "$commitAuthorEmail"
git config credential.helper "store --file=.git/credentials"

echo "https://${MATERIAL2_BUILDS_TOKEN}:@github.com" > .git/credentials

echo "Credentials for docs-content repository are now set up. Publishing.."

git add -A
git commit --allow-empty -m "${buildCommitMessage}"
git tag "${buildTagName}"
git push origin ${branchName} --tags --force

echo "Published docs-content for ${buildVersionName} into ${branchName} successfully"
