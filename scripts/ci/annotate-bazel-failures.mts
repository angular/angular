/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Reads Bazel failure artifacts (Build Event Protocol JSONL and/or `dist/testlogs`)
 * and emits GitHub Actions `::error` annotations readable via `/check-runs/{id}/annotations`.
 *
 * Usage: node scripts/ci/annotate-bazel-failures.mts [--bep=<path>] [--testlogs=<dir>]
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {stripVTControlCharacters} from 'node:util';

const MAX_ANNOTATIONS_PER_STEP = 10;
const MAX_TITLE_CHARS = 255;
const MAX_MESSAGE_CHARS = 3800;
const MAX_TEST_EXCERPT_LINES = 25;
const MAX_BUILD_CONTEXT_LINES = 15;

const BAZEL_NOISE = /^(?:INFO:|Loading:|Analyzing:|SUBCOMMAND:|\[[\d,]+ \/ [\d,]+\])/;
const FAILING_TEST_STATUSES = new Set(['FAILED', 'TIMEOUT', 'FAILED_TO_BUILD', 'INCOMPLETE']);

export interface FailureAnnotation {
  title: string;
  message: string;
}

export interface AnnotateOptions {
  bepPath?: string;
  testlogsDirs?: readonly string[];
  cwd?: string;
}

interface BepFileRef {
  name?: string;
  uri?: string;
}

interface BepEvent {
  id?: {
    targetCompleted?: {label?: string};
    testResult?: {label?: string};
    testSummary?: {label?: string};
  };
  aborted?: {description?: string};
  progress?: {stderr?: string};
  completed?: {success?: boolean; failureDetail?: {message?: string}};
  testResult?: {status?: string; testActionOutput?: BepFileRef[]};
  testSummary?: {overallStatus?: string; failed?: BepFileRef[]};
  finished?: {overallSuccess?: boolean};
}

export function collectAnnotations(options: AnnotateOptions = {}): FailureAnnotation[] {
  const cwd = options.cwd ?? process.cwd();
  const bepPath =
    options.bepPath ??
    process.env.BAZEL_BEP_PATH ??
    path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'bazel-bep.jsonl');

  if (bepPath && fs.existsSync(bepPath)) {
    const rawBep = fs.readFileSync(bepPath, 'utf8').trim();
    if (rawBep.length > 0) {
      return collectFromBep(rawBep);
    }
  }

  for (const dir of options.testlogsDirs ?? [
    path.join(cwd, 'dist/testlogs'),
    path.join(cwd, 'bazel-testlogs'),
  ]) {
    if (fs.existsSync(dir)) {
      return collectFromTestlogs(dir);
    }
  }
  return [];
}

