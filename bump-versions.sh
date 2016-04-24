#!/usr/bin/env bash

cd `dirname $0`

for PACKAGE in \
  core \
  compiler \
  common \
  http \
  platform-browser \
  platform-server
do
  SRCDIR=./modules/angular2/${PACKAGE}
  echo "====== BUMPING version for: ${SRCDIR} ====="
  cd ${SRCDIR}
  npm version patch
  cd ../../..
done
