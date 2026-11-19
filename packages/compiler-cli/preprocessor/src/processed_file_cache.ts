/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ProcessedFile} from './processor.js';
import type {NgpTypeCheckingConfig} from './tcb.js';
import type {AnalysisResult} from './types.js';

/** Reference-equality inputs that must match for a cached `ProcessedFile` to be reused. */
export interface ProcessedFileCacheKey {
  readonly sourceContent: string;
  readonly analysisResult: AnalysisResult;
  readonly tcbConfig: NgpTypeCheckingConfig;
  readonly remoteScopeKey: string;
}

/**
 * Keeps each file's processed output across the builds of a session, reusing an entry only when
 * the file was not invalidated (`markChangeKind` deletes invalidated entries) and its
 * `sourceContent`, `AnalysisResult` reference, `tcbConfig` reference, and intra-chunk
 * `remoteScopeKey` match.
 *
 * Reused outputs are shared with whoever received them before, so consumers must not mutate a
 * `ProcessedFile`.
 */
export class ProcessedFileCache {
  private readonly entries = new Map<
    string,
    ProcessedFileCacheKey & {readonly processed: ProcessedFile}
  >();

  get(filePath: string, key: ProcessedFileCacheKey): ProcessedFile | undefined {
    const entry = this.entries.get(filePath);
    if (
      entry !== undefined &&
      entry.sourceContent === key.sourceContent &&
      entry.analysisResult === key.analysisResult &&
      entry.tcbConfig === key.tcbConfig &&
      entry.remoteScopeKey === key.remoteScopeKey
    ) {
      return entry.processed;
    }
    return undefined;
  }

  set(filePath: string, key: ProcessedFileCacheKey, processed: ProcessedFile): void {
    this.entries.set(filePath, {...key, processed});
  }

  delete(filePath: string): void {
    this.entries.delete(filePath);
  }

  clear(): void {
    this.entries.clear();
  }
}
