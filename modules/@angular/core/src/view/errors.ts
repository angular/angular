/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ERROR_DEBUG_CONTEXT, ERROR_ORIGINAL_ERROR, getDebugContext} from '../errors';
import {DebugContext, ViewState} from './types';

export function expressionChangedAfterItHasBeenCheckedError(
    context: DebugContext, oldValue: any, currValue: any, isFirstCheck: boolean): Error {
  let msg =
      `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: '${oldValue}'. Current value: '${currValue}'.`;
  if (isFirstCheck) {
    msg +=
        ` It seems like the view has been created after its parent and its children have been dirty checked.` +
        ` Has it been created in a change detection hook ?`;
  }
  return viewDebugError(msg, context);
}

export function viewWrappedDebugError(originalError: any, context: DebugContext): Error {
  const err = viewDebugError(originalError.message, context);
  (err as any)[ERROR_ORIGINAL_ERROR] = originalError;
  return err;
}

export function viewDebugError(msg: string, context: DebugContext): Error {
  const err = new Error(msg);
  (err as any)[ERROR_DEBUG_CONTEXT] = context;
  err.stack = context.source;
  return err;
}

export function isViewDebugError(err: Error): boolean {
  return !!getDebugContext(err);
}

export function viewDestroyedError(action: string): Error {
  return new Error(`ViewDestroyedError: Attempt to use a destroyed view: ${action}`);
}
