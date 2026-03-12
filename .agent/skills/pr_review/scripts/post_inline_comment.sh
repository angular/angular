#!/usr/bin/env bash
set -euo pipefail

# post_inline_comment.sh
# Adds an inline comment to a specific line in a PR via the GitHub API.
# Usage: ./post_inline_comment.sh <PR_NUMBER> <FILE_PATH> <LINE_NUMBER> <COMMENT_BODY>

if [ "$#" -lt 4 ]; then
  echo "Usage: $0 <PR_NUMBER> <FILE_PATH> <LINE_NUMBER> <COMMENT_BODY>"
  exit 1
fi

PR_NUMBER="$1"
FILE_PATH="$2"
LINE="$3"
BODY="$4"

# Ensure gh cli is installed
if ! command -v gh &> /dev/null; then
    echo "Error: gh CLI could not be found. Please install and authenticate."
    exit 1
fi

# Get the current repository (e.g., angular/angular)
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

echo "Staging inline comment for PR #${PR_NUMBER} on ${FILE_PATH}:${LINE}..."

COMMENT_FILE="/tmp/angular_pr_${PR_NUMBER}_comments.json"
if [ ! -f "$COMMENT_FILE" ]; then
  echo "[]" > "$COMMENT_FILE"
fi

# Append the new comment to the JSON array
jq --arg path "${FILE_PATH}" --argjson line "${LINE}" --arg body "${BODY}" \
  '. += [{"path": $path, "line": $line, "body": $body}]' "$COMMENT_FILE" > "${COMMENT_FILE}.tmp" && mv "${COMMENT_FILE}.tmp" "$COMMENT_FILE"

echo "Comment successfully staged locally. Remember to call submit_pr_review.sh when finished to publish all comments as a single review!"
