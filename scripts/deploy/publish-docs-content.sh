#!/bin/bash

# Publish material2 docs assets to the material2-docs-content repo
# material.angular.io will pull from this assets repo to get the latest docs

# The script should immediately exit if any command in the script fails.
set -e

cd "$(dirname $0)/../../"

if [ -z ${MATERIAL2_DOCS_CONTENT_TOKEN} ]; then
  echo "Error: No access token for GitHub could be found." \
       "Please set the environment variable 'MATERIAL2_DOCS_CONTENT_TOKEN'."
  exit 1
fi

docsPath="./dist/docs"
packagePath="./dist/releases/material-examples"
repoPath="/tmp/material2-docs-content"
repoUrl="https://github.com/angular/material2-docs-content"
examplesSource="./dist/docs/examples"

if [[ ! ${*} == *--no-build* ]]; then
  $(npm bin)/gulp material-examples:build-release:clean
  $(npm bin)/gulp docs
fi

# Get git meta info for commit
commitSha="$(git rev-parse --short HEAD)"
commitAuthorName="$(git --no-pager show -s --format='%an' HEAD)"
commitAuthorEmail="$(git --no-pager show -s --format='%ae' HEAD)"
commitMessage="$(git log --oneline -n 1)"

# create directory and clone test repo
rm -rf $repoPath
mkdir -p $repoPath
git clone $repoUrl $repoPath --depth 1

# Clean out repo directory and copy contents of dist/docs into it
rm -rf $repoPath/*

# Create folders that will contain docs content files.  
mkdir $repoPath/{overview,guides,api,examples,plunker,examples-package}

# Copy api files over to $repoPath/api
cp -r $docsPath/api/* $repoPath/api

# Copy the material-examples package to the docs content repository.
cp -r $packagePath/* $repoPath/examples-package

# Flatten the markdown docs structure and move it into $repoPath/overview
overviewFiles=$docsPath/markdown/
for filename in $overviewFiles*
do
  if [ -d $filename ]; then
    for _ in $filename/*
    do
      markdownFile=${filename#$overviewFiles}.html
      # Filename should be same as folder name with .html extension
      if [ -e $filename/$markdownFile ]; then
        cp -r $filename/$markdownFile $repoPath/overview/
      fi
    done
  fi
done

# Copy guide files over to $repoPath/guides
for filename in $overviewFiles*
do
  if [ -f $filename ]; then
    cp -r $filename $repoPath/guides
  fi
done

# Copy highlighted examples into $repoPath
cp -r $examplesSource/* $repoPath/examples

# Copy example plunker assets
cp -r $docsPath/plunker/* $repoPath/plunker

# Copies assets over to the docs-content repository.
cp LICENSE $repoPath/

# Push content to repo
cd $repoPath
git config user.name "$commitAuthorName"
git config user.email "$commitAuthorEmail"
git config credential.helper "store --file=.git/credentials"

echo "https://${MATERIAL2_DOCS_CONTENT_TOKEN}:@github.com" > .git/credentials

git add -A
git commit --allow-empty -m "$commitMessage"
git tag "$commitSha"
git push origin master --tags
