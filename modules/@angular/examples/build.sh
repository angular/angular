#!/usr/bin/env bash

set -e -o pipefail

#
# This script is used to compile and copy the contents for each of
# example directories over to the dist/examples directory so that they
# can be tested with karma and protractor. The `gulp serve-examples` command
# can be used to run each of the examples in isolation via http as well.
#

cd `dirname $0`

DIST="../../../dist/examples";
rm -rf -- $DIST
$(npm bin)/tsc -p ./tsconfig-build.json

mkdir $DIST/vendor/

ln -s ../../../dist/packages-dist/ $DIST/vendor/@angular

for FILE in \
    ../../../node_modules/zone.js/dist/zone.js \
    ../../../node_modules/systemjs/dist/system.js \
    ../../../node_modules/reflect-metadata/Reflect.js \
    ../../../node_modules/rxjs
do
  ln -s $FILE $DIST/vendor/`basename $FILE`
done

for MODULE in `find . -name module.ts`; do
  FINAL_DIR_PATH=$DIST/`dirname $MODULE`

  echo "==== $MODULE"
  cp _common/*.html $FINAL_DIR_PATH
  cp $DIST/_common/*.js $FINAL_DIR_PATH
  cp $DIST/_common/*.js.map $FINAL_DIR_PATH
done
