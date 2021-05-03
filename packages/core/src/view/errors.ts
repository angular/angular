/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getDebugContext} from '../errors';
import {ERROR_DEBUG_CONTEXT, ERROR_LOGGER} from '../util/errors';

import {DebugContext} from './types';

export function expressionChangedAfterItHasBeenCheckedError(
    context: DebugContext, oldValue: any, currValue: any, isFirstCheck: boolean): Error {
  let msg =
      `ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: '${
          oldValue}'. Current value: '${currValue}'.`;
  if (isFirstCheck) {
    msg +=
        ` It seems like the view has been created after its parent and its children have been dirty checked.` +
        ` Has it been created in a change detection hook ?`;
  }
  return viewDebugError(msg, context);
}

export function viewWrappedDebugError(err: any, context: DebugContext): Error {
  if (!(err instanceof Error)) {
    // errors that are not Error instances don't have a stack,
    // so it is ok to wrap them into a new Error object...
    err = new Error(err.toString());
  }
  _addDebugContext(err, context);
  return err;
}

export function viewDebugError(msg: string, context: DebugContext): Error {
  const err = new Error(msg);
  _addDebugContext(err, context);
  return err;
}

function _addDebugContext(err: Error, context: DebugContext) {
  (err as any)[ERROR_DEBUG_CONTEXT] = context;
  (err as any)[ERROR_LOGGER] = context.logError.bind(context);
}

export function isViewDebugError(err: Error): boolean {
  return !!getDebugContext(err);
}

export function viewDestroyedError(action: string): Error {
  return new Error(`ViewDestroyedError: Attempt to use a destroyed view: ${action}`);
}
