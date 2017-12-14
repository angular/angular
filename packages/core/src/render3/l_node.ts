/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, Injector, TemplateRef, ViewContainerRef} from '../core';
import {RComment, RElement, RText} from './renderer';
import {ViewState, ContainerState, ProjectionState, QueryState} from './interfaces';
import {LNodeStatic} from './l_node_static';

/**
 * LNodeFlags corresponds to the LNode.flags property. It contains information
 * on how to map a particular set of bits in LNode.flags to the node type, directive
 * count, or directive starting index.
 *
 * For example, if you wanted to check the type of a certain node, you would mask
 * node.flags with TYPE_MASK and compare it to the value for a certain node type. e.g:
 *
 *```ts
 * if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element) {...}
 *```
 */
export const enum LNodeFlags {
  Container = 0b00,
  Projection = 0b01,
  View = 0b10,
  Element = 0b11,
  ViewOrElement = 0b10,
  SIZE_SKIP = 0b100,
  SIZE_SHIFT = 2,
  INDX_SHIFT = 12,
  TYPE_MASK = 0b00000000000000000000000000000011,
  SIZE_MASK = 0b00000000000000000000111111111100,
  INDX_MASK = 0b11111111111111111111000000000000
}

/**
 * LNode is an internal data structure which is used for the incremental DOM algorithm.
 * The "L" stands for "Logical" to differentiate between `RNodes` (actual rendered DOM
 * node) and our logical representation of DOM nodes, `LNodes`.
 *
 * The data structure is optimized for speed and size.
 *
 * In order to be fast, all subtypes of `LNode` should have the same shape.
 * Because size of the `LNode` matters, many fields have multiple roles depending
 * on the `LNode` subtype.
 *
 * See: https://en.wikipedia.org/wiki/Inline_caching#Monomorphic_inline_caching
 *
 * NOTE: This is a private data structure and should not be exported by any of the
 * instructions.
 */
export interface LNode {
  /**
   * This number stores three values using its bits:
   *
   * - the type of the node (first 2 bits)
   * - the number of directives on that node (next 10 bits)
   * - the starting index of the node's directives in the directives array (last 20 bits).
   *
   * The latter two values are necessary so DI can effectively search the directives associated
   * with a node without searching the whole directives array.
   */
  flags: LNodeFlags;

  /**
   * The associated DOM node. Storing this allows us to:
   *  - append children to their element parents in the DOM (e.g. `parent.native.appendChild(...)`)
   *  - retrieve the sibling elements of text nodes whose creation / insertion has been delayed
   *  - mark locations where child views should be inserted (for containers)
   */
  readonly native: RElement|RText|RComment|null;

  /**
   * We need a reference to a node's parent so we can append the node to its parent's native
   * element at the appropriate time.
   */
  readonly parent: LNode|null;

  /**
   * First child of the current node.
   */
  child: LNode|null;

  /**
   * The next sibling node. Necessary so we can propagate through the root nodes of a view
   * to insert them or remove them from the DOM.
   */
  next: LNode|null;

  /**
   * If regular LElement, then `data` will be null.
   * If LElement with component, then `data` contains ViewState.
   * If LView, then `data` contains the ViewState.
   * If LContainer, then `data` contains ContainerState.
   * If LProjection, then `data` contains ProjectionState.
   */
  readonly data: ViewState|ContainerState|ProjectionState|null;


  /**
   * Each node belongs to a view.
   *
   * When the injector is walking up a tree, it needs access to the `directives` (part of view).
   */
  readonly view: ViewState;

  /** The injector associated with this node. Necessary for DI. */
  nodeInjector: LNodeInjector|null;

  /**
   * Optional `QueryState` used for tracking queries.
   *
   * If present the node creation/updates are reported to the `QueryState`.
   */
  query: QueryState|null;

  /**
   * Pointer to the corresponding LNodeStatic object, which stores static
   * data about this node.
   */
  staticData: LNodeStatic|null;
}


/** LNode representing an element. */
export interface LElement extends LNode {
  /** The DOM element associated with this node. */
  readonly native: RElement;

