/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DehydratedContainerView} from '../../hydration/interfaces';

import {TNode} from './node';
import {RComment, RElement} from './renderer_dom';
import {FLAGS, HOST, LView, NEXT, PARENT, T_HOST} from './view';

/**
 * Special location which allows easy identification of type. If we have an array which was
 * retrieved from the `LView` and that array has `true` at `TYPE` location, we know it is
 * `LContainer`.
 */
export const TYPE = 1;

/**
 * Below are constants for LContainer indices to help us look up LContainer members
 * without having to remember the specific indices.
 * Uglify will inline these when minifying so there shouldn't be a cost.
 */

// FLAGS, PARENT, NEXT, and T_HOST are indices 2, 3, 4, and 5
// As we already have these constants in LView, we don't need to re-create them.

export const DEHYDRATED_VIEWS = 6;
export const NATIVE = 7;
export const VIEW_REFS = 8;
export const MOVED_VIEWS = 9;

/**
 * Size of LContainer's header. Represents the index after which all views in the
 * container will be inserted. We need to keep a record of current views so we know
 * which views are already in the DOM (and don't need to be re-added) and so we can
 * remove views from the DOM when they are no longer required.
 */
export const CONTAINER_HEADER_OFFSET = 10;

/**
 * The state associated with a container.
 *
 * This is an array so that its structure is closer to LView. This helps
 * when traversing the view tree (which is a mix of containers and component
 * views), so we can jump to viewOrContainer[NEXT] in the same way regardless
 * of type.
 */
export interface LContainer extends Array<any> {
  /**
   * The host element of this LContainer.
   *
   * The host could be an LView if this container is on a component node.
   * In that case, the component LView is its HOST.
   */
  readonly [HOST]: RElement | RComment | LView;

  /**
   * This is a type field which allows us to differentiate `LContainer` from `StylingContext` in an
   * efficient way. The value is always set to `true`
   */
  [TYPE]: true;

  /** Flags for this container. See LContainerFlags for more info. */
  [FLAGS]: LContainerFlags;

  /**
   * Access to the parent view is necessary so we can propagate back
   * up from inside a container to parent[NEXT].
   */
  [PARENT]: LView;

  /**
   * This allows us to jump from a container to a sibling container or component
   * view with the same parent, so we can remove listeners efficiently.
   */
  [NEXT]: LView | LContainer | null;

  /**
   * A collection of views created based on the underlying `<ng-template>` element but inserted into
   * a different `LContainer`. We need to track views created from a given declaration point since
   * queries collect matches from the embedded view declaration point and _not_ the insertion point.
   */
  [MOVED_VIEWS]: LView[] | null;

  /**
   * Pointer to the `TNode` which represents the host of the container.
   */
  [T_HOST]: TNode;

  /** The comment element that serves as an anchor for this LContainer. */
  [NATIVE]: RComment;

  /**
   * Array of `ViewRef`s used by any `ViewContainerRef`s that point to this container.
   *
   * This is lazily initialized by `ViewContainerRef` when the first view is inserted.
   *
   * NOTE: This is stored as `any[]` because render3 should really not be aware of `ViewRef` and
   * doing so creates circular dependency.
   */
  [VIEW_REFS]: unknown[] | null;

  /**
   * Array of dehydrated views within this container.
   *
   * This information is used during the hydration process on the client.
   * The hydration logic tries to find a matching dehydrated view, "claim" it
   * and use this information to do further matching. After that, this "claimed"
   * view is removed from the list. The remaining "unclaimed" views are
   * "garbage-collected" later on, i.e. removed from the DOM once the hydration
   * logic finishes.
   */
  [DEHYDRATED_VIEWS]: DehydratedContainerView[] | null;
}

/** Flags associated with an LContainer (saved in LContainer[FLAGS]) */
export const enum LContainerFlags {
  None = 0,
  /**
   * Flag to signify that this `LContainer` may have transplanted views which need to be change
   * detected. (see: `LView[DECLARATION_COMPONENT_VIEW])`.
   *
   * This flag, once set, is never unset for the `LContainer`.
   */
  HasTransplantedViews = 1 << 1,
}
