#!/usr/bin/env bash

cd `dirname $0 `

for PACKAGE in \
  core \
  compiler \
  common \
  http \
  platform-browser \
  platform-server
do
  DESTDIR=./dist/packages-dist/${PACKAGE}
  echo "====== PUBLISHING: ${DESTDIR} ====="
  npm publish ${DESTDIR} --access public
done
