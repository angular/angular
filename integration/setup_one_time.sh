#!/usr/bin/env bash

# Execute this script once
# - after `EXPERIMENTAL_ES2015_DISTRO=1 <angular>/build.sh has been executed`
# - before compiling any folder using `build_folder.sh`

set -e -o pipefail

cd `dirname $0`

rm -rf node_modules
mkdir node_modules
rm -rf rxjs

# Node packages which are installed in the angular project and just needed to be linked over
for PACKAGE in \
  zone.js
do
  ln -s ../../node_modules/${PACKAGE} node_modules/${PACKAGE}
done

# Link ES6 @angular packages
mkdir node_modules/@angular
for PACKAGE in \
  common \
  compiler \
  compiler-cli \
  core \
  forms \
  http \
  platform-browser \
  platform-browser-dynamic \
  platform-server \
  router \
  upgrade
do
  rsync -r  ../dist/packages-dist-es2015/${PACKAGE} node_modules/@angular/
done

# Node packages which are created in tools
rsync -r  ../dist/tools/@angular/tsc-wrapped node_modules/@angular/

mkdir node_modules/.bin
ln -s  ../@angular/compiler-cli/src/main.js node_modules/.bin/ngc
chmod +x node_modules/.bin/ngc

# Create an ES6 package for RxJS
git clone https://github.com/ReactiveX/rxjs.git --depth=200
git -C rxjs/ checkout 5.0.3
cp rxjs.tsconfig.json rxjs/
TSC="node --max-old-space-size=3000 ../dist/tools/@angular/tsc-wrapped/src/main"
$TSC -p rxjs/rxjs.tsconfig.json

npm i
