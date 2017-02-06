#!/bin/bash

# Publish material2 docs assets to the material2-docs-content repo
# material.angular.io will pull from this assets repo to get the latest docs

cd "$(dirname $0)/../../"

docsPath="/dist/docs"
repoPath="/tmp/material2-docs-content"
repoUrl="https://github.com/DevVersion/material2-docs-content"

# If the docs directory is not present, generate docs
if [ ! -d $docsPath ]; then
  $(npm bin)/gulp docs
fi

# Get git meta info for commit
commitSha="$(git rev-parse --short HEAD)"
commitAuthorName="$(git --no-pager show -s --format='%an' HEAD)"
commitAuthorEmail="$(git --no-pager show -s --format='%ae' HEAD)"
commitMessage="$(git log --oneline -n 1)"

# create directory and clone test repo
rm -rf "/tmp/"
mkdir "/tmp/" $repoPath
git clone $repoUrl $repoPath

# Clean out repo directory and copy contents of dist/docs into it
rm -rf $repoPath/*
mkdir $repoPath/overview
mkdir $repoPath/guides
mkdir $repoPath/api
# mkdir $repoPath/examples

# Move api files over to $repoPath/api
cp -r $docsPath/api/* $repoPath/api

# Move guide files over to $repoPath/guides
for filename in $overviewFiles*
do
  if [ -f $filename ]; then
    cp -r $filename $repoPath/guides
  fi
done

# Flatten the markdown docs structure and move it into $repoPath/overview
overviewFiles=$docsPath/markdown/
targetFile="OVERVIEW.html"
for filename in $overviewFiles*
do
  if [ -d $filename ]; then
    for _ in $filename/*
    do
      if [ -f $filename/$targetFile ]; then
        name=${filename#$overviewFiles}
        cp -r $filename/$targetFile $repoPath/overview/
        mv $repoPath/overview/$targetFile $repoPath/overview/$name.html
      fi
    done
  fi
done

# src/examples should be added to the $repoPath after they have been moved into
# the material2 repo from material.angular.io

# Push content to repo
cd $repoPath
git config user.name "$commitAuthorName"
git config user.email "$commitAuthorEmail"
git config credential.helper "store --file=.git/credentials"

echo "https://${MATERIAL2_BUILDS_TOKEN}:@github.com" > .git/credentials

git add -A
git commit -m "$commitMessage"
git tag "$commitSha"
git push origin master --tags
