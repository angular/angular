/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class MetadataKey<TValue> {
  constructor(
    readonly defaultValue: () => TValue,
    readonly merge: (prev: TValue, next: TValue) => TValue,
  ) {
  }
}

export const REQUIRED = new MetadataKey(
  () => false,
  (prev, next) => prev || next,
);

export const DISABLED_REASON = new MetadataKey<readonly string[]>(
  () => [],
  (prev, next) => [...prev, ...next],
);

export const MIN = new MetadataKey<number>(
  () => -Infinity,
  (prev, next) => Math.max(prev, next),
);

export const MAX = new MetadataKey<number>(
  () => +Infinity,
  (prev, next) => Math.min(prev, next),
);

export const MIN_LENGTH = new MetadataKey<number>(
  () => -Infinity,
  (prev, next) => Math.max(prev, next)
);

export const MAX_LENGTH = new MetadataKey<number>(
  () => +Infinity,
  (prev, next) => Math.min(prev, next)
);
