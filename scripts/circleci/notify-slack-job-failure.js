#!/usr/bin/env node

/**
 * Script that notifies Slack about the currently failing job. This script
 * will be a noop when running for forked builds (i.e. PRs).
 */

if (process.env.CIRCLE_PR_NUMBER) {
  console.info('Skipping notifications for pull requests.');
  process.exit(0);
}

const {echo, set} = require('shelljs');
const {
  CIRCLE_JOB: jobName,
  CIRCLE_BRANCH: branchName,
  CIRCLE_BUILD_URL: jobUrl,
  SLACK_COMPONENTS_CI_FAILURES_WEBHOOK_URL: webhookUrl,
} = process.env;

const text = `\`${jobName}\` failed in branch: ${branchName}: ${jobUrl}`;
const payload = {text};
const [channelName] = process.argv.slice(2);

set('-e');

// If an explicit channel has been specified, override the default
// webhook channel to the specified one.
if (channelName !== undefined) {
  payload.channel = channelName;
}

echo(JSON.stringify(payload, null, 2)).exec(
  `curl -d@- -H "Content-Type: application/json" ${webhookUrl}`,
);
console.info('Notified Slack about job failure.');
