#! /bin/sh
rm node_modules/traceur
ln -s ../tools/traceur node_modules/traceur

rm node_modules/js2dart
ln -s ../tools/j2dart node_modules/js2dart

cd tools/traceur
npm install

cd ../js2dart
npm install