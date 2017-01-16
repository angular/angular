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

for PACKAGE in \
  core \
  compiler \
  compiler-cli \
  common \
  http \
  platform-browser \
  platform-server \
  upgrade
do
  DESTDIR=./dist/packages-dist/${PACKAGE}
  echo "====== PUBLISHING: ${DESTDIR} ====="
  npm publish ${DESTDIR} --access public
done
