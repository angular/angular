/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Reads the Bazel Build Event Protocol file of the last Bazel invocation and emits a GitHub
 * Actions `::error` annotation for each failed target, so that the reason for a CI failure can
 * be read from the check-run annotations API without downloading the job log.
 *
 * Usage: node scripts/ci/annotate-bazel-failures.mts [bep-file]
 */

import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {stripVTControlCharacters} from 'node:util';

// GitHub only keeps the first 10 error annotations of a step.
const MAX_ANNOTATIONS = 10;
const MAX_TITLE_CHARS = 255;
const MAX_MESSAGE_CHARS = 3800;
const MAX_TEST_LOG_LINES = 40;
const MAX_BUILD_CONTEXT_LINES = 30;

const FAILING_TEST_STATUSES = new Set(['FAILED', 'TIMEOUT', 'INCOMPLETE']);
/** e.g. `FAIL: //pkg:test (Exit 1) (see /path/to/testlogs/pkg/test/test.log)`. */
const TEST_LOG_LOCATION = /^(?:FAIL|TIMEOUT): (\/\/\S+) .*\(see (.+)\)$/;
const BUILD_END = /^ERROR: Build did NOT complete successfully/;
const BAZEL_NOISE = /^(?:INFO:|Loading:|Analyzing:|SUBCOMMAND:|\[[\d,]+ \/ [\d,]+\])/;

export interface FailureAnnotation {
  title: string;
  message: string;
}

/** The parts of a Build Event Protocol event that are read here. */
interface BepEvent {
  id?: {targetCompleted?: {label?: string}; testSummary?: {label?: string}};
  aborted?: {description?: string};
  progress?: {stderr?: string; stdout?: string};
  completed?: {failureDetail?: {message?: string}};
  testSummary?: {overallStatus?: string};
  finished?: {overallSuccess?: boolean};
}

export function collectAnnotations(rawBep: string): FailureAnnotation[] {
  const failedTests = new Map<string, string>();
  const failedBuilds = new Map<string, string>();
  const aborted: string[] = [];
  let output = '';
  let succeeded = false;

  for (const line of rawBep.split('\n')) {
    let event: BepEvent;
    try {
      event = JSON.parse(line) as BepEvent;
    } catch {
      continue;
    }
    output += (event.progress?.stderr ?? '') + (event.progress?.stdout ?? '');
    if (event.finished !== undefined) {
      succeeded = event.finished.overallSuccess === true;
    }

    const testLabel = event.id?.testSummary?.label;
    const testStatus = event.testSummary?.overallStatus ?? '';
    if (testLabel && FAILING_TEST_STATUSES.has(testStatus)) {
      failedTests.set(testLabel, testStatus);
    }

    const targetLabel = event.id?.targetCompleted?.label;
    const buildFailure = event.completed?.failureDetail?.message?.trim();
    if (targetLabel && buildFailure) {
      failedBuilds.set(targetLabel, buildFailure);
    } else if (!targetLabel && event.aborted?.description) {
      aborted.push(event.aborted.description.trim());
    }
  }

  // The step that failed was not Bazel, e.g. a later non-Bazel step of the job.
  if (succeeded) {
    return [];
  }

  const outputLines = cleanLines(output);
  const testLogs = new Map<string, string>();
  for (const line of outputLines) {
    const match = TEST_LOG_LOCATION.exec(line);
    if (match !== null) {
      testLogs.set(match[1], match[2]);
    }
  }

  const annotations: FailureAnnotation[] = [];
  for (const [label, status] of failedTests) {
    const title = `${label} ${status}`;
    annotations.push({title, message: readTestLogTail(testLogs.get(label)) || title});
  }

  const buildContext = extractBuildContext(outputLines);
  for (const [label, detail] of failedBuilds) {
    const title = `${label} FAILED TO BUILD`;
    annotations.push({title, message: [title, detail, ...buildContext].join('\n')});
  }

  if (annotations.length === 0 && (aborted.length > 0 || buildContext.length > 0)) {
    annotations.push({
      title: 'Bazel build failed',
      message: [...aborted, ...buildContext].join('\n'),
    });
  }

  if (annotations.length <= MAX_ANNOTATIONS) {
    return annotations;
  }
  const rest = annotations.splice(MAX_ANNOTATIONS - 1);
  annotations.push({
    title: `${rest.length} more Bazel failure(s)`,
    message: rest.map((a) => a.title).join('\n'),
  });
  return annotations;
}

export function formatWorkflowCommands(annotations: readonly FailureAnnotation[]): string {
  return annotations
    .map(({title, message}) => {
      const safeTitle =
        title.length <= MAX_TITLE_CHARS ? title : `${title.slice(0, MAX_TITLE_CHARS - 3)}...`;
      // The end of the output is where the failure is, so lines are dropped from the start.
      const lines = message.split('\n');
      while (lines.length > 1 && escapeData(lines.join('\n')).length > MAX_MESSAGE_CHARS) {
        lines.shift();
      }
      const safeMessage = escapeData(lines.join('\n')).slice(-MAX_MESSAGE_CHARS);
      return `::error title=${escapeData(safeTitle).replace(/[:,]/g, encodeURIComponent)}::${safeMessage}`;
    })
    .join('\n');
}

function readTestLogTail(logPath: string | undefined): string {
  if (logPath === undefined || !fs.existsSync(logPath)) {
    return '';
  }
  return cleanLines(fs.readFileSync(logPath, 'utf8')).slice(-MAX_TEST_LOG_LINES).join('\n');
}

/** The lines from the first `ERROR:` line to the end of the build, which hold the diagnostics. */
function extractBuildContext(outputLines: readonly string[]): string[] {
  const lines = outputLines.filter((line) => !BAZEL_NOISE.test(line));
  const start = lines.findIndex((line) => line.startsWith('ERROR:'));
  if (start === -1) {
    return [];
  }
  const end = lines.findIndex((line, i) => i > start && BUILD_END.test(line));
  return lines.slice(start, end === -1 ? undefined : end + 1).slice(0, MAX_BUILD_CONTEXT_LINES);
}

function cleanLines(raw: string): string[] {
  return (
    stripVTControlCharacters(raw)
      .split(/\r?\n/)
      // Keep only the final state of lines that were redrawn using carriage returns.
      .map((line) => line.slice(line.lastIndexOf('\r') + 1).trimEnd())
      .filter((line) => line !== '')
  );
}

function escapeData(value: string): string {
  return value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const bepPath = process.argv[2] ?? process.env.BAZEL_BEP_PATH;
  if (bepPath !== undefined && fs.existsSync(bepPath)) {
    const output = formatWorkflowCommands(collectAnnotations(fs.readFileSync(bepPath, 'utf8')));
    if (output !== '') {
      process.stdout.write(`${output}\n`);
    }
  }
}
