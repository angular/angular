#!/bin/bash

# Script that publishes the build and package tools of Angular Material to a Github repository.
# This allows other Angular projects like Flex-Layout to use the same packaging as in Material.

# The script should immediately exit if any command in the script fails.
set -e

# Go to the root of the project.
cd $(dirname ${0})/../..

if [ -z ${MATERIAL2_BUILDS_TOKEN} ]; then
  echo "Error: No access token for GitHub could be found." \
       "Please set the environment variable 'MATERIAL2_BUILDS_TOKEN'."
  exit 1
fi

packageToolsPath="./tools/package-tools/"
packageToolsOutput="./dist/package-tools/"

buildVersion=$(node -pe "require('./package.json').version")

commitSha=$(git rev-parse --short HEAD)
commitAuthorName=$(git --no-pager show -s --format='%an' HEAD)
commitAuthorEmail=$(git --no-pager show -s --format='%ae' HEAD)
commitMessage=$(git log --oneline -n 1)

repoName="material2-build-tools"
repoUrl="https://github.com/angular/${repoName}.git"
repoDir="tmp/${repoName}"

# Build the package tools output.
$(npm bin)/tsc -p ${packageToolsPath}

# Copy the package.json and the license file to the output directory.
cp ${packageToolsPath}/package.json ${packageToolsOutput}
cp LICENSE ${packageToolsOutput}

# Prepare cloning the builds repository
rm -rf ${repoDir}
mkdir -p ${repoDir}

# Clone the repository and only fetch the last commit to download less unused data.
git clone ${repoUrl} ${repoDir} --depth 1

# Delete old files and copy the build files to the repository
rm -rf ${repoDir}/*
cp -r ${packageToolsOutput}/* ${repoDir}

# Create the build commit and push the changes to the repository.
cd ${repoDir}

# Replace all placeholders with a unique version that can be used to install the build-tools
# from Github.
sed -i "s/0.0.0-PLACEHOLDER/${buildVersion}-${commitSha}/g" package.json

# Prepare Git for pushing the artifacts to the repository.
git config user.name "${commitAuthorName}"
git config user.email "${commitAuthorEmail}"
git config credential.helper "store --file=.git/credentials"

echo "https://${MATERIAL2_BUILDS_TOKEN}:@github.com" > .git/credentials

git add -A
git commit -m "${commitMessage}"
git tag "${buildVersion}-${commitSha}"
git push origin master --tags

echo "Published the build tools for SHA ${commitSha} on Github."
