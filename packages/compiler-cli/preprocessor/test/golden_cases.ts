/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Which golden cases exist, and the pipeline options each one runs under.
 */

import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as path from 'path';
import {pathExists} from './utils.js';

export function resolveGoldenRoot(): string {
  if (process.env['BUILD_WORKSPACE_DIRECTORY']) {
    const candidate = path.join(
      process.env['BUILD_WORKSPACE_DIRECTORY'],
      'packages/compiler-cli/preprocessor/test/golden',
    );
    if (fsSync.existsSync(candidate)) {
      return candidate;
    }
  }

  const runfilesDir = process.env['JS_BINARY__RUNFILES'] || process.env['RUNFILES_DIR'];
  if (runfilesDir) {
    const candidates = [
      path.join(runfilesDir, '_main/packages/compiler-cli/preprocessor/test/golden'),
      path.join(runfilesDir, 'angular/packages/compiler-cli/preprocessor/test/golden'),
      path.join(runfilesDir, 'packages/compiler-cli/preprocessor/test/golden'),
    ];
    for (const c of candidates) {
      if (fsSync.existsSync(c)) {
        return c;
      }
    }
  }
  const relativeCandidates = [
    path.resolve(process.cwd(), 'packages/compiler-cli/preprocessor/test/golden'),
    path.resolve(process.cwd(), 'golden'),
    path.resolve(import.meta.dirname, 'golden'),
  ];
  for (const c of relativeCandidates) {
    if (fsSync.existsSync(c)) {
      return c;
    }
  }
  return path.resolve(import.meta.dirname, 'golden');
}

export const GOLDEN_ROOT: string = resolveGoldenRoot();

/** The two compilation modes a case can pin, named after the golden that holds each one. */
export type GoldenMode = 'standard' | 'optimize';

export interface GoldenPipelineOptions {
  readonly optimize: boolean;
  readonly enableSelectorless: boolean;
}

/**
 * Walks the golden tree synchronously. Returns case paths relative to `GOLDEN_ROOT`.
 */
export function collectGoldenCasesSync(dir: string = resolveGoldenRoot()): string[] {
  if (!fsSync.existsSync(dir)) {
    return [];
  }

  const root = resolveGoldenRoot();
  const entries = fsSync.readdirSync(dir, {withFileTypes: true});
  const subdirs = entries.filter((e) => e.isDirectory()).map((e) => path.join(dir, e.name));

  const results: string[] = [];
  for (const fullPath of subdirs) {
    if (fsSync.existsSync(path.join(fullPath, 'source.md'))) {
      results.push(path.relative(root, fullPath));
    } else {
      results.push(...collectGoldenCasesSync(fullPath));
    }
  }

  return results;
}

/**
 * Walks the golden tree. A directory holding `source.md` is a case; directories above it are
 * grouping. Returns case paths relative to `GOLDEN_ROOT`.
 */
export async function collectGoldenCases(dir: string = resolveGoldenRoot()): Promise<string[]> {
  if (!(await pathExists(dir))) {
    return [];
  }

  const root = resolveGoldenRoot();
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const subdirs = entries.filter((e) => e.isDirectory()).map((e) => path.join(dir, e.name));

  const results = await Promise.all(
    subdirs.map(async (fullPath) => {
      if (await pathExists(path.join(fullPath, 'source.md'))) {
        return [path.relative(root, fullPath)];
      }
      return collectGoldenCases(fullPath);
    }),
  );

  return results.flat();
}

/**
 * How to compile `testCase` for `mode`. Two fixtures need something other than the defaults:
 * `duplicate_import_already_present` only reproduces under optimization, so its `golden.md` holds
 * optimized output, and `selectorless` needs the selectorless template parser.
 */
export function pipelineOptionsFor(testCase: string, mode: GoldenMode): GoldenPipelineOptions {
  return {
    optimize: mode === 'optimize' || testCase === 'duplicate_import_already_present',
    enableSelectorless: testCase === 'selectorless',
  };
}
