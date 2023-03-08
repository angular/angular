/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RNode} from '../render3/interfaces/renderer_dom';

/**
 * Keys within serialized view data structure to represent various
 * parts. See the `SerializedView` interface below for additional information.
 */
export const ELEMENT_CONTAINERS = 'e';
export const TEMPLATES = 't';
export const CONTAINERS = 'c';
export const NUM_ROOT_NODES = 'r';
export const TEMPLATE = 'i';  // as it's also an "id"

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

  /**
   * Serialized information about templates.
   * Key-value pairs where a key is an index of the corresponding
   * `template` instruction and the value is a unique id that can
   * be used during hydration to identify that template.
   */
  [TEMPLATES]?: Record<number, string>;

  /**
   * Serialized information about view containers.
   * Key-value pairs where a key is an index of the corresponding
   * LContainer entry within an LView, and the value is a list
   * of serialized information about views within this container.
   */
  [CONTAINERS]?: Record<number, SerializedContainerView[]>;
}

/**
 * Serialized data structure that contains relevant hydration
 * annotation information about a view that is a part of a
 * ViewContainer collection.
 */
export interface SerializedContainerView extends SerializedView {
  /**
   * Unique id that represents a TView that was used to create
   * a given instance of a view:
   *  - TViewType.Embedded: a unique id generated during serialization on the server
   *  - TViewType.Component: an id generated based on component properties
   *                        (see `getComponentId` function for details)
   */
  [TEMPLATE]: string;

  /**
   * Number of root nodes that belong to this view.
   * This information is needed to effectively traverse the DOM tree
   * and identify segments that belong to different views.
   */
  [NUM_ROOT_NODES]: number;
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

/**
 * An object that contains hydration-related information serialized
 * on the server, as well as the necessary references to segments of
 * the DOM, to facilitate the hydration process for a given view
 * inside a view container (either an embedded view or a view created
 * for a component).
 */
export interface DehydratedContainerView extends DehydratedView {
  data: Readonly<SerializedContainerView>;
}
