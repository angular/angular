/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './ng_dev_mode';

import {QueryList} from '../linker';
import {Sanitizer} from '../sanitization/security';
import {StyleSanitizeFn} from '../sanitization/style_sanitizer';

import {assertDefined, assertEqual, assertLessThan, assertNotDefined, assertNotEqual} from './assert';
import {throwCyclicDependencyError, throwErrorIfNoChangesMode, throwMultipleComponentError} from './errors';
import {executeHooks, executeInitHooks, queueInitHooks, queueLifecycleHooks} from './hooks';
import {ACTIVE_INDEX, LContainer, RENDER_PARENT, VIEWS} from './interfaces/container';
import {ComponentDefInternal, ComponentQuery, ComponentTemplate, DirectiveDefInternal, DirectiveDefListOrFactory, EmbeddedTemplate, InitialStylingFlags, PipeDefListOrFactory, RenderFlags} from './interfaces/definition';
import {LInjector} from './interfaces/injector';
import {AttributeMarker, InitialInputData, InitialInputs, LContainerNode, LElementNode, LNode, LProjectionNode, LTextNode, LViewNode, PropertyAliasValue, PropertyAliases, TAttributes, TContainerNode, TElementNode, TNode, TNodeFlags, TNodeType} from './interfaces/node';
import {CssSelectorList, NG_PROJECT_AS_ATTR_NAME} from './interfaces/projection';
import {LQueries} from './interfaces/query';
import {ProceduralRenderer3, RComment, RElement, RText, Renderer3, RendererFactory3, RendererStyleFlags3, isProceduralRenderer} from './interfaces/renderer';
import {BINDING_INDEX, CLEANUP, CONTAINER_INDEX, CONTENT_QUERIES, CONTEXT, CurrentMatchesList, DECLARATION_VIEW, DIRECTIVES, FLAGS, HEADER_OFFSET, HOST_NODE, INJECTOR, LViewData, LViewFlags, NEXT, PARENT, QUERIES, RENDERER, RootContext, SANITIZER, TAIL, TData, TVIEW, TView} from './interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from './node_assert';
import {appendChild, appendProjectedNode, canInsertNativeNode, createTextNode, findComponentHost, getChildLNode, getLViewChild, getNextLNode, getParentLNode, insertView, removeView} from './node_manipulation';
import {isNodeMatchingSelectorList, matchingSelectorIndex} from './node_selector_matcher';
import {StylingContext, allocStylingContext, createStylingContextTemplate, renderStyling as renderElementStyles, updateClassProp as updateElementClassProp, updateStyleProp as updateElementStyleProp, updateStylingMap} from './styling';
import {assertDataInRangeInternal, isDifferent, loadElementInternal, loadInternal, stringify} from './util';
import {ViewRef} from './view_ref';



/**
 * Directive (D) sets a property on all component instances using this constant as a key and the
 * component's host node (LElement) as the value. This is used in methods like detectChanges to
 * facilitate jumping from an instance to the host node.
 */
export const NG_HOST_SYMBOL = '__ngHostLNode__';

/**
 * A permanent marker promise which signifies that the current CD tree is
 * clean.
 */
const _CLEAN_PROMISE = Promise.resolve(null);

/**
 * Function used to sanitize the value before writing it into the renderer.
 */
export type SanitizerFn = (value: any) => string;

/**
 * Directive and element indices for top-level directive.
 *
 * Saved here to avoid re-instantiating an array on every change detection run.
 *
 * Note: Element is not actually stored at index 0 because of the LViewData
 * header, but the host bindings function expects an index that is NOT adjusted
 * because it will ultimately be fed to instructions like elementProperty.
 */
const _ROOT_DIRECTIVE_INDICES = [0, 0];

/**
 * TView.data needs to fill the same number of slots as the LViewData header
 * so the indices of nodes are consistent between LViewData and TView.data.
 *
 * It's much faster to keep a blueprint of the pre-filled array and slice it
 * than it is to create a new array and fill it each time a TView is created.
 */
const HEADER_FILLER = new Array(HEADER_OFFSET).fill(null);

/**
 * Token set in currentMatches while dependencies are being resolved.
 *
 * If we visit a directive that has a value set to CIRCULAR, we know we've
 * already seen it, and thus have a circular dependency.
 */
export const CIRCULAR = '__CIRCULAR__';

/**
 * This property gets set before entering a template.
 *
 * This renderer can be one of two varieties of Renderer3:
 *
 * - ObjectedOrientedRenderer3
 *
 * This is the native browser API style, e.g. operations are methods on individual objects
 * like HTMLElement. With this style, no additional code is needed as a facade (reducing payload
 * size).
 *
 * - ProceduralRenderer3
 *
 * In non-native browser environments (e.g. platforms such as web-workers), this is the facade
 * that enables element manipulation. This also facilitates backwards compatibility with
 * Renderer2.
 */
let renderer: Renderer3;
let rendererFactory: RendererFactory3;
let currentElementNode: LElementNode|null = null;

export function getRenderer(): Renderer3 {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return renderer;
}

export function getCurrentSanitizer(): Sanitizer|null {
  return viewData && viewData[SANITIZER];
}

export function getViewData(): LViewData {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return viewData;
}

/** Used to set the parent property when nodes are created. */
let previousOrParentNode: LNode;

export function getPreviousOrParentNode(): LNode {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return previousOrParentNode;
}

/**
 * If `isParent` is:
 *  - `true`: then `previousOrParentNode` points to a parent node.
 *  - `false`: then `previousOrParentNode` points to previous node (sibling).
 */
let isParent: boolean;

let tView: TView;

let currentQueries: LQueries|null;

/**
 * Query instructions can ask for "current queries" in 2 different cases:
 * - when creating view queries (at the root of a component view, before any node is created - in
 * this case currentQueries points to view queries)
 * - when creating content queries (inb this previousOrParentNode points to a node on which we
 * create content queries).
 */
export function getCurrentQueries(QueryType: {new (): LQueries}): LQueries {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return currentQueries ||
      (currentQueries =
           (previousOrParentNode.queries && previousOrParentNode.queries.clone() ||
            new QueryType()));
}

/**
 * This property gets set before entering a template.
 */
let creationMode: boolean;

export function getCreationMode(): boolean {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return creationMode;
}

/**
 * State of the current view being processed.
 *
 * An array of nodes (text, element, container, etc), pipes, their bindings, and
 * any local variables that need to be stored between invocations.
 */
let viewData: LViewData;

/**
 * An array of directive instances in the current view.
 *
 * These must be stored separately from LNodes because their presence is
 * unknown at compile-time and thus space cannot be reserved in data[].
 */
let directives: any[]|null;

function getCleanup(view: LViewData): any[] {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return view[CLEANUP] || (view[CLEANUP] = []);
}

function getTViewCleanup(view: LViewData): any[] {
  return view[TVIEW].cleanup || (view[TVIEW].cleanup = []);
}
/**
 * In this mode, any changes in bindings will throw an ExpressionChangedAfterChecked error.
 *
 * Necessary to support ChangeDetectorRef.checkNoChanges().
 */
let checkNoChangesMode = false;

/** Whether or not this is the first time the current view has been processed. */
let firstTemplatePass = true;

const enum BindingDirection {
  Input,
  Output,
}

/**
 * Swap the current state with a new state.
 *
 * For performance reasons we store the state in the top level of the module.
 * This way we minimize the number of properties to read. Whenever a new view
 * is entered we have to store the state for later, and when the view is
 * exited the state has to be restored
 *
 * @param newView New state to become active
 * @param host Element to which the View is a child of
 * @returns the previous state;
 */
export function enterView(newView: LViewData, host: LElementNode | LViewNode | null): LViewData {
  const oldView: LViewData = viewData;
  directives = newView && newView[DIRECTIVES];
  tView = newView && newView[TVIEW];

  creationMode = newView && (newView[FLAGS] & LViewFlags.CreationMode) === LViewFlags.CreationMode;
  firstTemplatePass = newView && tView.firstTemplatePass;

  renderer = newView && newView[RENDERER];

  if (host != null) {
    previousOrParentNode = host;
    isParent = true;
  }

  viewData = newView;
  currentQueries = newView && newView[QUERIES];

  return oldView;
}

/**
 * Used in lieu of enterView to make it clear when we are exiting a child view. This makes
 * the direction of traversal (up or down the view tree) a bit clearer.
 *
 * @param newView New state to become active
 * @param creationOnly An optional boolean to indicate that the view was processed in creation mode
 * only, i.e. the first update will be done later. Only possible for dynamically created views.
 */
export function leaveView(newView: LViewData, creationOnly?: boolean): void {
  if (!creationOnly) {
    if (!checkNoChangesMode) {
      executeHooks(directives !, tView.viewHooks, tView.viewCheckHooks, creationMode);
    }
    // Views are clean and in update mode after being checked, so these bits are cleared
    viewData[FLAGS] &= ~(LViewFlags.CreationMode | LViewFlags.Dirty);
  }
  viewData[FLAGS] |= LViewFlags.RunInit;
  viewData[BINDING_INDEX] = -1;
  enterView(newView, null);
}

/**
 * Refreshes the view, executing the following steps in that order:
 * triggers init hooks, refreshes dynamic embedded views, triggers content hooks, sets host
 * bindings, refreshes child components.
 * Note: view hooks are triggered later when leaving the view.
 */
function refreshDescendantViews() {
  // This needs to be set before children are processed to support recursive components
  tView.firstTemplatePass = firstTemplatePass = false;

  if (!checkNoChangesMode) {
    executeInitHooks(viewData, tView, creationMode);
  }
  refreshDynamicEmbeddedViews(viewData);
  if (!checkNoChangesMode) {
    executeHooks(directives !, tView.contentHooks, tView.contentCheckHooks, creationMode);
  }

  setHostBindings(tView.hostBindings);
  refreshContentQueries(tView);
  refreshChildComponents(tView.components);
}


/** Sets the host bindings for the current view. */
export function setHostBindings(bindings: number[] | null): void {
  if (bindings != null) {
    const defs = tView.directives !;
    for (let i = 0; i < bindings.length; i += 2) {
      const dirIndex = bindings[i];
      const def = defs[dirIndex] as DirectiveDefInternal<any>;
      def.hostBindings && def.hostBindings(dirIndex, bindings[i + 1]);
    }
  }
}

/** Refreshes content queries for all directives in the given view. */
function refreshContentQueries(tView: TView): void {
  if (tView.contentQueries != null) {
    for (let i = 0; i < tView.contentQueries.length; i += 2) {
      const directiveDefIdx = tView.contentQueries[i];
      const directiveDef = tView.directives ![directiveDefIdx];

      directiveDef.contentQueriesRefresh !(directiveDefIdx, tView.contentQueries[i + 1]);
    }
  }
}

/** Refreshes child components in the current view. */
function refreshChildComponents(components: number[] | null): void {
  if (components != null) {
    for (let i = 0; i < components.length; i++) {
      componentRefresh(components[i]);
    }
  }
}

export function executeInitAndContentHooks(): void {
  if (!checkNoChangesMode) {
    executeInitHooks(viewData, tView, creationMode);
    executeHooks(directives !, tView.contentHooks, tView.contentCheckHooks, creationMode);
  }
}

export function createLViewData<T>(
    renderer: Renderer3, tView: TView, context: T | null, flags: LViewFlags,
    sanitizer?: Sanitizer | null): LViewData {
  return [
    tView,                                                                       // tView
    viewData,                                                                    // parent
    null,                                                                        // next
    null,                                                                        // queries
    flags | LViewFlags.CreationMode | LViewFlags.Attached | LViewFlags.RunInit,  // flags
    null !,                                                                      // hostNode
    -1,                                                                          // bindingIndex
    null,                                                                        // directives
    null,                                                                        // cleanupInstances
    context,                                                                     // context
    viewData && viewData[INJECTOR],                                              // injector
    renderer,                                                                    // renderer
    sanitizer || null,                                                           // sanitizer
    null,                                                                        // tail
    -1,                                                                          // containerIndex
    null,                                                                        // contentQueries
    null                                                                         // declarationView
  ];
}

/**
 * Creation of LNode object is extracted to a separate function so we always create LNode object
 * with the same shape
 * (same properties assigned in the same order).
 */
