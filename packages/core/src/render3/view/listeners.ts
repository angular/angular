/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '@angular/core/primitives/signals';

import {NotificationSource} from '../../change_detection/scheduling/zoneless_scheduling';
import {TNode} from '../interfaces/node';
import {isComponentHost} from '../interfaces/type_checks';
import {CONTEXT, INJECTOR, LView} from '../interfaces/view';
import {getComponentLViewByIndex} from '../util/view_utils';
import {profiler} from '../profiler';
import {ProfilerEvent} from '../profiler_types';
import {ErrorHandler} from '../../error_handler';
import {markViewDirty} from '../instructions/mark_view_dirty';

/**
 * Wraps an event listener with a function that marks ancestors dirty and prevents default behavior,
 * if applicable.
 *
 * @param tNode The TNode associated with this listener
 * @param lView The LView that contains this listener
 * @param listenerFn The listener function to call
 * @param wrapWithPreventDefault Whether or not to prevent default behavior
 * (the procedural renderer does this already, so in those cases, we should skip)
 */
export function wrapListener(
  tNode: TNode,
  lView: LView<{} | null>,
  listenerFn: (e?: any) => any,
): EventListener {
  // Note: we are performing most of the work in the listener function itself
  // to optimize listener registration.
  return function wrapListenerIn_markDirtyAndPreventDefault(e: any) {
    // Ivy uses `Function` as a special token that allows us to unwrap the function
    // so that it can be invoked programmatically by `DebugNode.triggerEventHandler`.
    if (e === Function) {
      return listenerFn;
    }

    // In order to be backwards compatible with View Engine, events on component host nodes
    // must also mark the component view itself dirty (i.e. the view that it owns).
    const startView = isComponentHost(tNode) ? getComponentLViewByIndex(tNode.index, lView) : lView;
    markViewDirty(startView, NotificationSource.Listener);

    const context = lView[CONTEXT];
    let result = executeListenerWithErrorHandling(lView, context, listenerFn, e);
    // A just-invoked listener function might have coalesced listeners so we need to check for
    // their presence and invoke as needed.
    let nextListenerFn = (<any>wrapListenerIn_markDirtyAndPreventDefault).__ngNextListenerFn__;
    while (nextListenerFn) {
      // We should prevent default if any of the listeners explicitly return false
      result = executeListenerWithErrorHandling(lView, context, nextListenerFn, e) && result;
      nextListenerFn = (<any>nextListenerFn).__ngNextListenerFn__;
    }

    return result;
  };
}

function executeListenerWithErrorHandling(
  lView: LView,
  context: {} | null,
  listenerFn: (e?: any) => any,
  e: any,
): boolean {
  const prevConsumer = setActiveConsumer(null);
  try {
    profiler(ProfilerEvent.OutputStart, context, listenerFn);
    // Only explicitly returning false from a listener should preventDefault
    return listenerFn(e) !== false;
  } catch (error) {
    // TODO(atscott): This should report to the application error handler, not the ErrorHandler on LView injector
    handleError(lView, error);
    return false;
  } finally {
    profiler(ProfilerEvent.OutputEnd, context, listenerFn);
    setActiveConsumer(prevConsumer);
  }
}

/** Handles an error thrown in an LView. */
function handleError(lView: LView, error: any): void {
  const injector = lView[INJECTOR];
  const errorHandler = injector ? injector.get(ErrorHandler, null) : null;
  errorHandler && errorHandler.handleError(error);
}
