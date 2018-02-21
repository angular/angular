/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LContainer} from './container';
import {ComponentTemplate, DirectiveDef} from './definition';
import {LElementNode, LViewNode, TNode} from './node';
import {LQueries} from './query';
import {Renderer3} from './renderer';


/**
 * `LView` stores all of the information needed to process the instructions as
 * they are invoked from the template. Each embedded view and component view has its
 * own `LView`. When processing a particular view, we set the `currentView` to that
 * `LView`. When that view is done processing, the `currentView` is set back to
 * whatever the original `currentView` was before (the parent `LView`).
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
   * When a view is destroyed, listeners need to be released and outputs need to be
   * unsubscribed. This cleanup array stores both listener data (in chunks of 4)
   * and output data (in chunks of 2) for a particular view. Combining the arrays
   * saves on memory (70 bytes per array) and on a few bytes of code size (for two
   * separate for loops).
   *
   * If it's a listener being stored:
   * 1st index is: event name to remove
   * 2nd index is: native element
   * 3rd index is: listener function
   * 4th index is: useCapture boolean
   *
   * If it's an output subscription:
   * 1st index is: unsubscribe function
   * 2nd index is: context for function
   */
  cleanup: any[]|null;

  /**
   * This number tracks the next lifecycle hook that needs to be run.
   *
   * If lifecycleStage === LifecycleStage.ON_INIT, the init hooks haven't yet been run
   * and should be executed by the first r() instruction that runs OR the first
   * cR() instruction that runs (so inits are run for the top level view before any
   * embedded views).
   *
   * If lifecycleStage === LifecycleStage.CONTENT_INIT, the init hooks have been run, but
   * the content hooks have not yet been run. They should be executed on the first
   * r() instruction that runs.
   *
   * If lifecycleStage === LifecycleStage.VIEW_INIT, both the init hooks and content hooks
   * have already been run.
   */
  lifecycleStage: LifecycleStage;

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
   */
  readonly data: any[];

  /**
   * The static data for this view. We need a reference to this so we can easily walk up the
   * node tree in DI and get the TView.data array associated with a node (where the
   * directive defs are stored).
   */
  tView: TView;

  /**
   * For dynamically inserted views, the template function to refresh the view.
   */
  template: ComponentTemplate<{}>|null;

  /**
   * - For embedded views, the context with which to render the template.
   * - For root view of the root component the context contains change detection data.
   * - `null` otherwise.
   */
  context: {}|RootContext|null;

  /**
   * A count of dynamic views that are children of this view (indirectly via containers).
   *
   * This is used to decide whether to scan children of this view when refreshing dynamic views
   * after refreshing the view itself.
   */
  dynamicViewCount: number;

  /**
   * Queries active for this view - nodes from a view are reported to those queries
   */
  queries: LQueries|null;
}

/** Interface necessary to work with view tree traversal */
export interface LViewOrLContainer {
  next: LView|LContainer|null;
  child?: LView|LContainer|null;
  views?: LViewNode[];
  parent: LView|null;
}

/**
 * The static data for an LView (shared between all templates of a
 * given type).
 *
 * Stored on the template function as ngPrivateData.
 */
export interface TView {
  /** Static data equivalent of LView.data[]. Contains TNodes and directive defs. */
  data: TData;

  /** Whether or not this template has been processed. */
  firstTemplatePass: boolean;

  /**
   * Array of ngOnInit and ngDoCheck hooks that should be executed for this view in
   * creation mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  initHooks: HookData|null;

  /**
   * Array of ngDoCheck hooks that should be executed for this view in update mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  checkHooks: HookData|null;

  /**
   * Array of ngAfterContentInit and ngAfterContentChecked hooks that should be executed
   * for this view in creation mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  contentHooks: HookData|null;

  /**
   * Array of ngAfterContentChecked hooks that should be executed for this view in update
   * mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  contentCheckHooks: HookData|null;

  /**
   * Array of ngAfterViewInit and ngAfterViewChecked hooks that should be executed for
   * this view in creation mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  viewHooks: HookData|null;

  /**
   * Array of ngAfterViewChecked hooks that should be executed for this view in
   * update mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  viewCheckHooks: HookData|null;

  /**
   * Array of ngOnDestroy hooks that should be executed when this view is destroyed.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  destroyHooks: HookData|null;
}

/**
 * RootContext contains information which is shared for all components which
 * were bootstrapped with {@link renderComponent}.
 */
export interface RootContext {
  /**
   * A function used for scheduling change detection in the future. Usually
   * this is `requestAnimationFrame`.
   */
  scheduler: (workFn: () => void) => void;

  /**
   * A promise which is resolved when all components are considered clean (not dirty).
   *
   * This promise is overwritten every time a first call to {@link markDirty} is invoked.
   */
  clean: Promise<null>;

  /**
   * RootComponent - The component which was instantiated by the call to
   * {@link renderComponent}.
   */
  component: {};
}

/**
 * Array of hooks that should be executed for a view and their directive indices.
 *
 * Even indices: Directive index
 * Odd indices: Hook function
 */
export type HookData = (number | (() => void))[];

/** Possible values of LView.lifecycleStage, used to determine which hooks to run.  */
export const enum LifecycleStage {
  /* Init hooks need to be run, if any. */
  INIT = 1,

  /* Content hooks need to be run, if any. Init hooks have already run. */
  CONTENT_INIT = 2,

  /* View hooks need to be run, if any. Any init hooks/content hooks have ran. */
  VIEW_INIT = 3
}

/**
 * Static data that corresponds to the instance-specific data array on an LView.
 *
 * Each node's static data is stored in tData at the same index that it's stored
 * in the data array. Each directive's definition is stored here at the same index
 * as its directive instance in the data array. Any nodes that do not have static
 * data store a null value in tData to avoid a sparse array.
 */
export type TData = (TNode | DirectiveDef<any>| null)[];

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
