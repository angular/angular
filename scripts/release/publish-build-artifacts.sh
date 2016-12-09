#!/bin/bash

# Script to publish the build artifacts to a GitHub repository.
# Builds will be automatically published once new changes are made to the repository.

# Go to the project root directory
cd $(dirname $0)/../..

buildDir="dist/@angular/material"
buildVersion=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' package.json)

commitSha=$(git rev-parse --short HEAD)
commitAuthor=$(git --no-pager show -s --format='%an <%ae>' HEAD)
commitMessage=$(git log --oneline | head -n1)

repoName="material-builds"
repoUrl="http://github.com/DevVersion/material-builds.git"
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
cd $repoDir &&

# Setup the git repository authentication.
git config credential.helper "store --file=.git/credentials" &&
echo "$MATERIAL2_BUILDS_TOKEN" > .git/credentials

git add -A &&
git commit -m "$commitMessage" --author "$commitAuthor" &&
git tag "$buildVersion-$commitSha" &&
git push origin master --tags

echo "Finished publishing build artifacts"
