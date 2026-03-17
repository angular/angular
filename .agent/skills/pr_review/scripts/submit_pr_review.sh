#!/usr/bin/env bash
set -euo pipefail

# submit_pr_review.sh
# Submits a batched PR review using comments previously staged by post_inline_comment.sh
# Usage: ./submit_pr_review.sh <PR_NUMBER> <EVENT_TYPE> [BODY]
# EVENT_TYPE must be COMMENT, APPROVE, or REQUEST_CHANGES

if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <PR_NUMBER> <EVENT_TYPE> [BODY]"
  echo "EVENT_TYPE must be COMMENT, APPROVE, or REQUEST_CHANGES"
  exit 1
fi

PR_NUMBER="$1"
EVENT="$2"
BODY="${3:-}"
COMMENT_FILE="/tmp/angular_pr_${PR_NUMBER}_comments.json"

if ! command -v gh &> /dev/null; then
    echo "Error: gh CLI could not be found. Please install and authenticate."
    exit 1
fi

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

# Check if there are staged comments
COMMENTS="[]"
if [ -f "$COMMENT_FILE" ]; then
  COMMENTS=$(cat "$COMMENT_FILE")
fi

echo "Submitting review for PR #${PR_NUMBER}..."

# Create the payload
PAYLOAD_FILE="/tmp/angular_pr_${PR_NUMBER}_payload.json"
jq -n --arg event "$EVENT" --arg body "$BODY" --argjson comments "$COMMENTS" \
  '{event: $event, body: $body, comments: $comments}' > "$PAYLOAD_FILE"

# Post the review using the GitHub Pull Request Reviews API
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "/repos/${REPO}/pulls/${PR_NUMBER}/reviews" \
  --input "$PAYLOAD_FILE"

echo "Review submitted successfully!"
rm -f "$COMMENT_FILE"
rm -f "$PAYLOAD_FILE"