export function createLNodeObject(
    type: TNodeType, currentView: LViewData, parent: LNode | null,
    native: RText | RElement | RComment | null, state: any,
    queries: LQueries | null): LElementNode&LTextNode&LViewNode&LContainerNode&LProjectionNode {
  return {
    native: native as any,
    view: currentView,
    nodeInjector: parent ? parent.nodeInjector : null,
    data: state,
    queries: queries,
    tNode: null !,
    dynamicLContainerNode: null
  };
}

/**
 * A common way of creating the LNode to make sure that all of them have same shape to
 * keep the execution code monomorphic and fast.
 *
 * @param index The index at which the LNode should be saved (null if view, since they are not
 * saved).
 * @param type The type of LNode to create
 * @param native The native element for this LNode, if applicable
 * @param name The tag name of the associated native element, if applicable
 * @param attrs Any attrs for the native element, if applicable
 * @param data Any data that should be saved on the LNode
 */
export function createLNode(
    index: number, type: TNodeType.Element, native: RElement | RText | null, name: string | null,
    attrs: TAttributes | null, lViewData?: LViewData | null): LElementNode;
export function createLNode(
    index: number, type: TNodeType.View, native: null, name: null, attrs: null,
    lViewData: LViewData): LViewNode;
export function createLNode(
    index: number, type: TNodeType.Container, native: RComment, name: string | null,
    attrs: TAttributes | null, lContainer: LContainer): LContainerNode;
export function createLNode(
    index: number, type: TNodeType.Projection, native: null, name: null, attrs: TAttributes | null,
    lProjection: null): LProjectionNode;
export function createLNode(
    index: number, type: TNodeType, native: RText | RElement | RComment | null, name: string | null,
    attrs: TAttributes | null, state?: null | LViewData | LContainer): LElementNode&LTextNode&
    LViewNode&LContainerNode&LProjectionNode {
  const parent = isParent ? previousOrParentNode :
                            previousOrParentNode && getParentLNode(previousOrParentNode) !as LNode;
  // Parents cannot cross component boundaries because components will be used in multiple places,
  // so it's only set if the view is the same.
  const tParent =
      parent && parent.view === viewData ? parent.tNode as TElementNode | TContainerNode : null;
  let queries =
      (isParent ? currentQueries : previousOrParentNode && previousOrParentNode.queries) ||
      parent && parent.queries && parent.queries.child();
  const isState = state != null;
  const node =
      createLNodeObject(type, viewData, parent, native, isState ? state as any : null, queries);

  if (index === -1 || type === TNodeType.View) {
    // View nodes are not stored in data because they can be added / removed at runtime (which
    // would cause indices to change). Their TNodes are instead stored in TView.node.
    node.tNode = (state ? (state as LViewData)[TVIEW].node : null) ||
        createTNode(type, index, null, null, tParent, null);
  } else {
    const adjustedIndex = index + HEADER_OFFSET;

    // This is an element or container or projection node
    ngDevMode && assertDataNext(adjustedIndex);
    const tData = tView.data;

    viewData[adjustedIndex] = node;

    // Every node adds a value to the static data array to avoid a sparse array
    if (adjustedIndex >= tData.length) {
      const tNode = tData[adjustedIndex] =
          createTNode(type, adjustedIndex, name, attrs, tParent, null);
      if (!isParent && previousOrParentNode) {
        const previousTNode = previousOrParentNode.tNode;
        previousTNode.next = tNode;
        if (previousTNode.dynamicContainerNode) previousTNode.dynamicContainerNode.next = tNode;
      }
    }
    node.tNode = tData[adjustedIndex] as TNode;

    // Now link ourselves into the tree.
    if (isParent) {
      currentQueries = null;
      if (previousOrParentNode.tNode.child == null && previousOrParentNode.view === viewData ||
          previousOrParentNode.tNode.type === TNodeType.View) {
        // We are in the same view, which means we are adding content node to the parent View.
        previousOrParentNode.tNode.child = node.tNode;
      }
    }
  }

  // View nodes and host elements need to set their host node (components set host nodes later)
  if ((type & TNodeType.ViewOrElement) === TNodeType.ViewOrElement && isState) {
    const lViewData = state as LViewData;
    ngDevMode && assertNotDefined(
                     lViewData[HOST_NODE], 'lViewData[HOST_NODE] should not have been initialized');
    lViewData[HOST_NODE] = node;
    if (firstTemplatePass) lViewData[TVIEW].node = node.tNode;
  }

  previousOrParentNode = node;
  isParent = true;
  return node;
}


//////////////////////////
//// Render
//////////////////////////

/**
 * Resets the application state.
 */
export function resetApplicationState() {
  isParent = false;
  previousOrParentNode = null !;
}

/**
 *
 * @param hostNode Existing node to render into.
 * @param template Template function with the instructions.
 * @param context to pass into the template.
 * @param providedRendererFactory renderer factory to use
 * @param host The host element node to use
 * @param directives Directive defs that should be used for matching
 * @param pipes Pipe defs that should be used for matching
 */
export function renderTemplate<T>(
    hostNode: RElement, template: ComponentTemplate<T>, context: T,
    providedRendererFactory: RendererFactory3, host: LElementNode | null,
    directives?: DirectiveDefListOrFactory | null, pipes?: PipeDefListOrFactory | null,
    sanitizer?: Sanitizer | null): LElementNode {
  if (host == null) {
    resetApplicationState();
    rendererFactory = providedRendererFactory;
    const tView = getOrCreateTView(template, directives || null, pipes || null, null);
    host = createLNode(
        -1, TNodeType.Element, hostNode, null, null,
        createLViewData(
            providedRendererFactory.createRenderer(null, null), tView, {}, LViewFlags.CheckAlways,
            sanitizer));
  }
  const hostView = host.data !;
  ngDevMode && assertDefined(hostView, 'Host node should have an LView defined in host.data.');
  renderComponentOrTemplate(host, hostView, context, template);
  return host;
}

/**
 * Used for creating the LViewNode of a dynamic embedded view,
 * either through ViewContainerRef.createEmbeddedView() or TemplateRef.createEmbeddedView().
 * Such lViewNode will then be renderer with renderEmbeddedTemplate() (see below).
 */
export function createEmbeddedViewNode<T>(
    tView: TView, context: T, declarationView: LViewData, renderer: Renderer3,
    queries?: LQueries | null): LViewNode {
  const _isParent = isParent;
  const _previousOrParentNode = previousOrParentNode;
  isParent = true;
  previousOrParentNode = null !;

  const lView =
      createLViewData(renderer, tView, context, LViewFlags.CheckAlways, getCurrentSanitizer());
  lView[DECLARATION_VIEW] = declarationView;

  if (queries) {
    lView[QUERIES] = queries.createView();
  }
  const viewNode = createLNode(-1, TNodeType.View, null, null, null, lView);

  isParent = _isParent;
  previousOrParentNode = _previousOrParentNode;
  return viewNode;
}

/**
 * Used for rendering embedded views (e.g. dynamically created views)
 *
 * Dynamically created views must store/retrieve their TViews differently from component views
 * because their template functions are nested in the template functions of their hosts, creating
 * closures. If their host template happens to be an embedded template in a loop (e.g. ngFor inside
 * an ngFor), the nesting would mean we'd have multiple instances of the template function, so we
 * can't store TViews in the template function itself (as we do for comps). Instead, we store the
 * TView for dynamically created views on their host TNode, which only has one instance.
 */
export function renderEmbeddedTemplate<T>(
    viewNode: LViewNode | LElementNode, tView: TView, context: T, rf: RenderFlags): LViewNode|
    LElementNode {
  const _isParent = isParent;
  const _previousOrParentNode = previousOrParentNode;
  let oldView: LViewData;
  if (viewNode.data ![PARENT] == null && viewNode.data ![CONTEXT] && !tView.template) {
    // This is a root view inside the view tree
    tickRootContext(viewNode.data ![CONTEXT] as RootContext);
  } else {
    try {
      isParent = true;
      previousOrParentNode = null !;

      oldView = enterView(viewNode.data !, viewNode);
      namespaceHTML();
      callTemplateWithContexts(rf, context, tView.template !, viewNode.data ![DECLARATION_VIEW] !);
      if (rf & RenderFlags.Update) {
        refreshDescendantViews();
      } else {
        viewNode.data ![TVIEW].firstTemplatePass = firstTemplatePass = false;
      }
    } finally {
      // renderEmbeddedTemplate() is called twice in fact, once for creation only and then once for
      // update. When for creation only, leaveView() must not trigger view hooks, nor clean flags.
      const isCreationOnly = (rf & RenderFlags.Create) === RenderFlags.Create;
      leaveView(oldView !, isCreationOnly);
      isParent = _isParent;
      previousOrParentNode = _previousOrParentNode;
    }
  }
  return viewNode;
}

/**
 * This function calls the template function of a dynamically created view with
 * all of its declaration parent contexts (up the view tree) until it reaches the
 * component boundary.
 *
 * Example:
 *
 * AppComponent template:
 *  <ul *ngFor="let list of lists">
 *      <li *ngFor="let item of list"> {{ item }} </li>
 *  </ul>
 *
 * function ulTemplate(rf, ulCtx, appCtx) {...}
 * function liTemplate(rf, liCtx, ulCtx, appCtx) {...}
 *
 * class AppComponent {...}
 * AppComponent.ngComponentDef = defineComponent({
 *   template: function AppComponentTemplate(rf, ctx) {...}
 * });
 *
 *
 * The ul view's template must be called with its own context and its declaration
 * parent, AppComponent. The li view's template must be called with its own context, its
 * parent (the ul), and the ul's parent (AppComponent).
 *
 * Note that a declaration parent is NOT always the same as the insertion parent. Templates
 * can be declared in different views than they are used.
 *
 * @param rf The RenderFlags for this template invocation
 * @param currentContext The context for this template
 * @param template The template function to call
 * @param parentView The declaration view of the dynamic view
 */
function callTemplateWithContexts<T>(
    rf: RenderFlags, currentContext: T, template: EmbeddedTemplate<T>,
    parentView: LViewData): void {
  const parentContext = parentView[CONTEXT];
  const parentView2 = parentView[DECLARATION_VIEW];

  // Calling a function with extra arguments has a VM cost, so only call with necessary args
  if (parentView2 === null) {
    return template(rf, currentContext, parentContext);
  }

  const parentContext2 = parentView2[CONTEXT];
  const parentView3 = parentView2[DECLARATION_VIEW];
  if (parentView3 === null) {
    return template(rf, currentContext, parentContext, parentContext2);
  }

  const parentContext3 = parentView3[CONTEXT];
  const parentView4 = parentView3[DECLARATION_VIEW];
  if (parentView4 === null) {
    return template(rf, currentContext, parentContext, parentContext2, parentContext3);
  }

  const parentContext4 = parentView4[CONTEXT];
  const parentView5 = parentView4[DECLARATION_VIEW];
  if (parentView5 === null) {
    return template(
        rf, currentContext, parentContext, parentContext2, parentContext3, parentContext4);
  }

  const parentContext5 = parentView5[CONTEXT];
  const parentView6 = parentView5[DECLARATION_VIEW];
  if (parentView6 === null) {
    return template(
        rf, currentContext, parentContext, parentContext2, parentContext3, parentContext4,
        parentContext5);
  }

  const parentContext6 = parentView6[CONTEXT];
  const parentView7 = parentView6[DECLARATION_VIEW];
  if (parentView7 === null) {
    return template(
        rf, currentContext, parentContext, parentContext2, parentContext3, parentContext4,
        parentContext5, parentContext6);
  }

  const parentContext7 = parentView7[CONTEXT];
  const parentView8 = parentView7[DECLARATION_VIEW];
  if (parentView8 === null) {
    return template(
        rf, currentContext, parentContext, parentContext2, parentContext3, parentContext4,
        parentContext5, parentContext6, parentContext7);
  }

  const parentContext8 = parentView8[CONTEXT];
  const parentView9 = parentView8[DECLARATION_VIEW];
  if (parentView9 === null) {
    return template(
        rf, currentContext, parentContext, parentContext2, parentContext3, parentContext4,
        parentContext5, parentContext6, parentContext7, parentContext8);
  }

  // We support up to 8 nesting levels in embedded views before we give up and call apply()
  const templateArgs = [
    rf, currentContext, parentContext, parentContext2, parentContext3, parentContext4,
    parentContext5, parentContext6, parentContext7, parentContext8, parentView9[CONTEXT]
  ];

  let currentDeclarationView: LViewData|null = parentView9[DECLARATION_VIEW];
  while (currentDeclarationView) {
    templateArgs.push(currentDeclarationView[CONTEXT]);
    currentDeclarationView = currentDeclarationView[DECLARATION_VIEW] !;
  }

  template.apply(null, templateArgs);
}

