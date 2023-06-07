/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * The private API for signal-based inputs used by the runtime.
 */
export interface InternalInputSignal {
  bindToComputation(computation: () => unknown): void;
  bindToValue(value: unknown): void;
  initialized(): void;
}
