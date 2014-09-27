#! /bin/sh
git submodule init && git submodule update

rm node_modules/transpiler
ln -s ../tools/transpiler node_modules/transpiler

(cd tools/transpiler; npm install)