export function renderComponentOrTemplate<T>(
    node: LElementNode, hostView: LViewData, componentOrContext: T,
    template?: ComponentTemplate<T>) {
  const oldView = enterView(hostView, node);
  try {
    if (rendererFactory.begin) {
      rendererFactory.begin();
    }
    if (template) {
      namespaceHTML();
      template(getRenderFlags(hostView), componentOrContext !);
      refreshDescendantViews();
    } else {
      executeInitAndContentHooks();

      // Element was stored at 0 in data and directive was stored at 0 in directives
      // in renderComponent()
      setHostBindings(_ROOT_DIRECTIVE_INDICES);
      componentRefresh(HEADER_OFFSET);
    }
  } finally {
    if (rendererFactory.end) {
      rendererFactory.end();
    }
    leaveView(oldView);
  }
}

/**
 * This function returns the default configuration of rendering flags depending on when the
 * template is in creation mode or update mode. By default, the update block is run with the
 * creation block when the view is in creation mode. Otherwise, the update block is run
 * alone.
 *
 * Dynamically created views do NOT use this configuration (update block and create block are
 * always run separately).
 */
function getRenderFlags(view: LViewData): RenderFlags {
  return view[FLAGS] & LViewFlags.CreationMode ? RenderFlags.Create | RenderFlags.Update :
                                                 RenderFlags.Update;
}

//////////////////////////
//// Namespace
//////////////////////////

let _currentNamespace: string|null = null;

export function namespaceSVG() {
  _currentNamespace = 'http://www.w3.org/2000/svg/';
}

export function namespaceMathML() {
  _currentNamespace = 'http://www.w3.org/1998/MathML/';
}

export function namespaceHTML() {
  _currentNamespace = null;
}

//////////////////////////
//// Element
//////////////////////////

/**
 * Creates an empty element using {@link elementStart} and {@link elementEnd}
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrs Statically bound set of attributes to be written into the DOM element on creation.
 * @param localRefs A set of local reference bindings on the element.
 */
export function element(
    index: number, name: string, attrs?: TAttributes | null, localRefs?: string[] | null): void {
  elementStart(index, name, attrs, localRefs);
  elementEnd();
}

/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the LViewData array
 * @param name Name of the DOM Node
 * @param attrs Statically bound set of attributes to be written into the DOM element on creation.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 */
export function elementStart(
    index: number, name: string, attrs?: TAttributes | null, localRefs?: string[] | null): void {
  ngDevMode &&
      assertEqual(viewData[BINDING_INDEX], -1, 'elements should be created before any bindings');

  ngDevMode && ngDevMode.rendererCreateElement++;

  const native = elementCreate(name);

  ngDevMode && assertDataInRange(index - 1);

  const node: LElementNode =
      createLNode(index, TNodeType.Element, native !, name, attrs || null, null);
  currentElementNode = node;

  if (attrs) {
    setUpAttributes(native, attrs);
  }
  appendChild(getParentLNode(node), native, viewData);
  createDirectivesAndLocals(localRefs);
}

/**
 * Creates a native element from a tag name, using a renderer.
 * @param name the tag name
 * @param overriddenRenderer Optional A renderer to override the default one
 * @returns the element created
 */
export function elementCreate(name: string, overriddenRenderer?: Renderer3): RElement {
  let native: RElement;
  const rendererToUse = overriddenRenderer || renderer;

  if (isProceduralRenderer(rendererToUse)) {
    native = rendererToUse.createElement(name, _currentNamespace);
  } else {
    if (_currentNamespace === null) {
      native = rendererToUse.createElement(name);
    } else {
      native = rendererToUse.createElementNS(_currentNamespace, name);
    }
  }
  return native;
}

/**
 * Creates directive instances and populates local refs.
 *
 * @param localRefs Local refs of the current node
 */
function createDirectivesAndLocals(localRefs?: string[] | null) {
  const node = previousOrParentNode;

  if (firstTemplatePass) {
    ngDevMode && ngDevMode.firstTemplatePass++;
    cacheMatchingDirectivesForNode(node.tNode, tView, localRefs || null);
  } else {
    instantiateDirectivesDirectly();
  }
  saveResolvedLocalsInData();
}

/**
 * On first template pass, we match each node against available directive selectors and save
 * the resulting defs in the correct instantiation order for subsequent change detection runs
 * (so dependencies are always created before the directives that inject them).
 */
function cacheMatchingDirectivesForNode(
    tNode: TNode, tView: TView, localRefs: string[] | null): void {
  // Please make sure to have explicit type for `exportsMap`. Inferred type triggers bug in tsickle.
  const exportsMap: ({[key: string]: number} | null) = localRefs ? {'': -1} : null;
  const matches = tView.currentMatches = findDirectiveMatches(tNode);
  if (matches) {
    for (let i = 0; i < matches.length; i += 2) {
      const def = matches[i] as DirectiveDefInternal<any>;
      const valueIndex = i + 1;
      resolveDirective(def, valueIndex, matches, tView);
      saveNameToExportMap(matches[valueIndex] as number, def, exportsMap);
    }
  }
  if (exportsMap) cacheMatchingLocalNames(tNode, localRefs, exportsMap);
}

/** Matches the current node against all available selectors. */
function findDirectiveMatches(tNode: TNode): CurrentMatchesList|null {
  const registry = tView.directiveRegistry;
  let matches: any[]|null = null;
  if (registry) {
    for (let i = 0; i < registry.length; i++) {
      const def = registry[i];
      if (isNodeMatchingSelectorList(tNode, def.selectors !)) {
        if ((def as ComponentDefInternal<any>).template) {
          if (tNode.flags & TNodeFlags.isComponent) throwMultipleComponentError(tNode);
          tNode.flags = TNodeFlags.isComponent;
        }
        if (def.diPublic) def.diPublic(def);
        (matches || (matches = [])).push(def, null);
      }
    }
  }
  return matches as CurrentMatchesList;
}

export function resolveDirective(
    def: DirectiveDefInternal<any>, valueIndex: number, matches: CurrentMatchesList,
    tView: TView): any {
  if (matches[valueIndex] === null) {
    matches[valueIndex] = CIRCULAR;
    const instance = def.factory();
    (tView.directives || (tView.directives = [])).push(def);
    return directiveCreate(matches[valueIndex] = tView.directives !.length - 1, instance, def);
  } else if (matches[valueIndex] === CIRCULAR) {
    // If we revisit this directive before it's resolved, we know it's circular
    throwCyclicDependencyError(def.type);
  }
  return null;
}

/** Stores index of component's host element so it will be queued for view refresh during CD. */
function queueComponentIndexForCheck(): void {
  if (firstTemplatePass) {
    (tView.components || (tView.components = [])).push(viewData.length - 1);
  }
}

/** Stores index of directive and host element so it will be queued for binding refresh during CD.
 */
function queueHostBindingForCheck(dirIndex: number): void {
  // Must subtract the header offset because hostBindings functions are generated with
  // instructions that expect element indices that are NOT adjusted (e.g. elementProperty).
  ngDevMode &&
      assertEqual(firstTemplatePass, true, 'Should only be called in first template pass.');
  (tView.hostBindings || (tView.hostBindings = [
   ])).push(dirIndex, viewData.length - 1 - HEADER_OFFSET);
}

/** Sets the context for a ChangeDetectorRef to the given instance. */
export function initChangeDetectorIfExisting(
    injector: LInjector | null, instance: any, view: LViewData): void {
  if (injector && injector.changeDetectorRef != null) {
    (injector.changeDetectorRef as ViewRef<any>)._setComponentContext(view, instance);
  }
}

export function isComponent(tNode: TNode): boolean {
  return (tNode.flags & TNodeFlags.isComponent) === TNodeFlags.isComponent;
}

/**
 * This function instantiates the given directives.
 */
function instantiateDirectivesDirectly() {
  const tNode = previousOrParentNode.tNode;
  const count = tNode.flags & TNodeFlags.DirectiveCountMask;

  if (count > 0) {
    const start = tNode.flags >> TNodeFlags.DirectiveStartingIndexShift;
    const end = start + count;
    const tDirectives = tView.directives !;

    for (let i = start; i < end; i++) {
      const def: DirectiveDefInternal<any> = tDirectives[i];
      directiveCreate(i, def.factory(), def);
    }
  }
}

/** Caches local names and their matching directive indices for query and template lookups. */
function cacheMatchingLocalNames(
    tNode: TNode, localRefs: string[] | null, exportsMap: {[key: string]: number}): void {
  if (localRefs) {
    const localNames: (string | number)[] = tNode.localNames = [];

    // Local names must be stored in tNode in the same order that localRefs are defined
    // in the template to ensure the data is loaded in the same slots as their refs
    // in the template (for template queries).
    for (let i = 0; i < localRefs.length; i += 2) {
      const index = exportsMap[localRefs[i + 1]];
      if (index == null) throw new Error(`Export of name '${localRefs[i + 1]}' not found!`);
      localNames.push(localRefs[i], index);
    }
  }
}

/**
 * Builds up an export map as directives are created, so local refs can be quickly mapped
 * to their directive instances.
 */
function saveNameToExportMap(
    index: number, def: DirectiveDefInternal<any>| ComponentDefInternal<any>,
    exportsMap: {[key: string]: number} | null) {
  if (exportsMap) {
    if (def.exportAs) exportsMap[def.exportAs] = index;
    if ((def as ComponentDefInternal<any>).template) exportsMap[''] = index;
  }
}

/**
 * Takes a list of local names and indices and pushes the resolved local variable values
 * to LViewData in the same order as they are loaded in the template with load().
 */
function saveResolvedLocalsInData(): void {
  const localNames = previousOrParentNode.tNode.localNames;
  if (localNames) {
    for (let i = 0; i < localNames.length; i += 2) {
      const index = localNames[i + 1] as number;
      const value = index === -1 ? previousOrParentNode.native : directives ![index];
      viewData.push(value);
    }
  }
}

/**
 * Gets TView from a template function or creates a new TView
 * if it doesn't already exist.
 *
 * @param template The template from which to get static data
 * @param directives Directive defs that should be saved on TView
 * @param pipes Pipe defs that should be saved on TView
 * @returns TView
 */
function getOrCreateTView(
    template: ComponentTemplate<any>, directives: DirectiveDefListOrFactory | null,
    pipes: PipeDefListOrFactory | null, viewQuery: ComponentQuery<any>| null): TView {
  // TODO(misko): reading `ngPrivateData` here is problematic for two reasons
  // 1. It is a megamorphic call on each invocation.
  // 2. For nested embedded views (ngFor inside ngFor) the template instance is per
  //    outer template invocation, which means that no such property will exist
  // Correct solution is to only put `ngPrivateData` on the Component template
  // and not on embedded templates.

  return template.ngPrivateData ||
      (template.ngPrivateData = createTView(-1, template, directives, pipes, viewQuery) as never);
}

/**
 * Creates a TView instance
 *
 * @param viewIndex The viewBlockId for inline views, or -1 if it's a component/dynamic
 * @param directives Registry of directives for this view
 * @param pipes Registry of pipes for this view
 */
export function createTView(
    viewIndex: number, template: ComponentTemplate<any>| EmbeddedTemplate<any>| null,
    directives: DirectiveDefListOrFactory | null, pipes: PipeDefListOrFactory | null,
    viewQuery: ComponentQuery<any>| null): TView {
  ngDevMode && ngDevMode.tView++;
  return {
    id: viewIndex,
    template: template,
    viewQuery: viewQuery,
    node: null !,
    data: HEADER_FILLER.slice(),  // Fill in to match HEADER_OFFSET in LViewData
    childIndex: -1,               // Children set in addToViewTree(), if any
    bindingStartIndex: -1,        // Set in initBindings()
    directives: null,
    firstTemplatePass: true,
    initHooks: null,
    checkHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    pipeDestroyHooks: null,
    cleanup: null,
    hostBindings: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof directives === 'function' ? directives() : directives,
    pipeRegistry: typeof pipes === 'function' ? pipes() : pipes,
    currentMatches: null
  };
}

