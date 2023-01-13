#!/usr/bin/env bash

set -eu -o pipefail

rm -rf built/ webpack-out/

ngc

# This is to mainly copy the index.html to be packaged into the server.
cp -r src/* built/src

# Bundle the server which hosts all the server side apps.
webpack --config webpack.server.config.mjs

# Bundle the clients into individual bundles.
webpack --config webpack.client.config.mjs
