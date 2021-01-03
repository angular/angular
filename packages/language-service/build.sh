#!/bin/bash
set -ex

# This script is used for building the @angular/language-service package locally
# so that it can be consumed by the Angular extension for local development.
# Usage: ./build.sh /path/to/vscode-ng-language-service

readonly bazel_bin=$(yarn run -s bazel info bazel-bin)
readonly extension_repo="$1"

if [[ -z "${extension_repo}" ]]; then
  echo "Please provide path to the vscode-ng-language-service repo"
  exit 1
fi

yarn bazel build --config=release //packages/language-service:npm_package
pushd "${extension_repo}"
yarn add @angular/language-service@file:"${bazel_bin}/packages/language-service/npm_package"
popd
