#!/bin/bash

# ANSI code variables which can be used to print a colored message.
RED='\033[0;31m'
YELLOW='\033[0;33m'

yarn -s bazel:format-lint || {
  echo ""
  echo -e "${RED}Please fix all warnings. Some warnings can" \
    "be fixed automatically by running: ${YELLOW}yarn format:bazel"
  exit 1
}
