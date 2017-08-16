#!/usr/bin/env bash

set -e -o pipefail

if [ $# -eq 0 ]
  then
    echo "Angular cli integration create project"
    echo
    echo "./ng-cli-create.sh [project-name]"
    echo
else
  TEMP=`dirname $0`
  INTEGRATION_DIR=`(cd $TEMP; pwd)`
  PROJECT=$1
  PROJECT_DIR=$INTEGRATION_DIR/$PROJECT
  NG=$INTEGRATION_DIR/.ng-cli/node_modules/.bin/ng
  (
    echo "==================="
    echo Creating $PROJECT...
    echo "==================="
    cd $INTEGRATION_DIR
    rm -rf $PROJECT
    $NG set --global packageManager=yarn
    $NG new $PROJECT --skip-install
    echo "==================="
    echo $PROJECT created
    echo "==================="
  )


  # By default `ng new` creates a package.json which uses @angular/* from NPM.
  # Instead we want to use them from the current build so we overwrite theme here.
  (
    echo "==================="
    echo Updating $PROJECT bundles
    echo "==================="
    cd $PROJECT_DIR

    sed -i -E 's/ng build/ng build --prod --build-optimizer/g' package.json
    sed -i -E 's/ng test/ng test --single-run/g' package.json
    # workaround for https://github.com/angular/angular-cli/issues/7401
    sed -i -E 's/"@angular\/cli\"\: \".*\"/"@angular\/cli":  "https:\/\/github.com\/angular\/cli-builds"/g' package.json

    yarn add \
      file:../../dist/packages-dist/compiler-cli \
      file:../../dist/packages-dist/language-service \
      --save-dev --skip-integrity-check --emoji

    yarn add \
      file:../../dist/packages-dist/core \
      file:../../dist/packages-dist/common \
      file:../../dist/packages-dist/forms \
      file:../../dist/packages-dist/http \
      --save --skip-integrity-check --emoji

    # yarn bug: can not install all of them in a single command and it has to be broken into separate invocations.
    yarn add \
      file:../../dist/packages-dist/animations \
      file:../../dist/packages-dist/compiler \
      file:../../dist/packages-dist/platform-browser \
      file:../../dist/packages-dist/platform-browser-dynamic \
      --save --skip-integrity-check --emoji

    yarn install --emoji

    echo "==================="
    echo $PROJECT created succesfully
    echo "==================="
  )
fi
