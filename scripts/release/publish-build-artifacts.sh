#!/bin/bash

# Script to publish the build artifacts to a GitHub repository.
# Builds will be automatically published once new changes are made to the repository.

set -e -o pipefail

# Go to the project root directory
cd $(dirname $0)/../..

buildDir="dist/@angular/material"
buildVersion=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' package.json)

commitSha=$(git rev-parse --short HEAD)
commitAuthorName=$(git --no-pager show -s --format='%an' HEAD)
commitAuthorEmail=$(git --no-pager show -s --format='%ae' HEAD)
commitMessage=$(git log --oneline -n 1)

repoName="material2-builds"
repoUrl="https://github.com/angular/material2-builds.git"
repoDir="tmp/$repoName"

# Create a release of the current repository.
$(npm bin)/gulp build:release

# Prepare cloning the builds repository
rm -rf $repoDir
mkdir -p $repoDir

# Clone the repository
git clone $repoUrl $repoDir

# Copy the build files to the repository
rm -rf $repoDir/*
cp -r $buildDir/* $repoDir

# Create the build commit and push the changes to the repository.
cd $repoDir

# Prepare Git for pushing the artifacts to the repository.
git config user.name "$commitAuthorName"
git config user.email "$commitAuthorEmail"
git config credential.helper "store --file=.git/credentials"

echo "https://${MATERIAL2_BUILDS_TOKEN}:@github.com" > .git/credentials

git add -A
git commit -m "$commitMessage"
git tag "$buildVersion-$commitSha"
git push origin master --tags

echo "Finished publishing build artifacts"
