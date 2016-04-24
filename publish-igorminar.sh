#!/usr/bin/env bash

set -ex

cd `dirname $0`
./build.sh

echo "====== RENAMING @angular to @igorminar ======"
find ./dist/packages-dist/ -type f -print0 | xargs -0 sed -i '' 's/\@angular/\@igorminar/g'

for PACKAGE in \
  core \
  compiler \
  common \
  http \
  platform-browser \
  platform-server \
  router \
  testing \
  upgrade
do
  DESTDIR=./dist/packages-dist/${PACKAGE}
  echo "====== PUBLISHING: ${DESTDIR} ====="
  npm publish ${DESTDIR} --access public
done
