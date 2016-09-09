#!/bin/sh

#
# This script is used to compile and copy the contents for each of
# example directories over to the dist/examples directory so that they
# can be tested with karma and protractor. The `gulp serve-examples` command
# can be used to run each of the examples in isolation via http as well.
#

cd `dirname $0`

DIST="../../../dist/examples";
rm -rf -- $DIST
$(npm bin)/tsc -p .

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
  SOURCE_DIR_PATH=`dirname $MODULE`
  FINAL_DIR_PATH=$DIST/$SOURCE_DIR_PATH

  echo "==== $MODULE"
  cp _common/*.html $FINAL_DIR_PATH
  cp _common/shared.css $FINAL_DIR_PATH

  cp $DIST/_common/*.js $FINAL_DIR_PATH
  cp $DIST/_common/*.js.map $FINAL_DIR_PATH

  SOURCE_EXAMPLE_STYLES="$SOURCE_DIR_PATH/styles.css"
  FINAL_EXAMPLE_STYLES="$FINAL_DIR_PATH/styles.css"
  if [ -f $SOURCE_EXAMPLE_STYLES ]; then
    cp $SOURCE_EXAMPLE_STYLES $FINAL_EXAMPLE_STYLES
  else
    touch $FINAL_EXAMPLE_STYLES
  fi
done
