/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RNode} from '../render3/interfaces/renderer_dom';

/* Represents a key in NghDom that holds information about <ng-container>s. */
export const ELEMENT_CONTAINERS = 'e';

/**
 * Represents element containers within this view, stored as key-value pairs
 * where key is an index of a container in an LView (also used in the
 * `elementContainerStart` instruction), the value is the number of root nodes
 * in this container. This information is needed to locate an anchor comment
 * node that goes after all container nodes.
 */
export interface SerializedElementContainers {
  [key: number]: number;
}

/**
 * Serialized data structure that contains relevant hydration
 * annotation information that describes a given hydration boundary
 * (e.g. a component).
 */
export interface SerializedView {
  /**
   * Serialized information about <ng-container>s.
   */
  [ELEMENT_CONTAINERS]?: SerializedElementContainers;
}

/**
 * Represents a hydration-related element container structure
 * at runtime, which includes a reference to a first node in
 * a DOM segment that corresponds to a given element container.
 */
export interface DehydratedElementContainer {
  /**
   * A reference to the first child in a DOM segment associated
   * with a first child in a given <ng-container>.
   */
  firstChild: RNode|null;
}

/**
 * An object that contains hydration-related information serialized
 * on the server, as well as the necessary references to segments of
 * the DOM, to facilitate the hydration process for a given hydration
 * boundary on the client.
 */
export interface DehydratedView {
  /**
   * The readonly hydration annotation data.
   */
  data: Readonly<SerializedView>;

  /**
   * A reference to the first child in a DOM segment associated
   * with a given hydration boundary.
   */
  firstChild: RNode|null;

  /**
   * Collection of <ng-container>s in a given view,
   * used as a set of pointers to first children in each
   * <ng-container>, so that those pointers are reused by
   * subsequent instructions.
   */
  ngContainers?: {[index: number]: DehydratedElementContainer};
}
