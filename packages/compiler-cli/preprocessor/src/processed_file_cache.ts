/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ProcessedFile} from './processor.js';

/**
 * Keeps each file's processed output across the builds of a session, so that a rebuild only
 * re-processes the files whose processing inputs changed. The inputs are fingerprinted by the
 * caller (`HybridCompiler`); an entry is reused only for an identical fingerprint.
 *
 * Reused outputs are shared with whoever received them before, so consumers must not mutate a
 * `ProcessedFile`.
 */
export class ProcessedFileCache {
  private readonly entries = new Map<string, {fingerprint: string; processed: ProcessedFile}>();

  get(filePath: string, fingerprint: string): ProcessedFile | undefined {
    const entry = this.entries.get(filePath);
    return entry?.fingerprint === fingerprint ? entry.processed : undefined;
  }

  set(filePath: string, fingerprint: string, processed: ProcessedFile): void {
    this.entries.set(filePath, {fingerprint, processed});
  }

  delete(filePath: string): void {
    this.entries.delete(filePath);
  }

  clear(): void {
    this.entries.clear();
  }
}

/**
 * A 128-bit fingerprint of `pieces`, in order. Not cryptographic: it guards against accidental
 * collisions between the successive inputs of one file, not against crafted ones. Two
 * independently seeded 64-bit lanes (cyrb53-style mixing) are fed every UTF-16 code unit, with a
 * separator after each piece so that `['ab', 'c']` and `['a', 'bc']` differ.
 */
export function fingerprintOf(pieces: readonly string[]): string {
  let a1 = 0xdeadbeef;
  let a2 = 0x41c6ce57;
  let b1 = 0x9e3779b9;
  let b2 = 0x85ebca6b;
  const feed = (code: number) => {
    a1 = Math.imul(a1 ^ code, 2654435761);
    a2 = Math.imul(a2 ^ code, 1597334677);
    b1 = Math.imul(b1 ^ code, 2246822507);
    b2 = Math.imul(b2 ^ code, 3266489909);
  };
  for (const piece of pieces) {
    for (let i = 0; i < piece.length; i++) {
      feed(piece.charCodeAt(i));
    }
    // Piece boundaries are made unambiguous by a separator and the piece's length.
    feed(0xffff);
    feed(piece.length & 0xffff);
    feed(piece.length >>> 16);
  }
  const finish = (h1: number, h2: number): [number, number] => {
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return [h1 >>> 0, h2 >>> 0];
  };
  return [...finish(a1, a2), ...finish(b1, b2)]
    .map((word) => word.toString(16).padStart(8, '0'))
    .join('');
}
