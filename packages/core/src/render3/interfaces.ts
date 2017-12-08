/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, Injector, QueryList, TemplateRef, Type, ViewContainerRef} from '../core';
import {ComponentTemplate} from './public_interfaces';
import {RComment, RElement, RText, Renderer3} from './renderer';

declare global {
  const ngDevMode: boolean;
}

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
  INDX_MASK = 0b11111111111111111111000000000000,
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


/**
 * `ViewState` stores all of the information needed to process the instructions as
 * they are invoked from the template. `ViewState` is saved when a child `View` is
 * being processed and restored when the child `View` is done.
 *
 * Keeping separate state for each view facilities view insertion / deletion, so we
 * don't have to edit the nodes array or directives array based on which views
 * are present.
 */
export interface ViewState {
  /**
   * The parent view is needed when we exit the view and must restore the previous
   * `ViewState`. Without this, the render method would have to keep a stack of
   * views as it is recursively rendering templates.
   */
  readonly parent: ViewState|null;

  /**
   * Pointer to the `LView` node which represents the root of the view. We
   * need this to be able to efficiently find the `LView` when inserting the
   * view into an anchor.
   */
  readonly node: LView|LElement;

  /**
   * ID to determine whether this view is the same as the previous view
   * in this position. If it's not, we know this view needs to be inserted
   * and the one that exists needs to be removed (e.g. if/else statements)
   */
  readonly id: number;

  /**
   * Renderer to be used for this view.
   */
  readonly renderer: Renderer3;

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
   * NOTE: We also use nodes == null as a marker for creationMode. We
   * do this by creating ViewState in incomplete state with nodes == null
   * and we initialize it on first run.
   */
  readonly data: any[];

  /**
   * All directives created inside this view. Stored as an array
   * rather than a linked list so we can look up directives directly
   * in the case of forward declaration or DI.
   *
   * The array alternates between instances and directive tokens.
   *  - even indices: contain the directive token (type)
   *  - odd indices: contain the directive def
   *
   * We must store the directive def (rather than token | null)
   * because we need to be able to access the inputs and outputs
   * of directives that aren't diPublic.
   */
  readonly directives: any[];

  /**
   * The binding start index is the index at which the nodes array
   * starts to store bindings only. Saving this value ensures that we
   * will begin reading bindings at the correct point in the array when
   * we are in update mode.
   */
  bindingStartIndex: number|null;

  /**
   * When a view is destroyed, listeners need to be released
   * and onDestroy callbacks need to be called. This cleanup array
   * stores both listener data (in chunks of 4) and onDestroy data
   * (in chunks of 2), as they'll be processed at the same time.
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
   * Necessary so views can traverse through their nested views
   * to remove listeners and call onDestroy callbacks.
   *
   * For embedded views, we store the container rather than the
   * first view to avoid managing splicing when views are added/removed.
   */
  child: ViewState|ContainerState|null;

  /**
   * The tail allows us to quickly add a new state to the end of the
   * view list without having to propagate starting from the first child.
   */
  tail: ViewState|ContainerState|null;

  /**
   * Allows us to propagate between view states.
   *
   * Embedded views already have a node.next, but it is only set for views
   * in the same container. We need a way to link component views as well.
   */
  next: ViewState|ContainerState|null;
}

export interface LNodeInjector {
  /**
   * We need to store a reference to the injector's parent so DI can keep looking up
   * the injector tree until it finds the dependency it's looking for.
   */
  readonly parent: LNodeInjector|null;

  /**
   * Allows access to the directives array in that node's view and to
   * the node's flags (for starting directive index and directive size). Necessary
   * for DI to retrieve a directive from the directives array if injector indicates
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
 * LNode is an internal data structure which is used for the incremental DOM algorithm.
 *
 * The data structure is optimized for speed and size.
 *
 * In order to be fast, all subtypes of `LNode` should have the same shape.
 * Because size of the `LNode` matters, many fields have multiple roles depending
 * on the `LNode` subtype.
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
   * If ViewState, then `data` contains lightDOM.
   * If LContainer, then `data` contains ContainerState
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

/**
 * Used for tracking queries.
 */
export interface QueryState {
  /**
   * Used to ask query if it should be cloned to the child element.
   *
   * For example in the case of deep queries the `child()` returns
   * query for the child node. In case of shallow queries it returns
   * `null`.
   */
  child(): QueryState|null;

  /**
   * Notify `QueryState` that a  `LNode` has been created.
   */
  add(node: LNode): void;

  /**
   * Notify `QueryState` that a `LView` has been added to `LContainer`.
   */
  insert(container: LContainer, view: LView, insertIndex: number): void;

  /**
   * Notify `QueryState` that a `LView` has been removed from `LContainer`.
   */
  remove(container: LContainer, view: LView, removeIndex: number): void;

  /**
   * Add additional `QueryList` to track.
   *
   * @param queryList `QueryList` to update with changes.
   * @param predicate Either `Type` or selector array of [key, value] predicates.
   * @param descend If true the query will recursively apply to the children.
   */
  track<T>(queryList: QueryList<T>, predicate: Type<T>|any[], descend?: boolean): void;
}

/** The state associated with an LContainer */
export interface ContainerState {
  /**
   * The next active index in the children array to read or write to. This helps us
   * keep track of where we are in the children array.
   */
  nextIndex: number;

  /**
   * This allows us to jump from a container to a sibling container or
   * component view with the same parent, so we can remove listeners efficiently.
   */
  next: ViewState|ContainerState|null;

  /**
   * Access to the parent view is necessary so we can propagate back
   * up from inside a container to parent.next.
   */
  parent: ViewState|null;

