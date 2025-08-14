#!/usr/bin/env bash

set -euo pipefail

readonly BAZEL_FLAGS="--curses yes --color yes --show_progress_rate_limit 5"

# Install dependencies.
apt-get update -qq
apt-get install -y -qq curl git zip

# Install Node.
readonly NODE_VERSION="$(cat .nvmrc)"
readonly NODE_MAJOR="$(echo ${NODE_VERSION} | cut -d '.' -f 1)"
curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
readonly NODE_PKG_VERSION="$(
    apt list -a nodejs 2> /dev/null |
    grep "${NODE_VERSION}" |
    awk '{print $2}' |
    head -n 1
)"
apt-get install -y -qq "nodejs=${NODE_PKG_VERSION}"

# Install the workspace.
npm install -g pnpm
pnpm install --frozen-lockfile

# Build Chrome.
echo "Building for Chrome..."
pnpm run devtools:build:chrome:release ${BAZEL_FLAGS}
zip -r ./devtools-chrome.zip dist/bin/devtools/projects/shell-browser/src/prodapp/*

# Build Firefox.
echo "Building for Firefox..."
pnpm devtools:build:firefox:release ${BAZEL_FLAGS}
zip -r ./devtools-firefox.zip dist/bin/devtools/projects/shell-browser/src/prodapp/*
