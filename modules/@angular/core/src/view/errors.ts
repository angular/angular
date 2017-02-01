/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseError, WrappedError} from '../facade/errors';

import {DebugContext, EntryAction, ViewState} from './types';

export function expressionChangedAfterItHasBeenCheckedError(
    context: DebugContext, oldValue: any, currValue: any, isFirstCheck: boolean): ViewDebugError {
  let msg =
      `Expression has changed after it was checked. Previous value: '${oldValue}'. Current value: '${currValue}'.`;
  if (isFirstCheck) {
    msg +=
        ` It seems like the view has been created after its parent and its children have been dirty checked.` +
        ` Has it been created in a change detection hook ?`;
  }
  return viewDebugError(msg, context);
}

export function viewWrappedDebugError(originalError: any, context: DebugContext): WrappedError&
    ViewDebugError {
  const err = viewDebugError(originalError.message, context) as WrappedError & ViewDebugError;
  err.originalError = originalError;
  return err;
}

export interface ViewDebugError { context: DebugContext; }

export function viewDebugError(msg: string, context: DebugContext): ViewDebugError {
  const err = new Error(msg) as any;
  err.context = context;
  err.stack = context.source;
  context.view.state |= ViewState.Errored;
  return err;
}

export function isViewDebugError(err: any): boolean {
  return err.context;
}

export function viewDestroyedError(action: EntryAction): Error {
  return new Error(`View has been used after destroy for ${EntryAction[action]}`);
}
