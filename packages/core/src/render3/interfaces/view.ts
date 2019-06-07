/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../../di/injection_token';
import {Injector} from '../../di/injector';
import {Type} from '../../interface/type';
import {SchemaMetadata} from '../../metadata';
import {Sanitizer} from '../../sanitization/security';

import {LContainer} from './container';
import {ComponentDef, ComponentTemplate, DirectiveDef, DirectiveDefList, HostBindingsFunction, PipeDef, PipeDefList, ViewQueriesFunction} from './definition';
import {I18nUpdateOpCodes, TI18n} from './i18n';
import {TElementNode, TNode, TViewNode} from './node';
import {PlayerHandler} from './player';
import {LQueries, TQueries} from './query';
import {RElement, Renderer3, RendererFactory3} from './renderer';



// Below are constants for LView indices to help us look up LView members
// without having to remember the specific indices.
// Uglify will inline these when minifying so there shouldn't be a cost.
export const HOST = 0;
export const TVIEW = 1;
export const FLAGS = 2;
export const PARENT = 3;
export const NEXT = 4;
export const QUERIES = 5;
export const T_HOST = 6;
export const BINDING_INDEX = 7;
export const CLEANUP = 8;
export const CONTEXT = 9;
export const INJECTOR = 10;
export const RENDERER_FACTORY = 11;
export const RENDERER = 12;
export const SANITIZER = 13;
export const CHILD_HEAD = 14;
export const CHILD_TAIL = 15;
export const DECLARATION_VIEW = 16;
export const DECLARATION_LCONTAINER = 17;
export const PREORDER_HOOK_FLAGS = 18;
/** Size of LView's header. Necessary to adjust for it when setting slots.  */
export const HEADER_OFFSET = 19;


// This interface replaces the real LView interface if it is an arg or a
// return value of a public instruction. This ensures we don't need to expose
// the actual interface, which should be kept private.
export interface OpaqueViewState {
  '__brand__': 'Brand for OpaqueViewState that nothing will match';
}


/**
 * `LView` stores all of the information needed to process the instructions as
 * they are invoked from the template. Each embedded view and component view has its
 * own `LView`. When processing a particular view, we set the `viewData` to that
 * `LView`. When that view is done processing, the `viewData` is set back to
 * whatever the original `viewData` was before (the parent `LView`).
 *
 * Keeping separate state for each view facilities view insertion / deletion, so we
 * don't have to edit the data array based on which views are present.
 */
export interface LView extends Array<any> {
  /**
   * The host node for this LView instance, if this is a component view.
   * If this is an embedded view, HOST will be null.
   */
  [HOST]: RElement|null;

  /**
   * The static data for this view. We need a reference to this so we can easily walk up the
   * node tree in DI and get the TView.data array associated with a node (where the
   * directive defs are stored).
   */
  readonly[TVIEW]: TView;

  /** Flags for this view. See LViewFlags for more info. */
  [FLAGS]: LViewFlags;

  /**
   * This may store an {@link LView} or {@link LContainer}.
   *
   * `LView` - The parent view. This is needed when we exit the view and must restore the previous
   * LView. Without this, the render method would have to keep a stack of
   * views as it is recursively rendering templates.
   *
   * `LContainer` - The current view is part of a container, and is an embedded view.
   */
  [PARENT]: LView|LContainer|null;

  /**
   *
   * The next sibling LView or LContainer.
   *
   * Allows us to propagate between sibling view states that aren't in the same
   * container. Embedded views already have a node.next, but it is only set for
   * views in the same container. We need a way to link component views and views
   * across containers as well.
   */
  [NEXT]: LView|LContainer|null;

  /** Queries active for this view - nodes from a view are reported to those queries. */
  [QUERIES]: LQueries|null;

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
  [T_HOST]: TViewNode|TElementNode|null;

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
  // TODO: flatten into LView[]
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
  [RENDERER_FACTORY]: RendererFactory3;

  /** Renderer to be used for this view. */
  [RENDERER]: Renderer3;

  /** An optional custom sanitizer. */
  [SANITIZER]: Sanitizer|null;

  /**
   * Reference to the first LView or LContainer beneath this LView in
   * the hierarchy.
   *
   * Necessary to store this so views can traverse through their nested views
   * to remove listeners and call onDestroy callbacks.
   */
  [CHILD_HEAD]: LView|LContainer|null;

  /**
   * The last LView or LContainer beneath this LView in the hierarchy.
   *
   * The tail allows us to quickly add a new state to the end of the view list
   * without having to propagate starting from the first child.
   */
  [CHILD_TAIL]: LView|LContainer|null;

