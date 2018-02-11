/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentTemplate} from './definition';
import {LElementNode, LViewNode} from './node';
import {LQueries} from './query';
import {LView, TView} from './view';



/** The state associated with an LContainer */
export interface LContainer {
  /**
   * The next active index in the views array to read or write to. This helps us
   * keep track of where we are in the views array.
   */
  nextIndex: number;

  /**
   * This allows us to jump from a container to a sibling container or
   * component view with the same parent, so we can remove listeners efficiently.
   */
  next: LView|LContainer|null;

  /**
   * Access to the parent view is necessary so we can propagate back
   * up from inside a container to parent.next.
   */
  parent: LView|null;

  /**
   * A list of the container's currently active child views. Views will be inserted
   * here as they are added and spliced from here when they are removed. We need
   * to keep a record of current views so we know which views are already in the DOM
   * (and don't need to be re-added) and so we can remove views from the DOM when they
   * are no longer required.
   */
  readonly views: LViewNode[];

  /**
   * Parent Element which will contain the location where all of the Views will be
   * inserted into to.
   *
   * If `renderParent` is `null` it is headless. This means that it is contained
   * in another `LViewNode` which in turn is contained in another `LContainerNode` and
   * therefore it does not yet have its own parent.
   *
   * If `renderParent` is not `null` then it may be:
   * - same as `LContainerNode.parent` in which case it is just a normal container.
   * - different from `LContainerNode.parent` in which case it has been re-projected.
   *   In other words `LContainerNode.parent` is logical parent where as
   *   `LContainer.projectedParent` is render parent.
   *
   * When views are inserted into `LContainerNode` then `renderParent` is:
   * - `null`, we are in `LViewNode` keep going up a hierarchy until actual
   *   `renderParent` is found.
   * - not `null`, then use the `projectedParent.native` as the `RElement` to insert
   *   `LViewNode`s into.
   */
  renderParent: LElementNode|null;

  /**
   * The template extracted from the location of the Container.
   */
  readonly template: ComponentTemplate<any>|null;

  /**
   * A count of dynamic views rendered into this container. If this is non-zero, the `views` array
   * will be traversed when refreshing dynamic views on this container.
   */
  dynamicViewCount: number;

  /**
   * Queries active for this container - all the views inserted to / removed from
   * this container are reported to queries referenced here.
   */
  queries: LQueries|null;
}

/**
 * The static equivalent of LContainer, used in TContainerNode.
 *
 * The container needs to store static data for each of its embedded views
 * (TViews). Otherwise, nodes in embedded views with the same index as nodes
 * in their parent views will overwrite each other, as they are in
 * the same template.
 *
 * Each index in this array corresponds to the static data for a certain
 * view. So if you had V(0) and V(1) in a container, you might have:
 *
 * [
 *   [{tagName: 'div', attrs: ...}, null],     // V(0) TView
 *   [{tagName: 'button', attrs ...}, null]    // V(1) TView
 * ]
 */
export type TContainer = TView[];

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