  child: LContainer|LElement|LText|LProjection|null;
  next: LContainer|LElement|LText|LProjection|null;

  /** If Component than data has ViewState (light DOM) */
  readonly data: ViewState|null;

  /** LElement nodes can be inside other LElement nodes or inside LViews. */
  readonly parent: LElement|LView;
}

/** LNode representing a #text node. */
export interface LText extends LNode {
  /** The text node associated with this node. */
  native: RText;
  child: null;
  next: LContainer|LElement|LText|LProjection|null;

  /** LText nodes can be inside LElement nodes or inside LViews. */
  readonly parent: LElement|LView;
  readonly data: null;
}

/**
 * Abstract node which contains root nodes of a view.
 */
export interface LView extends LNode {
  readonly native: null;
  child: LContainer|LElement|LText|LProjection|null;
  next: LView|null;

  /**  LView nodes can only be added to LContainers. */
  readonly parent: LContainer|null;
  readonly data: ViewState;
}

/**
 * Abstract node container which contains other views.
 */
export interface LContainer extends LNode {
  /**
   * This comment node is appended to the container's parent element to mark where
   * in the DOM the container's child views should be added.
   *
   * If the container is a root node of a view, this comment will not be appended
   * until the parent view is processed.
   */
  readonly native: RComment;
  readonly data: ContainerState;
  child: null;
  next: LContainer|LElement|LText|LProjection|null;

  /** Containers can be added to elements or views. */
  readonly parent: LElement|LView|null;
}


export interface LProjection extends LNode {
  readonly native: null;
  child: null;
  next: LContainer|LElement|LText|LProjection|null;

  readonly data: ProjectionState;

  /** Projections can be added to elements or views. */
  readonly parent: LElement|LView;
}

/**
 * NOTES:
 *
 * Each Array costs 70 bytes and is composed of `Array` and `(array)` object
 * - `Array` javascript visible object: 32 bytes
 * - `(array)` VM object where the array is actually stored in: 38 bytes
 *
 * Each Object cost is 24 bytes plus 8 bytes per property.
 *
 * For small arrays, it is more efficient to store the data as a linked list
 * of items rather than small arrays. However, the array access is faster as
 * shown here: https://jsperf.com/small-arrays-vs-linked-objects
 */

export interface LNodeInjector {
  /**
   * We need to store a reference to the injector's parent so DI can keep looking up
   * the injector tree until it finds the dependency it's looking for.
   */
  readonly parent: LNodeInjector|null;

  /**
   * Allows access to the directives array in that node's static data and to
   * the node's flags (for starting directive index and directive size). Necessary
   * for DI to retrieve a directive from the data array if injector indicates
   * it is there.
   */
  readonly node: LElement|LContainer;

  /**
   * The following bloom filter determines whether a directive is available
   * on the associated node or not. This prevents us from searching the directives
   * array at this level unless it's probable the directive is in it.
   *
   * - bf0: Check directive IDs 0-31  (IDs are % 128)
   * - bf1: Check directive IDs 33-63
   * - bf2: Check directive IDs 64-95
   * - bf3: Check directive IDs 96-127
   *
   * See: https://en.wikipedia.org/wiki/Bloom_filter for more about bloom filters.
   */
  bf0: number;
  bf1: number;
  bf2: number;
  bf3: number;

  /**
   * cbf0 - cbf3 properties determine whether a directive is available through a
   * parent injector. They refer to the merged values of parent bloom filters. This
   * allows us to skip looking up the chain unless it's probable that directive exists
   * up the chain.
   */
  cbf0: number;
  cbf1: number;
  cbf2: number;
  cbf3: number;
  injector: Injector|null;

  /** Stores the TemplateRef so subsequent injections of the TemplateRef get the same instance. */
  templateRef: TemplateRef<any>|null;

  /** Stores the ViewContainerRef so subsequent injections of the ViewContainerRef get the same
   * instance. */
  viewContainerRef: ViewContainerRef|null;

  /** Stores the ElementRef so subsequent injections of the ElementRef get the same instance. */
  elementRef: ElementRef|null;
}
