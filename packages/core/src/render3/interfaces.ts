/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {ElementRef} from '../linker/element_ref';
import {QueryList} from '../linker/query_list';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {Type} from '../type';

import {ComponentTemplate, DirectiveDef} from './definition_interfaces';
import {RComment, RElement, RText, Renderer3} from './renderer';
import {TNode} from './t_node';



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
   * If regular LElementNode, then `data` will be null.
   * If LElementNode with component, then `data` contains LView.
   * If LViewNode, then `data` contains the LView.
   * If LContainerNode, then `data` contains LContainer.
   * If LProjectionNode, then `data` contains LProjection.
   */
  readonly data: LView|LContainer|LProjection|null;


  /**
   * Each node belongs to a view.
   *
   * When the injector is walking up a tree, it needs access to the `directives` (part of view).
   */
  readonly view: LView;

  /** The injector associated with this node. Necessary for DI. */
  nodeInjector: LInjector|null;

  /**
   * Optional `QueryState` used for tracking queries.
   *
   * If present the node creation/updates are reported to the `QueryState`.
   */
  query: LQuery|null;

  /**
   * Pointer to the corresponding TNode object, which stores static
   * data about this node.
   */
  tNode: TNode|null;
}


/** LNode representing an element. */
export interface LElementNode extends LNode {
  /** The DOM element associated with this node. */
  readonly native: RElement;

  child: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;
  next: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;

  /** If Component then data has LView (light DOM) */
  readonly data: LView|null;

  /** LElementNodes can be inside other LElementNodes or inside LViewNodes. */
  readonly parent: LElementNode|LViewNode;
}

/** LNode representing a #text node. */
export interface LTextNode extends LNode {
  /** The text node associated with this node. */
  native: RText;
  child: null;
  next: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;

  /** LTextNodes can be inside LElementNodes or inside LViewNodes. */
  readonly parent: LElementNode|LViewNode;
  readonly data: null;
}

/** Abstract node which contains root nodes of a view. */
export interface LViewNode extends LNode {
  readonly native: null;
  child: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;
  next: LViewNode|null;

  /**  LViewNodes can only be added to LContainerNodes. */
  readonly parent: LContainerNode|null;
  readonly data: LView;
}

/** Abstract node container which contains other views. */
export interface LContainerNode extends LNode {
  /**
   * This comment node is appended to the container's parent element to mark where
   * in the DOM the container's child views should be added.
   *
   * If the container is a root node of a view, this comment will not be appended
   * until the parent view is processed.
   */
  readonly native: RComment;
  readonly data: LContainer;
  child: null;
  next: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;

  /** Containers can be added to elements or views. */
  readonly parent: LElementNode|LViewNode|null;
}


export interface LProjectionNode extends LNode {
  readonly native: null;
  child: null;
  next: LContainerNode|LElementNode|LTextNode|LProjectionNode|null;

  readonly data: LProjection;

  /** Projections can be added to elements or views. */
  readonly parent: LElementNode|LViewNode;
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

export interface LInjector {
  /**
   * We need to store a reference to the injector's parent so DI can keep looking up
   * the injector tree until it finds the dependency it's looking for.
   */
  readonly parent: LInjector|null;

  /**
   * Allows access to the directives array in that node's static data and to
   * the node's flags (for starting directive index and directive size). Necessary
   * for DI to retrieve a directive from the data array if injector indicates
   * it is there.
   */
  readonly node: LElementNode|LContainerNode;

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

/**
 * `LView` stores all of the information needed to process the instructions as
 * they are invoked from the template. Each embedded view and component view has its
 * own `LView`. When processing a particular view, we set the `currentView` to that
 * `LView`. When that view is done processing, the `currentView` is set back to
 * whatever the original `currentView` was before(the parent `LView`).
 *
 * Keeping separate state for each view facilities view insertion / deletion, so we
 * don't have to edit the data array based on which views are present.
 */
export interface LView {
  /**
   * Whether or not the view is in creationMode.
   *
   * This must be stored in the view rather than using `data` as a marker so that
   * we can properly support embedded views. Otherwise, when exiting a child view
   * back into the parent view, `data` will be defined and `creationMode` will be
   * improperly reported as false.
   */
  creationMode: boolean;

  /** The index in the data array at which view hooks begin to be stored. */
  viewHookStartIndex: number|null;

  /**
   * The parent view is needed when we exit the view and must restore the previous
   * `LView`. Without this, the render method would have to keep a stack of
   * views as it is recursively rendering templates.
   */
  readonly parent: LView|null;

  /**
   * Pointer to the `LViewNode` or `LElementNode` which represents the root of the view.
   *
   * If `LViewNode`, this is an embedded view of a container. We need this to be able to
   * efficiently find the `LViewNode` when inserting the view into an anchor.
   *
   * If `LElementNode`, this is the LView of a component.
   */
  readonly node: LViewNode|LElementNode;

  /**
   * ID to determine whether this view is the same as the previous view
   * in this position. If it's not, we know this view needs to be inserted
   * and the one that exists needs to be removed (e.g. if/else statements)
   */
  readonly id: number;

  /** Renderer to be used for this view. */
  readonly renderer: Renderer3;

  /**
   * The binding start index is the index at which the nodes array
   * starts to store bindings only. Saving this value ensures that we
   * will begin reading bindings at the correct point in the array when
   * we are in update mode.
   */
  bindingStartIndex: number|null;

