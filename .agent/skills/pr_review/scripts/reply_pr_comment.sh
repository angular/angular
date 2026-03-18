#!/usr/bin/env bash
set -euo pipefail

# reply_pr_comment.sh <PR_NUMBER> <COMMENT_ID> <REPLY_BODY>
# Replies to an existing PR comment thread. Note: COMMENT_ID must be the ID of the top-level comment in the thread you are replying to.

if [ "$#" -lt 3 ]; then
  echo "Usage: reply_pr_comment.sh <PR_NUMBER> <COMMENT_ID> <REPLY_BODY>"
  exit 1
fi

PR_NUMBER="$1"
COMMENT_ID="$2"
BODY="$3"

# Ensure gh cli is installed
if ! command -v gh &> /dev/null; then
    echo "Error: gh CLI could not be found. Please install and authenticate."
    exit 1
fi

# Get the current repository (e.g., angular/angular)
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# Reply to the thread using the provided comment ID
gh api \
  --silent \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/pulls/${PR_NUMBER}/comments/${COMMENT_ID}/replies" \
  -f body="$BODY"
