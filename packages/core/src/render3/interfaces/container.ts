/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LQueries} from './query';
import {RComment, RElement} from './renderer';
import {StylingContext} from './styling';
import {HOST, LViewData, NEXT, PARENT, QUERIES} from './view';


/**
 * Below are constants for LContainer indices to help us look up LContainer members
 * without having to remember the specific indices.
 * Uglify will inline these when minifying so there shouldn't be a cost.
 */
export const ACTIVE_INDEX = 0;
export const VIEWS = 1;
// PARENT, NEXT, QUERIES, and HOST are indices 2, 3, 4, and 5.
// As we already have these constants in LViewData, we don't need to re-create them.
export const NATIVE = 6;
export const RENDER_PARENT = 7;

/**
 * The state associated with a container.
 *
 * This is an array so that its structure is closer to LViewData. This helps
 * when traversing the view tree (which is a mix of containers and component
 * views), so we can jump to viewOrContainer[NEXT] in the same way regardless
 * of type.
 */
export interface LContainer extends Array<any> {
  /**
   * The next active index in the views array to read or write to. This helps us
   * keep track of where we are in the views array.
   * In the case the LContainer is created for a ViewContainerRef,
   * it is set to null to identify this scenario, as indices are "absolute" in that case,
   * i.e. provided directly by the user of the ViewContainerRef API.
   */
  [ACTIVE_INDEX]: number;

  /**
   * A list of the container's currently active child views. Views will be inserted
   * here as they are added and spliced from here when they are removed. We need
   * to keep a record of current views so we know which views are already in the DOM
   * (and don't need to be re-added) and so we can remove views from the DOM when they
   * are no longer required.
   */
  [VIEWS]: LViewData[];

  /**
   * Access to the parent view is necessary so we can propagate back
   * up from inside a container to parent[NEXT].
   */
  [PARENT]: LViewData|null;

  /**
   * This allows us to jump from a container to a sibling container or component
   * view with the same parent, so we can remove listeners efficiently.
   */
  [NEXT]: LViewData|LContainer|null;

  /**
   * Queries active for this container - all the views inserted to / removed from
   * this container are reported to queries referenced here.
   */
  [QUERIES]: LQueries|null;

  /**
   * The host element of this LContainer.
   *
   * The host could be an LViewData if this container is on a component node.
   * In that case, the component LViewData is its HOST.
   *
   * It could also be a styling context if this is a node with a style/class
   * binding.
   */
  [HOST]: RElement|RComment|StylingContext|LViewData;

  /** The comment element that serves as an anchor for this LContainer. */
  [NATIVE]: RComment;

  /**
   * Parent Element which will contain the location where all of the views will be
   * inserted into to.
   *
   * If `renderParent` is `null` it is headless. This means that it is contained
   * in another view which in turn is contained in another container and
   * therefore it does not yet have its own parent.
   *
   * If `renderParent` is not `null` then it may be:
   * - same as `tContainerNode.parent` in which case it is just a normal container.
   * - different from `tContainerNode.parent` in which case it has been re-projected.
   *   In other words `tContainerNode.parent` is logical parent where as
   *   `tContainerNode.projectedParent` is render parent.
   *
   * When views are inserted into `LContainer` then `renderParent` is:
   * - `null`, we are in a view, keep going up a hierarchy until actual
   *   `renderParent` is found.
   * - not `null`, then use the `projectedParent.native` as the `RElement` to insert
   * views into.
   */
  [RENDER_PARENT]: RElement|null;
}

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
