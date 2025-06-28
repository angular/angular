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

  static create<TValue>(defaultValue: () => TValue, merge: (prev: TValue, next: TValue) => TValue) {
    return new ReactiveMetadataKey(defaultValue, merge);
  }

  static aggregate<TValue>() {
    return new ReactiveMetadataKey<TValue[]>(
      () => [],
      (prev, next) => [...prev, ...next],
    );
  }

  static min() {
    return new ReactiveMetadataKey<number | undefined>(
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
  }

  static max() {
    return new ReactiveMetadataKey<number | undefined>(
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
  }

  static or() {
    return new ReactiveMetadataKey<boolean>(
      () => false,
      (prev, next) => prev || next,
    );
  }

  static and() {
    return new ReactiveMetadataKey<boolean>(
      () => true,
      (prev, next) => prev && next,
    );
  }

  static static<TValue>() {
    return new StaticMetadataKey<TValue>();
  }
}

export class StaticMetadataKey<TValue> extends MetadataKey<TValue> {}

export class ReactiveMetadataKey<TValue> extends MetadataKey<TValue> {
  constructor(
    readonly defaultValue: () => TValue,
    readonly merge: (prev: TValue, next: TValue) => TValue,
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
