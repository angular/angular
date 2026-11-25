/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {asyncFn, DtLinkApi} from '../../../shared-utils';

// An example async function
async function remoteMultiply(a: number, b: number) {
  return await new Promise<number>((r) => setTimeout(() => r(a * b), 1000));
}

// Exposed BE API.
// Add all exposed functions, generators or remote signals to the array.
// The items should be decorated with one of the available function
// decorators that corresponds to the features of the exposable.
export const BACKEND_DTLINK_API = [asyncFn({remoteMultiply})] satisfies DtLinkApi;

/** Exposed DtLink backend API. */
export type BackendDtLinkApi = typeof BACKEND_DTLINK_API;
