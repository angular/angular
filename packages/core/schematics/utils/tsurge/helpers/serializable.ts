/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Branded type indicating that the given data `T` is serializable. */
export type Serializable<T> = T & {__serializable: true};

/** Confirms that the given data `T` is serializable. */
export function confirmAsSerializable<T>(data: T): Serializable<T> {
  return data as Serializable<T>;
}