function setUpAttributes(native: RElement, attrs: TAttributes): void {
  const isProc = isProceduralRenderer(renderer);
  let i = 0;

  while (i < attrs.length) {
    const attrName = attrs[i];
    if (attrName === AttributeMarker.SelectOnly) break;
    if (attrName === NG_PROJECT_AS_ATTR_NAME) {
      i += 2;
    } else {
      ngDevMode && ngDevMode.rendererSetAttribute++;
      if (attrName === AttributeMarker.NamespaceURI) {
        // Namespaced attributes
        const namespaceURI = attrs[i + 1] as string;
        const attrName = attrs[i + 2] as string;
        const attrVal = attrs[i + 3] as string;
        isProc ?
            (renderer as ProceduralRenderer3)
                .setAttribute(native, attrName, attrVal, namespaceURI) :
            native.setAttributeNS(namespaceURI, attrName, attrVal);
        i += 4;
      } else {
        // Standard attributes
        const attrVal = attrs[i + 1];
        isProc ?
            (renderer as ProceduralRenderer3)
                .setAttribute(native, attrName as string, attrVal as string) :
            native.setAttribute(attrName as string, attrVal as string);
        i += 2;
      }
    }
  }
}

export function createError(text: string, token: any) {
  return new Error(`Renderer: ${text} [${stringify(token)}]`);
}


/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param elementOrSelector Render element or CSS selector to locate the element.
 */
export function locateHostElement(
    factory: RendererFactory3, elementOrSelector: RElement | string): RElement|null {
  ngDevMode && assertDataInRange(-1);
  rendererFactory = factory;
  const defaultRenderer = factory.createRenderer(null, null);
  const rNode = typeof elementOrSelector === 'string' ?
      (isProceduralRenderer(defaultRenderer) ?
           defaultRenderer.selectRootElement(elementOrSelector) :
           defaultRenderer.querySelector(elementOrSelector)) :
      elementOrSelector;
  if (ngDevMode && !rNode) {
    if (typeof elementOrSelector === 'string') {
      throw createError('Host node with selector not found:', elementOrSelector);
    } else {
      throw createError('Host node is required:', elementOrSelector);
    }
  }
  return rNode;
}

/**
 * Creates the host LNode.
 *
 * @param rNode Render host element.
 * @param def ComponentDef
 *
 * @returns LElementNode created
 */
export function hostElement(
    tag: string, rNode: RElement | null, def: ComponentDefInternal<any>,
    sanitizer?: Sanitizer | null): LElementNode {
  resetApplicationState();
  const node = createLNode(
      0, TNodeType.Element, rNode, null, null,
      createLViewData(
          renderer, getOrCreateTView(def.template, def.directiveDefs, def.pipeDefs, def.viewQuery),
          null, def.onPush ? LViewFlags.Dirty : LViewFlags.CheckAlways, sanitizer));

  if (firstTemplatePass) {
    node.tNode.flags = TNodeFlags.isComponent;
    if (def.diPublic) def.diPublic(def);
    tView.directives = [def];
  }

  return node;
}


/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener.
 */
export function listener(
    eventName: string, listenerFn: (e?: any) => any, useCapture = false): void {
  ngDevMode && assertPreviousIsParent();
  const node = previousOrParentNode;
  const native = node.native as RElement;
  ngDevMode && ngDevMode.rendererAddEventListener++;

  // In order to match current behavior, native DOM event listeners must be added for all
  // events (including outputs).
  if (isProceduralRenderer(renderer)) {
    const wrappedListener = wrapListenerWithDirtyLogic(viewData, listenerFn);
    const cleanupFn = renderer.listen(native, eventName, wrappedListener);
    storeCleanupFn(viewData, cleanupFn);
  } else {
    const wrappedListener = wrapListenerWithDirtyAndDefault(viewData, listenerFn);
    native.addEventListener(eventName, wrappedListener, useCapture);
    const cleanupInstances = getCleanup(viewData);
    cleanupInstances.push(wrappedListener);
    if (firstTemplatePass) {
      getTViewCleanup(viewData).push(
          eventName, node.tNode.index, cleanupInstances !.length - 1, useCapture);
    }
  }

  let tNode: TNode|null = node.tNode;
  if (tNode.outputs === undefined) {
    // if we create TNode here, inputs must be undefined so we know they still need to be
    // checked
    tNode.outputs = generatePropertyAliases(node.tNode.flags, BindingDirection.Output);
  }

  const outputs = tNode.outputs;
  let outputData: PropertyAliasValue|undefined;
  if (outputs && (outputData = outputs[eventName])) {
    createOutput(outputData, listenerFn);
  }
}

/**
 * Iterates through the outputs associated with a particular event name and subscribes to
 * each output.
 */
function createOutput(outputs: PropertyAliasValue, listener: Function): void {
  for (let i = 0; i < outputs.length; i += 2) {
    ngDevMode && assertDataInRange(outputs[i] as number, directives !);
    const subscription = directives ![outputs[i] as number][outputs[i + 1]].subscribe(listener);
    storeCleanupWithContext(viewData, subscription, subscription.unsubscribe);
  }
}

/**
 * Saves context for this cleanup function in LView.cleanupInstances.
 *
 * On the first template pass, saves in TView:
 * - Cleanup function
 * - Index of context we just saved in LView.cleanupInstances
 */
export function storeCleanupWithContext(
    view: LViewData | null, context: any, cleanupFn: Function): void {
  if (!view) view = viewData;
  getCleanup(view).push(context);

  if (view[TVIEW].firstTemplatePass) {
    getTViewCleanup(view).push(cleanupFn, view[CLEANUP] !.length - 1);
  }
}

/**
 * Saves the cleanup function itself in LView.cleanupInstances.
 *
 * This is necessary for functions that are wrapped with their contexts, like in renderer2
 * listeners.
 *
 * On the first template pass, the index of the cleanup function is saved in TView.
 */
export function storeCleanupFn(view: LViewData, cleanupFn: Function): void {
  getCleanup(view).push(cleanupFn);

  if (view[TVIEW].firstTemplatePass) {
    getTViewCleanup(view).push(view[CLEANUP] !.length - 1, null);
  }
}

/** Mark the end of the element. */
export function elementEnd(): void {
  if (isParent) {
    isParent = false;
  } else {
    ngDevMode && assertHasParent();
    previousOrParentNode = getParentLNode(previousOrParentNode) as LElementNode;
  }
  ngDevMode && assertNodeType(previousOrParentNode, TNodeType.Element);
  const queries = previousOrParentNode.queries;
  queries && queries.addNode(previousOrParentNode);
  queueLifecycleHooks(previousOrParentNode.tNode.flags, tView);
  currentElementNode = null;
}

/**
 * Updates the value of removes an attribute on an Element.
 *
 * @param number index The index of the element in the data array
 * @param name name The name of the attribute.
 * @param value value The attribute is removed when value is `null` or `undefined`.
 *                  Otherwise the attribute value is set to the stringified value.
 * @param sanitizer An optional function used to sanitize the value.
 */
export function elementAttribute(
    index: number, name: string, value: any, sanitizer?: SanitizerFn): void {
  if (value !== NO_CHANGE) {
    const element = loadElement(index);
    if (value == null) {
      ngDevMode && ngDevMode.rendererRemoveAttribute++;
      isProceduralRenderer(renderer) ? renderer.removeAttribute(element.native, name) :
                                       element.native.removeAttribute(name);
    } else {
      ngDevMode && ngDevMode.rendererSetAttribute++;
      const strValue = sanitizer == null ? stringify(value) : sanitizer(value);
      isProceduralRenderer(renderer) ? renderer.setAttribute(element.native, name, strValue) :
                                       element.native.setAttribute(name, strValue);
    }
  }
}

/**
 * Update a property on an Element.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new @Inputs don't have to be re-compiled.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 */

export function elementProperty<T>(
    index: number, propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn): void {
  if (value === NO_CHANGE) return;
  const node = loadElement(index) as LElementNode;
  const tNode = node.tNode;
  // if tNode.inputs is undefined, a listener has created outputs, but inputs haven't
  // yet been checked
  if (tNode && tNode.inputs === undefined) {
    // mark inputs as checked
    tNode.inputs = generatePropertyAliases(node.tNode.flags, BindingDirection.Input);
  }

  const inputData = tNode && tNode.inputs;
  let dataValue: PropertyAliasValue|undefined;
  if (inputData && (dataValue = inputData[propName])) {
    setInputsForProperty(dataValue, value);
    markDirtyIfOnPush(node);
  } else {
    // It is assumed that the sanitizer is only added when the compiler determines that the property
    // is risky, so sanitization can be done without further checks.
    value = sanitizer != null ? (sanitizer(value) as any) : value;
    const native = node.native;
    ngDevMode && ngDevMode.rendererSetProperty++;
    isProceduralRenderer(renderer) ? renderer.setProperty(native, propName, value) :
                                     (native.setProperty ? native.setProperty(propName, value) :
                                                           (native as any)[propName] = value);
  }
}

/**
 * Constructs a TNode object from the arguments.
 *
 * @param type The type of the node
 * @param adjustedIndex The index of the TNode in TView.data, adjusted for HEADER_OFFSET
 * @param tagName The tag name of the node
 * @param attrs The attributes defined on this node
 * @param parent The parent of this node
 * @param tViews Any TViews attached to this node
 * @returns the TNode object
 */
export function createTNode(
    type: TNodeType, adjustedIndex: number, tagName: string | null, attrs: TAttributes | null,
    parent: TElementNode | TContainerNode | null, tViews: TView[] | null): TNode {
  ngDevMode && ngDevMode.tNode++;
  return {
    type: type,
    index: adjustedIndex,
    flags: 0,
    tagName: tagName,
    attrs: attrs,
    localNames: null,
    initialInputs: undefined,
    inputs: undefined,
    outputs: undefined,
    tViews: tViews,
    next: null,
    child: null,
    parent: parent,
    dynamicContainerNode: null,
    detached: null,
    stylingTemplate: null,
    projection: null
  };
}

/**
 * Given a list of directive indices and minified input names, sets the
 * input properties on the corresponding directives.
 */
function setInputsForProperty(inputs: PropertyAliasValue, value: any): void {
  for (let i = 0; i < inputs.length; i += 2) {
    ngDevMode && assertDataInRange(inputs[i] as number, directives !);
    directives ![inputs[i] as number][inputs[i + 1]] = value;
  }
}

/**
 * Consolidates all inputs or outputs of all directives on this logical node.
 *
 * @param number lNodeFlags logical node flags
 * @param Direction direction whether to consider inputs or outputs
 * @returns PropertyAliases|null aggregate of all properties if any, `null` otherwise
 */
function generatePropertyAliases(
    tNodeFlags: TNodeFlags, direction: BindingDirection): PropertyAliases|null {
  const count = tNodeFlags & TNodeFlags.DirectiveCountMask;
  let propStore: PropertyAliases|null = null;

  if (count > 0) {
    const start = tNodeFlags >> TNodeFlags.DirectiveStartingIndexShift;
    const end = start + count;
    const isInput = direction === BindingDirection.Input;
    const defs = tView.directives !;

    for (let i = start; i < end; i++) {
      const directiveDef = defs[i] as DirectiveDefInternal<any>;
      const propertyAliasMap: {[publicName: string]: string} =
          isInput ? directiveDef.inputs : directiveDef.outputs;
      for (let publicName in propertyAliasMap) {
        if (propertyAliasMap.hasOwnProperty(publicName)) {
          propStore = propStore || {};
          const internalName = propertyAliasMap[publicName];
          const hasProperty = propStore.hasOwnProperty(publicName);
          hasProperty ? propStore[publicName].push(i, internalName) :
                        (propStore[publicName] = [i, internalName]);
        }
      }
    }
  }
  return propStore;
}

/**
 * Add or remove a class in a `classList` on a DOM element.
 *
 * This instruction is meant to handle the [class.foo]="exp" case
 *
 * @param index The index of the element to update in the data array
 * @param className Name of class to toggle. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value A value indicating if a given class should be added or removed.
 */
export function elementClassProp<T>(
    index: number, stylingIndex: number, value: T | NO_CHANGE): void {
  updateElementClassProp(getStylingContext(index), stylingIndex, value ? true : false);
}

