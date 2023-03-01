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

# sedi makes `sed -i` work on both OSX & Linux
# See https://stackoverflow.com/questions/2320564/i-need-my-sed-i-command-for-in-place-editing-to-work-with-both-gnu-sed-and-bsd
_sedi () {
  case $(uname) in
    Darwin*) sedi=('-i' '') ;;
    *) sedi=('-i') ;;
  esac

  sed "${sedi[@]}" "$@"
}

yarn bazel build --config=release //packages/language-service:npm_package
pushd "${extension_repo}"
rm -rf .angular_packages/language-service
mkdir -p .angular_packages/language-service
cp -r "${bazel_bin}/packages/language-service/npm_package/" .angular_packages/language-service
chmod -R +w .angular_packages/language-service
cat <<EOT >> .angular_packages/language-service/BUILD.bazel
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
npm_package(
  name = "language-service",
  srcs = glob(["**"], exclude = ["BUILD.bazel"]),
  visibility = ["//visibility:public"],
)
EOT
_sedi 's#\# PLACE_HOLDER_FOR_angular/angular_packages/language-service/build.sh#"//.angular_packages/language-service:package.json", \# FOR TESTING ONLY! DO NOT COMMIT THIS LINE!#' WORKSPACE
yarn add @angular/language-service@file:".angular_packages/language-service"
popd