  /**
   * View where this view's template was declared.
   *
   * Only applicable for dynamically created views. Will be null for inline/component views.
   *
   * The template for a dynamically created view may be declared in a different view than
   * it is inserted. We already track the "insertion view" (view where the template was
   * inserted) in LView[PARENT], but we also need access to the "declaration view"
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
  [DECLARATION_VIEW]: LView|null;

  /**
   * A declaration point of embedded views (ones instantiated based on the content of a
   * <ng-template>), null for other types of views.
   *
   * We need to track all embedded views created from a given declaration point so we can prepare
   * query matches in a proper order (query matches are ordered based on their declaration point and
   * _not_ the insertion point).
   */
  [DECLARATION_LCONTAINER]: LContainer|null;

  /**
   * More flags for this view. See PreOrderHookFlags for more info.
   */
  [PREORDER_HOOK_FLAGS]: PreOrderHookFlags;
}

/** Flags associated with an LView (saved in LView[FLAGS]) */
export const enum LViewFlags {
  /** The state of the init phase on the first 2 bits */
  InitPhaseStateIncrementer = 0b00000000001,
  InitPhaseStateMask = 0b00000000011,

  /**
   * Whether or not the view is in creationMode.
   *
   * This must be stored in the view rather than using `data` as a marker so that
   * we can properly support embedded views. Otherwise, when exiting a child view
   * back into the parent view, `data` will be defined and `creationMode` will be
   * improperly reported as false.
   */
  CreationMode = 0b00000000100,

  /**
   * Whether or not this LView instance is on its first processing pass.
   *
   * An LView instance is considered to be on its "first pass" until it
   * has completed one creation mode run and one update mode run. At this
   * time, the flag is turned off.
   */
  FirstLViewPass = 0b00000001000,

  /** Whether this view has default change detection strategy (checks always) or onPush */
  CheckAlways = 0b00000010000,

  /**
   * Whether or not manual change detection is turned on for onPush components.
   *
   * This is a special mode that only marks components dirty in two cases:
   * 1) There has been a change to an @Input property
   * 2) `markDirty()` has been called manually by the user
   *
   * Note that in this mode, the firing of events does NOT mark components
   * dirty automatically.
   *
   * Manual mode is turned off by default for backwards compatibility, as events
   * automatically mark OnPush components dirty in View Engine.
   *
   * TODO: Add a public API to ChangeDetectionStrategy to turn this mode on
   */
  ManualOnPush = 0b00000100000,

  /** Whether or not this view is currently dirty (needing check) */
  Dirty = 0b000001000000,

  /** Whether or not this view is currently attached to change detection tree. */
  Attached = 0b000010000000,

  /** Whether or not this view is destroyed. */
  Destroyed = 0b000100000000,

  /** Whether or not this view is the root view */
  IsRoot = 0b001000000000,

  /**
   * Index of the current init phase on last 22 bits
   */
  IndexWithinInitPhaseIncrementer = 0b010000000000,
  IndexWithinInitPhaseShift = 10,
  IndexWithinInitPhaseReset = 0b001111111111,
}

/**
 * Possible states of the init phase:
 * - 00: OnInit hooks to be run.
 * - 01: AfterContentInit hooks to be run
 * - 10: AfterViewInit hooks to be run
 * - 11: All init hooks have been run
 */
export const enum InitPhaseState {
  OnInitHooksToBeRun = 0b00,
  AfterContentInitHooksToBeRun = 0b01,
  AfterViewInitHooksToBeRun = 0b10,
  InitPhaseCompleted = 0b11,
}

/** More flags associated with an LView (saved in LView[FLAGS_MORE]) */
export const enum PreOrderHookFlags {
  /** The index of the next pre-order hook to be called in the hooks array, on the first 16
     bits */
  IndexOfTheNextPreOrderHookMaskMask = 0b01111111111111111,

  /**
   * The number of init hooks that have already been called, on the last 16 bits
   */
  NumberOfInitHooksCalledIncrementer = 0b010000000000000000,
  NumberOfInitHooksCalledShift = 16,
  NumberOfInitHooksCalledMask = 0b11111111111111110000000000000000,
}

/**
 * Set of instructions used to process host bindings efficiently.
 *
 * See VIEW_DATA.md for more information.
 */
export interface ExpandoInstructions extends Array<number|HostBindingsFunction<any>|null> {}

