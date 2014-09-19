#! /bin/sh
git submodule init && git submodule update

rm node_modules/traceur
ln -s ../tools/traceur node_modules/traceur

rm node_modules/js2dart
ln -s ../tools/js2dart node_modules/js2dart

(cd tools/traceur; npm install)

(cd tools/js2dart; npm install)