/**
 * Assign any inline style values to the element during creation mode.
 *
 * This instruction is meant to be called during creation mode to apply all styling
 * (e.g. `style="..."`) values to the element. This is also where the provided index
 * value is allocated for the styling details for its corresponding element (the element
 * index is the previous index value from this one).
 *
 * (Note this function calls `elementStylingApply` immediately when called.)
 *
 *
 * @param index Index value which will be allocated to store styling data for the element.
 *        (Note that this is not the element index, but rather an index value allocated
 *        specifically for element styling--the index must be the next index after the element
 *        index.)
 * @param classDeclarations A key/value array of CSS classes that will be registered on the element.
 *   Each individual style will be used on the element as long as it is not overridden
 *   by any classes placed on the element by multiple (`[class]`) or singular (`[class.named]`)
 *   bindings. If a class binding changes its value to a falsy value then the matching initial
 *   class value that are passed in here will be applied to the element (if matched).
 * @param styleDeclarations A key/value array of CSS styles that will be registered on the element.
 *   Each individual style will be used on the element as long as it is not overridden
 *   by any styles placed on the element by multiple (`[style]`) or singular (`[style.prop]`)
 *   bindings. If a style binding changes its value to null then the initial styling
 *   values that are passed in here will be applied to the element (if matched).
 * @param styleSanitizer An optional sanitizer function that will be used (if provided)
 *   to sanitize the any CSS property values that are applied to the element (during rendering).
 */
export function elementStyling<T>(
    classDeclarations?: (string | boolean | InitialStylingFlags)[] | null,
    styleDeclarations?: (string | boolean | InitialStylingFlags)[] | null,
    styleSanitizer?: StyleSanitizeFn | null): void {
  const lElement = currentElementNode !;
  const tNode = lElement.tNode;
  if (!tNode.stylingTemplate) {
    // initialize the styling template.
    tNode.stylingTemplate =
        createStylingContextTemplate(classDeclarations, styleDeclarations, styleSanitizer);
  }
  if (styleDeclarations && styleDeclarations.length ||
      classDeclarations && classDeclarations.length) {
    elementStylingApply(tNode.index - HEADER_OFFSET);
  }
}

/**
 * Retrieve the `StylingContext` at a given index.
 *
 * This method lazily creates the `StylingContext`. This is because in most cases
 * we have styling without any bindings. Creating `StylingContext` eagerly would mean that
 * every style declaration such as `<div style="color: 'red' ">` would result `StyleContext`
 * which would create unnecessary memory pressure.
 *
 * @param index Index of the style allocation. See: `elementStyling`.
 */
function getStylingContext(index: number): StylingContext {
  let stylingContext = load<StylingContext>(index);
  if (!Array.isArray(stylingContext)) {
    const lElement = stylingContext as any as LElementNode;
    const tNode = lElement.tNode;
    ngDevMode &&
        assertDefined(tNode.stylingTemplate, 'getStylingContext() called before elementStyling()');
    stylingContext = viewData[index + HEADER_OFFSET] =
        allocStylingContext(lElement, tNode.stylingTemplate !);
  }
  return stylingContext;
}

/**
 * Apply all styling values to the element which have been queued by any styling instructions.
 *
 * This instruction is meant to be run once one or more `elementStyle` and/or `elementStyleProp`
 * have been issued against the element. This function will also determine if any styles have
 * changed and will then skip the operation if there is nothing new to render.
 *
 * Once called then all queued styles will be flushed.
 *
 * @param index Index of the element's styling storage that will be rendered.
 *        (Note that this is not the element index, but rather an index value allocated
 *        specifically for element styling--the index must be the next index after the element
 *        index.)
 */
export function elementStylingApply<T>(index: number): void {
  renderElementStyles(getStylingContext(index), renderer);
}

/**
 * Queue a given style to be rendered on an Element.
 *
 * If the style value is `null` then it will be removed from the element
 * (or assigned a different value depending if there are any styles placed
 * on the element with `elementStyle` or any styles that are present
 * from when the element was created (with `elementStyling`).
 *
 * (Note that the styling instruction will not be applied until `elementStylingApply` is called.)
 *
 * @param index Index of the element's styling storage to change in the data array.
 *        (Note that this is not the element index, but rather an index value allocated
 *        specifically for element styling--the index must be the next index after the element
 *        index.)
 * @param styleIndex Index of the style property on this element. (Monotonically increasing.)
 * @param styleName Name of property. Because it is going to DOM this is not subject to
 *        renaming as part of minification.
 * @param value New value to write (null to remove).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 */
export function elementStyleProp<T>(
    index: number, styleIndex: number, value: T | null, suffix?: string): void {
  let valueToAdd: string|null = null;
  if (value) {
    if (suffix) {
      // when a suffix is applied then it will bypass
      // sanitization entirely (b/c a new string is created)
      valueToAdd = stringify(value) + suffix;
    } else {
      // sanitization happens by dealing with a String value
      // this means that the string value will be passed through
      // into the style rendering later (which is where the value
      // will be sanitized before it is applied)
      valueToAdd = value as any as string;
    }
  }
  updateElementStyleProp(getStylingContext(index), styleIndex, valueToAdd);
}

/**
 * Queue a key/value map of styles to be rendered on an Element.
 *
 * This instruction is meant to handle the `[style]="exp"` usage. When styles are applied to
 * the Element they will then be placed with respect to any styles set with `elementStyleProp`.
 * If any styles are set to `null` then they will be removed from the element (unless the same
 * style properties have been assigned to the element during creation using `elementStyling`).
 *
 * (Note that the styling instruction will not be applied until `elementStylingApply` is called.)
 *
 * @param index Index of the element's styling storage to change in the data array.
 *        (Note that this is not the element index, but rather an index value allocated
 *        specifically for element styling--the index must be the next index after the element
 *        index.)
 * @param classes A key/value style map of CSS classes that will be added to the given element.
 *        Any missing classes (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's list of CSS classes.
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 */
export function elementStylingMap<T>(
    index: number, classes: {[key: string]: any} | string | null,
    styles?: {[styleName: string]: any} | null): void {
  updateStylingMap(getStylingContext(index), classes, styles);
}

//////////////////////////
//// Text
//////////////////////////

/**
 * Create static text node
 *
 * @param index Index of the node in the data array
 * @param value Value to write. This value will be stringified.
 */
export function text(index: number, value?: any): void {
  ngDevMode &&
      assertEqual(viewData[BINDING_INDEX], -1, 'text nodes should be created before bindings');
  ngDevMode && ngDevMode.rendererCreateTextNode++;
  const textNode = createTextNode(value, renderer);
  const node = createLNode(index, TNodeType.Element, textNode, null, null);

  // Text nodes are self closing.
  isParent = false;
  appendChild(getParentLNode(node), textNode, viewData);
}

/**
 * Create text node with binding
 * Bindings should be handled externally with the proper interpolation(1-8) method
 *
 * @param index Index of the node in the data array.
 * @param value Stringified value to write.
 */
export function textBinding<T>(index: number, value: T | NO_CHANGE): void {
  if (value !== NO_CHANGE) {
    ngDevMode && assertDataInRange(index + HEADER_OFFSET);
    const existingNode = loadElement(index) as any as LTextNode;
    ngDevMode && assertDefined(existingNode, 'LNode should exist');
    ngDevMode && assertDefined(existingNode.native, 'native element should exist');
    ngDevMode && ngDevMode.rendererSetText++;
    isProceduralRenderer(renderer) ? renderer.setValue(existingNode.native, stringify(value)) :
                                     existingNode.native.textContent = stringify(value);
  }
}

//////////////////////////
//// Directive
//////////////////////////

/**
 * Create a directive and their associated content queries.
 *
 * NOTE: directives can be created in order other than the index order. They can also
 *       be retrieved before they are created in which case the value will be null.
 *
 * @param directive The directive instance.
 * @param directiveDef DirectiveDef object which contains information about the template.
 */
export function directiveCreate<T>(
    directiveDefIdx: number, directive: T,
    directiveDef: DirectiveDefInternal<T>| ComponentDefInternal<T>): T {
  const instance = baseDirectiveCreate(directiveDefIdx, directive, directiveDef);

  ngDevMode && assertDefined(previousOrParentNode.tNode, 'previousOrParentNode.tNode');
  const tNode = previousOrParentNode.tNode;

  const isComponent = (directiveDef as ComponentDefInternal<T>).template;
  if (isComponent) {
    addComponentLogic(directiveDefIdx, directive, directiveDef as ComponentDefInternal<T>);
  }

  if (firstTemplatePass) {
    // Init hooks are queued now so ngOnInit is called in host components before
    // any projected components.
    queueInitHooks(directiveDefIdx, directiveDef.onInit, directiveDef.doCheck, tView);

    if (directiveDef.hostBindings) queueHostBindingForCheck(directiveDefIdx);
  }

  if (tNode && tNode.attrs) {
    setInputsFromAttrs(directiveDefIdx, instance, directiveDef.inputs, tNode);
  }

  if (directiveDef.contentQueries) {
    directiveDef.contentQueries();
  }

  return instance;
}

function addComponentLogic<T>(
    directiveIndex: number, instance: T, def: ComponentDefInternal<T>): void {
  const tView = getOrCreateTView(def.template, def.directiveDefs, def.pipeDefs, def.viewQuery);

  // Only component views should be added to the view tree directly. Embedded views are
  // accessed through their containers because they may be removed / re-added later.
  const componentView = addToViewTree(
      viewData, previousOrParentNode.tNode.index as number,
      createLViewData(
          rendererFactory.createRenderer(previousOrParentNode.native as RElement, def.rendererType),
          tView, instance, def.onPush ? LViewFlags.Dirty : LViewFlags.CheckAlways,
          getCurrentSanitizer()));

  // We need to set the host node/data here because when the component LNode was created,
  // we didn't yet know it was a component (just an element).
  (previousOrParentNode as{data: LViewData}).data = componentView;
  (componentView as LViewData)[HOST_NODE] = previousOrParentNode as LElementNode;

  initChangeDetectorIfExisting(previousOrParentNode.nodeInjector, instance, componentView);

  if (firstTemplatePass) queueComponentIndexForCheck();
}

/**
 * A lighter version of directiveCreate() that is used for the root component
 *
 * This version does not contain features that we don't already support at root in
 * current Angular. Example: local refs and inputs on root component.
 */
export function baseDirectiveCreate<T>(
    index: number, directive: T,
    directiveDef: DirectiveDefInternal<T>| ComponentDefInternal<T>): T {
  ngDevMode &&
      assertEqual(viewData[BINDING_INDEX], -1, 'directives should be created before any bindings');
  ngDevMode && assertPreviousIsParent();

  Object.defineProperty(
      directive, NG_HOST_SYMBOL, {enumerable: false, value: previousOrParentNode});

  if (directives == null) viewData[DIRECTIVES] = directives = [];

  ngDevMode && assertDataNext(index, directives);
  directives[index] = directive;

  if (firstTemplatePass) {
    const flags = previousOrParentNode.tNode.flags;
    if ((flags & TNodeFlags.DirectiveCountMask) === 0) {
      // When the first directive is created:
      // - save the index,
      // - set the number of directives to 1
      previousOrParentNode.tNode.flags =
          index << TNodeFlags.DirectiveStartingIndexShift | flags & TNodeFlags.isComponent | 1;
    } else {
      // Only need to bump the size when subsequent directives are created
      ngDevMode && assertNotEqual(
                       flags & TNodeFlags.DirectiveCountMask, TNodeFlags.DirectiveCountMask,
                       'Reached the max number of directives');
      previousOrParentNode.tNode.flags++;
    }
  } else {
    const diPublic = directiveDef !.diPublic;
    if (diPublic) diPublic(directiveDef !);
  }

  if (directiveDef !.attributes != null && previousOrParentNode.tNode.type == TNodeType.Element) {
    setUpAttributes(
        (previousOrParentNode as LElementNode).native, directiveDef !.attributes as string[]);
  }

  return directive;
}

/**
 * Sets initial input properties on directive instances from attribute data
 *
 * @param directiveIndex Index of the directive in directives array
 * @param instance Instance of the directive on which to set the initial inputs
 * @param inputs The list of inputs from the directive def
 * @param tNode The static data for this node
 */
function setInputsFromAttrs<T>(
    directiveIndex: number, instance: T, inputs: {[P in keyof T]: string;}, tNode: TNode): void {
  let initialInputData = tNode.initialInputs as InitialInputData | undefined;
  if (initialInputData === undefined || directiveIndex >= initialInputData.length) {
    initialInputData = generateInitialInputs(directiveIndex, inputs, tNode);
  }

  const initialInputs: InitialInputs|null = initialInputData[directiveIndex];
  if (initialInputs) {
    for (let i = 0; i < initialInputs.length; i += 2) {
      (instance as any)[initialInputs[i]] = initialInputs[i + 1];
    }
  }
}

