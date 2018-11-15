/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../../di/injection_token';
import {Injector} from '../../di/injector';
import {QueryList} from '../../linker';
import {Sanitizer} from '../../sanitization/security';
import {Type} from '../../type';
import {LContainer} from './container';
import {ComponentDef, ComponentQuery, ComponentTemplate, DirectiveDef, DirectiveDefList, HostBindingsFunction, PipeDef, PipeDefList} from './definition';
import {I18nUpdateOpCodes, TI18n} from './i18n';
import {TElementNode, TNode, TViewNode} from './node';
import {PlayerHandler} from './player';
import {LQueries} from './query';
import {RElement, Renderer3} from './renderer';
import {StylingContext} from './styling';


/** Size of LViewData's header. Necessary to adjust for it when setting slots.  */
export const HEADER_OFFSET = 17;

// Below are constants for LViewData indices to help us look up LViewData members
// without having to remember the specific indices.
// Uglify will inline these when minifying so there shouldn't be a cost.
export const TVIEW = 0;
export const FLAGS = 1;
export const PARENT = 2;
export const NEXT = 3;
export const QUERIES = 4;
export const HOST = 5;
export const HOST_NODE = 6;
export const BINDING_INDEX = 7;
export const CLEANUP = 8;
export const CONTEXT = 9;
export const INJECTOR = 10;
export const RENDERER = 11;
export const SANITIZER = 12;
export const TAIL = 13;
export const CONTAINER_INDEX = 14;
export const CONTENT_QUERIES = 15;
export const DECLARATION_VIEW = 16;

// This interface replaces the real LViewData interface if it is an arg or a
// return value of a public instruction. This ensures we don't need to expose
// the actual interface, which should be kept private.
export interface OpaqueViewState {
  '__brand__': 'Brand for OpaqueViewState that nothing will match';
}


/**
 * `LViewData` stores all of the information needed to process the instructions as
 * they are invoked from the template. Each embedded view and component view has its
 * own `LViewData`. When processing a particular view, we set the `viewData` to that
 * `LViewData`. When that view is done processing, the `viewData` is set back to
 * whatever the original `viewData` was before (the parent `LViewData`).
 *
 * Keeping separate state for each view facilities view insertion / deletion, so we
 * don't have to edit the data array based on which views are present.
 */
export interface LViewData extends Array<any> {
  /**
   * The static data for this view. We need a reference to this so we can easily walk up the
   * node tree in DI and get the TView.data array associated with a node (where the
   * directive defs are stored).
   */
  readonly[TVIEW]: TView;

  /** Flags for this view. See LViewFlags for more info. */
  [FLAGS]: LViewFlags;

  /**
   * The parent view is needed when we exit the view and must restore the previous
   * `LViewData`. Without this, the render method would have to keep a stack of
   * views as it is recursively rendering templates.
   *
   * This is the "insertion" view for embedded views. This allows us to properly
   * destroy embedded views.
   */
  [PARENT]: LViewData|null;

  /**
   *
   * The next sibling LViewData or LContainer.
   *
   * Allows us to propagate between sibling view states that aren't in the same
   * container. Embedded views already have a node.next, but it is only set for
   * views in the same container. We need a way to link component views and views
   * across containers as well.
   */
  [NEXT]: LViewData|LContainer|null;

  /** Queries active for this view - nodes from a view are reported to those queries. */
  [QUERIES]: LQueries|null;

  /**
   * The host node for this LViewData instance, if this is a component view.
   *
   * If this is an embedded view, HOST will be null.
   */
  [HOST]: RElement|StylingContext|null;

  /**
   * Pointer to the `TViewNode` or `TElementNode` which represents the root of the view.
   *
   * If `TViewNode`, this is an embedded view of a container. We need this to be able to
   * efficiently find the `LViewNode` when inserting the view into an anchor.
   *
   * If `TElementNode`, this is the LView of a component.
   *
   * If null, this is the root view of an application (root component is in this view).
   */
  [HOST_NODE]: TViewNode|TElementNode|null;

  /**
   * The binding index we should access next.
   *
   * This is stored so that bindings can continue where they left off
   * if a view is left midway through processing bindings (e.g. if there is
   * a setter that creates an embedded view, like in ngIf).
   */
  [BINDING_INDEX]: number;

  /**
   * When a view is destroyed, listeners need to be released and outputs need to be
   * unsubscribed. This context array stores both listener functions wrapped with
   * their context and output subscription instances for a particular view.
   *
   * These change per LView instance, so they cannot be stored on TView. Instead,
   * TView.cleanup saves an index to the necessary context in this array.
   */
  // TODO: flatten into LViewData[]
  [CLEANUP]: any[]|null;

