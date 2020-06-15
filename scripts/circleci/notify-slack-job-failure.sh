#!/usr/bin/env bash

# Script that notifies Slack about the currently failing job. This script
# will be a noop when running for forked builds (i.e. PRs).

if [[ -n "${CIRCLE_PR_NUMBER}" ]]; then
  echo "Skipping notification for pull request."
  exit 0
fi

message="\`${CIRCLE_JOB}\` failed in branch: ${CIRCLE_BRANCH}: ${CIRCLE_BUILD_URL}"
data="{\"text\": \"${message}\"}"

curl --request POST --header "Content-Type: application/json" --data "${data}" \
  ${SLACK_COMPONENTS_CI_FAILURES_WEBHOOK_URL}

echo "Notified Slack about job failure."
