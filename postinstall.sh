#! /bin/sh
git submodule init && git submodule update

rm node_modules/js2dart
ln -s ../tools/js2dart node_modules/js2dart

(cd tools/js2dart; npm install)
