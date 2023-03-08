/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DEHYDRATED_VIEWS, LContainer} from '../render3/interfaces/container';
import {RNode} from '../render3/interfaces/renderer_dom';

import {DehydratedContainerView, NUM_ROOT_NODES, SerializedContainerView, TEMPLATE} from './interfaces';
import {siblingAfter} from './node_lookup_utils';


/**
 * Given a current DOM node and a serialized information about the views
 * in a container, walks over the DOM structure, collecting the list of
 * dehydrated views.
 */
export function locateDehydratedViewsInContainer(
    currentRNode: RNode,
    serializedViews: SerializedContainerView[]): [RNode, DehydratedContainerView[]] {
  const dehydratedViews: DehydratedContainerView[] = [];
  for (const serializedView of serializedViews) {
    const view: DehydratedContainerView = {
      data: serializedView,
      firstChild: null,
    };
    if (serializedView[NUM_ROOT_NODES] > 0) {
      // Keep reference to the first node in this view,
      // so it can be accessed while invoking template instructions.
      view.firstChild = currentRNode as HTMLElement;

      // Move over to the next node after this view, which can
      // either be a first node of the next view or an anchor comment
      // node after the last view in a container.
      currentRNode = siblingAfter(serializedView[NUM_ROOT_NODES], currentRNode)!;
    }
    dehydratedViews.push(view);
  }

  return [currentRNode, dehydratedViews];
}

/**
 * Reference to a function that searches for a matching dehydrated views
 * stored on a given lContainer.
 * Returns `null` by default, when hydration is not enabled.
 */
let _findMatchingDehydratedViewImpl: typeof findMatchingDehydratedViewImpl =
    (lContainer: LContainer, template: string|null) => null;

function findMatchingDehydratedViewImpl(
    lContainer: LContainer, template: string|null): DehydratedContainerView|null {
  if (!lContainer || !template || !lContainer[DEHYDRATED_VIEWS]) {
    return null;
  }
  let view: DehydratedContainerView|null = null;
  // Does the target container have any dehydrated views?
  const views = lContainer[DEHYDRATED_VIEWS];
  if (views.length > 0) {
    const viewIndex = views.findIndex(view => view.data[TEMPLATE] === template);

    if (viewIndex > -1) {
      view = views[viewIndex];

      // Drop this view from the list of de-hydrated ones.
      views.splice(viewIndex, 1);
    }
  }
  return view;
}

export function enableFindMatchingDehydratedViewImpl() {
  _findMatchingDehydratedViewImpl = findMatchingDehydratedViewImpl;
}

export function findMatchingDehydratedView(
    lContainer: LContainer, template: string|null): DehydratedContainerView|null {
  return _findMatchingDehydratedViewImpl(lContainer, template);
}
