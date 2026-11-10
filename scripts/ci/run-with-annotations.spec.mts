/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {describe, it} from 'node:test';
import {fileURLToPath} from 'node:url';

const script = fileURLToPath(new URL('./run-with-annotations.mts', import.meta.url));

/** Runs the wrapper around a child process which prints `output` and exits with `exitCode`. */
function run(output: string, exitCode: number) {
  return spawnSync(
    process.execPath,
    [
      script,
      process.execPath,
      '-e',
      'process.stdout.write(process.env.OUT); process.exit(+process.env.CODE)',
    ],
    {encoding: 'utf8', env: {...process.env, OUT: output, CODE: String(exitCode)}},
  );
}

function annotations(stdout: string): string[] {
  return stdout.split('\n').filter((line) => line.startsWith('::error'));
}

// Trimmed from the log of a real failure of `pnpm test:ci` on the main branch.
const BAZEL_TEST_OUTPUT = [
  '[35,124 / 35,150] 840 / 863 tests; Testing //packages/core/test/resource:resource_web_chromium; 59s remote, remote-cache ... (24 actions, 13 running)',
  '\x1b[31m\x1b[1mFAIL: \x1b[0m//packages/core/test/bundling/http:symbol_test (Exit 1) (see /home/runner/.cache/bazel/testlogs/packages/core/test/bundling/http/symbol_test/test.log)',
  '\x1b[31m\x1b[1mFAILED: \x1b[0m//packages/core/test/bundling/http:symbol_test (Summary)',
  '==================== Test output for //packages/core/test/bundling/http:symbol_test:',
  '   Symbol: abortReason => 1 missing in golden file.',
  'TEST FAILED!',
  '================================================================================',
  '\x1b[35mFLAKY: \x1b[0m//packages/core/test/webmcp:webmcp_firefox (Summary)',
  '==================== Test output for //packages/core/test/webmcp:webmcp_firefox:',
  ' ❌ webmcp > should register tools',
  '================================================================================',
  'INFO: Build completed, 1 test FAILED, 30811 total actions',
  '//packages/core/test:test                                       \x1b[0m\x1b[32m(cached) PASSED\x1b[0m in 12.3s',
  '//packages/core/test/webmcp:webmcp_firefox                                \x1b[0m\x1b[35mFLAKY\x1b[0m, failed in 1 out of 2 in 17.6s',
  '//packages/core/test/bundling/http:symbol_test                           \x1b[0m\x1b[31m\x1b[1mFAILED\x1b[0m in 3 out of 3 in 2.1s',
  '//packages/router/test:test_web_firefox                                  \x1b[0m\x1b[31m\x1b[1mTIMEOUT\x1b[0m in 300.0s',
  '',
  'Executed 265 out of 863 tests: 861 tests pass and \x1b[0m\x1b[31m\x1b[1m2 fail remotely\x1b[0m.',
  '\x1b[0m[ELIFECYCLE] Command failed with exit code 3.',
].join('\r\n');

describe('run-with-annotations', () => {
  it('passes through output and emits nothing when the command succeeds', () => {
    const result = run('OK\n', 0);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, 'OK\n');
  });

  it('lists failed Bazel targets with test output excerpts while ignoring passed flaky targets', () => {
    const result = run(BAZEL_TEST_OUTPUT, 3);
    assert.equal(result.status, 3);
    const [annotation, ...rest] = annotations(result.stdout);
    assert.equal(rest.length, 0);
    assert.match(annotation, /^::error title=.*2 Bazel target\(s\) failed::/);
    assert.equal(
      annotation.split('::')[2],
      '//packages/core/test/bundling/http:symbol_test FAILED%0A' +
        '     Symbol: abortReason => 1 missing in golden file.%0A' +
        '  TEST FAILED!%0A' +
        '//packages/router/test:test_web_firefox TIMEOUT',
    );
  });

  it('includes compiler diagnostics alongside FAILED TO BUILD targets', () => {
    const result = run(
      [
        "packages/core/src/index.ts:12:5 - error TS2322: Type 'string' is not assignable.",
        'ERROR: /workspace/packages/core/BUILD.bazel:10:1: Compiling TypeScript failed',
        '//packages/core:core                                            FAILED TO BUILD',
      ].join('\n'),
      1,
    );
    assert.equal(result.status, 1);
    const [annotation] = annotations(result.stdout);
    assert.equal(
      annotation.split('::')[2],
      '//packages/core:core FAILED TO BUILD%0A' +
        "packages/core/src/index.ts:12:5 - error TS2322: Type 'string' is not assignable.%0A" +
        'ERROR: /workspace/packages/core/BUILD.bazel:10:1: Compiling TypeScript failed',
    );
  });

  it('falls back to the end of the output, without Bazel progress lines', () => {
    const result = run(
      [
        'ERROR: packages/core/BUILD.bazel:10:1: Compiling TypeScript failed',
        '[1,234 / 5,000] Compiling something else',
        'ERROR: Build did NOT complete successfully',
      ].join('\n'),
      1,
    );
    assert.equal(result.status, 1);
    assert.deepEqual(
      annotations(result.stdout).map((a) => a.split('::')[2]),
      [
        'ERROR: packages/core/BUILD.bazel:10:1: Compiling TypeScript failed%0A' +
          'ERROR: Build did NOT complete successfully',
      ],
    );
  });

  it('bounds long annotation titles and bodies safely below GitHub limits', () => {
    const longOutput = Array.from({length: 60}, (_, i) => `//pkg:target_${i} FAILED`).join('\n');
    const longArg = 'x'.repeat(300);
    const result = spawnSync(
      process.execPath,
      [
        script,
        process.execPath,
        '-e',
        'process.stdout.write(process.env.OUT); process.exit(1)',
        longArg,
      ],
      {encoding: 'utf8', env: {...process.env, OUT: longOutput}},
    );
    assert.equal(result.status, 1);
    const [annotation] = annotations(result.stdout);
    const [, header, body] = annotation.split('::');
    const escapedTitle = header.slice('error title='.length);
    assert.equal(escapedTitle.length <= 255, true);
    assert.equal(body.length <= 4000, true);
  });

  it('exits non-zero and emits ::error when the wrapped command fails to spawn', () => {
    const result = spawnSync(process.execPath, [script, 'nonexistent-binary-angular-ci-test'], {
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    const [annotation] = annotations(result.stdout);
    assert.match(
      annotation,
      /^::error title=nonexistent-binary-angular-ci-test failed::Failed to run/,
    );
  });

  it('does not emit an annotation when the run is cancelled', async () => {
    const child = spawn(process.execPath, [
      script,
      process.execPath,
      '-e',
      "process.on('SIGTERM', () => process.exit(8)); console.log('//pkg:test  FAILED in 1.0s'); setInterval(() => {}, 1000)",
    ]);
    let stdout = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    await once(child.stdout, 'data');
    child.kill('SIGTERM');
    const [code] = await once(child, 'close');
    assert.equal(code, 8);
    assert.deepEqual(annotations(stdout), []);
  });
});
