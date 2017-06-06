#!/bin/bash
set -ex

# This script sets up symlinks needed for building the API docs.
# It assumes that the `angular/angular` repo is in a directory named `angular`
# and that the `angular/angular.io` repo is in the same directory named `angular.io`
# so that the two directories are siblings.

# move to parent directory of this repo
ROOT_DIR=$(cd $(dirname $0)/../..; pwd)
cd $ROOT_DIR

# create symlinks from angular/dist/angular.io/partials/api/angular2 to angular.io/public/docs/js/latest/api
ln -s $ROOT_DIR/angular/dist/angular.io/partials/api/angular2/core $ROOT_DIR/angular.io/public/docs/js/latest/api/core
ln -s $ROOT_DIR/angular/dist/angular.io/partials/api/angular2/http $ROOT_DIR/angular.io/public/docs/js/latest/api/http
ln -s $ROOT_DIR/angular/dist/angular.io/partials/api/angular2/lifecycle_hooks $ROOT_DIR/angular.io/public/docs/js/latest/api/lifecycle_hooks
ln -s $ROOT_DIR/angular/dist/angular.io/partials/api/angular2/router $ROOT_DIR/angular.io/public/docs/js/latest/api/router
ln -s $ROOT_DIR/angular/dist/angular.io/partials/api/angular2/test $ROOT_DIR/angular.io/public/docs/js/latest/api/test
