/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../../di/injector';
import {Sanitizer} from '../../sanitization/security';

import {LContainer} from './container';
import {ComponentTemplate, DirectiveDef, DirectiveDefList, PipeDef, PipeDefList} from './definition';
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
  /** Flags for this view (see LViewFlags for definition of each bit). */
  flags: LViewFlags;

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
  // TODO(kara): Remove when we have parent/child on TNodes
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
  bindingStartIndex: number;

  /**
   * The binding index we should access next.
   *
   * This is stored so that bindings can continue where they left off
   * if a view is left midway through processing bindings (e.g. if there is
   * a setter that creates an embedded view, like in ngIf).
   */
  bindingIndex: number;

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
   * (e.g. E(1)).
   *
   * All bindings for a given view are stored in the order in which they
   * appear in the template, starting with `bindingStartIndex`.
   * We use `bindingIndex` to internally keep track of which binding
   * is currently active.
   */
  readonly data: any[];

  /**
   * An array of directive instances in the current view.
   *
   * These must be stored separately from LNodes because their presence is
   * unknown at compile-time and thus space cannot be reserved in data[].
   */
  directives: any[]|null;

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
   * Queries active for this view - nodes from a view are reported to those queries
   */
  queries: LQueries|null;

  /**
   * An optional Module Injector to be used as fall back after Element Injectors are consulted.
   */
  injector: Injector|null;

  /**
   * An optional custom sanitizer
   */
  sanitizer: Sanitizer|null;
}

/** Flags associated with an LView (saved in LView.flags) */
export const enum LViewFlags {
  /**
   * Whether or not the view is in creationMode.
   *
   * This must be stored in the view rather than using `data` as a marker so that
   * we can properly support embedded views. Otherwise, when exiting a child view
   * back into the parent view, `data` will be defined and `creationMode` will be
   * improperly reported as false.
   */
  CreationMode = 0b0001,

  /** Whether this view has default change detection strategy (checks always) or onPush */
  CheckAlways = 0b0010,

  /** Whether or not this view is currently dirty (needing check) */
  Dirty = 0b0100,

  /** Whether or not this view is currently attached to change detection tree. */
  Attached = 0b1000,
}

/** Interface necessary to work with view tree traversal */
export interface LViewOrLContainer {
  next: LView|LContainer|null;
  views?: LViewNode[];
  tView?: TView;
  parent: LView|null;
}

/**
 * The static data for an LView (shared between all templates of a
 * given type).
 *
 * Stored on the template function as ngPrivateData.
 */
export interface TView {
  /**
   * Pointer to the `TNode` that represents the root of the view.
   *
   * If this is a `TNode` for an `LViewNode`, this is an embedded view of a container.
   * We need this pointer to be able to efficiently find this node when inserting the view
   * into an anchor.
   *
   * If this is a `TNode` for an `LElementNode`, this is the TView of a component.
   */
  node: TNode;

  /** Whether or not this template has been processed. */
  firstTemplatePass: boolean;

  /** Static data equivalent of LView.data[]. Contains TNodes. */
  data: TData;

  /**
   * Index of the host node of the first LView or LContainer beneath this LView in
   * the hierarchy.
   *
   * Necessary to store this so views can traverse through their nested views
   * to remove listeners and call onDestroy callbacks.
   *
   * For embedded views, we store the index of an LContainer's host rather than the first
   * LView to avoid managing splicing when views are added/removed.
   */
  childIndex: number;

  /**
   * Selector matches for a node are temporarily cached on the TView so the
   * DI system can eagerly instantiate directives on the same node if they are
   * created out of order. They are overwritten after each node.
   *
   * <div dirA dirB></div>
   *
   * e.g. DirA injects DirB, but DirA is created first. DI should instantiate
   * DirB when it finds that it's on the same node, but not yet created.
   *
   * Even indices: Directive defs
   * Odd indices:
   *   - Null if the associated directive hasn't been instantiated yet
   *   - Directive index, if associated directive has been created
   *   - String, temporary 'CIRCULAR' token set while dependencies are being resolved
   */
  currentMatches: CurrentMatchesList|null;

  /**
   * Directive and component defs that have already been matched to nodes on
   * this view.
   *
   * Defs are stored at the same index in TView.directives[] as their instances
   * are stored in LView.directives[]. This simplifies lookup in DI.
   */
  directives: DirectiveDefList|null;

  /**
   * Full registry of directives and components that may be found in this view.
   *
   * It's necessary to keep a copy of the full def list on the TView so it's possible
   * to render template functions without a host component.
   */
  directiveRegistry: DirectiveDefList|null;

  /**
   * Full registry of pipes that may be found in this view.
   *
   * The property is either an array of `PipeDefs`s or a function which returns the array of
   * `PipeDefs`s. The function is necessary to be able to support forward declarations.
   *
   * It's necessary to keep a copy of the full def list on the TView so it's possible
   * to render template functions without a host component.
   */
  pipeRegistry: PipeDefList|null;

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

  /**
   * Array of pipe ngOnDestroy hooks that should be executed when this view is destroyed.
   *
   * Even indices: Index of pipe in data
   * Odd indices: Hook function
   *
   * These must be stored separately from directive destroy hooks because their contexts
   * are stored in data.
   */
  pipeDestroyHooks: HookData|null;

  /**
   * A list of directive and element indices for child components that will need to be
   * refreshed when the current view has finished its check.
   *
   * Even indices: Directive indices
   * Odd indices: Element indices
   */
  components: number[]|null;

  /**
   * A list of indices for child directives that have host bindings.
   *
   * Even indices: Directive indices
   * Odd indices: Element indices
   */
  hostBindings: number[]|null;
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
// TODO: Remove this enum when containerRefresh instructions are removed
export const enum LifecycleStage {

  /* Init hooks need to be run, if any. */
  Init = 1,

  /* Content hooks need to be run, if any. Init hooks have already run. */
  AfterInit = 2,
}

/**
 * Static data that corresponds to the instance-specific data array on an LView.
 *
 * Each node's static data is stored in tData at the same index that it's stored
 * in the data array. Each pipe's definition is stored here at the same index
 * as its pipe instance in the data array. Any nodes that do not have static
 * data store a null value in tData to avoid a sparse array.
 */
export type TData = (TNode | PipeDef<any>| null)[];

/** Type for TView.currentMatches */
export type CurrentMatchesList = [DirectiveDef<any>, (string | number | null)];

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
