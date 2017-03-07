#!/usr/bin/env bash

set -ex

cd $(dirname $0)/../../..
ROOTDIR=$(pwd)
SRCDIR=${ROOTDIR}/packages/benchpress
DESTDIR=${ROOTDIR}/dist/packages-dist/benchpress

rm -fr ${DESTDIR}

echo "====== BUILDING... ====="
./build.sh --packages=core,benchpress --bundle=false

echo "====== PUBLISHING: ${DESTDIR} ====="
npm publish ${DESTDIR} --access public