export function collectFromBep(rawBep: string): FailureAnnotation[] {
  const testSummaries = new Map<string, {status: string; logUri?: string}>();
  const testOutputs = new Map<string, {logUri?: string; xmlUri?: string}>();
  const failedBuildTargets = new Map<string, string>();
  const abortedDescriptions: string[] = [];
  const stderrLines: string[] = [];
  let finishedSuccess: boolean | undefined;

  for (const rawLine of rawBep.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      continue;
    }
    let event: BepEvent;
    try {
      event = JSON.parse(trimmed) as BepEvent;
    } catch {
      continue;
    }

    if (event.progress?.stderr) {
      stderrLines.push(...cleanLines(event.progress.stderr));
      if (stderrLines.length > 400) {
        stderrLines.splice(0, stderrLines.length - 400);
      }
    }

    if (event.finished !== undefined) {
      finishedSuccess = event.finished.overallSuccess === true;
    }

    const testLabel = event.id?.testResult?.label;
    if (testLabel && event.testResult && FAILING_TEST_STATUSES.has(event.testResult.status ?? '')) {
      const entry = testOutputs.get(testLabel) ?? {};
      for (const output of event.testResult.testActionOutput ?? []) {
        if (!output.uri) {
          continue;
        }
        if (output.name === 'test.log' || output.uri.endsWith('/test.log')) {
          entry.logUri = output.uri;
        } else if (output.name === 'test.xml' || output.uri.endsWith('/test.xml')) {
          entry.xmlUri = output.uri;
        }
      }
      testOutputs.set(testLabel, entry);
    }

    const summaryLabel = event.id?.testSummary?.label;
    if (summaryLabel && event.testSummary) {
      const status = event.testSummary.overallStatus ?? '';
      if (FAILING_TEST_STATUSES.has(status)) {
        const logUri = (event.testSummary.failed ?? [])
          .map((f) => f.uri)
          .filter((uri): uri is string => typeof uri === 'string' && uri.length > 0)
          .pop();
        testSummaries.set(summaryLabel, {status, logUri});
      }
    }

    const targetLabel = event.id?.targetCompleted?.label;
    if (targetLabel && event.completed && event.completed.success !== true) {
      const detail =
        event.completed.failureDetail?.message?.trim() || event.aborted?.description?.trim() || '';
      if (detail) {
        failedBuildTargets.set(targetLabel, detail);
      }
    } else if (!targetLabel && event.aborted?.description) {
      abortedDescriptions.push(event.aborted.description.trim());
    }
  }

  // If the last Bazel invocation succeeded (e.g. a subsequent non-Bazel step failed), emit nothing.
  if (finishedSuccess === true) {
    return [];
  }

  const annotations: FailureAnnotation[] = [];

  for (const [label, summary] of testSummaries) {
    if (summary.status === 'FAILED_TO_BUILD') {
      continue;
    }
    const outputs = testOutputs.get(label);
    const excerpt = readTestExcerpt(
      resolveFileUri(summary.logUri ?? outputs?.logUri),
      resolveFileUri(outputs?.xmlUri),
    );
    annotations.push({
      title: `${label} ${summary.status}`,
      message: excerpt || `${label} ${summary.status}`,
    });
  }

  const buildContextTail = extractBuildContext(stderrLines);
  for (const [label, detail] of failedBuildTargets) {
    annotations.push({
      title: `${label} FAILED TO BUILD`,
      message: capLines([`${label} FAILED TO BUILD`, detail, ...buildContextTail]),
    });
  }

  if (annotations.length === 0 && (abortedDescriptions.length > 0 || buildContextTail.length > 0)) {
    annotations.push({
      title: 'Bazel build failed',
      message: capLines([...abortedDescriptions, ...buildContextTail]) || 'Bazel build failed.',
    });
  }

  return capAnnotationCount(annotations);
}

