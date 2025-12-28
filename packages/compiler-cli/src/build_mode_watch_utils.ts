/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import path from 'path';

export interface BuildModeProjectContext {
  /** Resolved absolute TS input file names for the project. */
  inputFiles: readonly string[];
}

export interface ModifiedTsFilesForResourceChange {
  tsFiles: string[];
  /** Whether the changed file should be reported to Angular as a modified resource. */
  recordAsResource: boolean;
}

export function isWithinDir(candidate: string, dir: string): boolean {
  const relative = path.relative(dir, candidate);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export function isWatchedResourceFile(filePath: string): boolean {
  const watchJson =
    process.env['NGC_BUILD_MODE_WATCH_JSON'] === '1' ||
    process.env['NGC_BUILD_MODE_WATCH_JSON'] === 'true';
  return (
    /\.(html|css|scss|sass|less|xlf|xliff|xmb)$/.test(filePath) ||
    (watchJson && filePath.endsWith('.json'))
  );
}

/**
 * Computes which TS files should be marked modified for a resource/config change.
 *
 * - If the resource is owned (template/style), returns those owning TS files.
 * - Otherwise, if the file lives within the project's config directory, returns a single
 *   representative TS file to force a project rebuild (parity fallback).
 * - Otherwise, returns null (ignore).
 */
export function computeModifiedTsFilesForResourceChange(
  changedAbsolutePath: string,
  configFilePath: string,
  resourceOwners: ReadonlyMap<string, ReadonlySet<string>>,
  ctx: BuildModeProjectContext | undefined,
): ModifiedTsFilesForResourceChange | null {
  const owners = resourceOwners.get(changedAbsolutePath);
  if (owners !== undefined && owners.size > 0) {
    return {tsFiles: Array.from(owners), recordAsResource: true};
  }

  const configDir = path.dirname(configFilePath);
  if (!isWithinDir(changedAbsolutePath, configDir)) {
    return null;
  }

  const primary = ctx?.inputFiles[0];
  return {tsFiles: primary ? [primary] : [], recordAsResource: false};
}
