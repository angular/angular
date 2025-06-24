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
  ) {}
}

export const REQUIRED = new MetadataKey(
  () => false,
  (prev, next) => prev || next,
);

export const MIN = new MetadataKey<number | undefined>(
  () => undefined,
  (prev, next) => {
    if (prev === undefined) {
      return next;
    }

    if (next === undefined) {
      return prev;
    }
    return Math.max(prev, next);
  },
);

export const MAX = new MetadataKey<number | undefined>(
  () => undefined,
  (prev, next) => {
    if (prev === undefined) {
      return next;
    }

    if (next === undefined) {
      return prev;
    }
    return Math.min(prev, next);
  },
);

export const MIN_LENGTH = new MetadataKey<number | undefined>(
  () => -Infinity,
  (prev, next) => {
    if (prev === undefined) {
      return next;
    }

    if (next === undefined) {
      return prev;
    }

    return Math.max(prev, next);
  },
);

export const MAX_LENGTH = new MetadataKey<number | undefined>(
  () => undefined,
  (prev, next) => {
    if (prev === undefined) {
      return next;
    }

    if (next === undefined) {
      return prev;
    }

    return Math.min(prev, next);
  },
);

export const PATTERN = new MetadataKey<(string | undefined)[]>(
  () => [],
  (prev, next) => [...prev, ...next],
);

export const REGEX = new MetadataKey<(RegExp | undefined)[]>(
  () => [],
  (prev, next) => [...prev, ...next],
);
