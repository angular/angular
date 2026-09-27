#!/usr/bin/env bash
set -euo pipefail

# determine_review_type.sh <PR_NUMBER>
# Determines if the PR should be reviewed locally or remotely based on author.

if [ "$#" -lt 1 ] || [ -z "$1" ]; then
  echo "Usage: $0 <PR_NUMBER>" >&2
  exit 1
fi

PR_NUMBER="$1"

# Ensure gh cli is installed
if ! command -v gh &> /dev/null; then
    echo "Error: gh CLI could not be found. Please install and authenticate." >&2
    exit 1
fi

# Get current authenticated user
if ! CURRENT_USER=$(gh api user -q .login); then
  echo "Error: Could not determine current GitHub user. Are you logged in to gh?" >&2
  exit 1
fi

# Get PR author. `--` keeps a leading dash in the argument from being read as a flag.
if ! PR_AUTHOR=$(gh pr view --json author -q .author.login -- "$PR_NUMBER"); then
  echo "Error: Could not retrieve PR information for $PR_NUMBER." >&2
  exit 1
fi

if [ "$CURRENT_USER" = "$PR_AUTHOR" ]; then
  echo "local"
else
  echo "remote"
fi
