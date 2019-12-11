/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// tslint:disable:no-console
import {execSync} from 'child_process';
import {parseLogFiles} from './parse-bazel-log-files';

let bazelProcessResultCode = 0;
const MEASURABLE_BAZEL_COMMANDS = ['build', 'run', 'test'];
const DIAGNOSTICS_FLAG = '--diagnostics';
const LOG_FILE_PATH = `/tmp/execution_log.json`;
const EXPLAIN_FILE_PATH = `/tmp/explain_log.log`;
const bazelCommand = process.argv[2] || '';
const allParameters = process.argv.slice(3);
const santizedBazelParameters =
    allParameters.filter(param => param !== DIAGNOSTICS_FLAG).map(a => `"${a}"`).join(' ');
let showDiagnostics = !!(
  allParameters.find(param => param === DIAGNOSTICS_FLAG) ||
  process.env['CI'] ||
  process.env['SHOW_BAZEL_DIAGNOSTICS']
);


async function runBazel() {
  // If the diagnostics flag is provided and the bazel command run can't be measured, exit early.
  if (showDiagnostics && !MEASURABLE_BAZEL_COMMANDS.includes(bazelCommand)) {
    console.info();
    console.error(`"${bazelCommand}" bazel command's diagnostics is unable to be measured,.`);
    console.error(`running without diagnostic reporting.`);
    console.info();
    showDiagnostics = false;
  }

  // If diagnostics are not being measured, just run the bazel command as requested
  if (!showDiagnostics) {
    try {
      execSync(
          `node_modules/.bin/bazel ${bazelCommand} ${santizedBazelParameters}`, {stdio: 'inherit'});
    } catch (error) {
      process.exit(error.status);
    }
    process.exit();
  }

  // Run the bazel command with the additional logging needed to get diagnostic information
  try {
    execSync(
        `node_modules/.bin/bazel ${bazelCommand} \
        --execution_log_json_file=${LOG_FILE_PATH} \
        --explain=${EXPLAIN_FILE_PATH} \
        ${santizedBazelParameters}`,
        {stdio: 'inherit'});
  } catch (error) {
    if (error.signal === 'SIGINT') {
      process.exit(error.status);
    }
    bazelProcessResultCode = error.status;
  }

  console.log(`┌────────────────────────────────────────────────────────┐`);
  console.log(`│                  Bazel Diagnostic Info                 │`);
  console.log(`└────────────────────────────────────────────────────────┘`);
  await parseLogFiles(LOG_FILE_PATH, EXPLAIN_FILE_PATH);
  process.exit(bazelProcessResultCode);
}

runBazel();
