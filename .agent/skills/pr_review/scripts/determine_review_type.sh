#!/usr/bin/env bash
set -euo pipefail

# determine_review_type.sh <PR_NUMBER>
# Determines if the PR should be reviewed locally or remotely based on author.

if [ -z "$1" ]; then
  echo "Usage: determine_review_type.sh <PR_NUMBER>"
  exit 1
fi

PR_NUMBER=$1

# Get current authenticated user
CURRENT_USER=$(gh api user -q .login 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "Error: Could not determine current GitHub user. Are you logged in to gh?"
  exit 1
fi

# Get PR author
PR_AUTHOR=$(gh pr view "$PR_NUMBER" --json author -q .author.login 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "Error: Could not retrieve PR information for $PR_NUMBER."
  exit 1
fi

if [ "$CURRENT_USER" = "$PR_AUTHOR" ]; then
  echo "local"
else
  echo "remote"
fi
