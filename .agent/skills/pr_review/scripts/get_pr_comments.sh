#!/usr/bin/env bash
set -euo pipefail

# get_pr_comments.sh
# Fetches existing inline comments on a PR to avoid duplicate reviews.
# Usage: ./get_pr_comments.sh <PR_NUMBER>

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <PR_NUMBER>"
  exit 1
fi

PR_NUMBER="$1"

# Ensure gh cli is installed
if ! command -v gh &> /dev/null; then
    echo "Error: gh CLI could not be found. Please install and authenticate."
    exit 1
fi

# Get the current repository (e.g., angular/angular)
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# Fetch comments
gh api \
  --paginate \
  -H "Accept: application/vnd.github+json" \
  "/repos/${REPO}/pulls/${PR_NUMBER}/comments" \
  --jq '.[] | {id: .id, path: .path, line: .line, body: .body, user: .user.login}'
