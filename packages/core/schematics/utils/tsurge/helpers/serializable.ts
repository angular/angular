/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Branded type indicating that the given data `T` is serializable. */
export type Serializable<T> = {__serializable: true; T: T; data: T};

/** Confirms that the given data `T` is serializable. */
export function confirmAsSerializable<T>(data: T): Serializable<T> {
  return {
    __serializable: true,
    T: null!, // Just for type.
    data,
  };
}