  /**
   * When a view is destroyed, listeners need to be released and onDestroy callbacks
   * need to be called. This cleanup array stores both listener data (in chunks of 4)
   * and onDestroy data (in chunks of 2) for a particular view. Combining the arrays
   * saves on memory (70 bytes per array) and on a few bytes of code size (for two
   * separate for loops).
   *
   * If it's a listener being stored:
   * 1st index is: event name to remove
   * 2nd index is: native element
   * 3rd index is: listener function
   * 4th index is: useCapture boolean
   *
   * If it's an onDestroy function:
   * 1st index is: onDestroy function
   * 2nd index is; context for function
   */
  cleanup: any[]|null;

  /**
   * The first LView or LContainer beneath this LView in the hierarchy.
   *
   * Necessary to store this so views can traverse through their nested views
   * to remove listeners and call onDestroy callbacks.
   *
   * For embedded views, we store the LContainer rather than the first ViewState
   * to avoid managing splicing when views are added/removed.
   */
  child: LView|LContainer|null;

  /**
   * The last LView or LContainer beneath this LView in the hierarchy.
   *
   * The tail allows us to quickly add a new state to the end of the view list
   * without having to propagate starting from the first child.
   */
  tail: LView|LContainer|null;

  /**
   * The next sibling LView or LContainer.
   *
   * Allows us to propagate between sibling view states that aren't in the same
   * container. Embedded views already have a node.next, but it is only set for
   * views in the same container. We need a way to link component views and views
   * across containers as well.
   */
  next: LView|LContainer|null;

  /**
   * This array stores all element/text/container nodes created inside this view
   * and their bindings. Stored as an array rather than a linked list so we can
   * look up nodes directly in the case of forward declaration or bindings
   * (e.g. E(1))..
   *
   * All bindings for a given view are stored in the order in which they
   * appear in the template, starting with `bindingStartIndex`.
   * We use `bindingIndex` to internally keep track of which binding
   * is currently active.
   *
   * NOTE: We also use data == null as a marker for creationMode. We
   * do this by creating ViewState in incomplete state with nodes == null
   * and we initialize it on first run.
   */
  readonly data: any[];

  /**
   * The static data array for the current view. We need a reference to this so we
   * can easily walk up the node tree in DI and get the ngStaticData array associated
   * with a node (where the directive defs are stored).
   */
  ngStaticData: (TNode|DirectiveDef<any>|null)[];
}


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
}


/** Interface necessary to work with view tree traversal */
export interface LViewOrLContainer {
  next: LView|LContainer|null;
  child?: LView|LContainer|null;
  views?: LViewNode[];
  parent: LView|null;
}

/**
 * An LProjection is just an array of projected nodes.
 *
 * It would be nice if we could not need an array, but since a projected node can be
 * re-projected, the same node can be part of more than one LProjectionNode which makes
 * list approach not possible.
 */
export type LProjection = Array<LElementNode|LTextNode|LContainerNode>;

/** An enum representing possible values of the "read" option for queries. */
export const enum QueryReadType {
  ElementRef = 0,
  ViewContainerRef = 1,
  TemplateRef = 2,
}

/** Used for tracking queries (e.g. ViewChild, ContentChild). */
export interface LQuery {
  /**
   * Used to ask query if it should be cloned to the child element.
   *
   * For example in the case of deep queries the `child()` returns
   * query for the child node. In case of shallow queries it returns
   * `null`.
   */
  child(): LQuery|null;

  /**
   * Notify `LQuery` that a  `LNode` has been created.
   */
  addNode(node: LNode): void;

  /**
   * Notify `LQuery` that an `LViewNode` has been added to `LContainerNode`.
   */
  insertView(container: LContainerNode, view: LViewNode, insertIndex: number): void;

  /**
   * Notify `LQuery` that an `LViewNode` has been removed from `LContainerNode`.
   */
  removeView(container: LContainerNode, view: LViewNode, removeIndex: number): void;

  /**
   * Add additional `QueryList` to track.
   *
   * @param queryList `QueryList` to update with changes.
   * @param predicate Either `Type` or selector array of [key, value] predicates.
   * @param descend If true the query will recursively apply to the children.
   * @param read Indicates which token should be read from DI for this query.
   */
  track<T>(
      queryList: QueryList<T>, predicate: Type<any>|string[], descend?: boolean,
      read?: QueryReadType|Type<T>): void;
}

/**
 * Parsed selector in the following format:
 * [tagName, attr1Name, attr1Val, ..., attrnName, attrnValue, 'class', className1, className2, ...,
 * classNameN]
 *
 * * For example, given the following selector:
 *  `div.foo.bar[attr1=val1][attr2]` a parsed format would be:
 * `['div', 'attr1', 'val1', 'attr2', '', 'class', 'foo', 'bar']`.
 *
 * Things to notice:
 * - tag name is always at the position 0
 * - the `class` attribute is always the last attribute in a pre-parsed array
 * - class names in a selector are at the end of an array (after the attribute with the name
 * 'class').
 */
export type SimpleCssSelector = string[];

/**
 * A complex selector expressed as an Array where:
 * - element at index 0 is a selector (SimpleCSSSelector) to match
 * - elements at index 1..n is a selector (SimpleCSSSelector) that should NOT match
 */
export type CssSelectorWithNegations = [SimpleCssSelector | null, SimpleCssSelector[] | null];

/**
 * A collection of complex selectors (CSSSelectorWithNegations) in a parsed form
 */
export type CssSelector = CssSelectorWithNegations[];
