/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {describe, it} from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {
  collectAnnotations,
  collectFromBep,
  collectFromTestlogs,
  formatWorkflowCommands,
} from './annotate-bazel-failures.mts';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ng-ci-annotations-test-'));
}

describe('annotate-bazel-failures', () => {
  it('emits nothing when the last Bazel BEP invocation succeeded', () => {
    const tmp = makeTempDir();
    try {
      const bepPath = path.join(tmp, 'bep.jsonl');
      const testlogs = path.join(tmp, 'dist/testlogs/pkg/stale_test');
      fs.mkdirSync(testlogs, {recursive: true});
      fs.writeFileSync(path.join(testlogs, 'test.xml'), '<testsuite failures="1"></testsuite>');
      fs.writeFileSync(
        bepPath,
        JSON.stringify({finished: {overallSuccess: true, exitCode: {code: 0}}}) + '\n',
      );
      const annotations = collectAnnotations({
        bepPath,
        testlogsDirs: [path.join(tmp, 'dist/testlogs')],
      });
      assert.deepEqual(annotations, []);
    } finally {
      fs.rmSync(tmp, {recursive: true, force: true});
    }
  });

  it('extracts test.log excerpts for failed and timed-out BEP targets while ignoring passed FLAKY targets', () => {
    const tmp = makeTempDir();
    try {
      const failLog = path.join(tmp, 'symbol_test.log');
      fs.writeFileSync(
        failLog,
        [
          'exec ${PAGER:-/usr/bin/less} "$0" || exit 1',
          '-----------------------------------------------------------------------------',
          '   Symbol: abortReason => 1 missing in golden file.',
          'TEST FAILED!',
        ].join('\n'),
      );
      const flakyLog = path.join(tmp, 'webmcp.log');
      fs.writeFileSync(flakyLog, 'flaky attempt 1 failed\n');

      const bep = [
        JSON.stringify({
          id: {testSummary: {label: '//packages/core/test/webmcp:webmcp_firefox'}},
          testSummary: {
            overallStatus: 'FLAKY',
            failed: [{uri: pathToFileURL(flakyLog).href}],
          },
        }),
        JSON.stringify({
          id: {testSummary: {label: '//packages/core/test/bundling/http:symbol_test'}},
          testSummary: {
            overallStatus: 'FAILED',
            failed: [{uri: pathToFileURL(failLog).href}],
          },
        }),
        JSON.stringify({
          id: {testSummary: {label: '//packages/router/test:test_web_firefox'}},
          testSummary: {
            overallStatus: 'TIMEOUT',
            failed: [],
          },
        }),
        JSON.stringify({finished: {overallSuccess: false, exitCode: {code: 3}}}),
      ].join('\n');

      const annotations = collectFromBep(bep);
      assert.equal(annotations.length, 2);
      assert.equal(annotations[0].title, '//packages/core/test/bundling/http:symbol_test FAILED');
      assert.equal(
        annotations[0].message,
        '   Symbol: abortReason => 1 missing in golden file.\nTEST FAILED!',
      );
      assert.equal(annotations[1].title, '//packages/router/test:test_web_firefox TIMEOUT');
      assert.equal(annotations[1].message, '//packages/router/test:test_web_firefox TIMEOUT');
    } finally {
      fs.rmSync(tmp, {recursive: true, force: true});
    }
  });

  it('extracts compiler diagnostics and deduplicates FAILED_TO_BUILD testSummary + targetCompleted', () => {
    const bep = [
      JSON.stringify({
        progress: {
          stderr: [
            '[123 / 500] Compiling TypeScript',
            '\x1b[31mpackages/core/src/index.ts:12:5 - error TS2322: Type string is not assignable.\x1b[0m',
            '\x1b[31m\x1b[1mERROR:\x1b[0m /workspace/packages/core/BUILD.bazel:10:1: Compiling TypeScript failed',
          ].join('\n'),
        },
      }),
      JSON.stringify({
        id: {targetCompleted: {label: '//packages/core:test'}},
        completed: {
          failureDetail: {message: 'Compiling TypeScript failed'},
        },
      }),
      JSON.stringify({
        id: {testSummary: {label: '//packages/core:test'}},
        testSummary: {overallStatus: 'FAILED_TO_BUILD'},
      }),
      JSON.stringify({finished: {overallSuccess: false, exitCode: {code: 1}}}),
    ].join('\n');

    const annotations = collectFromBep(bep);
    assert.equal(annotations.length, 1);
    assert.equal(annotations[0].title, '//packages/core:test FAILED TO BUILD');
    assert.match(annotations[0].message, /error TS2322/);
    assert.doesNotMatch(annotations[0].message, /\x1b\[/);
  });

  it('reports loading/analysis aborted failures when no targetCompleted event was emitted', () => {
    const bep = [
      JSON.stringify({
        id: {pattern: {pattern: ['//packages/bad/...']}},
        aborted: {reason: 'ANALYSIS_FAILURE', description: "no such package 'packages/bad'"},
      }),
      JSON.stringify({finished: {overallSuccess: false, exitCode: {code: 1}}}),
    ].join('\n');

    const annotations = collectFromBep(bep);
    assert.equal(annotations.length, 1);
    assert.equal(annotations[0].title, 'Bazel build failed');
    assert.match(annotations[0].message, /no such package 'packages\/bad'/);
  });

  it('falls back to dist/testlogs XML and logs when BEP is absent and ignores passed flaky XML', () => {
    const tmp = makeTempDir();
    try {
      const testlogs = path.join(tmp, 'dist/testlogs');
      const passDir = path.join(testlogs, 'packages/core/flaky_pass_test');
      const failDir = path.join(testlogs, 'packages/router/spec_test/shard_2_of_4');
      fs.mkdirSync(passDir, {recursive: true});
      fs.mkdirSync(failDir, {recursive: true});
      fs.writeFileSync(
        path.join(passDir, 'test.xml'),
        '<testsuite failures="0" errors="0"></testsuite>',
      );
      fs.writeFileSync(path.join(passDir, 'test.log'), 'passed on retry\n');
      fs.writeFileSync(
        path.join(failDir, 'test.xml'),
        '<testsuite failures="1" errors="0"></testsuite>',
      );
      fs.writeFileSync(path.join(failDir, 'test.log'), 'Expected true to be false.\n');

      const annotations = collectFromTestlogs(testlogs);
      assert.equal(annotations.length, 1);
      assert.equal(annotations[0].title, '//packages/router:spec_test (shard 2 of 4) FAILED');
      assert.equal(annotations[0].message, 'Expected true to be false.');
    } finally {
      fs.rmSync(tmp, {recursive: true, force: true});
    }
  });

  it('caps annotations at 10 per step with an overflow summary and safe workflow escaping', () => {
    const bepLines = Array.from({length: 13}, (_, i) =>
      JSON.stringify({
        id: {testSummary: {label: `//pkg:test_${i}`}},
        testSummary: {overallStatus: 'FAILED'},
      }),
    );
    bepLines.push(JSON.stringify({finished: {overallSuccess: false}}));

    const annotations = collectFromBep(bepLines.join('\n'));
    assert.equal(annotations.length, 10);
    assert.equal(annotations[9].title, '4 more Bazel failure(s)');
    assert.match(annotations[9].message, /\/\/pkg:test_12 FAILED/);

    const formatted = formatWorkflowCommands(annotations);
    const lines = formatted.split('\n');
    assert.equal(lines.length, 10);
    for (const line of lines) {
      assert.match(line, /^::error title=[^:]+::.+$/);
    }
  });

  it('runs as a CLI entrypoint and emits ::error lines to stdout', () => {
    const tmp = makeTempDir();
    try {
      const bepPath = path.join(tmp, 'bep.jsonl');
      fs.writeFileSync(
        bepPath,
        [
          JSON.stringify({
            id: {testSummary: {label: '//pkg:cli_test'}},
            testSummary: {overallStatus: 'FAILED'},
          }),
          JSON.stringify({finished: {overallSuccess: false}}),
        ].join('\n'),
      );
      const script = fileURLToPath(new URL('./annotate-bazel-failures.mts', import.meta.url));
      const fallbackJs = script.replace(/\.mts$/, '.mjs');
      const target = fs.existsSync(script) ? script : fallbackJs;
      const res = spawnSync(process.execPath, [target, `--bep=${bepPath}`], {encoding: 'utf8'});
      assert.equal(res.status, 0);
      assert.match(
        res.stdout,
        /^::error title=\/\/pkg%3Acli_test FAILED::\/\/pkg:cli_test FAILED\n$/,
      );
    } finally {
      fs.rmSync(tmp, {recursive: true, force: true});
    }
  });
});

describe('problem matcher .github/matchers/ci.json', () => {
  interface MatcherPattern {
    regexp: string;
    file?: number;
    line?: number;
    column?: number;
    severity?: number;
    code?: number;
    message: number;
    loop?: boolean;
  }

  interface MatcherSpec {
    problemMatcher: Array<{
      owner: string;
      severity?: string;
      pattern: MatcherPattern[];
    }>;
  }

  const matcherUrl = new URL('../../.github/matchers/ci.json', import.meta.url);
  const spec = JSON.parse(fs.readFileSync(matcherUrl, 'utf8')) as MatcherSpec;

  function findMatches(line: string): Array<{owner: string; groups: RegExpExecArray}> {
    const hits: Array<{owner: string; groups: RegExpExecArray}> = [];
    for (const m of spec.problemMatcher) {
      if (m.pattern.length !== 1) {
        continue;
      }
      const re = new RegExp(m.pattern[0].regexp);
      const exec = re.exec(line);
      if (exec) {
        hits.push({owner: m.owner, groups: exec});
      }
    }
    return hits;
  }

  function findMultilineMatches(lines: string[]): Array<{
    owner: string;
    file: string;
    severity: string;
    line: string;
    column: string;
    code?: string;
    message: string;
  }> {
    const hits: Array<{
      owner: string;
      file: string;
      severity: string;
      line: string;
      column: string;
      code?: string;
      message: string;
    }> = [];
    for (const m of spec.problemMatcher) {
      if (m.pattern.length !== 2) {
        continue;
      }
      const headerRe = new RegExp(m.pattern[0].regexp);
      const bodySpec = m.pattern[1];
      const bodyRe = new RegExp(bodySpec.regexp);
      for (let i = 0; i < lines.length; i++) {
        const headerMatch = headerRe.exec(lines[i]);
        if (!headerMatch) {
          continue;
        }
        const file = bodySpec.file ? undefined : headerMatch[m.pattern[0].file!];
        for (let j = i + 1; j < lines.length; j++) {
          const bodyMatch = bodyRe.exec(lines[j]);
          if (!bodyMatch) {
            break;
          }
          hits.push({
            owner: m.owner,
            file: file ?? bodyMatch[bodySpec.file!],
            severity: (bodySpec.severity ? bodyMatch[bodySpec.severity] : m.severity) ?? 'error',
            line: bodyMatch[bodySpec.line!],
            column: bodyMatch[bodySpec.column!],
            code: bodySpec.code ? bodyMatch[bodySpec.code] : undefined,
            message: bodyMatch[bodySpec.message!],
          });
          if (!bodySpec.loop) {
            break;
          }
        }
      }
    }
    return hits;
  }

  it('matches tsc non-pretty and pretty errors including ANSI codes', () => {
    const nonPretty = findMatches(
      "scripts/ci/foo.mts(12,5): error TS2322: Type 'string' is not assignable.",
    );
    assert.equal(nonPretty.length, 1);
    assert.equal(nonPretty[0].owner, 'angular-tsc');
    assert.equal(nonPretty[0].groups[1], 'scripts/ci/foo.mts');
    assert.equal(nonPretty[0].groups[5], 'TS2322');

    const pretty = findMatches(
      "\x1b[96mpackages/core/src/index.ts\x1b[0m:12:5 - error TS2322: Type 'string' is not assignable.",
    );
    assert.equal(pretty.length, 1);
    assert.equal(pretty[0].owner, 'angular-tsc-pretty');
    assert.equal(pretty[0].groups[5], 'TS2322');
  });

  it('matches tslint prose errors (relative and absolute) with and without ANSI without matching Bazel ERROR lines', () => {
    const tslintHit = findMatches(
      '\x1b[31mERROR:\x1b[0m packages/core/src/foo.ts:12:5 - Forbidden import (no-console)',
    );
    assert.equal(tslintHit.length, 1);
    assert.equal(tslintHit[0].owner, 'angular-tslint-error');
    assert.equal(tslintHit[0].groups[1], 'packages/core/src/foo.ts');
    assert.equal(tslintHit[0].groups[2], '12');
    assert.equal(tslintHit[0].groups[3], '5');

    const tslintAbsHit = findMatches(
      'ERROR: /home/runner/work/angular/angular/packages/core/src/foo.ts:12:5 - Forbidden import',
    );
    assert.equal(tslintAbsHit.length, 1);
    assert.equal(tslintAbsHit[0].owner, 'angular-tslint-error-abs');
    assert.equal(
      tslintAbsHit[0].groups[1],
      '/home/runner/work/angular/angular/packages/core/src/foo.ts',
    );
    assert.equal(tslintAbsHit[0].groups[2], '12');
    assert.equal(tslintAbsHit[0].groups[3], '5');
  });

  it('matches tslint stylish multi-line output (absolute and relative, with and without ANSI)', () => {
    const absHits = findMultilineMatches([
      '/home/runner/work/angular/angular/packages/core/src/foo.ts\x1b[8m:1:1\x1b[28m',
      '\x1b[31mERROR: 1:1  \x1b[39m  \x1b[90mno-var-keyword  \x1b[39m  \x1b[33mForbidden var keyword\x1b[39m',
      '\x1b[34mWARNING: 12:5\x1b[39m  \x1b[90msemicolon       \x1b[39m  \x1b[33mMissing semicolon\x1b[39m',
    ]);
    assert.deepEqual(absHits, [
      {
        owner: 'angular-tslint-stylish-abs',
        file: '/home/runner/work/angular/angular/packages/core/src/foo.ts',
        severity: 'ERROR',
        line: '1',
        column: '1',
        code: 'no-var-keyword',
        message: 'Forbidden var keyword',
      },
      {
        owner: 'angular-tslint-stylish-abs',
        file: '/home/runner/work/angular/angular/packages/core/src/foo.ts',
        severity: 'WARNING',
        line: '12',
        column: '5',
        code: 'semicolon',
        message: 'Missing semicolon',
      },
    ]);

    const relHits = findMultilineMatches([
      'packages/core/src/foo.ts:3:9',
      'ERROR: 3:9  no-console  Calls to console.log are forbidden',
    ]);
    assert.deepEqual(relHits, [
      {
        owner: 'angular-tslint-stylish-rel',
        file: 'packages/core/src/foo.ts',
        severity: 'ERROR',
        line: '3',
        column: '9',
        code: 'no-console',
        message: 'Calls to console.log are forbidden',
      },
    ]);
  });

  it('matches Bazel ERROR lines (absolute and relative, with ANSI) without matching TSLint lines', () => {
    const absHit = findMatches(
      '\x1b[31m\x1b[1mERROR:\x1b[0m /home/runner/work/angular/angular/packages/core/BUILD.bazel:10:1: Compiling TypeScript failed',
    );
    assert.equal(absHit.length, 1);
    assert.equal(absHit[0].owner, 'angular-bazel-error-abs');
    assert.equal(
      absHit[0].groups[1],
      '/home/runner/work/angular/angular/packages/core/BUILD.bazel',
    );
    assert.equal(absHit[0].groups[2], '10');

    const relHit = findMatches(
      'ERROR: packages/core/BUILD.bazel:10:1: Compiling TypeScript failed',
    );
    assert.equal(relHit.length, 1);
    assert.equal(relHit[0].owner, 'angular-bazel-error-rel');
    assert.equal(relHit[0].groups[1], 'packages/core/BUILD.bazel');
  });

  it('matches ts-circular-deps chains and ng-dev errors without matching ::error or plain bullets', () => {
    const chainHit = findMatches(
      '\x1b[31m     • packages/core/src/a.ts → packages/core/src/b.ts → packages/core/src/a.ts\x1b[39m',
    );
    assert.equal(chainHit.length, 1);
    assert.equal(chainHit[0].owner, 'angular-ts-circular-deps');
    assert.equal(
      chainHit[0].groups[1],
      'packages/core/src/a.ts → packages/core/src/b.ts → packages/core/src/a.ts',
    );
    assert.equal(chainHit[0].groups[2], 'packages/core/src/a.ts');

    const ngDevHeader = findMatches(
      '\x1b[31m✘  Golden does not match current circular dependencies.\x1b[39m',
    );
    assert.equal(ngDevHeader.length, 1);
    assert.equal(ngDevHeader[0].owner, 'angular-ng-dev-error');
    assert.equal(ngDevHeader[0].groups[1], 'Golden does not match current circular dependencies.');

    const ngBotError = findMatches('\x1b[31m! Invalid NgBot YAML config\x1b[39m');
    assert.equal(ngBotError.length, 1);
    assert.equal(ngBotError[0].owner, 'angular-ng-dev-error');
    assert.equal(ngBotError[0].groups[1], 'Invalid NgBot YAML config');

    assert.equal(findMatches('  • packages/core/src/a.ts').length, 0);
    assert.equal(
      findMatches(
        '::error file=packages/core/src/a.ts::Circular dependency: packages/core/src/a.ts → packages/core/src/b.ts',
      ).length,
      0,
    );
  });
});
