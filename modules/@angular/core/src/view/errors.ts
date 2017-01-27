/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseError, WrappedError} from '../facade/errors';

import {DebugContext} from './types';

export function expressionChangedAfterItHasBeenCheckedError(
    context: DebugContext, oldValue: any, currValue: any, isFirstCheck: boolean): ViewError {
  let msg =
      `Expression has changed after it was checked. Previous value: '${oldValue}'. Current value: '${currValue}'.`;
  if (isFirstCheck) {
    msg +=
        ` It seems like the view has been created after its parent and its children have been dirty checked.` +
        ` Has it been created in a change detection hook ?`;
  }
  return viewError(msg, context);
}

export function viewWrappedError(originalError: any, context: DebugContext): WrappedError&
    ViewError {
  const err = viewError(originalError.message, context) as WrappedError & ViewError;
  err.originalError = originalError;
  return err;
}

export interface ViewError { context: DebugContext; }

export function viewError(msg: string, context: DebugContext): ViewError {
  const err = new Error(msg) as any;
  err.context = context;
  err.stack = context.source;
  return err;
}

export function isViewError(err: any): boolean {
  return err.context;
}
