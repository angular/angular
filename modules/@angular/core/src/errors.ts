/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from './type';
import {DebugContext} from './view';

export const ERROR_TYPE = 'ngType';
export const ERROR_COMPONENT_TYPE = 'ngComponentType';
export const ERROR_DEBUG_CONTEXT = 'ngDebugContext';
export const ERROR_ORIGINAL_ERROR = 'ngOriginalError';


export function getType(error: Error): Function {
  return (error as any)[ERROR_TYPE];
}

export function getDebugContext(error: Error): DebugContext {
  return (error as any)[ERROR_DEBUG_CONTEXT];
}

export function getOriginalError(error: Error): Error {
  return (error as any)[ERROR_ORIGINAL_ERROR];
}
