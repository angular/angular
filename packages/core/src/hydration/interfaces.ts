/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {DeferBlockTrigger} from '../defer/interfaces';
import type {I18nICUNode} from '../render3/interfaces/i18n';
import {RNode} from '../render3/interfaces/renderer_dom';

/** Encodes that the node lookup should start from the host node of this component. */
export const REFERENCE_NODE_HOST = 'h';

/** Encodes that the node lookup should start from the document body node. */
export const REFERENCE_NODE_BODY = 'b';

/**
 * Describes navigation steps that the runtime logic need to perform,
 * starting from a given (known) element.
 * We're not using enum `NodeNavigationStep` because it produces more code overhead;
 * thus, using plain `const` eliminates extra bytes. We can't use `const enum` due
 * to single-file compilation restrictions.
 */

export type NodeNavigationStep = 'f' | 'n';

export const NODE_NAVIGATION_STEP_FIRST_CHILD = 'f';
export const NODE_NAVIGATION_STEP_NEXT_SIBLING = 'n';

/**
 * Keys within serialized view data structure to represent various
 * parts. See the `SerializedView` interface below for additional information.
 */
export const ELEMENT_CONTAINERS = 'e';
export const TEMPLATES = 't';
export const CONTAINERS = 'c';
export const MULTIPLIER = 'x';
export const NUM_ROOT_NODES = 'r';
export const TEMPLATE_ID = 'i'; // as it's also an "id"
export const NODES = 'n';
export const DISCONNECTED_NODES = 'd';
export const I18N_DATA = 'l';
export const DEFER_BLOCK_ID = 'di';
export const DEFER_BLOCK_STATE = 's';
export const DEFER_PARENT_BLOCK_ID = 'p';
export const DEFER_HYDRATE_TRIGGERS = 't';
export const DEFER_PREFETCH_TRIGGERS = 'pt';

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

  /**
   * Serialized information about i18n blocks in a template.
   * Key-value pairs where a key is an index of the corresponding
   * i18n entry within an LView, and the value is a list of
   * active ICU cases.
   */
  [I18N_DATA]?: Record<number, number[]>;

  /**
   * If this view represents a `@defer` block, this field contains
   * unique id of the block.
   */
  [DEFER_BLOCK_ID]?: string;

  /**
   * This field represents a status, based on the `DeferBlockState` enum.
   */
  [DEFER_BLOCK_STATE]?: number;
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
 * Serialized data structure that contains relevant defer block
 * information that describes a given incremental hydration boundary
 */
export interface SerializedDeferBlock {
  /**
   * This contains the unique id of this defer block's parent, if it exists.
   */
  [DEFER_PARENT_BLOCK_ID]?: string;

  /**
   * This field represents a status, based on the `DeferBlockState` enum.
   */
  [DEFER_BLOCK_STATE]?: number;

  /**
   * Number of root nodes that belong to this defer block's template.
   * This information is needed to effectively traverse the DOM tree
   * and add jsaction attributes to root nodes appropriately for
   * incremental hydration.
   */
  [NUM_ROOT_NODES]: number;

  /**
   * The list of triggers that exist for incremental hydration, based on the
   * `Trigger` enum.
   */
  [DEFER_HYDRATE_TRIGGERS]?: (DeferBlockTrigger | SerializedTriggerDetails)[];
}

export interface SerializedTriggerDetails {
  trigger: DeferBlockTrigger;
  delay?: number;
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
   *
   * Once a view becomes hydrated, the value is set to `null`, which
   * indicates that further detaching/attaching view actions should result
   * in invoking corresponding DOM actions (attaching DOM nodes action is
   * skipped when we hydrate, since nodes are already in the DOM).
   */
  firstChild: RNode | null;

  /**
   * Stores references to first nodes in DOM segments that
   * represent either an <ng-container> or a view container.
   */
  segmentHeads?: {[index: number]: RNode | null};

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
  disconnectedNodes?: Set<number> | null;

  /**
   * A mapping from a view to the first child to begin claiming nodes.
   *
   * This mapping is generated by an i18n block, and is the source of
   * truth for the nodes inside of it.
   */
  i18nNodes?: Map<number, RNode | null>;

  /**
   * A mapping from the index of an ICU node to dehydrated data for it.
   *
   * This information is used during the hydration process on the client.
   * ICU cases that were active during server-side rendering will be added
   * to the map. The hydration logic will "claim" matching cases, removing
   * them from the map. The remaining entries are "unclaimed", and will be
   * removed from the DOM during hydration cleanup.
   */
  dehydratedIcuData?: Map<number, DehydratedIcuData>;
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

/**
 * An object that contains information about a dehydrated ICU case,
 * to facilitate cleaning up ICU cases that were active during
 * server-side rendering, but not during hydration.
 */
export interface DehydratedIcuData {
  /**
   * The case index that this data represents.
   */
  case: number;

  /**
   * A reference back to the AST for the ICU node. This allows the
   * AST to be used to clean up dehydrated nodes.
   */
  node: I18nICUNode;
}

/**
 * Summarizes the presence of specific types of triggers anywhere in the DOM
 */
export interface BlockSummary {
  data: SerializedDeferBlock;
  hydrate: {idle: boolean; immediate: boolean; viewport: boolean; timer: number | null};
}

/**
 * The details of a specific element's trigger and how it is associated to a block
 */
export interface ElementTrigger {
  el: HTMLElement;
  blockName: string;
  delay?: number;
}
