/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ERROR_DEBUG_CONTEXT, ERROR_LOGGER, ERROR_ORIGINAL_ERROR, ERROR_TYPE} from './util/errors';
import {DebugContext} from './view/types';

export function getType(error: Error): Function {
  return (error as any)[ERROR_TYPE];
}

export function getDebugContext(error: Error): DebugContext {
  return (error as any)[ERROR_DEBUG_CONTEXT];
}

export function getOriginalError(error: Error): Error {
  return (error as any)[ERROR_ORIGINAL_ERROR];
}

export function getErrorLogger(error: Error): (console: Console, ...values: any[]) => void {
  return (error as any)[ERROR_LOGGER] || defaultErrorLogger;
}


function defaultErrorLogger(console: Console, ...values: any[]) {
  (<any>console.error)(...values);
}