  /**
   * A list of the container's currently active child views. Views will be inserted
   * here as they are added and spliced from here when they are removed. We need
   * to keep a record of current views so we know which views are already in the DOM
   * (and don't need to be re-added) and so we can remove views from the DOM when they
   * are no longer required.
   */
  readonly children: LView[];

  /**
   * Parent Element which will contain the location where all of the Views will be
   * inserted into to.
   *
   * If `renderParent` is `null` it is headless. This means that it is contained
   * in another `LView` which in turn is contained in another `LContainer` and therefore
   * it does not yet have its own parent.
   *
   * If `renderParent` is not `null` than it may be:
   * - same as `LContainer.parent` in which case it is just a normal container.
   * - different from `LContainer.parent` in which case it has been re-projected.
   *   In other words `LContainer.parent` is logical parent where as
   *   `ContainerState.projectedParent` is render parent.
   *
   * When views are inserted into `LContainer` than `renderParent` is:
   * - `null`, we are in `LView` keep going up a hierarchy until actual
   *   `renderParent` is found.
   * - not `null`, than use the `projectedParent.native` as the `RElement` to insert
   *   `LView`s into.
   */
  renderParent: LElement|null;

  /**
   * The template extracted from the location of the Container.
   */
  readonly template: ComponentTemplate<any>|null;
}

/**
 * This mapping is necessary so we can set input properties and output listeners
 * properly at runtime when property names are minified.
 *
 * Key: original unminified input or output name
 * Value: array containing minified name and related directive index
 *
 * The value must be an array to support inputs and outputs with the same name
 * on the same node.
 */
export type MinificationData = {
  [key: string]: MinificationDataValue
};

/**
 * The value in MinificationData objects.
 *
 * In each array:
 * Even indices: directive index
 * Odd indices: minified name
 *
 * e.g. [0, 'change-minified']
 */
export type MinificationDataValue = (number | string)[];


/**
 * This array contains information about input properties that
 * need to be set once from attribute data. It's ordered by
 * directive index (relative to element) so it's simple to
 * look up a specific directive's initial input data.
 *
 * Within each sub-array:
 *
 * Even indices: minified input name
 * Odd indices: initial value
 *
 * If a directive on a node does not have any input properties
 * that should be set from attributes, its index is set to null
 * to avoid a sparse array.
 *
 * e.g. [null, ['role-min', 'button']]
 */
export type InitialInputData = (InitialInputs | null)[];

/**
 * Used by InitialInputData to store input properties
 * that should be set once from attributes.
 *
 * Even indices: minified input name
 * Odd indices: initial value
 *
 * e.g. ['role-min', 'button']
 */
export type InitialInputs = string[];

/**
 * LNode binding data for a particular node that is shared between all templates
 * of a specific type.
 *
 * If a property is:
 *    - Minification Data: that property's data was generated and this is it
 *    - Null: that property's data was already generated and nothing was found.
 *    - Undefined: that property's data has not yet been generated
 */
export interface LNodeStatic {
  /** The tag name associated with this node. */
  tagName: string|null;

  /**
   * Static attributes associated with an element. We need to store
   * static attributes to support content projection with selectors.
   * Attributes are stored statically because reading them from the DOM
   * would be way too slow for content projection and queries.
   *
   * Since attrs will always be calculated first, they will never need
   * to be marked undefined by other instructions.
   */
  attrs: string[]|null;

  /**
   * This property contains information about input properties that
   * need to be set once from attribute data.
   */
  initialInputs: InitialInputData|null|undefined;

  /** Input data for all directives on this node. */
  inputs: MinificationData|null|undefined;

  /** Output data for all directives on this node. */
  outputs: MinificationData|null|undefined;

  /**
   * If this LNodeStatic corresponds to an LContainer, the container will
   * need to have nested static data for each of its embedded views.
   * Otherwise, nodes in embedded views with the same index as nodes
   * in their parent views will overwrite each other, as they are in
   * the same template.
   *
   * Each index in this array corresponds to the static data for a certain
   * view. So if you had V(0) and V(1) in a container, you might have:
   *
   * [
   *   [{tagName: 'div', attrs: ...}, null],     // V(0) ngData
   *   [{tagName: 'button', attrs ...}, null]    // V(1) ngData
   * ]
   */
  containerStatic: (LNodeStatic|null)[][]|null;
}

/** Static data for an LElement */
export interface LElementStatic extends LNodeStatic { containerStatic: null; }

/** Static data for an LContainer */
export interface LContainerStatic extends LNodeStatic { containerStatic: (LNodeStatic|null)[][]; }

/** Interface necessary to work with view tree traversal */
export interface ViewOrContainerState {
  next: ViewState|ContainerState|null;
  child?: ViewState|ContainerState|null;
  children?: LView[];
  parent: ViewState|null;
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

/**
 * A projection state is just an array of projected nodes.
 *
 * It would be nice if we could not need an array, but since a projected note can be
 * re-projected, the same node can be part of more than one LProjection which makes
 * list approach not possible.
 */
export type ProjectionState = Array<LElement|LText|LContainer>;

export interface LProjection extends LNode {
  readonly native: null;
  child: null;
  next: LContainer|LElement|LText|LProjection|null;

  readonly data: ProjectionState;

  /** Projections can be added to elements or views. */
  readonly parent: LElement|LView;
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
export type SimpleCSSSelector = string[];

/**
 * A complex selector expressed as an Array where:
 * - element at index 0 is a selector (SimpleCSSSelector) to match
 * - elements at index 1..n is a selector (SimpleCSSSelector) that should NOT match
 */
export type CSSSelectorWithNegations = [SimpleCSSSelector | null, SimpleCSSSelector[] | null];

/**
 * A collection of complex selectors (CSSSelectorWithNegations) in a parsed form
 */
export type CSSSelector = CSSSelectorWithNegations[];
