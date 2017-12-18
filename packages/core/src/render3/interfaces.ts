/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList, Type} from '../core';

import {LContainer, LElement, LNode, LText, LView} from './l_node';
import {LNodeStatic} from './l_node_static';
import {ComponentTemplate, DirectiveDef} from './public_interfaces';
import {Renderer3} from './renderer';

/**
 * `ViewState` stores all of the information needed to process the instructions as
 * they are invoked from the template. Each embedded view and component view has its
 * own `ViewState`. When processing a particular view, we set the `currentView` to that
 * `ViewState`. When that view is done processing, the `currentView` is set back to
 * whatever the original `currentView` was before(the parent `ViewState`).
 *
 * Keeping separate state for each view facilities view insertion / deletion, so we
 * don't have to edit the data array based on which views are present.
 */
export interface ViewState {
  /**
   * The parent view is needed when we exit the view and must restore the previous
   * `ViewState`. Without this, the render method would have to keep a stack of
   * views as it is recursively rendering templates.
   */
  readonly parent: ViewState|null;

  /**
   * Pointer to the `LView` or `LElement` node which represents the root of the view.
   *
   * If `LView`, this is an embedded view of a container. We need this to be able to
   * efficiently find the `LView` when inserting the view into an anchor.
   *
   * If `LElement`, this is the ViewState of a component.
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
   * The first ViewState or ContainerState beneath this ViewState in the hierarchy.
   *
   * Necessary to store this so views can traverse through their nested views
   * to remove listeners and call onDestroy callbacks.
   *
   * For embedded views, we store the ContainerState rather than the first ViewState
   * to avoid managing splicing when views are added/removed.
   */
  child: ViewState|ContainerState|null;

  /**
   * The last ViewState or ContainerState beneath this ViewState in the hierarchy.
   *
   * The tail allows us to quickly add a new state to the end of the view list
   * without having to propagate starting from the first child.
   */
  tail: ViewState|ContainerState|null;

  /**
   * The next sibling ViewState or ContainerState.
   *
   * Allows us to propagate between sibling view states that aren't in the same
   * container. Embedded views already have a node.next, but it is only set for
   * views in the same container. We need a way to link component views and views
   * across containers as well.
   */
  next: ViewState|ContainerState|null;

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
  ngStaticData: (LNodeStatic|DirectiveDef<any>|null)[];
}


/** The state associated with an LContainer */
export interface ContainerState {
  /**
   * The next active index in the views array to read or write to. This helps us
   * keep track of where we are in the views array.
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
  readonly views: LView[];

  /**
   * Parent Element which will contain the location where all of the Views will be
   * inserted into to.
   *
   * If `renderParent` is `null` it is headless. This means that it is contained
   * in another `LView` which in turn is contained in another `LContainer` and therefore
   * it does not yet have its own parent.
   *
   * If `renderParent` is not `null` then it may be:
   * - same as `LContainer.parent` in which case it is just a normal container.
   * - different from `LContainer.parent` in which case it has been re-projected.
   *   In other words `LContainer.parent` is logical parent where as
   *   `ContainerState.projectedParent` is render parent.
   *
   * When views are inserted into `LContainer` then `renderParent` is:
   * - `null`, we are in `LView` keep going up a hierarchy until actual
   *   `renderParent` is found.
   * - not `null`, then use the `projectedParent.native` as the `RElement` to insert
   *   `LView`s into.
   */
  renderParent: LElement|null;

  /**
   * The template extracted from the location of the Container.
   */
  readonly template: ComponentTemplate<any>|null;
}


/** Interface necessary to work with view tree traversal */
export interface ViewOrContainerState {
  next: ViewState|ContainerState|null;
  child?: ViewState|ContainerState|null;
  views?: LView[];
  parent: ViewState|null;
}

/**
 * A projection state is just an array of projected nodes.
 *
 * It would be nice if we could not need an array, but since a projected node can be
 * re-projected, the same node can be part of more than one LProjection which makes
 * list approach not possible.
 */
export type ProjectionState = Array<LElement|LText|LContainer>;

/**
 * An enum representing possible values of the "read" option for queries.
 */
export const enum QueryReadType {
  ElementRef = 0,
  ViewContainerRef = 1,
  TemplateRef = 2,
}

/**
 * Used for tracking queries (e.g. ViewChild, ContentChild).
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
  addNode(node: LNode): void;

  /**
   * Notify `QueryState` that a `LView` has been added to `LContainer`.
   */
  insertView(container: LContainer, view: LView, insertIndex: number): void;

  /**
   * Notify `QueryState` that a `LView` has been removed from `LContainer`.
   */
  removeView(container: LContainer, view: LView, removeIndex: number): void;

  /**
   * Add additional `QueryList` to track.
   *
   * @param queryList `QueryList` to update with changes.
   * @param predicate Either `Type` or selector array of [key, value] predicates.
   * @param descend If true the query will recursively apply to the children.
   * @param read Indicates which token should be read from DI for this query.
   */
  track<T>(
      queryList: QueryList<T>, predicate: Type<T>|string[], descend?: boolean,
      read?: QueryReadType): void;
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
