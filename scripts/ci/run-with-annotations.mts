/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Runs a command and, if it fails, emits a GitHub Actions `::error` annotation saying what failed.
 * Annotations are readable through the check-run annotations API without downloading the job log.
 *
 * Usage: node scripts/ci/run-with-annotations.mts <command> [args...]
 */

import {spawn} from 'node:child_process';
import {stripVTControlCharacters} from 'node:util';

const MAX_CAPTURE_CHARS = 1024 * 1024;
const MAX_TITLE_CHARS = 255;
const MAX_MESSAGE_LINES = 50;
const MAX_MESSAGE_CHARS = 3800;
const MAX_TEST_EXCERPT_LINES = 15;

/** A row of the Bazel test summary for a target that did not pass, e.g. `//pkg:test  FAILED in 2.1s`. */
const BAZEL_FAILED_TARGET = /^(\/\/\S+)\s+(?:\(cached\)\s+)?(FAILED TO BUILD|FAILED|TIMEOUT)\b/;
const BAZEL_TEST_OUTPUT_HEADER =
  /^={20}\s+Test output for\s+(\/\/\S+?)(?:\s+\(shard\s+\d+\s+of\s+\d+\))?:\s*$/;
const BAZEL_PROGRESS = /^\[[\d,]+ \/ [\d,]+\]/;
const BAZEL_NOISE = /^(?:INFO:|Loading:|Analyzing:|SUBCOMMAND:|\[[\d,]+ \/ [\d,]+\])/;

const [command, ...args] = process.argv.slice(2);
if (command === undefined) {
  process.stderr.write('Usage: node scripts/ci/run-with-annotations.mts <command> [args...]\n');
  process.exit(1);
}

let output = '';
let cancelled = false;
let finished = false;
const child = spawn(command, args, {stdio: ['inherit', 'pipe', 'pipe']});

function emitFailureAnnotation(): void {
  const {title, message} = describeFailure(output);
  const safeTitle =
    title.length <= MAX_TITLE_CHARS ? title : `${title.slice(0, MAX_TITLE_CHARS - 3)}...`;
  process.stdout.write(
    `\n::error title=${escapeData(safeTitle).replace(/[:,]/g, encodeURIComponent)}::${escapeData(message)}\n`,
  );
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    cancelled = true;
    child.kill(signal);
  });
}
for (const stream of ['stdout', 'stderr'] as const) {
  child[stream].on('data', (chunk: Buffer) => {
    process[stream].write(chunk);
    output = (output + chunk.toString('utf8')).slice(-MAX_CAPTURE_CHARS);
  });
}
child.on('error', (error) => {
  if (finished) {
    return;
  }
  finished = true;
  const message = `Failed to run \`${command}\`: ${error.message}\n`;
  process.stderr.write(message);
  output += message;
  process.exitCode = 1;
  emitFailureAnnotation();
});
child.on('close', (code, signal) => {
  if (finished) {
    return;
  }
  finished = true;
  process.exitCode = code ?? 1;
  // A cancelled run (e.g. superseded by a newer commit on the branch) is not a failure.
  if (code === 0 || cancelled || signal === 'SIGINT' || signal === 'SIGTERM') {
    return;
  }
  emitFailureAnnotation();
});

function describeFailure(rawOutput: string): {title: string; message: string} {
  const name = [command, ...args].join(' ');
  const lines = stripVTControlCharacters(rawOutput)
    .split(/\r?\n/)
    // Keep only the final state of lines that were redrawn using carriage returns.
    .map((line) => line.slice(line.lastIndexOf('\r') + 1));

  const failedTargets = new Map<string, string>();
  const testOutputs = new Map<string, string[]>();
  const testOutputLineIndices = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const headerMatch = BAZEL_TEST_OUTPUT_HEADER.exec(lines[i]);
    if (headerMatch !== null) {
      testOutputLineIndices.add(i);
      const blockLines: string[] = [];
      for (i++; i < lines.length; i++) {
        testOutputLineIndices.add(i);
        if (/^={80}\s*$/.test(lines[i])) {
          break;
        }
        if (lines[i].trim() !== '') {
          blockLines.push(lines[i]);
        }
      }
      if (blockLines.length > 0) {
        testOutputs.set(headerMatch[1], blockLines.slice(-MAX_TEST_EXCERPT_LINES));
      }
      continue;
    }

    const match = BAZEL_FAILED_TARGET.exec(lines[i]);
    if (match !== null) {
      failedTargets.set(match[1], match[2]);
    }
  }

  if (failedTargets.size > 0) {
    const messageLines: string[] = [];
    let hasBuildFailure = false;
    for (const [target, status] of failedTargets) {
      messageLines.push(`${target} ${status}`);
      if (status === 'FAILED TO BUILD') {
        hasBuildFailure = true;
      }
      const excerpt = testOutputs.get(target);
      if (excerpt !== undefined) {
        for (const excerptLine of excerpt) {
          messageLines.push(`  ${excerptLine.trimEnd()}`);
        }
      }
    }
    if (hasBuildFailure) {
      const errorTail = extractBuildErrorTail(lines, testOutputLineIndices);
      if (errorTail.length > 0) {
        messageLines.push(...errorTail);
      }
    }
    return {
      title: `${name}: ${failedTargets.size} Bazel target(s) failed`,
      message: capHeadLines(messageLines),
    };
  }

  const tail = lines.filter((line) => line.trim() !== '' && !BAZEL_PROGRESS.test(line));
  return {
    title: `${name} failed`,
    message: capTailLines(tail) || 'No output.',
  };
}

function extractBuildErrorTail(
  lines: readonly string[],
  excludedLines: ReadonlySet<number>,
): string[] {
  let lastErrorIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!excludedLines.has(i) && /^ERROR:\s+/.test(lines[i])) {
      lastErrorIndex = i;
      break;
    }
  }
  if (lastErrorIndex === -1) {
    return [];
  }
  const snippet: string[] = [];
  for (let i = Math.max(0, lastErrorIndex - 15); i <= lastErrorIndex; i++) {
    if (!excludedLines.has(i) && lines[i].trim() !== '' && !BAZEL_NOISE.test(lines[i])) {
      snippet.push(lines[i]);
    }
  }
  return snippet;
}

function capHeadLines(lines: readonly string[]): string {
  const kept = lines.slice(0, MAX_MESSAGE_LINES);
  while (kept.length > 1 && escapeData(kept.join('\n')).length > MAX_MESSAGE_CHARS - 30) {
    kept.pop();
  }
  if (kept.length === 1 && escapeData(kept[0]).length > MAX_MESSAGE_CHARS) {
    kept[0] = `${kept[0].slice(0, MAX_MESSAGE_CHARS - 20)}...`;
  }
  const omitted = lines.length - kept.length;
  if (omitted > 0) {
    kept.push(`... (${omitted} more lines omitted)`);
  }
  return kept.join('\n');
}

function capTailLines(lines: readonly string[]): string {
  const kept = lines.slice(-MAX_MESSAGE_LINES);
  while (kept.length > 1 && escapeData(kept.join('\n')).length > MAX_MESSAGE_CHARS) {
    kept.shift();
  }
  if (kept.length === 1 && escapeData(kept[0]).length > MAX_MESSAGE_CHARS) {
    kept[0] = `...${kept[0].slice(-(MAX_MESSAGE_CHARS - 20))}`;
  }
  return kept.join('\n');
}

function escapeData(value: string): string {
  return value.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