  /**
   * - For dynamic views, this is the context with which to render the template (e.g.
   *   `NgForContext`), or `{}` if not defined explicitly.
   * - For root view of the root component the context contains change detection data.
   * - For non-root components, the context is the component instance,
   * - For inline views, the context is null.
   */
  [CONTEXT]: {}|RootContext|null;

  /** An optional Module Injector to be used as fall back after Element Injectors are consulted. */
  readonly[INJECTOR]: Injector|null;

  /** Renderer to be used for this view. */
  [RENDERER]: Renderer3;

  /** An optional custom sanitizer. */
  [SANITIZER]: Sanitizer|null;

  /**
   * The last LViewData or LContainer beneath this LViewData in the hierarchy.
   *
   * The tail allows us to quickly add a new state to the end of the view list
   * without having to propagate starting from the first child.
   */
  [TAIL]: LViewData|LContainer|null;

  /**
   * The index of the parent container's host node. Applicable only to embedded views that
   * have been inserted dynamically. Will be -1 for component views and inline views.
   *
   * This is necessary to jump from dynamically created embedded views to their parent
   * containers because their parent cannot be stored on the TViewNode (views may be inserted
   * in multiple containers, so the parent cannot be shared between view instances).
   */
  [CONTAINER_INDEX]: number;

  /**
   * Stores QueryLists associated with content queries of a directive. This data structure is
   * filled-in as part of a directive creation process and is later used to retrieve a QueryList to
   * be refreshed.
   */
  [CONTENT_QUERIES]: QueryList<any>[]|null;

  /**
   * View where this view's template was declared.
   *
   * Only applicable for dynamically created views. Will be null for inline/component views.
   *
   * The template for a dynamically created view may be declared in a different view than
   * it is inserted. We already track the "insertion view" (view where the template was
   * inserted) in LViewData[PARENT], but we also need access to the "declaration view"
   * (view where the template was declared). Otherwise, we wouldn't be able to call the
   * view's template function with the proper contexts. Context should be inherited from
   * the declaration view tree, not the insertion view tree.
   *
   * Example (AppComponent template):
   *
   * <ng-template #foo></ng-template>       <-- declared here -->
   * <some-comp [tpl]="foo"></some-comp>    <-- inserted inside this component -->
   *
   * The <ng-template> above is declared in the AppComponent template, but it will be passed into
   * SomeComp and inserted there. In this case, the declaration view would be the AppComponent,
   * but the insertion view would be SomeComp. When we are removing views, we would want to
   * traverse through the insertion view to clean up listeners. When we are calling the
   * template function during change detection, we need the declaration view to get inherited
   * context.
   */
  [DECLARATION_VIEW]: LViewData|null;
}

/** Flags associated with an LView (saved in LViewData[FLAGS]) */
export const enum LViewFlags {
  /**
   * Whether or not the view is in creationMode.
   *
   * This must be stored in the view rather than using `data` as a marker so that
   * we can properly support embedded views. Otherwise, when exiting a child view
   * back into the parent view, `data` will be defined and `creationMode` will be
   * improperly reported as false.
   */
  CreationMode = 0b0000001,

  /** Whether this view has default change detection strategy (checks always) or onPush */
  CheckAlways = 0b0000010,

  /** Whether or not this view is currently dirty (needing check) */
  Dirty = 0b0000100,

  /** Whether or not this view is currently attached to change detection tree. */
  Attached = 0b0001000,

  /**
   *  Whether or not the init hooks have run.
   *
   * If on, the init hooks haven't yet been run and should be executed by the first component that
   * runs OR the first cR() instruction that runs (so inits are run for the top level view before
   * any embedded views).
   */
  RunInit = 0b0010000,

  /** Whether or not this view is destroyed. */
  Destroyed = 0b0100000,

  /** Whether or not this view is the root view */
  IsRoot = 0b1000000,
}

/**
 * The static data for an LView (shared between all templates of a
 * given type).
 *
 * Stored on the template function as ngPrivateData.
 */
export interface TView {
  /**
   * ID for inline views to determine whether a view is the same as the previous view
   * in a certain position. If it's not, we know the new view needs to be inserted
   * and the one that exists needs to be removed (e.g. if/else statements)
   *
   * If this is -1, then this is a component view or a dynamically created view.
   */
  readonly id: number;

  /**
   * This is a blueprint used to generate LViewData instances for this TView. Copying this
   * blueprint is faster than creating a new LViewData from scratch.
   */
  blueprint: LViewData;

  /**
   * The template function used to refresh the view of dynamically created views
   * and components. Will be null for inline views.
   */
  template: ComponentTemplate<{}>|null;

