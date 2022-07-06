/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined} from '../../util/assert';
import {getComponentViewByInstance} from '../context_discovery';
import {CONTEXT, RootContext, RootContextFlags, TVIEW} from '../interfaces/view';
import {getRootView} from '../util/view_traversal_utils';

import {detectChangesInternal, markViewDirty, scheduleTick, tickRootContext} from './shared';

/**
 * Synchronously perform change detection on a component (and possibly its sub-components).
 *
 * This function triggers change detection in a synchronous way on a component.
 *
 * @param component The component which the change detection should be performed on.
 */
export function detectChanges(component: {}): void {
  const view = getComponentViewByInstance(component);
  detectChangesInternal(view[TVIEW], view, component);
}

/**
 * Marks the component as dirty (needing change detection). Marking a component dirty will
 * schedule a change detection on it at some point in the future.
 *
 * Marking an already dirty component as dirty won't do anything. Only one outstanding change
 * detection can be scheduled per component tree.
 *
 * @param component Component to mark as dirty.
 */
export function markDirty(component: {}): void {
  ngDevMode && assertDefined(component, 'component');
  const rootView = markViewDirty(getComponentViewByInstance(component))!;

  ngDevMode && assertDefined(rootView[CONTEXT], 'rootContext should be defined');
  scheduleTick(rootView[CONTEXT] as RootContext, RootContextFlags.DetectChanges);
}
