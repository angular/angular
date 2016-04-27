#!/usr/bin/env bash

set -ex

cd `dirname $0`

VERSION=$1

if [[ "${VERSION}" == "" ]]
then
  echo "Version number required"
  exit 1
fi

./build.sh

echo "====== RENAMING @angular to @igorminar ======"
find ./dist/packages-dist/ -type f -print0 | xargs -0 sed -i '' 's/\@angular/\@igorminar/g'

echo "====== RENAMING @angular to @igorminar ======"
find ./dist/packages-dist/ -type f -name package.json -print0 | xargs -0 sed -i '' "s/\\\$\\\$ANGULAR_VERSION\\\$\\\$/${VERSION}/g"

for PACKAGE in \
  core \
  compiler \
  common \
  http \
  platform-browser \
  platform-browser-dynamic \
  platform-server \
  router \
  testing \
  upgrade
do
  DESTDIR=./dist/packages-dist/${PACKAGE}
  echo "====== PUBLISHING: ${DESTDIR} ====="
  npm publish ${DESTDIR} --access public
done