  /**
   * A function containing query-related instructions.
   */
  viewQuery: ComponentQuery<{}>|null;

  /**
   * Pointer to the `TNode` that represents the root of the view.
   *
   * If this is a `TNode` for an `LViewNode`, this is an embedded view of a container.
   * We need this pointer to be able to efficiently find this node when inserting the view
   * into an anchor.
   *
   * If this is a `TElementNode`, this is the view of a root component. It has exactly one
   * root TNode.
   *
   * If this is null, this is the view of a component that is not at root. We do not store
   * the host TNodes for child component views because they can potentially have several
   * different host TNodes, depending on where the component is being used. These host
   * TNodes cannot be shared (due to different indices, etc).
   */
  node: TViewNode|TElementNode|null;

  /** Whether or not this template has been processed. */
  firstTemplatePass: boolean;

  /** Static data equivalent of LView.data[]. Contains TNodes, PipeDefInternal or TI18n. */
  data: TData;

  /**
   * The binding start index is the index at which the data array
   * starts to store bindings only. Saving this value ensures that we
   * will begin reading bindings at the correct point in the array when
   * we are in update mode.
   */
  bindingStartIndex: number;

  /**
   * The index where the "expando" section of `LViewData` begins. The expando
   * section contains injectors, directive instances, and host binding values.
   * Unlike the "consts" and "vars" sections of `LViewData`, the length of this
   * section cannot be calculated at compile-time because directives are matched
   * at runtime to preserve locality.
   *
   * We store this start index so we know where to start checking host bindings
   * in `setHostBindings`.
   */
  expandoStartIndex: number;

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
   * A reference to the first child node located in the view.
   */
  firstChild: TNode|null;

  /**
   * Set of instructions used to process host bindings efficiently.
   *
   * See VIEW_DATA.md for more information.
   */
  expandoInstructions: (number|HostBindingsFunction)[]|null;

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
   * When a view is destroyed, listeners need to be released and outputs need to be
   * unsubscribed. This cleanup array stores both listener data (in chunks of 4)
   * and output data (in chunks of 2) for a particular view. Combining the arrays
   * saves on memory (70 bytes per array) and on a few bytes of code size (for two
   * separate for loops).
   *
   * If it's a native DOM listener being stored:
   * 1st index is: event name to remove
   * 2nd index is: index of native element in LView.data[]
   * 3rd index is: index of wrapped listener function in LView.cleanupInstances[]
   * 4th index is: useCapture boolean
   *
   * If it's a renderer2 style listener or ViewRef destroy hook being stored:
   * 1st index is: index of the cleanup function in LView.cleanupInstances[]
   * 2nd index is: null
   *
   * If it's an output subscription or query list destroy hook:
   * 1st index is: output unsubscribe function / query list destroy function
   * 2nd index is: index of function context in LView.cleanupInstances[]
   */
  cleanup: any[]|null;

  /**
   * A list of element indices for child components that will need to be
   * refreshed when the current view has finished its check. These indices have
   * already been adjusted for the HEADER_OFFSET.
   *
   */
  components: number[]|null;

  /**
   * A list of indices for child directives that have content queries.
   *
   * Even indices: Directive indices
   * Odd indices: Starting index of content queries (stored in CONTENT_QUERIES) for this directive
   */
  contentQueries: number[]|null;
}

export const enum RootContextFlags {Empty = 0b00, DetectChanges = 0b01, FlushPlayers = 0b10}


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
   * RootComponents - The components that were instantiated by the call to
   * {@link renderComponent}.
   */
  components: {}[];

  /**
   * The player flushing handler to kick off all animations
   */
  playerHandler: PlayerHandler|null;

  /**
   * What render-related operations to run once a scheduler has been set
   */
  flags: RootContextFlags;
}

/**
 * Array of hooks that should be executed for a view and their directive indices.
 *
 * Even indices: Directive index
 * Odd indices: Hook function
 */
export type HookData = (number | (() => void))[];

/**
 * Static data that corresponds to the instance-specific data array on an LView.
 *
 * Each node's static data is stored in tData at the same index that it's stored
 * in the data array.  Any nodes that do not have static data store a null value in
 * tData to avoid a sparse array.
 *
 * Each pipe's definition is stored here at the same index as its pipe instance in
 * the data array.
 *
 * Injector bloom filters are also stored here.
 */
export type TData =
    (TNode | PipeDef<any>| DirectiveDef<any>| ComponentDef<any>| number | Type<any>|
     InjectionToken<any>| TI18n | I18nUpdateOpCodes | null)[];

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