export function collectFromTestlogs(testlogsDir: string): FailureAnnotation[] {
  const xmlFiles = (fs.readdirSync(testlogsDir, {recursive: true}) as string[])
    .filter((rel) => path.basename(rel) === 'test.xml')
    .sort();
  const annotations: FailureAnnotation[] = [];

  for (const relXml of xmlFiles) {
    const xmlPath = path.join(testlogsDir, relXml);
    const xmlContent = fs.readFileSync(xmlPath, 'utf8');
    if (!/\b(?:failures|errors)=["'][1-9]\d*["']|<(?:failure|error)\b/i.test(xmlContent)) {
      continue;
    }
    const label = formatLabelFromTestlogRelPath(path.dirname(relXml));
    const logPath = path.join(path.dirname(xmlPath), 'test.log');
    const excerpt = readTestExcerpt(logPath, xmlPath);
    annotations.push({
      title: `${label} FAILED`,
      message: excerpt || `${label} FAILED`,
    });
  }

  return capAnnotationCount(annotations);
}

export function formatWorkflowCommands(annotations: readonly FailureAnnotation[]): string {
  return annotations
    .map(({title, message}) => {
      const safeTitle =
        title.length <= MAX_TITLE_CHARS ? title : `${title.slice(0, MAX_TITLE_CHARS - 3)}...`;
      const safeMessage =
        escapeData(message).length <= MAX_MESSAGE_CHARS ? message : capLines(message.split('\n'));
      return `::error title=${escapeData(safeTitle).replace(/[:,]/g, encodeURIComponent)}::${escapeData(safeMessage)}`;
    })
    .join('\n');
}

function capAnnotationCount(annotations: readonly FailureAnnotation[]): FailureAnnotation[] {
  if (annotations.length <= MAX_ANNOTATIONS_PER_STEP) {
    return [...annotations];
  }
  const remaining = annotations.slice(MAX_ANNOTATIONS_PER_STEP - 1);
  return [
    ...annotations.slice(0, MAX_ANNOTATIONS_PER_STEP - 1),
    {
      title: `${remaining.length} more Bazel failure(s)`,
      message: capLines(remaining.map((a) => a.title)),
    },
  ];
}

function readTestExcerpt(logPath?: string, xmlPath?: string): string {
  if (logPath && fs.existsSync(logPath)) {
    const lines = cleanLines(fs.readFileSync(logPath, 'utf8'));
    // Strip Bazel's standard test.log preamble (`exec ${PAGER:-/usr/bin/less} ...` + `-----...`)
    const sepIdx = lines.slice(0, 6).findIndex((line) => /^-{40,}$/.test(line.trim()));
    const excerpt = capLines(
      lines.slice(sepIdx === -1 ? 0 : sepIdx + 1).slice(-MAX_TEST_EXCERPT_LINES),
    );
    if (excerpt) {
      return excerpt;
    }
  }
  if (xmlPath && fs.existsSync(xmlPath)) {
    const match =
      /<(?:failure|error)\b[^>]*?(?:\bmessage=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/(?:failure|error)>/i.exec(
        fs.readFileSync(xmlPath, 'utf8'),
      );
    if (match) {
      return capLines(
        cleanLines([match[1], match[2]].filter(Boolean).join('\n')).slice(-MAX_TEST_EXCERPT_LINES),
      );
    }
  }
  return '';
}

function resolveFileUri(uri?: string): string | undefined {
  if (!uri?.startsWith('file://')) {
    return undefined;
  }
  try {
    return fileURLToPath(uri);
  } catch {
    return undefined;
  }
}

function extractBuildContext(stderrLines: readonly string[]): string[] {
  const cleaned = stderrLines.filter((line) => !BAZEL_NOISE.test(line));
  for (let i = cleaned.length - 1; i >= 0; i--) {
    if (/^ERROR:\s+/.test(cleaned[i])) {
      return cleaned.slice(Math.max(0, i - MAX_BUILD_CONTEXT_LINES), i + 1);
    }
  }
  return cleaned.slice(-MAX_BUILD_CONTEXT_LINES);
}

function formatLabelFromTestlogRelPath(relDir: string): string {
  const parts = relDir.split(path.sep).filter((p) => p && p !== '.');
  const shardMatch = /^shard_(\d+)_of_(\d+)$/.exec(parts[parts.length - 1] ?? '');
  const shardSuffix = shardMatch ? ` (shard ${shardMatch[1]} of ${shardMatch[2]})` : '';
  if (shardMatch) {
    parts.pop();
  }
  const target = parts.pop() ?? '';
  return `//${parts.join('/')}:${target}${shardSuffix}`;
}

function cleanLines(raw: string): string[] {
  return stripVTControlCharacters(raw)
    .split(/\r?\n/)
    .map((line) => line.slice(line.lastIndexOf('\r') + 1).trimEnd())
    .filter((line) => line.trim() !== '');
}

function capLines(lines: readonly string[]): string {
  const kept = [...lines];
  while (kept.length > 1 && escapeData(kept.join('\n')).length > MAX_MESSAGE_CHARS - 30) {
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

function main(): void {
  let bepPath: string | undefined;
  let testlogsDir: string | undefined;
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--bep=')) {
      bepPath = arg.slice('--bep='.length);
    } else if (arg.startsWith('--testlogs=')) {
      testlogsDir = arg.slice('--testlogs='.length);
    }
  }
  const output = formatWorkflowCommands(
    collectAnnotations({
      bepPath,
      testlogsDirs: testlogsDir ? [testlogsDir] : undefined,
    }),
  );
  if (output) {
    process.stdout.write(`${output}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
