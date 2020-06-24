#!/usr/bin/env node

/**
 * Usage (cli):
 * ```
 * node create-preview <build-number> <job-name> <webhook-url>
 * ```
 *
 * Usage (JS):
 * ```js
 * require('./trigger-webhook').
 *   triggerWebhook(buildNumber, jobName, webhookUrl).
 *   then(...);
 * ```
 *
 * Triggers a notification webhook with CircleCI specific info.
 *
 * It can be used for notifying external servers and trigger operations based on CircleCI job status
 * (e.g. triggering the creation of a preview based on previously stored build atrifacts).
 *
 * The body of the sent payload is of the form:
 * ```json
 * {
 *   "payload": {
 *     "build_num": ${buildNumber}
 *     "build_parameters": {
 *       "CIRCLE_JOB": "${jobName}"
 *     }
 *   }
 * }
 * ```
 *
 * When used from JS, it returns a promise which resolves to an object of the form:
 * ```json
 * {
 *   "statucCode": ${statusCode},
 *   "responseText": "${responseText}"
 * }
 * ```
 *
 * NOTE:
 * - When used from the cli, the command will exit with an error code if the response's status code
 *   is outside the [200, 400) range.
 * - When used from JS, the returned promise will be resolved, even if the response's status code is
 *   outside the [200, 400) range. It is up to the caller to decide how this should be handled.
 */

// Imports
const {request} = require('https');

// Exports
module.exports = {
  triggerWebhook,
};

// Run
if (require.resolve === module) {
  _main(process.argv.slice(2));
}

// Helpers
function _main(args) {
  triggerWebhook(...args)
      .then(
          ({statusCode, responseText}) => (200 <= statusCode && statusCode < 400) ?
              console.log(`Status: ${statusCode}\n${responseText}`) :
              Promise.reject(new Error(`Request failed (status: ${statusCode}): ${responseText}`)))
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
}

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const opts = {method: 'post', headers: {'Content-Type': 'application/json'}};
    const onResponse = res => {
      const statusCode = res.statusCode || -1;
      let responseText = '';

      res.on('error', reject)
          .on('data', d => responseText += d)
          .on('end', () => resolve({statusCode, responseText}));
    };

    request(url, opts, onResponse).on('error', reject).end(JSON.stringify(data));
  });
}

async function triggerWebhook(buildNumber, jobName, webhookUrl) {
  if (!buildNumber || !jobName || !webhookUrl || isNaN(buildNumber)) {
    throw new Error(
        'Missing or invalid arguments.\n' +
        'Expected: buildNumber (number), jobName (string), webhookUrl (string)');
  }

  const data = {
    payload: {
      build_num: +buildNumber,
      build_parameters: {CIRCLE_JOB: jobName},
    },
  };

  return postJson(webhookUrl, data);
}
