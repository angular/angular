#!/usr/bin/env bash

set -eux -o pipefail

function installLocalPackages() {
  # Install Angular packages that are built locally from HEAD.
  # This also gets around the bug whereby yarn caches local `file://` urls.
  # See https://github.com/yarnpkg/yarn/issues/2165
  readonly pwd=$(pwd)
  readonly packages=(
    animations common compiler core forms platform-browser
    platform-browser-dynamic router elements compiler-cli language-service
  )
  local local_packages=()
  for package in "${packages[@]}"; do
    local_packages+=("@angular/${package}@file:${pwd}/../../../dist/packages-dist/${package}")
  done

  # keep typescript, tslib, and @types/node versions in sync with the ones used in this repo
  local_packages+=("typescript@file:${pwd}/../../../node_modules/typescript")
  local_packages+=("tslib@file:${pwd}/../../../node_modules/tslib")
  local_packages+=("@types/node@file:${pwd}/../../../node_modules/@types/node")

  yarn add --ignore-scripts --silent "${local_packages[@]}"
}


function test() {
  # Set up
  ng version
  rm -rf demo
  # Create project
  ng new demo --skip-git --skip-install --style=css
  cd demo
  ng add @angular/elements
  installLocalPackages
  ng build
}

test
