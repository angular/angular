/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Flags describing an input for a directive. */
export enum InputFlags {
  None = 0,
  SignalBased = 1 << 0,
  HasDecoratorInputTransform = 1 << 1,
}
