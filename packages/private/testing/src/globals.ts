/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Set by the test initialization scripts.

export const isBrowser = !!(globalThis as any).isBrowser;
export const isNode = !!(globalThis as any).isNode;
