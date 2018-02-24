/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNotNull} from './assert';
import {LElementNode} from './interfaces/node';
import {LView, LViewFlags, RootContext} from './interfaces/view';


/** If node is an OnPush component, marks its LView dirty. */
export function markOnPushDirty(node: LElementNode): void {
  // Because data flows down the component tree, ancestors do not need to be marked dirty
  if (node.data && !(node.data.flags & LViewFlags.CheckAlways)) {
    node.data.flags |= LViewFlags.Dirty;
  }
}

/**
 * Wraps an event listener so its host view and its ancestor views will be marked dirty
 * whenever the event fires. Necessary to support OnPush components.
 */
export function wrapListenerWithDirtyLogic(
    view: LView, listener: EventListener, scheduler: (c: any) => void): EventListener {
  return function(e: Event) {
    markSelfAndParentsDirty(view, scheduler);
    listener(e);
  };
}

/** Marks current view and all ancestors dirty */
function markSelfAndParentsDirty(view: LView, scheduler: (c: any) => void): void {
  let currentView: LView|null = view;

  while (currentView.parent != null) {
    currentView.flags |= LViewFlags.Dirty;
    currentView = currentView.parent;
  }
  currentView.flags |= LViewFlags.Dirty;

  ngDevMode && assertNotNull(currentView !.context, 'rootContext');
  scheduler(currentView !.context as RootContext);
}