/**
 * The static data for an LView (shared between all templates of a
 * given type).
 *
 * Stored on the `ComponentDef.tView`.
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
   * This is a blueprint used to generate LView instances for this TView. Copying this
   * blueprint is faster than creating a new LView from scratch.
   */
  blueprint: LView;

  /**
   * The template function used to refresh the view of dynamically created views
   * and components. Will be null for inline views.
   */
  template: ComponentTemplate<{}>|null;

  /**
   * A function containing query-related instructions.
   */
  viewQuery: ViewQueriesFunction<{}>|null;

  /**
   * Pointer to the host `TNode` (not part of this TView).
   *
   * If this is a `TViewNode` for an `LViewNode`, this is an embedded view of a container.
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
   * The index where the "expando" section of `LView` begins. The expando
   * section contains injectors, directive instances, and host binding values.
   * Unlike the "consts" and "vars" sections of `LView`, the length of this
   * section cannot be calculated at compile-time because directives are matched
   * at runtime to preserve locality.
   *
   * We store this start index so we know where to start checking host bindings
   * in `setHostBindings`.
   */
  expandoStartIndex: number;

  /**
   * Whether or not there are any static view queries tracked on this view.
   *
   * We store this so we know whether or not we should do a view query
   * refresh after creation mode to collect static query results.
   */
  staticViewQueries: boolean;

  /**
   * Whether or not there are any static content queries tracked on this view.
   *
   * We store this so we know whether or not we should do a content query
   * refresh after creation mode to collect static query results.
   */
  staticContentQueries: boolean;

  /**
   * A reference to the first child node located in the view.
   */
  firstChild: TNode|null;

  /**
   * Set of instructions used to process host bindings efficiently.
   *
   * See VIEW_DATA.md for more information.
   */
  expandoInstructions: ExpandoInstructions|null;

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
   * Array of ngOnInit, ngOnChanges and ngDoCheck hooks that should be executed for this view in
   * creation mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  preOrderHooks: HookData|null;

  /**
   * Array of ngOnChanges and ngDoCheck hooks that should be executed for this view in update mode.
   *
   * Even indices: Directive index
   * Odd indices: Hook function
   */
  preOrderCheckHooks: HookData|null;

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
   * When a view is destroyed, listeners need to be released and outputs need to be
   * unsubscribed. This cleanup array stores both listener data (in chunks of 4)
   * and output data (in chunks of 2) for a particular view. Combining the arrays
   * saves on memory (70 bytes per array) and on a few bytes of code size (for two
   * separate for loops).
   *
   * If it's a native DOM listener or output subscription being stored:
   * 1st index is: event name  `name = tView.cleanup[i+0]`
   * 2nd index is: index of native element or a function that retrieves global target (window,
   *               document or body) reference based on the native element:
   *    `typeof idxOrTargetGetter === 'function'`: global target getter function
   *    `typeof idxOrTargetGetter === 'number'`: index of native element
   *
   * 3rd index is: index of listener function `listener = lView[CLEANUP][tView.cleanup[i+2]]`
   * 4th index is: `useCaptureOrIndx = tView.cleanup[i+3]`
   *    `typeof useCaptureOrIndx == 'boolean' : useCapture boolean
   *    `typeof useCaptureOrIndx == 'number':
   *         `useCaptureOrIndx >= 0` `removeListener = LView[CLEANUP][useCaptureOrIndx]`
   *         `useCaptureOrIndx <  0` `subscription = LView[CLEANUP][-useCaptureOrIndx]`
   *
   * If it's an output subscription or query list destroy hook:
   * 1st index is: output unsubscribe function / query list destroy function
   * 2nd index is: index of function context in LView.cleanupInstances[]
   *               `tView.cleanup[i+0].call(lView[CLEANUP][tView.cleanup[i+1]])`
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
   * A collection of queries tracked in a given view.
   */
  queries: TQueries|null;

  /**
   * An array of indices pointing to directives with content queries alongside with the
   * corresponding
   * query index. Each entry in this array is a tuple of:
   * - index of the first content query index declared by a given directive;
   * - index of a directive.
   *
   * We are storing those indexes so we can refresh content queries as part of a view refresh
   * process.
   */
  contentQueries: number[]|null;

  /**
   * Set of schemas that declare elements to be allowed inside the view.
   */
  schemas: SchemaMetadata[]|null;
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
 * For each node of the view, the following data is stored:
 * 1) Node index (optional)
 * 2) A series of number/function pairs where:
 *  - even indices are directive indices
 *  - odd indices are hook functions
 *
 * Special cases:
 *  - a negative directive index flags an init hook (ngOnInit, ngAfterContentInit, ngAfterViewInit)
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
 * Each host property's name is stored here at the same index as its value in the
 * data array.
 *
 * Each property binding name is stored here at the same index as its value in
 * the data array. If the binding is an interpolation, the static string values
 * are stored parallel to the dynamic values. Example:
 *
 * id="prefix {{ v0 }} a {{ v1 }} b {{ v2 }} suffix"
 *
 * LView       |   TView.data
 *------------------------
 *  v0 value   |   'a'
 *  v1 value   |   'b'
 *  v2 value   |   id � prefix � suffix
 *
 * Injector bloom filters are also stored here.
 */
export type TData =
    (TNode | PipeDef<any>| DirectiveDef<any>| ComponentDef<any>| number | Type<any>|
     InjectionToken<any>| TI18n | I18nUpdateOpCodes | null | string)[];

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
