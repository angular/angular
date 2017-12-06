#!/usr/bin/env bash

set -u -e -o pipefail

bazel build --config=ci packages/...
