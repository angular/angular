#!/bin/sh
# Install bazel remote cache proxy
# This is temporary until the feature is no longer experimental on CircleCI.
# See remote cache documentation in /docs/BAZEL.md

set -u -e

readonly DOWNLOAD_URL="https://5-116431813-gh.circle-artifacts.com/0/pkg/bazel-remote-proxy-$(uname -s)_$(uname -m)"

curl --fail -o ~/bazel-remote-proxy "$DOWNLOAD_URL"
chmod +x ~/bazel-remote-proxy
