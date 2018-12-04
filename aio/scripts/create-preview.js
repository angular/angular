#!/usr/bin/env node

/**
 * Usage:
 *   node create-preview <build-number>
 *
 * Triggers the preview server to initiate the preview creation process for the specified CircleCI
 * build number. It must be called _after_ the build artifacts have been created and stored on
 * CircleCI.
 */

// Imports
const {triggerWebhook} = require('../../.circleci/trigger-webhook');

// Constants
const JOB_NAME = 'aio_preview';
const WEBHOOK_URL = 'https://ngbuilds.io/circle-build';

// Input
const buildNumber = process.argv[2];

// Run
triggerWebhook(buildNumber, JOB_NAME, WEBHOOK_URL).
  then(({statusCode, responseText}) => isSuccess(statusCode) ?
    console.log(`Status: ${statusCode}\n${responseText}`) :
    Promise.reject(new Error(`Request failed (status: ${statusCode}): ${responseText}`))).
  catch(err => {
    console.error(err);
    process.exit(1);
  });

// Helpers
function isSuccess(statusCode) {
  // Getting a 409 response from the preview server means that the preview has already been created
  // for the corresponding PR/SHA, so our objective has been accomplished.
  return (200 <= statusCode && statusCode < 400) || (statusCode === 409);
}
