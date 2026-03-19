/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {assertDefined} from '../../util/assert';
import {assertLView} from '../assert';
import {readPatchedLView} from '../context_discovery';
import {CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {TNode} from '../interfaces/node';
import {isLContainer, isLView, isRootView} from '../interfaces/type_checks';
import {CHILD_HEAD, CONTEXT, LView, NEXT, TVIEW} from '../interfaces/view';

import {getComponentLViewByIndex, getLViewParent} from './view_utils';

/**
 * Retrieve the root view from any component or `LView` by walking the parent `LView` until
 * reaching the root `LView`.
 *
 * @param componentOrLView any component or `LView`
 */
export function getRootView<T>(componentOrLView: LView | {}): LView<T> {
  ngDevMode && assertDefined(componentOrLView, 'component');
  let lView = isLView(componentOrLView) ? componentOrLView : readPatchedLView(componentOrLView)!;
  while (lView && !isRootView(lView)) {
    lView = getLViewParent(lView)!;
  }
  ngDevMode && assertLView(lView);
  return lView as LView<T>;
}

/**
 * Returns the context information associated with the application where the target is situated. It
 * does this by walking the parent views until it gets to the root view, then getting the context
 * off of that.
 *
 * @param viewOrComponent the `LView` or component to get the root context for.
 */
export function getRootContext<T>(viewOrComponent: LView<T> | {}): T {
  const rootView = getRootView(viewOrComponent);
  ngDevMode &&
    assertDefined(rootView[CONTEXT], 'Root view has no context. Perhaps it is disconnected?');
  return rootView[CONTEXT] as T;
}

/**
 * Gets the first `LContainer` in the LView or `null` if none exists.
 */
export function getFirstLContainer(lView: LView): LContainer | null {
  return getNearestLContainer(lView[CHILD_HEAD]);
}

/**
 * Gets the next `LContainer` that is a sibling of the given container.
 */
export function getNextLContainer(container: LContainer): LContainer | null {
  return getNearestLContainer(container[NEXT]);
}

function getNearestLContainer(viewOrContainer: LContainer | LView | null) {
  while (viewOrContainer !== null && !isLContainer(viewOrContainer)) {
    viewOrContainer = viewOrContainer[NEXT];
  }
  return viewOrContainer as LContainer | null;
}

/**
 * A generator that yields the logical children of a given TNode in its LView.
 *
 * @param tNode The parent TNode.
 * @param lView The current LView.
 * @returns A generator that yields [TNode, LView] pairs for each logical child.
 */
function* walkLViewChildren(tNode: TNode, lView: LView): IterableIterator<[TNode, LView]> {
  // Visit child TNodes in the current view.
  let child = tNode.child;
  while (child) {
    yield [child, lView];
    child = child.next;
  }

  // If this is a component, visit its internal view.
  if (tNode.componentOffset > -1) {
    const componentLView = getComponentLViewByIndex(tNode.index, lView);
    if (isLView(componentLView)) {
      const componentTView = componentLView[TVIEW];
      let componentChild = componentTView.firstChild;
      while (componentChild) {
        yield [componentChild, componentLView];
        componentChild = componentChild.next;
      }
    }
  }

  // If this is a container (like `@if`), visit its embedded views.
  const slot = lView[tNode.index];
  if (isLContainer(slot)) {
    for (let i = CONTAINER_HEADER_OFFSET; i < slot.length; i++) {
      const embeddedLView = slot[i] as LView;
      const embeddedTView = embeddedLView[TVIEW];
      let embeddedChild = embeddedTView.firstChild;
      while (embeddedChild) {
        yield [embeddedChild, embeddedLView];
        embeddedChild = embeddedChild.next;
      }
    }
  }
}

/**
 * Recursively iterates through transitive descendants of an input view.
 *
 * @param lView The input LView.
 * @returns A generator that yields [TNode, LView] pairs for all descendants.
 */
function* walkLViewDescendants(lView: LView): IterableIterator<[TNode, LView]> {
  const tView = lView[TVIEW];
  let child = tView.firstChild;
  while (child) {
    yield* walkTNodeDescendants(child, lView);
    child = child.next;
  }
}

/**
 * Recursively iterates through the descendants of a TNode in the view tree,
 * yielding the node itself and all its transitive descendants.
 *
 * @param tNode The starting TNode.
 * @param lView The LView associated with the TNode.
 * @returns A generator that yields [TNode, LView] pairs for the node and its descendants.
 */
function* walkTNodeDescendants(tNode: TNode, lView: LView): IterableIterator<[TNode, LView]> {
  yield [tNode, lView];
  for (const [childTNode, childLView] of walkLViewChildren(tNode, lView)) {
    yield* walkTNodeDescendants(childTNode, childLView);
  }
}

/**
 * Iterates through transitive descendants of an input view and filters down to only components/directives.
 *
 * @param lView The input LView.
 * @returns A generator that yields [TNode, LView] pairs for nodes with directives.
 */
export function* walkLViewDirectives(lView: LView): IterableIterator<[TNode, LView]> {
  for (const [tNode, currentLView] of walkLViewDescendants(lView)) {
    if (tNode.directiveEnd > tNode.directiveStart) {
      yield [tNode, currentLView];
    }
  }
}
