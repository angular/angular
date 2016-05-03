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

echo "====== RENAMING \$\$ANGULAR_VERSION\$\$ to 0.0.0-${VERSION} ======"
find ./dist/packages-dist/ -type f -name package.json -print0 | xargs -0 sed -i '' "s/\\\$\\\$ANGULAR_VERSION\\\$\\\$/2.0.0-rc.${VERSION}/g"

for PACKAGE in \
  core \
  compiler \
  common \
  http \
  platform-browser \
  platform-browser-dynamic \
  platform-server \
  router \
  router-deprecated \
  upgrade
do
  DESTDIR=./dist/packages-dist/${PACKAGE}
  echo "====== PUBLISHING: ${DESTDIR} ====="
  npm publish ${DESTDIR} --access public
done