/**
 * Generates initialInputData for a node and stores it in the template's static storage
 * so subsequent template invocations don't have to recalculate it.
 *
 * initialInputData is an array containing values that need to be set as input properties
 * for directives on this node, but only once on creation. We need this array to support
 * the case where you set an @Input property of a directive using attribute-like syntax.
 * e.g. if you have a `name` @Input, you can set it once like this:
 *
 * <my-component name="Bess"></my-component>
 *
 * @param directiveIndex Index to store the initial input data
 * @param inputs The list of inputs from the directive def
 * @param tNode The static data on this node
 */
function generateInitialInputs(
    directiveIndex: number, inputs: {[key: string]: string}, tNode: TNode): InitialInputData {
  const initialInputData: InitialInputData = tNode.initialInputs || (tNode.initialInputs = []);
  initialInputData[directiveIndex] = null;

  const attrs = tNode.attrs !;
  let i = 0;
  while (i < attrs.length) {
    const attrName = attrs[i];
    if (attrName === AttributeMarker.SelectOnly) break;
    if (attrName === AttributeMarker.NamespaceURI) {
      // We do not allow inputs on namespaced attributes.
      i += 4;
      continue;
    }
    const minifiedInputName = inputs[attrName];
    const attrValue = attrs[i + 1];

    if (minifiedInputName !== undefined) {
      const inputsToStore: InitialInputs =
          initialInputData[directiveIndex] || (initialInputData[directiveIndex] = []);
      inputsToStore.push(minifiedInputName, attrValue as string);
    }

    i += 2;
  }
  return initialInputData;
}

//////////////////////////
//// ViewContainer & View
//////////////////////////

/**
 * Creates a LContainer, either from a container instruction, or for a ViewContainerRef.
 *
 * @param parentLNode the LNode in which the container's content will be rendered
 * @param currentView The parent view of the LContainer
 * @param isForViewContainerRef Optional a flag indicating the ViewContainerRef case
 * @returns LContainer
 */
export function createLContainer(
    parentLNode: LNode, currentView: LViewData, isForViewContainerRef?: boolean): LContainer {
  ngDevMode && assertDefined(parentLNode, 'containers should have a parent');
  let renderParent = canInsertNativeNode(parentLNode, currentView) ?
      parentLNode as LElementNode | LViewNode :
      null;
  if (renderParent && renderParent.tNode.type === TNodeType.View) {
    renderParent = getParentLNode(renderParent as LViewNode) !.data[RENDER_PARENT];
  }
  return [
    isForViewContainerRef ? null : 0,  // active index
    currentView,                       // parent
    null,                              // next
    null,                              // queries
    [],                                // views
    renderParent as LElementNode
  ];
}

/**
 * Creates an LContainerNode.
 *
 * Only `LViewNodes` can go into `LContainerNodes`.
 *
 * @param index The index of the container in the data array
 * @param template Optional inline template
 * @param tagName The name of the container element, if applicable
 * @param attrs The attrs attached to the container, if applicable
 * @param localRefs A set of local reference bindings on the element.
 */
export function container(
    index: number, template?: EmbeddedTemplate<any>, tagName?: string | null, attrs?: TAttributes,
    localRefs?: string[] | null): void {
  ngDevMode &&
      assertEqual(
          viewData[BINDING_INDEX], -1, 'container nodes should be created before any bindings');

  const currentParent = isParent ? previousOrParentNode : getParentLNode(previousOrParentNode) !;
  const lContainer = createLContainer(currentParent, viewData);

  const comment = renderer.createComment(ngDevMode ? 'container' : '');
  const node =
      createLNode(index, TNodeType.Container, comment, tagName || null, attrs || null, lContainer);
  appendChild(getParentLNode(node), comment, viewData);

  if (firstTemplatePass) {
    node.tNode.tViews = template ?
        createTView(-1, template, tView.directiveRegistry, tView.pipeRegistry, null) :
        [];
  }

  // Containers are added to the current view tree instead of their embedded views
  // because views can be removed and re-inserted.
  addToViewTree(viewData, index + HEADER_OFFSET, node.data);

  const queries = node.queries;
  if (queries) {
    // prepare place for matching nodes from views inserted into a given container
    lContainer[QUERIES] = queries.container();
  }

  createDirectivesAndLocals(localRefs);

  isParent = false;
  ngDevMode && assertNodeType(previousOrParentNode, TNodeType.Container);
  queries && queries.addNode(node);  // check if a given container node matches
  queueLifecycleHooks(node.tNode.flags, tView);
}

/**
 * Sets a container up to receive views.
 *
 * @param index The index of the container in the data array
 */
export function containerRefreshStart(index: number): void {
  previousOrParentNode = loadElement(index) as LNode;
  ngDevMode && assertNodeType(previousOrParentNode, TNodeType.Container);
  isParent = true;
  (previousOrParentNode as LContainerNode).data[ACTIVE_INDEX] = 0;

  if (!checkNoChangesMode) {
    // We need to execute init hooks here so ngOnInit hooks are called in top level views
    // before they are called in embedded views (for backwards compatibility).
    executeInitHooks(viewData, tView, creationMode);
  }
}

/**
 * Marks the end of the LContainerNode.
 *
 * Marking the end of LContainerNode is the time when to child Views get inserted or removed.
 */
export function containerRefreshEnd(): void {
  if (isParent) {
    isParent = false;
  } else {
    ngDevMode && assertNodeType(previousOrParentNode, TNodeType.View);
    ngDevMode && assertHasParent();
    previousOrParentNode = getParentLNode(previousOrParentNode) !;
  }
  ngDevMode && assertNodeType(previousOrParentNode, TNodeType.Container);
  const container = previousOrParentNode as LContainerNode;
  ngDevMode && assertNodeType(container, TNodeType.Container);
  const nextIndex = container.data[ACTIVE_INDEX] !;

  // remove extra views at the end of the container
  while (nextIndex < container.data[VIEWS].length) {
    removeView(container, nextIndex);
  }
}

/**
 * Goes over dynamic embedded views (ones created through ViewContainerRef APIs) and refreshes them
 * by executing an associated template function.
 */
function refreshDynamicEmbeddedViews(lViewData: LViewData) {
  for (let current = getLViewChild(lViewData); current !== null; current = current[NEXT]) {
    // Note: current can be an LViewData or an LContainer instance, but here we are only interested
    // in LContainer. We can tell it's an LContainer because its length is less than the LViewData
    // header.
    if (current.length < HEADER_OFFSET && current[ACTIVE_INDEX] === null) {
      const container = current as LContainer;
      for (let i = 0; i < container[VIEWS].length; i++) {
        const lViewNode = container[VIEWS][i];
        // The directives and pipes are not needed here as an existing view is only being refreshed.
        const dynamicViewData = lViewNode.data;
        ngDevMode && assertDefined(dynamicViewData[TVIEW], 'TView must be allocated');
        renderEmbeddedTemplate(
            lViewNode, dynamicViewData[TVIEW], dynamicViewData[CONTEXT] !, RenderFlags.Update);
      }
    }
  }
}


/**
 * Looks for a view with a given view block id inside a provided LContainer.
 * Removes views that need to be deleted in the process.
 *
 * @param containerNode where to search for views
 * @param startIdx starting index in the views array to search from
 * @param viewBlockId exact view block id to look for
 * @returns index of a found view or -1 if not found
 */
function scanForView(
    containerNode: LContainerNode, startIdx: number, viewBlockId: number): LViewNode|null {
  const views = containerNode.data[VIEWS];
  for (let i = startIdx; i < views.length; i++) {
    const viewAtPositionId = views[i].data[TVIEW].id;
    if (viewAtPositionId === viewBlockId) {
      return views[i];
    } else if (viewAtPositionId < viewBlockId) {
      // found a view that should not be at this position - remove
      removeView(containerNode, i);
    } else {
      // found a view with id greater than the one we are searching for
      // which means that required view doesn't exist and can't be found at
      // later positions in the views array - stop the search here
      break;
    }
  }
  return null;
}

/**
 * Marks the start of an embedded view.
 *
 * @param viewBlockId The ID of this view
 * @return boolean Whether or not this view is in creation mode
 */
export function embeddedViewStart(viewBlockId: number): RenderFlags {
  const container =
      (isParent ? previousOrParentNode : getParentLNode(previousOrParentNode)) as LContainerNode;
  ngDevMode && assertNodeType(container, TNodeType.Container);
  const lContainer = container.data;
  let viewNode: LViewNode|null = scanForView(container, lContainer[ACTIVE_INDEX] !, viewBlockId);

  if (viewNode) {
    previousOrParentNode = viewNode;
    ngDevMode && assertNodeType(previousOrParentNode, TNodeType.View);
    isParent = true;
    enterView(viewNode.data, viewNode);
  } else {
    // When we create a new LView, we always reset the state of the instructions.
    const newView = createLViewData(
        renderer, getOrCreateEmbeddedTView(viewBlockId, container), null, LViewFlags.CheckAlways,
        getCurrentSanitizer());

    if (lContainer[QUERIES]) {
      newView[QUERIES] = lContainer[QUERIES] !.createView();
    }

    enterView(
        newView, viewNode = createLNode(viewBlockId, TNodeType.View, null, null, null, newView));
  }
  if (container) {
    if (creationMode) {
      // it is a new view, insert it into collection of views for a given container
      insertView(container, viewNode, lContainer[ACTIVE_INDEX] !);
    }
    lContainer[ACTIVE_INDEX] !++;
  }
  return getRenderFlags(viewNode.data);
}

/**
 * Initialize the TView (e.g. static data) for the active embedded view.
 *
 * Each embedded view block must create or retrieve its own TView. Otherwise, the embedded view's
 * static data for a particular node would overwrite the static data for a node in the view above
 * it with the same index (since it's in the same template).
 *
 * @param viewIndex The index of the TView in TNode.tViews
 * @param parent The parent container in which to look for the view's static data
 * @returns TView
 */
function getOrCreateEmbeddedTView(viewIndex: number, parent: LContainerNode): TView {
  ngDevMode && assertNodeType(parent, TNodeType.Container);
  const containerTViews = (parent !.tNode as TContainerNode).tViews as TView[];
  ngDevMode && assertDefined(containerTViews, 'TView expected');
  ngDevMode && assertEqual(Array.isArray(containerTViews), true, 'TViews should be in an array');
  if (viewIndex >= containerTViews.length || containerTViews[viewIndex] == null) {
    containerTViews[viewIndex] =
        createTView(viewIndex, null, tView.directiveRegistry, tView.pipeRegistry, null);
  }
  return containerTViews[viewIndex];
}

/** Marks the end of an embedded view. */
export function embeddedViewEnd(): void {
  refreshDescendantViews();
  isParent = false;
  previousOrParentNode = viewData[HOST_NODE] as LViewNode;
  leaveView(viewData[PARENT] !);
  ngDevMode && assertEqual(isParent, false, 'isParent');
  ngDevMode && assertNodeType(previousOrParentNode, TNodeType.View);
}

/////////////

/**
 * Refreshes components by entering the component view and processing its bindings, queries, etc.
 *
 * @param adjustedElementIndex  Element index in LViewData[] (adjusted for HEADER_OFFSET)
 */
export function componentRefresh<T>(adjustedElementIndex: number): void {
  ngDevMode && assertDataInRange(adjustedElementIndex);
  const element = viewData[adjustedElementIndex] as LElementNode;
  ngDevMode && assertNodeType(element, TNodeType.Element);
  ngDevMode &&
      assertDefined(element.data, `Component's host node should have an LViewData attached.`);
  const hostView = element.data !;

  // Only attached CheckAlways components or attached, dirty OnPush components should be checked
  if (viewAttached(hostView) && hostView[FLAGS] & (LViewFlags.CheckAlways | LViewFlags.Dirty)) {
    detectChangesInternal(hostView, element, hostView[CONTEXT]);
  }
}

/** Returns a boolean for whether the view is attached */
export function viewAttached(view: LViewData): boolean {
  return (view[FLAGS] & LViewFlags.Attached) === LViewFlags.Attached;
}

