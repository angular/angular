/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '../../document';
import {StyleRoot} from '../../render';
import {asStyleRoot} from '../../render/api';
import {assertDefined} from '../../util/assert';
import {assertLView} from '../assert';
import {readPatchedLView} from '../context_discovery';
import {CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {TElementNode, TNode} from '../interfaces/node';
import {isComponentHost, isLContainer, isLView, isRootView} from '../interfaces/type_checks';
import {
  CHILD_HEAD,
  DECLARATION_COMPONENT_VIEW,
  CONTEXT,
  HOST,
  INJECTOR,
  LView,
  NEXT,
  RENDERER,
  T_HOST,
  PARENT,
} from '../interfaces/view';

import {getLViewParent} from './view_utils';

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
 * Generates all the {@link LView} and {@link LContainer} descendants of the given input. Also generates {@link LView}
 * and {@link LContainer} instances which are projected into a descendant.
 *
 * There are no strict guarantees on the order of traversal.
 * TODO: Duplicating results.
 */
export function* walkDescendants(
  parent: LView | LContainer,
): Generator<LView | LContainer, void, void> {
  for (const child of walkChildren(parent)) {
    yield child;
    yield* walkDescendants(child);
  }
}

function* walkChildren(parent: LView | LContainer): Generator<LView | LContainer, void, void> {
  let child = isLContainer(parent) ? parent[CONTAINER_HEADER_OFFSET] : parent[CHILD_HEAD];
  while (child) {
    yield child;
    child = child[NEXT];
  }

  if (isLView(parent)) {
    const host = parent[T_HOST];
    if (host && isComponentHost(host)) {
      // `parent[T_HOST]` is the `TElementNode` in the parents's parent view, which
      // owns the host element of `parent`. So we need to look up the grandparent
      // to access it.
      const grandparent = isLContainer(parent[PARENT]) ? parent[PARENT][PARENT]! : parent[PARENT]!;
      yield* walkProjectedChildren(grandparent, host as TElementNode);
    }
  }
}

function* walkProjectedChildren(
  lView: LView,
  componentHost: TElementNode,
): Generator<LView | LContainer, void, void> {
  if (!componentHost.projection) return;

  for (const projectedNodes of componentHost.projection) {
    if (Array.isArray(projectedNodes)) {
      // Projected `RNode` objects are just raw elements and don't contain any `LView` objects.
      continue;
    }

    for (const projectedNode of walkProjectedSiblings(projectedNodes)) {
      const projected = lView[projectedNode.index];
      if (isLView(projected) || isLContainer(projected)) yield projected;
    }
  }
}

function* walkProjectedSiblings(node: TNode | null): Generator<TNode, void, void> {
  while (node) {
    yield node;
    node = node.projectionNext;
  }
}

/** Combine multiple iterables into a single stream with the same ordering. */
export function* concat<T>(...iterables: Array<Iterable<T>>): Iterable<T> {
  for (const iterable of iterables) {
    yield* iterable;
  }
}

/** Returns the {@link StyleRoot} where styles for the component should be applied. */
export function getStyleRoot(lView: LView): StyleRoot | undefined {
  // DOM emulation does not support shadow DOM and `Node.prototype.getRootNode`, so we
  // need to feature detect and fallback even though it is already Baseline Widely
  // Available. In theory, we could do this only on SSR, but Jest, Vitest, and other
  // Node testing solutions lack DOM emulation as well.
  if (!Node.prototype.getRootNode) {
    // TODO: Can't use injector during destroy because it is destroyed before the
    // component. Is it ok to depend on the `document` global? If not, might need to
    // change the contract of `getStyleRoot` and inject `DOCUMENT` prior to
    // destruction.
    // const injector = lView[INJECTOR];
    // const doc = injector.get(DOCUMENT);

    return document;
  }

  const renderer = lView[RENDERER];
  if (renderer?.shadowRoot) return renderer.shadowRoot;

  const hostRNode = lView[HOST];
  ngDevMode && assertDefined(hostRNode, 'hostRNode');

  return asStyleRoot(hostRNode!.getRootNode());
}
