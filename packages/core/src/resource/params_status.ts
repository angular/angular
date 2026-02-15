/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ResourceParamsStatus} from './api';

export const PARAMS_STATUS = Symbol();

/**
 * A helper to create `ResourceParamsStatus` values.
 *
 * @experimental
 */
export const ResourceParams = {
  idle(): ResourceParamsStatus {
    return {[PARAMS_STATUS]: 'idle'};
  },
  loading(): ResourceParamsStatus {
    return {[PARAMS_STATUS]: 'loading'};
  },
  error(error: Error): ResourceParamsStatus {
    return {[PARAMS_STATUS]: 'error', error};
  },
};