/**
 * Instruction to distribute projectable nodes among <ng-content> occurrences in a given template.
 * It takes all the selectors from the entire component's template and decides where
 * each projected node belongs (it re-distributes nodes among "buckets" where each "bucket" is
 * backed by a selector).
 *
 * This function requires CSS selectors to be provided in 2 forms: parsed (by a compiler) and text,
 * un-parsed form.
 *
 * The parsed form is needed for efficient matching of a node against a given CSS selector.
 * The un-parsed, textual form is needed for support of the ngProjectAs attribute.
 *
 * Having a CSS selector in 2 different formats is not ideal, but alternatives have even more
 * drawbacks:
 * - having only a textual form would require runtime parsing of CSS selectors;
 * - we can't have only a parsed as we can't re-construct textual form from it (as entered by a
 * template author).
 *
 * @param selectors A collection of parsed CSS selectors
 * @param rawSelectors A collection of CSS selectors in the raw, un-parsed form
 */
export function projectionDef(selectors?: CssSelectorList[], textSelectors?: string[]): void {
  const componentNode: LElementNode = findComponentHost(viewData);

  if (!componentNode.tNode.projection) {
    const noOfNodeBuckets = selectors ? selectors.length + 1 : 1;
    const pData: (TNode | null)[] = componentNode.tNode.projection =
        new Array(noOfNodeBuckets).fill(null);
    const tails: (TNode | null)[] = pData.slice();

    let componentChild = componentNode.tNode.child;

    while (componentChild !== null) {
      const bucketIndex =
          selectors ? matchingSelectorIndex(componentChild, selectors, textSelectors !) : 0;
      const nextNode = componentChild.next;

      if (tails[bucketIndex]) {
        tails[bucketIndex] !.next = componentChild;
      } else {
        pData[bucketIndex] = componentChild;
        componentChild.next = null;
      }
      tails[bucketIndex] = componentChild;

      componentChild = nextNode;
    }
  }
}

/**
 * Stack used to keep track of projection nodes in projection() instruction.
 *
 * This is deliberately created outside of projection() to avoid allocating
 * a new array each time the function is called. Instead the array will be
 * re-used by each invocation. This works because the function is not reentrant.
 */
const projectionNodeStack: LProjectionNode[] = [];

/**
 * Inserts previously re-distributed projected nodes. This instruction must be preceded by a call
 * to the projectionDef instruction.
 *
 * @param nodeIndex
 * @param selectorIndex:
 *        - 0 when the selector is `*` (or unspecified as this is the default value),
 *        - 1 based index of the selector from the {@link projectionDef}
 */
export function projection(nodeIndex: number, selectorIndex: number = 0, attrs?: string[]): void {
  const node = createLNode(nodeIndex, TNodeType.Projection, null, null, attrs || null, null);

  // We can't use viewData[HOST_NODE] because projection nodes can be nested in embedded views.
  if (node.tNode.projection === null) node.tNode.projection = selectorIndex;

  // `<ng-content>` has no content
  isParent = false;

  // re-distribution of projectable nodes is stored on a component's view level
  const parent = getParentLNode(node);

  if (canInsertNativeNode(parent, viewData)) {
    const componentNode = findComponentHost(viewData);
    let nodeToProject = (componentNode.tNode.projection as(TNode | null)[])[selectorIndex];
    let projectedView = componentNode.view;
    let projectionNodeIndex = -1;
    let grandparent: LContainerNode;
    const renderParent = parent.tNode.type === TNodeType.View ?
        (grandparent = getParentLNode(parent) as LContainerNode) &&
            grandparent.data[RENDER_PARENT] ! :
        parent as LElementNode;

    while (nodeToProject) {
      if (nodeToProject.type === TNodeType.Projection) {
        // This node is re-projected, so we must go up the tree to get its projected nodes.
        const currentComponentHost = findComponentHost(projectedView);
        const firstProjectedNode = (currentComponentHost.tNode.projection as(
            TNode | null)[])[nodeToProject.projection as number];

        if (firstProjectedNode) {
          projectionNodeStack[++projectionNodeIndex] = projectedView[nodeToProject.index];
          nodeToProject = firstProjectedNode;
          projectedView = currentComponentHost.view;
          continue;
        }
      } else {
        const lNode = projectedView[nodeToProject.index];
        lNode.tNode.flags |= TNodeFlags.isProjected;
        appendProjectedNode(
            lNode as LTextNode | LElementNode | LContainerNode, parent, viewData, renderParent);
      }

      // If we are finished with a list of re-projected nodes, we need to get
      // back to the root projection node that was re-projected.
      if (nodeToProject.next === null && projectedView !== componentNode.view) {
        // move down into the view of the component we're projecting right now
        const lNode = projectionNodeStack[projectionNodeIndex--];
        nodeToProject = lNode.tNode;
        projectedView = lNode.view;
      }
      nodeToProject = nodeToProject.next;
    }
  }
}

/**
 * Adds LViewData or LContainer to the end of the current view tree.
 *
 * This structure will be used to traverse through nested views to remove listeners
 * and call onDestroy callbacks.
 *
 * @param currentView The view where LViewData or LContainer should be added
 * @param adjustedHostIndex Index of the view's host node in LViewData[], adjusted for header
 * @param state The LViewData or LContainer to add to the view tree
 * @returns The state passed in
 */
export function addToViewTree<T extends LViewData|LContainer>(
    currentView: LViewData, adjustedHostIndex: number, state: T): T {
  if (currentView[TAIL]) {
    currentView[TAIL] ![NEXT] = state;
  } else if (firstTemplatePass) {
    tView.childIndex = adjustedHostIndex;
  }
  currentView[TAIL] = state;
  return state;
}

///////////////////////////////
//// Change detection
///////////////////////////////

/** If node is an OnPush component, marks its LViewData dirty. */
export function markDirtyIfOnPush(node: LElementNode): void {
  // Because data flows down the component tree, ancestors do not need to be marked dirty
  if (node.data && !(node.data[FLAGS] & LViewFlags.CheckAlways)) {
    node.data[FLAGS] |= LViewFlags.Dirty;
  }
}

/**
 * Wraps an event listener so its host view and its ancestor views will be marked dirty
 * whenever the event fires. Necessary to support OnPush components.
 */
export function wrapListenerWithDirtyLogic(
    view: LViewData, listenerFn: (e?: any) => any): (e: Event) => any {
  return function(e: any) {
    markViewDirty(view);
    return listenerFn(e);
  };
}

/**
 * Wraps an event listener so its host view and its ancestor views will be marked dirty
 * whenever the event fires. Also wraps with preventDefault behavior.
 */
export function wrapListenerWithDirtyAndDefault(
    view: LViewData, listenerFn: (e?: any) => any): EventListener {
  return function wrapListenerIn_markViewDirty(e: Event) {
    markViewDirty(view);
    if (listenerFn(e) === false) {
      e.preventDefault();
      // Necessary for legacy browsers that don't support preventDefault (e.g. IE)
      e.returnValue = false;
    }
  };
}

/** Marks current view and all ancestors dirty */
export function markViewDirty(view: LViewData): void {
  let currentView: LViewData = view;

  while (currentView[PARENT] != null) {
    currentView[FLAGS] |= LViewFlags.Dirty;
    currentView = currentView[PARENT] !;
  }
  currentView[FLAGS] |= LViewFlags.Dirty;
  ngDevMode && assertDefined(currentView[CONTEXT], 'rootContext');
  scheduleTick(currentView[CONTEXT] as RootContext);
}


/**
 * Used to schedule change detection on the whole application.
 *
 * Unlike `tick`, `scheduleTick` coalesces multiple calls into one change detection run.
 * It is usually called indirectly by calling `markDirty` when the view needs to be
 * re-rendered.
 *
 * Typically `scheduleTick` uses `requestAnimationFrame` to coalesce multiple
 * `scheduleTick` requests. The scheduling function can be overridden in
 * `renderComponent`'s `scheduler` option.
 */
export function scheduleTick<T>(rootContext: RootContext) {
  if (rootContext.clean == _CLEAN_PROMISE) {
    let res: null|((val: null) => void);
    rootContext.clean = new Promise<null>((r) => res = r);
    rootContext.scheduler(() => {
      tickRootContext(rootContext);
      res !(null);
      rootContext.clean = _CLEAN_PROMISE;
    });
  }
}

/**
 * Used to perform change detection on the whole application.
 *
 * This is equivalent to `detectChanges`, but invoked on root component. Additionally, `tick`
 * executes lifecycle hooks and conditionally checks components based on their
 * `ChangeDetectionStrategy` and dirtiness.
 *
 * The preferred way to trigger change detection is to call `markDirty`. `markDirty` internally
 * schedules `tick` using a scheduler in order to coalesce multiple `markDirty` calls into a
 * single change detection run. By default, the scheduler is `requestAnimationFrame`, but can
 * be changed when calling `renderComponent` and providing the `scheduler` option.
 */
export function tick<T>(component: T): void {
  const rootView = getRootView(component);
  const rootContext = rootView[CONTEXT] as RootContext;
  tickRootContext(rootContext);
}

function tickRootContext(rootContext: RootContext) {
  for (let i = 0; i < rootContext.components.length; i++) {
    const rootComponent = rootContext.components[i];
    const hostNode = _getComponentHostLElementNode(rootComponent);

    ngDevMode && assertDefined(hostNode.data, 'Component host node should be attached to an LView');
    renderComponentOrTemplate(hostNode, getRootView(rootComponent), rootComponent);
  }
}

/**
 * Retrieve the root view from any component by walking the parent `LViewData` until
 * reaching the root `LViewData`.
 *
 * @param component any component
 */

export function getRootView(component: any): LViewData {
  ngDevMode && assertDefined(component, 'component');
  const lElementNode = _getComponentHostLElementNode(component);
  let lViewData = lElementNode.view;
  while (lViewData[PARENT]) {
    lViewData = lViewData[PARENT] !;
  }
  return lViewData;
}

/**
 * Synchronously perform change detection on a component (and possibly its sub-components).
 *
 * This function triggers change detection in a synchronous way on a component. There should
 * be very little reason to call this function directly since a preferred way to do change
 * detection is to {@link markDirty} the component and wait for the scheduler to call this method
 * at some future point in time. This is because a single user action often results in many
 * components being invalidated and calling change detection on each component synchronously
 * would be inefficient. It is better to wait until all components are marked as dirty and
 * then perform single change detection across all of the components
 *
 * @param component The component which the change detection should be performed on.
 */
export function detectChanges<T>(component: T): void {
  const hostNode = _getComponentHostLElementNode(component);
  ngDevMode &&
      assertDefined(
          hostNode.data, 'Component host node should be attached to an LViewData instance.');
  detectChangesInternal(hostNode.data as LViewData, hostNode, component);
}


/**
 * Checks the change detector and its children, and throws if any changes are detected.
 *
 * This is used in development mode to verify that running change detection doesn't
 * introduce other changes.
 */
export function checkNoChanges<T>(component: T): void {
  checkNoChangesMode = true;
  try {
    detectChanges(component);
  } finally {
    checkNoChangesMode = false;
  }
}

/** Checks the view of the component provided. Does not gate on dirty checks or execute doCheck. */
export function detectChangesInternal<T>(
    hostView: LViewData, hostNode: LElementNode, component: T) {
  const oldView = enterView(hostView, hostNode);
  const hostTView = hostView[TVIEW];
  const template = hostTView.template !;
  const viewQuery = hostTView.viewQuery;

  try {
    namespaceHTML();
    createViewQuery(viewQuery, hostView[FLAGS], component);
    template(getRenderFlags(hostView), component);
    refreshDescendantViews();
    updateViewQuery(viewQuery, component);
  } finally {
    leaveView(oldView);
  }
}

function createViewQuery<T>(
    viewQuery: ComponentQuery<{}>| null, flags: LViewFlags, component: T): void {
  if (viewQuery && (flags & LViewFlags.CreationMode)) {
    viewQuery(RenderFlags.Create, component);
  }
}

function updateViewQuery<T>(viewQuery: ComponentQuery<{}>| null, component: T): void {
  if (viewQuery) {
    viewQuery(RenderFlags.Update, component);
  }
}


/**
 * Mark the component as dirty (needing change detection).
 *
 * Marking a component dirty will schedule a change detection on this
 * component at some point in the future. Marking an already dirty
 * component as dirty is a noop. Only one outstanding change detection
 * can be scheduled per component tree. (Two components bootstrapped with
 * separate `renderComponent` will have separate schedulers)
 *
 * When the root component is bootstrapped with `renderComponent`, a scheduler
 * can be provided.
 *
 * @param component Component to mark as dirty.
 */
export function markDirty<T>(component: T) {
  ngDevMode && assertDefined(component, 'component');
  const lElementNode = _getComponentHostLElementNode(component);
  markViewDirty(lElementNode.view);
}

