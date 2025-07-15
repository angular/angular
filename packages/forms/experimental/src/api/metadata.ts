/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class MetadataKey<TValue> {
  /** @internal */
  protected __type!: TValue;

  static reduce<TValue>(merge: (prev: TValue, next: TValue) => TValue, defaultValue: () => TValue) {
    return new ReactiveMetadataKey(merge, defaultValue);
  }

  static aggregate<TValue>() {
    return new ReactiveMetadataKey<TValue[]>(
      (prev, next) => [...prev, ...next],
      () => [],
    );
  }

  static min() {
    return new ReactiveMetadataKey<number | undefined>(
      (prev, next) => {
        if (prev === undefined) {
          return next;
        }
        if (next === undefined) {
          return prev;
        }
        return Math.min(prev, next);
      },
      () => undefined,
    );
  }

  static max() {
    return new ReactiveMetadataKey<number | undefined>(
      (prev, next) => {
        if (prev === undefined) {
          return next;
        }
        if (next === undefined) {
          return prev;
        }
        return Math.max(prev, next);
      },
      () => undefined,
    );
  }

  static or() {
    return new ReactiveMetadataKey<boolean>(
      (prev, next) => prev || next,
      () => false,
    );
  }

  static and() {
    return new ReactiveMetadataKey<boolean>(
      (prev, next) => prev && next,
      () => true,
    );
  }
}

export class ReactiveMetadataKey<TValue> extends MetadataKey<TValue> {
  constructor(
    readonly merge: (prev: TValue, next: TValue) => TValue,
    readonly defaultValue: () => TValue,
  ) {
    super();
  }
}

export const REQUIRED = MetadataKey.or();
export const MIN = MetadataKey.max();
export const MAX = MetadataKey.min();
export const MIN_LENGTH = MetadataKey.max();
export const MAX_LENGTH = MetadataKey.min();
export const PATTERN = MetadataKey.aggregate<string>();
