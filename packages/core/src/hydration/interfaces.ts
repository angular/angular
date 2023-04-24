/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RNode} from '../render3/interfaces/renderer_dom';


/** Encodes that the node lookup should start from the host node of this component. */
export const REFERENCE_NODE_HOST = 'h';

/** Encodes that the node lookup should start from the document body node. */
export const REFERENCE_NODE_BODY = 'b';

/**
 * Describes navigation steps that the runtime logic need to perform,
 * starting from a given (known) element.
 */
export enum NodeNavigationStep {
  FirstChild = 'f',
  NextSibling = 'n',
}

/**
 * Keys within serialized view data structure to represent various
 * parts. See the `SerializedView` interface below for additional information.
 */
export const ELEMENT_CONTAINERS = 'e';
export const TEMPLATES = 't';
export const CONTAINERS = 'c';
export const MULTIPLIER = 'x';
export const NUM_ROOT_NODES = 'r';
export const TEMPLATE_ID = 'i';  // as it's also an "id"
export const NODES = 'n';
export const DISCONNECTED_NODES = 'd';

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

  /**
   * Serialized information about nodes in a template.
   * Key-value pairs where a key is an index of the corresponding
   * DOM node in an LView and the value is a path that describes
   * the location of this node (as a set of navigation instructions).
   */
  [NODES]?: Record<number, string>;

  /**
   * A list of ids which represents a set of nodes disconnected
   * from the DOM tree at the serialization time, but otherwise
   * present in the internal data structures.
   *
   * This information is used to avoid triggering the hydration
   * logic for such nodes and instead use a regular "creation mode".
   */
  [DISCONNECTED_NODES]?: number[];
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
  [TEMPLATE_ID]: string;

  /**
   * Number of root nodes that belong to this view.
   * This information is needed to effectively traverse the DOM tree
   * and identify segments that belong to different views.
   */
  [NUM_ROOT_NODES]: number;

  /**
   * Number of times this view is repeated.
   * This is used to avoid serializing and sending the same hydration
   * information about similar views (for example, produced by *ngFor).
   */
  [MULTIPLIER]?: number;
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
   * Stores references to first nodes in DOM segments that
   * represent either an <ng-container> or a view container.
   */
  segmentHeads?: {[index: number]: RNode|null};

  /**
   * An instance of a Set that represents nodes disconnected from
   * the DOM tree at the serialization time, but otherwise present
   * in the internal data structures.
   *
   * The Set is based on the `SerializedView[DISCONNECTED_NODES]` data
   * and is needed to have constant-time lookups.
   *
   * If the value is `null`, it means that there were no disconnected
   * nodes detected in this view at serialization time.
   */
  disconnectedNodes?: Set<number>|null;
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