///////////////////////////////
//// Bindings & interpolations
///////////////////////////////

export interface NO_CHANGE {
  // This is a brand that ensures that this type can never match anything else
  brand: 'NO_CHANGE';
}

/** A special value which designates that a value has not changed. */
export const NO_CHANGE = {} as NO_CHANGE;

/**
 *  Initializes the binding start index. Will get inlined.
 *
 *  This function must be called before any binding related function is called
 *  (ie `bind()`, `interpolationX()`, `pureFunctionX()`)
 */
function initBindings() {
  ngDevMode && assertEqual(
                   viewData[BINDING_INDEX], -1,
                   'Binding index should not yet be set ' + viewData[BINDING_INDEX]);
  if (tView.bindingStartIndex === -1) {
    tView.bindingStartIndex = viewData.length;
  }
  viewData[BINDING_INDEX] = tView.bindingStartIndex;
}

/**
 * Creates a single value binding.
 *
 * @param value Value to diff
 */
export function bind<T>(value: T): T|NO_CHANGE {
  return bindingUpdated(value) ? value : NO_CHANGE;
}

/**
 * Reserves slots for pure functions (`pureFunctionX` instructions)
 *
 * Bindings for pure functions are stored after the LNodes in the data array but before the binding.
 *
 *  ----------------------------------------------------------------------------
 *  |  LNodes ... | pure function bindings | regular bindings / interpolations |
 *  ----------------------------------------------------------------------------
 *                                         ^
 *                                         TView.bindingStartIndex
 *
 * Pure function instructions are given an offset from TView.bindingStartIndex.
 * Subtracting the offset from TView.bindingStartIndex gives the first index where the bindings
 * are stored.
 *
 * NOTE: reserveSlots instructions are only ever allowed at the very end of the creation block
 */
export function reserveSlots(numSlots: number) {
  // Init the slots with a unique `NO_CHANGE` value so that the first change is always detected
  // whether it happens or not during the first change detection pass - pure functions checks
  // might be skipped when short-circuited.
  viewData.length += numSlots;
  viewData.fill(NO_CHANGE, -numSlots);
  // We need to initialize the binding in case a `pureFunctionX` kind of binding instruction is
  // called first in the update section.
  initBindings();
}

/**
 * Sets up the binding index before executing any `pureFunctionX` instructions.
 *
 * The index must be restored after the pure function is executed
 *
 * {@link reserveSlots}
 */
export function moveBindingIndexToReservedSlot(offset: number): number {
  const currentSlot = viewData[BINDING_INDEX];
  viewData[BINDING_INDEX] = tView.bindingStartIndex - offset;
  return currentSlot;
}

/**
 * Restores the binding index to the given value.
 *
 * This function is typically used to restore the index after a `pureFunctionX` has
 * been executed.
 */
export function restoreBindingIndex(index: number): void {
  viewData[BINDING_INDEX] = index;
}

/**
 * Create interpolation bindings with a variable number of expressions.
 *
 * If there are 1 to 8 expressions `interpolation1()` to `interpolation8()` should be used instead.
 * Those are faster because there is no need to create an array of expressions and iterate over it.
 *
 * `values`:
 * - has static text at even indexes,
 * - has evaluated expressions at odd indexes.
 *
 * Returns the concatenated string when any of the arguments changes, `NO_CHANGE` otherwise.
 */
export function interpolationV(values: any[]): string|NO_CHANGE {
  ngDevMode && assertLessThan(2, values.length, 'should have at least 3 values');
  ngDevMode && assertEqual(values.length % 2, 1, 'should have an odd number of values');

  let different = false;

  for (let i = 1; i < values.length; i += 2) {
    // Check if bindings (odd indexes) have changed
    bindingUpdated(values[i]) && (different = true);
  }

  if (!different) {
    return NO_CHANGE;
  }

  // Build the updated content
  let content = values[0];
  for (let i = 1; i < values.length; i += 2) {
    content += stringify(values[i]) + values[i + 1];
  }

  return content;
}

/**
 * Creates an interpolation binding with 1 expression.
 *
 * @param prefix static value used for concatenation only.
 * @param v0 value checked for change.
 * @param suffix static value used for concatenation only.
 */
export function interpolation1(prefix: string, v0: any, suffix: string): string|NO_CHANGE {
  const different = bindingUpdated(v0);

  return different ? prefix + stringify(v0) + suffix : NO_CHANGE;
}

/** Creates an interpolation binding with 2 expressions. */
export function interpolation2(
    prefix: string, v0: any, i0: string, v1: any, suffix: string): string|NO_CHANGE {
  const different = bindingUpdated2(v0, v1);

  return different ? prefix + stringify(v0) + i0 + stringify(v1) + suffix : NO_CHANGE;
}

/** Creates an interpolation binding with 3 expressions. */
export function interpolation3(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): string|
    NO_CHANGE {
  let different = bindingUpdated2(v0, v1);
  different = bindingUpdated(v2) || different;

  return different ? prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + suffix :
                     NO_CHANGE;
}

/** Create an interpolation binding with 4 expressions. */
export function interpolation4(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    suffix: string): string|NO_CHANGE {
  const different = bindingUpdated4(v0, v1, v2, v3);

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) +
          suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 5 expressions. */
export function interpolation5(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, suffix: string): string|NO_CHANGE {
  let different = bindingUpdated4(v0, v1, v2, v3);
  different = bindingUpdated(v4) || different;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 6 expressions. */
export function interpolation6(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, suffix: string): string|NO_CHANGE {
  let different = bindingUpdated4(v0, v1, v2, v3);
  different = bindingUpdated2(v4, v5) || different;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + i4 + stringify(v5) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 7 expressions. */
export function interpolation7(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): string|
    NO_CHANGE {
  let different = bindingUpdated4(v0, v1, v2, v3);
  different = bindingUpdated2(v4, v5) || different;
  different = bindingUpdated(v6) || different;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + i4 + stringify(v5) + i5 + stringify(v6) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 8 expressions. */
export function interpolation8(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any,
    suffix: string): string|NO_CHANGE {
  let different = bindingUpdated4(v0, v1, v2, v3);
  different = bindingUpdated4(v4, v5, v6, v7) || different;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + i4 + stringify(v5) + i5 + stringify(v6) + i6 + stringify(v7) + suffix :
      NO_CHANGE;
}

/** Store a value in the `data` at a given `index`. */
export function store<T>(index: number, value: T): void {
  // We don't store any static data for local variables, so the first time
  // we see the template, we should store as null to avoid a sparse array
  const adjustedIndex = index + HEADER_OFFSET;
  if (adjustedIndex >= tView.data.length) {
    tView.data[adjustedIndex] = null;
  }
  viewData[adjustedIndex] = value;
}

/** Retrieves a value from an LViewData at the given nesting level. */
export function reference<T>(nestingLevel: number, index: number) {
  let currentView = viewData;
  while (nestingLevel > 0) {
    ngDevMode && assertDefined(
                     currentView[DECLARATION_VIEW],
                     'Declaration view should be defined if nesting level is greater than 0.');
    currentView = currentView[DECLARATION_VIEW] !;
    nestingLevel--;
  }

  return loadInternal<T>(index, currentView);
}

/** Retrieves a value from the `directives` array. */
export function loadDirective<T>(index: number): T {
  ngDevMode && assertDefined(directives, 'Directives array should be defined if reading a dir.');
  ngDevMode && assertDataInRange(index, directives !);
  return directives ![index];
}

export function loadQueryList<T>(queryListIdx: number): QueryList<T> {
  ngDevMode && assertDefined(
                   viewData[CONTENT_QUERIES],
                   'Content QueryList array should be defined if reading a query.');
  ngDevMode && assertDataInRange(queryListIdx, viewData[CONTENT_QUERIES] !);

  return viewData[CONTENT_QUERIES] ![queryListIdx];
}

/** Retrieves a value from current `viewData`. */
export function load<T>(index: number): T {
  return loadInternal<T>(index, viewData);
}

export function loadElement(index: number): LElementNode {
  return loadElementInternal(index, viewData);
}

/** Gets the current binding value and increments the binding index. */
export function consumeBinding(): any {
  ngDevMode && assertDataInRange(viewData[BINDING_INDEX]);
  ngDevMode &&
      assertNotEqual(
          viewData[viewData[BINDING_INDEX]], NO_CHANGE, 'Stored value should never be NO_CHANGE.');
  return viewData[viewData[BINDING_INDEX]++];
}

/** Updates binding if changed, then returns whether it was updated. */
export function bindingUpdated(value: any): boolean {
  ngDevMode && assertNotEqual(value, NO_CHANGE, 'Incoming value should never be NO_CHANGE.');
  if (viewData[BINDING_INDEX] === -1) initBindings();
  const bindingIndex = viewData[BINDING_INDEX];

  if (bindingIndex >= viewData.length) {
    viewData[viewData[BINDING_INDEX]++] = value;
  } else if (isDifferent(viewData[bindingIndex], value)) {
    throwErrorIfNoChangesMode(creationMode, checkNoChangesMode, viewData[bindingIndex], value);
    viewData[viewData[BINDING_INDEX]++] = value;
  } else {
    viewData[BINDING_INDEX]++;
    return false;
  }
  return true;
}

/** Updates binding if changed, then returns the latest value. */
export function checkAndUpdateBinding(value: any): any {
  bindingUpdated(value);
  return value;
}

/** Updates 2 bindings if changed, then returns whether either was updated. */
export function bindingUpdated2(exp1: any, exp2: any): boolean {
  const different = bindingUpdated(exp1);
  return bindingUpdated(exp2) || different;
}

/** Updates 4 bindings if changed, then returns whether any was updated. */
export function bindingUpdated4(exp1: any, exp2: any, exp3: any, exp4: any): boolean {
  const different = bindingUpdated2(exp1, exp2);
  return bindingUpdated2(exp3, exp4) || different;
}

export function getTView(): TView {
  return tView;
}

/**
 * Registers a QueryList, associated with a content query, for later refresh (part of a view
 * refresh).
 */
export function registerContentQuery<Q>(queryList: QueryList<Q>): void {
  const savedContentQueriesLength =
      (viewData[CONTENT_QUERIES] || (viewData[CONTENT_QUERIES] = [])).push(queryList);
  if (firstTemplatePass) {
    const currentDirectiveIndex = directives !.length - 1;
    const tViewContentQueries = tView.contentQueries || (tView.contentQueries = []);
    const lastSavedDirectiveIndex =
        tView.contentQueries.length ? tView.contentQueries[tView.contentQueries.length - 2] : -1;
    if (currentDirectiveIndex !== lastSavedDirectiveIndex) {
      tViewContentQueries.push(currentDirectiveIndex, savedContentQueriesLength - 1);
    }
  }
}

export function assertPreviousIsParent() {
  assertEqual(isParent, true, 'previousOrParentNode should be a parent');
}

function assertHasParent() {
  assertDefined(getParentLNode(previousOrParentNode), 'previousOrParentNode should have a parent');
}

function assertDataInRange(index: number, arr?: any[]) {
  if (arr == null) arr = viewData;
  assertDataInRangeInternal(index, arr || viewData);
}

function assertDataNext(index: number, arr?: any[]) {
  if (arr == null) arr = viewData;
  assertEqual(
      arr.length, index, `index ${index} expected to be at the end of arr (length ${arr.length})`);
}

/**
 * On the first template pass, the reserved slots should be set `NO_CHANGE`.
 *
 * If not, they might not have been actually reserved.
 */
export function assertReservedSlotInitialized(slotOffset: number, numSlots: number) {
  if (firstTemplatePass) {
    const startIndex = tView.bindingStartIndex - slotOffset;
    for (let i = 0; i < numSlots; i++) {
      assertEqual(
          viewData[startIndex + i], NO_CHANGE,
          'The reserved slots should be set to `NO_CHANGE` on first template pass');
    }
  }
}

export function _getComponentHostLElementNode<T>(component: T): LElementNode {
  ngDevMode && assertDefined(component, 'expecting component got null');
  const lElementNode = (component as any)[NG_HOST_SYMBOL] as LElementNode;
  ngDevMode && assertDefined(component, 'object is not a component');
  return lElementNode;
}

export const CLEAN_PROMISE = _CLEAN_PROMISE;
export const ROOT_DIRECTIVE_INDICES = _ROOT_DIRECTIVE_INDICES;
