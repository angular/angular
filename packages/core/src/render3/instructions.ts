/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './ng_dev_mode';
import {resolveForwardRef} from '../di/forward_ref';
import {InjectionToken} from '../di/injection_token';
import {Injector} from '../di/injector';
import {InjectFlags} from '../di/injector_compatibility';
import {QueryList} from '../linker';
import {Sanitizer} from '../sanitization/security';
import {StyleSanitizeFn} from '../sanitization/style_sanitizer';
import {Type} from '../type';
import {noop} from '../util/noop';
import {assertDefined, assertEqual, assertLessThan, assertNotEqual} from './assert';
import {attachPatchData, getComponentViewByInstance} from './context_discovery';
import {diPublicInInjector, getNodeInjectable, getOrCreateInjectable, getOrCreateNodeInjectorForNode, injectAttributeImpl} from './di';
import {throwErrorIfNoChangesMode, throwMultipleComponentError} from './errors';
import {executeHooks, executeInitHooks, queueInitHooks, queueLifecycleHooks} from './hooks';
import {ACTIVE_INDEX, LContainer, VIEWS} from './interfaces/container';
import {ComponentDef, ComponentQuery, ComponentTemplate, DirectiveDef, DirectiveDefListOrFactory, InitialStylingFlags, PipeDefListOrFactory, RenderFlags} from './interfaces/definition';
import {INJECTOR_SIZE, NodeInjectorFactory} from './interfaces/injector';
import {AttributeMarker, InitialInputData, InitialInputs, LocalRefExtractor, PropertyAliasValue, PropertyAliases, TAttributes, TContainerNode, TElementContainerNode, TElementNode, TIcuContainerNode, TNode, TNodeFlags, TNodeProviderIndexes, TNodeType, TProjectionNode, TViewNode} from './interfaces/node';
import {PlayerFactory} from './interfaces/player';
import {CssSelectorList, NG_PROJECT_AS_ATTR_NAME} from './interfaces/projection';
import {LQueries} from './interfaces/query';
import {ProceduralRenderer3, RComment, RElement, RNode, RText, Renderer3, RendererFactory3, isProceduralRenderer} from './interfaces/renderer';
import {SanitizerFn} from './interfaces/sanitization';
import {StylingIndex} from './interfaces/styling';
import {BINDING_INDEX, CLEANUP, CONTAINER_INDEX, CONTENT_QUERIES, CONTEXT, DECLARATION_VIEW, FLAGS, HEADER_OFFSET, HOST, HOST_NODE, INJECTOR, LViewData, LViewFlags, NEXT, OpaqueViewState, PARENT, QUERIES, RENDERER, RootContext, RootContextFlags, SANITIZER, TAIL, TVIEW, TView} from './interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from './node_assert';
import {appendChild, appendProjectedNode, createTextNode, findComponentView, getLViewChild, getRenderParent, insertView, removeView} from './node_manipulation';
import {isNodeMatchingSelectorList, matchingSelectorIndex} from './node_selector_matcher';
import {assertDataInRange, assertHasParent, assertPreviousIsParent, decreaseElementDepthCount, enterView, getBindingsEnabled, getCheckNoChangesMode, getCleanup, getContextViewData, getCreationMode, getCurrentQueries, getCurrentSanitizer, getElementDepthCount, getFirstTemplatePass, getIsParent, getPreviousOrParentTNode, getRenderer, getRendererFactory, getTView, getTViewCleanup, getViewData, increaseElementDepthCount, leaveView, nextContextImpl, resetComponentState, setBindingRoot, setCheckNoChangesMode, setCurrentQueries, setFirstTemplatePass, setIsParent, setPreviousOrParentTNode, setRenderer, setRendererFactory} from './state';
import {createStylingContextTemplate, renderStyleAndClassBindings, updateClassProp as updateElementClassProp, updateStyleProp as updateElementStyleProp, updateStylingMap} from './styling/class_and_style_bindings';
import {BoundPlayerFactory} from './styling/player_factory';
import {getStylingContext} from './styling/util';
import {NO_CHANGE} from './tokens';
import {getComponentViewByIndex, getNativeByIndex, getNativeByTNode, getRootContext, getRootView, getTNode, isComponent, isComponentDef, isDifferent, loadInternal, readPatchedLViewData, stringify} from './util';

/**
 * A permanent marker promise which signifies that the current CD tree is
 * clean.
 */
const _CLEAN_PROMISE = Promise.resolve(null);

const enum BindingDirection {
  Input,
  Output,
}

/**
 * Refreshes the view, executing the following steps in that order:
 * triggers init hooks, refreshes dynamic embedded views, triggers content hooks, sets host
 * bindings, refreshes child components.
 * Note: view hooks are triggered later when leaving the view.
 */
export function refreshDescendantViews(viewData: LViewData, rf: RenderFlags | null) {
  const tView = getTView();
  const parentFirstTemplatePass = getFirstTemplatePass();

  // This needs to be set before children are processed to support recursive components
  tView.firstTemplatePass = false;
  setFirstTemplatePass(false);

  // Dynamically created views must run first only in creation mode. If this is a
  // creation-only pass, we should not call lifecycle hooks or evaluate bindings.
  // This will be done in the update-only pass.
  if (rf !== RenderFlags.Create) {
    const creationMode = getCreationMode();
    const checkNoChangesMode = getCheckNoChangesMode();

    if (!checkNoChangesMode) {
      executeInitHooks(viewData, tView, creationMode);
    }

    refreshDynamicEmbeddedViews(viewData);

    // Content query results must be refreshed before content hooks are called.
    refreshContentQueries(tView);

    if (!checkNoChangesMode) {
      executeHooks(viewData, tView.contentHooks, tView.contentCheckHooks, creationMode);
    }

    setHostBindings(tView, viewData);
  }

  refreshChildComponents(tView.components, parentFirstTemplatePass, rf);
}


/** Sets the host bindings for the current view. */
export function setHostBindings(tView: TView, viewData: LViewData): void {
  if (tView.expandoInstructions) {
    let bindingRootIndex = viewData[BINDING_INDEX] = tView.expandoStartIndex;
    setBindingRoot(bindingRootIndex);
    let currentDirectiveIndex = -1;
    let currentElementIndex = -1;
    for (let i = 0; i < tView.expandoInstructions.length; i++) {
      const instruction = tView.expandoInstructions[i];
      if (typeof instruction === 'number') {
        if (instruction <= 0) {
          // Negative numbers mean that we are starting new EXPANDO block and need to update
          // the current element and directive index.
          currentElementIndex = -instruction;
          // Injector block and providers are taken into account.
          const providerCount = (tView.expandoInstructions[++i] as number);
          bindingRootIndex += INJECTOR_SIZE + providerCount;

          currentDirectiveIndex = bindingRootIndex;
        } else {
          // This is either the injector size (so the binding root can skip over directives
          // and get to the first set of host bindings on this node) or the host var count
          // (to get to the next set of host bindings on this node).
          bindingRootIndex += instruction;
        }
        setBindingRoot(bindingRootIndex);
      } else {
        // If it's not a number, it's a host binding function that needs to be executed.
        viewData[BINDING_INDEX] = bindingRootIndex;
        // We must subtract the header offset because the load() instruction
        // expects a raw, unadjusted index.
        instruction(currentDirectiveIndex - HEADER_OFFSET, currentElementIndex);
        currentDirectiveIndex++;
      }
    }
  }
}

/** Refreshes content queries for all directives in the given view. */
function refreshContentQueries(tView: TView): void {
  if (tView.contentQueries != null) {
    for (let i = 0; i < tView.contentQueries.length; i += 2) {
      const directiveDefIdx = tView.contentQueries[i];
      const directiveDef = tView.data[directiveDefIdx] as DirectiveDef<any>;

      directiveDef.contentQueriesRefresh !(
          directiveDefIdx - HEADER_OFFSET, tView.contentQueries[i + 1]);
    }
  }
}

/** Refreshes child components in the current view. */
function refreshChildComponents(
    components: number[] | null, parentFirstTemplatePass: boolean, rf: RenderFlags | null): void {
  if (components != null) {
    for (let i = 0; i < components.length; i++) {
      componentRefresh(components[i], parentFirstTemplatePass, rf);
    }
  }
}

export function createLViewData<T>(
    renderer: Renderer3, tView: TView, context: T | null, flags: LViewFlags,
    sanitizer?: Sanitizer | null, injector?: Injector | null): LViewData {
  const viewData = getViewData();
  const instance = tView.blueprint.slice() as LViewData;
  instance[FLAGS] = flags | LViewFlags.CreationMode | LViewFlags.Attached | LViewFlags.RunInit;
  instance[PARENT] = instance[DECLARATION_VIEW] = viewData;
  instance[CONTEXT] = context;
  instance[INJECTOR as any] =
      injector === undefined ? (viewData ? viewData[INJECTOR] : null) : injector;
  instance[RENDERER] = renderer;
  instance[SANITIZER] = sanitizer || null;
  return instance;
}

/**
 * Create and stores the TNode, and hooks it up to the tree.
 *
 * @param index The index at which the TNode should be saved (null if view, since they are not
 * saved).
 * @param type The type of TNode to create
 * @param native The native element for this node, if applicable
 * @param name The tag name of the associated native element, if applicable
 * @param attrs Any attrs for the native element, if applicable
 */
export function createNodeAtIndex(
    index: number, type: TNodeType.Element, native: RElement | RText | null, name: string | null,
    attrs: TAttributes | null): TElementNode;
export function createNodeAtIndex(
    index: number, type: TNodeType.Container, native: RComment, name: string | null,
    attrs: TAttributes | null): TContainerNode;
export function createNodeAtIndex(
    index: number, type: TNodeType.Projection, native: null, name: null,
    attrs: TAttributes | null): TProjectionNode;
export function createNodeAtIndex(
    index: number, type: TNodeType.ElementContainer, native: RComment, name: null,
    attrs: TAttributes | null): TElementContainerNode;
export function createNodeAtIndex(
    index: number, type: TNodeType.IcuContainer, native: RComment, name: null,
    attrs: TAttributes | null): TElementContainerNode;
export function createNodeAtIndex(
    index: number, type: TNodeType, native: RText | RElement | RComment | null, name: string | null,
    attrs: TAttributes | null): TElementNode&TContainerNode&TElementContainerNode&TProjectionNode&
    TIcuContainerNode {
  const viewData = getViewData();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;
  ngDevMode &&
      assertLessThan(adjustedIndex, viewData.length, `Slot should have been initialized with null`);
  viewData[adjustedIndex] = native;

  let tNode = tView.data[adjustedIndex] as TNode;
  if (tNode == null) {
    const previousOrParentTNode = getPreviousOrParentTNode();
    const isParent = getIsParent();
    tNode = tView.data[adjustedIndex] =
        createTNode(viewData, type, adjustedIndex, name, attrs, null);

    // Now link ourselves into the tree.
    if (previousOrParentTNode) {
      if (isParent && previousOrParentTNode.child == null &&
          (tNode.parent !== null || previousOrParentTNode.type === TNodeType.View)) {
        // We are in the same view, which means we are adding content node to the parent view.
        previousOrParentTNode.child = tNode;
      } else if (!isParent) {
        previousOrParentTNode.next = tNode;
      }
    }
  }

  if (tView.firstChild == null && type === TNodeType.Element) {
    tView.firstChild = tNode;
  }

  setPreviousOrParentTNode(tNode);
  setIsParent(true);
  return tNode as TElementNode & TViewNode & TContainerNode & TElementContainerNode &
      TProjectionNode & TIcuContainerNode;
}

export function createViewNode(index: number, view: LViewData) {
  // View nodes are not stored in data because they can be added / removed at runtime (which
  // would cause indices to change). Their TNodes are instead stored in tView.node.
  if (view[TVIEW].node == null) {
    view[TVIEW].node = createTNode(view, TNodeType.View, index, null, null, null) as TViewNode;
  }

  setIsParent(true);
  const tNode = view[TVIEW].node as TViewNode;
  setPreviousOrParentTNode(tNode);
  return view[HOST_NODE] = tNode;
}


/**
 * When elements are created dynamically after a view blueprint is created (e.g. through
 * i18nApply() or ComponentFactory.create), we need to adjust the blueprint for future
 * template passes.
 */
export function allocExpando(view: LViewData) {
  const tView = view[TVIEW];
  if (tView.firstTemplatePass) {
    tView.expandoStartIndex++;
    tView.blueprint.push(null);
    tView.data.push(null);
    view.push(null);
  }
}


//////////////////////////
//// Render
//////////////////////////

/**
 *
 * @param hostNode Existing node to render into.
 * @param templateFn Template function with the instructions.
 * @param consts The number of nodes, local refs, and pipes in this template
 * @param context to pass into the template.
 * @param providedRendererFactory renderer factory to use
 * @param host The host element node to use
 * @param directives Directive defs that should be used for matching
 * @param pipes Pipe defs that should be used for matching
 */
export function renderTemplate<T>(
    hostNode: RElement, templateFn: ComponentTemplate<T>, consts: number, vars: number, context: T,
    providedRendererFactory: RendererFactory3, hostView: LViewData | null,
    directives?: DirectiveDefListOrFactory | null, pipes?: PipeDefListOrFactory | null,
    sanitizer?: Sanitizer | null): LViewData {
  if (hostView == null) {
    resetComponentState();
    setRendererFactory(providedRendererFactory);
    const renderer = providedRendererFactory.createRenderer(null, null);
    setRenderer(renderer);

    // We need to create a root view so it's possible to look up the host element through its index
    enterView(
        createLViewData(
            renderer, createTView(-1, null, 1, 0, null, null, null), {},
            LViewFlags.CheckAlways | LViewFlags.IsRoot),
        null);

    const componentTView =
        getOrCreateTView(templateFn, consts, vars, directives || null, pipes || null, null);
    hostView =
        createLViewData(renderer, componentTView, context, LViewFlags.CheckAlways, sanitizer);
    hostView[HOST_NODE] = createNodeAtIndex(0, TNodeType.Element, hostNode, null, null);
  }
  renderComponentOrTemplate(hostView, context, null, templateFn);

  return hostView;
}

/**
 * Used for creating the LViewNode of a dynamic embedded view,
 * either through ViewContainerRef.createEmbeddedView() or TemplateRef.createEmbeddedView().
 * Such lViewNode will then be renderer with renderEmbeddedTemplate() (see below).
 */
export function createEmbeddedViewAndNode<T>(
    tView: TView, context: T, declarationView: LViewData, renderer: Renderer3,
    queries: LQueries | null, injectorIndex: number): LViewData {
  const _isParent = getIsParent();
  const _previousOrParentTNode = getPreviousOrParentTNode();
  setIsParent(true);
  setPreviousOrParentTNode(null !);

  const lView =
      createLViewData(renderer, tView, context, LViewFlags.CheckAlways, getCurrentSanitizer());
  lView[DECLARATION_VIEW] = declarationView;

  if (queries) {
    lView[QUERIES] = queries.createView();
  }
  createViewNode(-1, lView);

  if (tView.firstTemplatePass) {
    tView.node !.injectorIndex = injectorIndex;
  }

  setIsParent(_isParent);
  setPreviousOrParentTNode(_previousOrParentTNode);
  return lView;
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
    viewToRender: LViewData, tView: TView, context: T, rf: RenderFlags) {
  const _isParent = getIsParent();
  const _previousOrParentTNode = getPreviousOrParentTNode();
  setIsParent(true);
  setPreviousOrParentTNode(null !);
  let oldView: LViewData;
  if (viewToRender[FLAGS] & LViewFlags.IsRoot) {
    // This is a root view inside the view tree
    tickRootContext(getRootContext(viewToRender));
  } else {
    try {
      setIsParent(true);
      setPreviousOrParentTNode(null !);

      oldView = enterView(viewToRender, viewToRender[HOST_NODE]);
      namespaceHTML();
      tView.template !(rf, context);
      if (rf & RenderFlags.Update) {
        refreshDescendantViews(viewToRender, null);
      } else {
        // This must be set to false immediately after the first creation run because in an
        // ngFor loop, all the views will be created together before update mode runs and turns
        // off firstTemplatePass. If we don't set it here, instances will perform directive
        // matching, etc again and again.
        viewToRender[TVIEW].firstTemplatePass = false;
        setFirstTemplatePass(false);
      }
    } finally {
      // renderEmbeddedTemplate() is called twice, once for creation only and then once for
      // update. When for creation only, leaveView() must not trigger view hooks, nor clean flags.
      const isCreationOnly = (rf & RenderFlags.Create) === RenderFlags.Create;
      leaveView(oldView !, isCreationOnly);
      setIsParent(_isParent);
      setPreviousOrParentTNode(_previousOrParentTNode);
    }
  }
}

/**
 * Retrieves a context at the level specified and saves it as the global, contextViewData.
 * Will get the next level up if level is not specified.
 *
 * This is used to save contexts of parent views so they can be bound in embedded views, or
 * in conjunction with reference() to bind a ref from a parent view.
 *
 * @param level The relative level of the view from which to grab context compared to contextVewData
 * @returns context
 */
export function nextContext<T = any>(level: number = 1): T {
  return nextContextImpl(level);
}

function renderComponentOrTemplate<T>(
    hostView: LViewData, componentOrContext: T, rf: RenderFlags | null,
    templateFn?: ComponentTemplate<T>) {
  const rendererFactory = getRendererFactory();
  const oldView = enterView(hostView, hostView[HOST_NODE]);
  try {
    if (rendererFactory.begin) {
      rendererFactory.begin();
    }
    if (templateFn) {
      namespaceHTML();
      templateFn(rf || getRenderFlags(hostView), componentOrContext !);
    }
    refreshDescendantViews(hostView, rf);
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
 * Creates a logical container for other nodes (<ng-container>) backed by a comment node in the DOM.
 * The instruction must later be followed by `elementContainerEnd()` call.
 *
 * @param index Index of the element in the LViewData array
 * @param attrs Set of attributes to be used when matching directives.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Even if this instruction accepts a set of attributes no actual attribute values are propagated to
 * the DOM (as a comment node can't have attributes). Attributes are here only for directive
 * matching purposes and setting initial inputs of directives.
 */
export function elementContainerStart(
    index: number, attrs?: TAttributes | null, localRefs?: string[] | null): void {
  const viewData = getViewData();
  const tView = getTView();
  const renderer = getRenderer();
  ngDevMode && assertEqual(
                   viewData[BINDING_INDEX], tView.bindingStartIndex,
                   'element containers should be created before any bindings');

  ngDevMode && ngDevMode.rendererCreateComment++;
  const native = renderer.createComment(ngDevMode ? 'ng-container' : '');

  ngDevMode && assertDataInRange(index - 1);
  const tNode = createNodeAtIndex(index, TNodeType.ElementContainer, native, null, attrs || null);

  appendChild(native, tNode, viewData);
  createDirectivesAndLocals(tView, viewData, localRefs);
}

/** Mark the end of the <ng-container>. */
export function elementContainerEnd(): void {
  let previousOrParentTNode = getPreviousOrParentTNode();
  const tView = getTView();
  if (getIsParent()) {
    setIsParent(false);
  } else {
    ngDevMode && assertHasParent();
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode);
  }

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.ElementContainer);
  const currentQueries = getCurrentQueries();
  if (currentQueries) {
    setCurrentQueries(currentQueries.addNode(previousOrParentTNode as TElementContainerNode));
  }

  queueLifecycleHooks(previousOrParentTNode.flags, tView);
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
  const viewData = getViewData();
  const tView = getTView();
  ngDevMode && assertEqual(
                   viewData[BINDING_INDEX], tView.bindingStartIndex,
                   'elements should be created before any bindings ');

  ngDevMode && ngDevMode.rendererCreateElement++;

  const native = elementCreate(name);

  ngDevMode && assertDataInRange(index - 1);

  const tNode = createNodeAtIndex(index, TNodeType.Element, native !, name, attrs || null);

  if (attrs) {
    setUpAttributes(native, attrs);
  }

  appendChild(native, tNode, viewData);
  createDirectivesAndLocals(tView, viewData, localRefs);

  // any immediate children of a component or template container must be pre-emptively
  // monkey-patched with the component view data so that the element can be inspected
  // later on using any element discovery utility methods (see `element_discovery.ts`)
  if (getElementDepthCount() === 0) {
    attachPatchData(native, viewData);
  }
  increaseElementDepthCount();
}

/**
 * Creates a native element from a tag name, using a renderer.
 * @param name the tag name
 * @param overriddenRenderer Optional A renderer to override the default one
 * @returns the element created
 */
export function elementCreate(name: string, overriddenRenderer?: Renderer3): RElement {
  let native: RElement;
  const rendererToUse = overriddenRenderer || getRenderer();

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
 * @param localRefs Local refs of the node in question
 * @param localRefExtractor mapping function that extracts local ref value from TNode
 */
function createDirectivesAndLocals(
    tView: TView, viewData: LViewData, localRefs: string[] | null | undefined,
    localRefExtractor: LocalRefExtractor = getNativeByTNode) {
  if (!getBindingsEnabled()) return;
  const previousOrParentTNode = getPreviousOrParentTNode();
  if (getFirstTemplatePass()) {
    ngDevMode && ngDevMode.firstTemplatePass++;

    resolveDirectives(
        tView, viewData, findDirectiveMatches(tView, viewData, previousOrParentTNode),
        previousOrParentTNode, localRefs || null);
  }
  instantiateAllDirectives(tView, viewData, previousOrParentTNode);
  saveResolvedLocalsInData(viewData, previousOrParentTNode, localRefExtractor);
}

/**
 * Takes a list of local names and indices and pushes the resolved local variable values
 * to LViewData in the same order as they are loaded in the template with load().
 */
function saveResolvedLocalsInData(
    viewData: LViewData, tNode: TNode, localRefExtractor: LocalRefExtractor): void {
  const localNames = tNode.localNames;
  if (localNames) {
    let localIndex = tNode.index + 1;
    for (let i = 0; i < localNames.length; i += 2) {
      const index = localNames[i + 1] as number;
      const value = index === -1 ?
          localRefExtractor(
              tNode as TElementNode | TContainerNode | TElementContainerNode, viewData) :
          viewData[index];
      viewData[localIndex++] = value;
    }
  }
}

/**
 * Gets TView from a template function or creates a new TView
 * if it doesn't already exist.
 *
 * @param templateFn The template from which to get static data
 * @param consts The number of nodes, local refs, and pipes in this view
 * @param vars The number of bindings and pure function bindings in this view
 * @param directives Directive defs that should be saved on TView
 * @param pipes Pipe defs that should be saved on TView
 * @returns TView
 */
export function getOrCreateTView(
    templateFn: ComponentTemplate<any>, consts: number, vars: number,
    directives: DirectiveDefListOrFactory | null, pipes: PipeDefListOrFactory | null,
    viewQuery: ComponentQuery<any>| null): TView {
  // TODO(misko): reading `ngPrivateData` here is problematic for two reasons
  // 1. It is a megamorphic call on each invocation.
  // 2. For nested embedded views (ngFor inside ngFor) the template instance is per
  //    outer template invocation, which means that no such property will exist
  // Correct solution is to only put `ngPrivateData` on the Component template
  // and not on embedded templates.

  return templateFn.ngPrivateData ||
      (templateFn.ngPrivateData =
           createTView(-1, templateFn, consts, vars, directives, pipes, viewQuery) as never);
}

/**
 * Creates a TView instance
 *
 * @param viewIndex The viewBlockId for inline views, or -1 if it's a component/dynamic
 * @param templateFn Template function
 * @param consts The number of nodes, local refs, and pipes in this template
 * @param directives Registry of directives for this view
 * @param pipes Registry of pipes for this view
 */
export function createTView(
    viewIndex: number, templateFn: ComponentTemplate<any>| null, consts: number, vars: number,
    directives: DirectiveDefListOrFactory | null, pipes: PipeDefListOrFactory | null,
    viewQuery: ComponentQuery<any>| null): TView {
  ngDevMode && ngDevMode.tView++;
  const bindingStartIndex = HEADER_OFFSET + consts;
  // This length does not yet contain host bindings from child directives because at this point,
  // we don't know which directives are active on this template. As soon as a directive is matched
  // that has a host binding, we will update the blueprint with that def's hostVars count.
  const initialViewLength = bindingStartIndex + vars;
  const blueprint = createViewBlueprint(bindingStartIndex, initialViewLength);
  return blueprint[TVIEW as any] = {
    id: viewIndex,
    blueprint: blueprint,
    template: templateFn,
    viewQuery: viewQuery,
    node: null !,
    data: blueprint.slice(),  // Fill in to match HEADER_OFFSET in LViewData
    childIndex: -1,           // Children set in addToViewTree(), if any
    bindingStartIndex: bindingStartIndex,
    expandoStartIndex: initialViewLength,
    expandoInstructions: null,
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
    contentQueries: null,
    components: null,
    directiveRegistry: typeof directives === 'function' ? directives() : directives,
    pipeRegistry: typeof pipes === 'function' ? pipes() : pipes,
    firstChild: null,
  };
}

function createViewBlueprint(bindingStartIndex: number, initialViewLength: number): LViewData {
  const blueprint = new Array(initialViewLength)
                        .fill(null, 0, bindingStartIndex)
                        .fill(NO_CHANGE, bindingStartIndex) as LViewData;
  blueprint[CONTAINER_INDEX] = -1;
  blueprint[BINDING_INDEX] = bindingStartIndex;
  return blueprint;
}

function setUpAttributes(native: RElement, attrs: TAttributes): void {
  const renderer = getRenderer();
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
  setRendererFactory(factory);
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
  const viewData = getViewData();
  const tNode = getPreviousOrParentTNode();
  ngDevMode && assertNodeOfPossibleTypes(
                   tNode, TNodeType.Element, TNodeType.Container, TNodeType.ElementContainer);

  // add native event listener - applicable to elements only
  if (tNode.type === TNodeType.Element) {
    const native = getNativeByTNode(tNode, viewData) as RElement;
    ngDevMode && ngDevMode.rendererAddEventListener++;
    const renderer = getRenderer();

    // In order to match current behavior, native DOM event listeners must be added for all
    // events (including outputs).
    if (isProceduralRenderer(renderer)) {
      const cleanupFn = renderer.listen(native, eventName, listenerFn);
      storeCleanupFn(viewData, cleanupFn);
    } else {
      const wrappedListener = wrapListenerWithPreventDefault(listenerFn);
      native.addEventListener(eventName, wrappedListener, useCapture);
      const cleanupInstances = getCleanup(viewData);
      cleanupInstances.push(wrappedListener);
      if (getFirstTemplatePass()) {
        getTViewCleanup(viewData).push(
            eventName, tNode.index, cleanupInstances !.length - 1, useCapture);
      }
    }
  }

  // subscribe to directive outputs
  if (tNode.outputs === undefined) {
    // if we create TNode here, inputs must be undefined so we know they still need to be
    // checked
    tNode.outputs = generatePropertyAliases(tNode.flags, BindingDirection.Output);
  }

  const outputs = tNode.outputs;
  let outputData: PropertyAliasValue|undefined;
  if (outputs && (outputData = outputs[eventName])) {
    createOutput(viewData, outputData, listenerFn);
  }
}

/**
 * Iterates through the outputs associated with a particular event name and subscribes to
 * each output.
 */
function createOutput(viewData: LViewData, outputs: PropertyAliasValue, listener: Function): void {
  for (let i = 0; i < outputs.length; i += 2) {
    ngDevMode && assertDataInRange(outputs[i] as number, viewData);
    const subscription = viewData[outputs[i] as number][outputs[i + 1]].subscribe(listener);
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
  if (!view) view = getViewData();
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
  let previousOrParentTNode = getPreviousOrParentTNode();
  if (getIsParent()) {
    setIsParent(false);
  } else {
    ngDevMode && assertHasParent();
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode);
  }
  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Element);
  const currentQueries = getCurrentQueries();
  if (currentQueries) {
    setCurrentQueries(currentQueries.addNode(previousOrParentTNode as TElementNode));
  }

  queueLifecycleHooks(previousOrParentTNode.flags, getTView());
  decreaseElementDepthCount();
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
    index: number, name: string, value: any, sanitizer?: SanitizerFn | null): void {
  if (value !== NO_CHANGE) {
    const viewData = getViewData();
    const renderer = getRenderer();
    const element = getNativeByIndex(index, viewData);
    if (value == null) {
      ngDevMode && ngDevMode.rendererRemoveAttribute++;
      isProceduralRenderer(renderer) ? renderer.removeAttribute(element, name) :
                                       element.removeAttribute(name);
    } else {
      ngDevMode && ngDevMode.rendererSetAttribute++;
      const strValue = sanitizer == null ? stringify(value) : sanitizer(value);
      isProceduralRenderer(renderer) ? renderer.setAttribute(element, name, strValue) :
                                       element.setAttribute(name, strValue);
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
    index: number, propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null): void {
  if (value === NO_CHANGE) return;
  const viewData = getViewData();
  const element = getNativeByIndex(index, viewData) as RElement | RComment;
  const tNode = getTNode(index, viewData);
  const inputData = initializeTNodeInputs(tNode);
  let dataValue: PropertyAliasValue|undefined;
  if (inputData && (dataValue = inputData[propName])) {
    setInputsForProperty(viewData, dataValue, value);
    if (isComponent(tNode)) markDirtyIfOnPush(viewData, index + HEADER_OFFSET);
  } else if (tNode.type === TNodeType.Element) {
    const renderer = getRenderer();
    // It is assumed that the sanitizer is only added when the compiler determines that the property
    // is risky, so sanitization can be done without further checks.
    value = sanitizer != null ? (sanitizer(value) as any) : value;
    ngDevMode && ngDevMode.rendererSetProperty++;
    isProceduralRenderer(renderer) ?
        renderer.setProperty(element as RElement, propName, value) :
        ((element as RElement).setProperty ? (element as any).setProperty(propName, value) :
                                             (element as any)[propName] = value);
  }
}

/**
 * Constructs a TNode object from the arguments.
 *
 * @param type The type of the node
 * @param adjustedIndex The index of the TNode in TView.data, adjusted for HEADER_OFFSET
 * @param tagName The tag name of the node
 * @param attrs The attributes defined on this node
 * @param tViews Any TViews attached to this node
 * @returns the TNode object
 */
export function createTNode(
    viewData: LViewData, type: TNodeType, adjustedIndex: number, tagName: string | null,
    attrs: TAttributes | null, tViews: TView[] | null): TNode {
  const previousOrParentTNode = getPreviousOrParentTNode();
  ngDevMode && ngDevMode.tNode++;
  const parent =
      getIsParent() ? previousOrParentTNode : previousOrParentTNode && previousOrParentTNode.parent;

  // Parents cannot cross component boundaries because components will be used in multiple places,
  // so it's only set if the view is the same.
  const parentInSameView = parent && viewData && parent !== viewData[HOST_NODE];
  const tParent = parentInSameView ? parent as TElementNode | TContainerNode : null;

  return {
    type: type,
    index: adjustedIndex,
    injectorIndex: tParent ? tParent.injectorIndex : -1,
    flags: 0,
    providerIndexes: 0,
    tagName: tagName,
    attrs: attrs,
    localNames: null,
    initialInputs: undefined,
    inputs: undefined,
    outputs: undefined,
    tViews: tViews,
    next: null,
    child: null,
    parent: tParent,
    detached: null,
    stylingTemplate: null,
    projection: null
  };
}

/**
 * Given a list of directive indices and minified input names, sets the
 * input properties on the corresponding directives.
 */
function setInputsForProperty(viewData: LViewData, inputs: PropertyAliasValue, value: any): void {
  for (let i = 0; i < inputs.length; i += 2) {
    ngDevMode && assertDataInRange(inputs[i] as number, viewData);
    viewData[inputs[i] as number][inputs[i + 1]] = value;
  }
}

/**
 * Consolidates all inputs or outputs of all directives on this logical node.
 *
 * @param number tNodeFlags node flags
 * @param Direction direction whether to consider inputs or outputs
 * @returns PropertyAliases|null aggregate of all properties if any, `null` otherwise
 */
function generatePropertyAliases(
    tNodeFlags: TNodeFlags, direction: BindingDirection): PropertyAliases|null {
  const tView = getTView();
  const count = tNodeFlags & TNodeFlags.DirectiveCountMask;
  let propStore: PropertyAliases|null = null;

  if (count > 0) {
    const start = tNodeFlags >> TNodeFlags.DirectiveStartingIndexShift;
    const end = start + count;
    const isInput = direction === BindingDirection.Input;
    const defs = tView.data;

    for (let i = start; i < end; i++) {
      const directiveDef = defs[i] as DirectiveDef<any>;
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
export function elementClassProp(
    index: number, stylingIndex: number, value: boolean | PlayerFactory): void {
  const val =
      (value instanceof BoundPlayerFactory) ? (value as BoundPlayerFactory<boolean>) : (!!value);
  updateElementClassProp(getStylingContext(index, getViewData()), stylingIndex, val);
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
export function elementStyling(
    classDeclarations?: (string | boolean | InitialStylingFlags)[] | null,
    styleDeclarations?: (string | boolean | InitialStylingFlags)[] | null,
    styleSanitizer?: StyleSanitizeFn | null): void {
  const tNode = getPreviousOrParentTNode();
  const inputData = initializeTNodeInputs(tNode);

  if (!tNode.stylingTemplate) {
    const hasClassInput = inputData && inputData.hasOwnProperty('class') ? true : false;
    if (hasClassInput) {
      tNode.flags |= TNodeFlags.hasClassInput;
    }

    // initialize the styling template.
    tNode.stylingTemplate = createStylingContextTemplate(
        classDeclarations, styleDeclarations, styleSanitizer, hasClassInput);
  }

  if (styleDeclarations && styleDeclarations.length ||
      classDeclarations && classDeclarations.length) {
    const index = tNode.index - HEADER_OFFSET;
    if (delegateToClassInput(tNode)) {
      const stylingContext = getStylingContext(index, getViewData());
      const initialClasses = stylingContext[StylingIndex.PreviousOrCachedMultiClassValue] as string;
      setInputsForProperty(getViewData(), tNode.inputs !['class'] !, initialClasses);
    }
    elementStylingApply(index);
  }
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
export function elementStylingApply(index: number): void {
  const viewData = getViewData();
  const isFirstRender = (viewData[FLAGS] & LViewFlags.CreationMode) !== 0;
  const totalPlayersQueued = renderStyleAndClassBindings(
      getStylingContext(index, viewData), getRenderer(), viewData, isFirstRender);
  if (totalPlayersQueued > 0) {
    const rootContext = getRootContext(viewData);
    scheduleTick(rootContext, RootContextFlags.FlushPlayers);
  }
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
 * @param value New value to write (null to remove).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 */
export function elementStyleProp(
    index: number, styleIndex: number, value: string | number | String | PlayerFactory | null,
    suffix?: string): void {
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
  updateElementStyleProp(getStylingContext(index, getViewData()), styleIndex, valueToAdd);
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
    index: number, classes: {[key: string]: any} | string | NO_CHANGE | null,
    styles?: {[styleName: string]: any} | NO_CHANGE | null): void {
  const viewData = getViewData();
  const tNode = getTNode(index, viewData);
  const stylingContext = getStylingContext(index, viewData);
  if (delegateToClassInput(tNode) && classes !== NO_CHANGE) {
    const initialClasses = stylingContext[StylingIndex.PreviousOrCachedMultiClassValue] as string;
    const classInputVal =
        (initialClasses.length ? (initialClasses + ' ') : '') + (classes as string);
    setInputsForProperty(getViewData(), tNode.inputs !['class'] !, classInputVal);
  }
  updateStylingMap(stylingContext, classes, styles);
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
  const viewData = getViewData();
  ngDevMode && assertEqual(
                   viewData[BINDING_INDEX], getTView().bindingStartIndex,
                   'text nodes should be created before any bindings');
  ngDevMode && ngDevMode.rendererCreateTextNode++;
  const textNative = createTextNode(value, getRenderer());
  const tNode = createNodeAtIndex(index, TNodeType.Element, textNative, null, null);

  // Text nodes are self closing.
  setIsParent(false);
  appendChild(textNative, tNode, viewData);
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
    const element = getNativeByIndex(index, getViewData()) as any as RText;
    ngDevMode && assertDefined(element, 'native element should exist');
    ngDevMode && ngDevMode.rendererSetText++;
    const renderer = getRenderer();
    isProceduralRenderer(renderer) ? renderer.setValue(element, stringify(value)) :
                                     element.textContent = stringify(value);
  }
}

//////////////////////////
//// Directive
//////////////////////////

/**
 * Instantiate a root component.
 */
export function instantiateRootComponent<T>(
    tView: TView, viewData: LViewData, def: ComponentDef<T>): T {
  const rootTNode = getPreviousOrParentTNode();
  if (tView.firstTemplatePass) {
    if (def.providersResolver) def.providersResolver(def);
    generateExpandoInstructionBlock(tView, rootTNode, 1);
    baseResolveDirective(tView, viewData, def, def.factory);
  }
  const directive =
      getNodeInjectable(tView.data, viewData, viewData.length - 1, rootTNode as TElementNode);
  postProcessBaseDirective(viewData, rootTNode, directive, def as DirectiveDef<T>);
  return directive;
}

/**
 * Resolve the matched directives on a node.
 */
function resolveDirectives(
    tView: TView, viewData: LViewData, directives: DirectiveDef<any>[] | null, tNode: TNode,
    localRefs: string[] | null): void {
  // Please make sure to have explicit type for `exportsMap`. Inferred type triggers bug in tsickle.
  ngDevMode && assertEqual(getFirstTemplatePass(), true, 'should run on first template pass only');
  const exportsMap: ({[key: string]: number} | null) = localRefs ? {'': -1} : null;
  let totalHostVars = 0;
  if (directives) {
    initNodeFlags(tNode, tView.data.length, directives.length);
    // When the same token is provided by several directives on the same node, some rules apply in
    // the viewEngine:
    // - viewProviders have priority over providers
    // - the last directive in NgModule.declarations has priority over the previous one
    // So to match these rules, the order in which providers are added in the arrays is very
    // important.
    for (let i = 0; i < directives.length; i++) {
      const def = directives[i] as DirectiveDef<any>;
      if (def.providersResolver) def.providersResolver(def);
    }
    generateExpandoInstructionBlock(tView, tNode, directives.length);
    for (let i = 0; i < directives.length; i++) {
      const def = directives[i] as DirectiveDef<any>;

      const directiveDefIdx = tView.data.length;
      baseResolveDirective(tView, viewData, def, def.factory);

      totalHostVars += def.hostVars;
      saveNameToExportMap(tView.data !.length - 1, def, exportsMap);

      // Init hooks are queued now so ngOnInit is called in host components before
      // any projected components.
      queueInitHooks(directiveDefIdx, def.onInit, def.doCheck, tView);
    }
  }
  if (exportsMap) cacheMatchingLocalNames(tNode, localRefs, exportsMap);
  prefillHostVars(tView, viewData, totalHostVars);
}

/**
 * Instantiate all the directives that were previously resolved on the current node.
 */
function instantiateAllDirectives(tView: TView, viewData: LViewData, previousOrParentTNode: TNode) {
  const start = previousOrParentTNode.flags >> TNodeFlags.DirectiveStartingIndexShift;
  const end = start + previousOrParentTNode.flags & TNodeFlags.DirectiveCountMask;
  if (!getFirstTemplatePass() && start < end) {
    getOrCreateNodeInjectorForNode(
        previousOrParentTNode as TElementNode | TContainerNode | TElementContainerNode, viewData);
  }
  for (let i = start; i < end; i++) {
    const def = tView.data[i] as DirectiveDef<any>;
    if (isComponentDef(def)) {
      addComponentLogic(viewData, previousOrParentTNode, def as ComponentDef<any>);
    }
    const directive =
        getNodeInjectable(tView.data, viewData !, i, previousOrParentTNode as TElementNode);
    postProcessDirective(viewData, directive, def, i);
  }
}

/**
* Generates a new block in TView.expandoInstructions for this node.
*
* Each expando block starts with the element index (turned negative so we can distinguish
* it from the hostVar count) and the directive count. See more in VIEW_DATA.md.
*/
export function generateExpandoInstructionBlock(
    tView: TView, tNode: TNode, directiveCount: number): void {
  ngDevMode && assertEqual(
                   tView.firstTemplatePass, true,
                   'Expando block should only be generated on first template pass.');

  const elementIndex = -(tNode.index - HEADER_OFFSET);
  const providerStartIndex = tNode.providerIndexes & TNodeProviderIndexes.ProvidersStartIndexMask;
  const providerCount = tView.data.length - providerStartIndex;
  (tView.expandoInstructions || (tView.expandoInstructions = [
   ])).push(elementIndex, providerCount, directiveCount);
}

/**
* On the first template pass, we need to reserve space for host binding values
* after directives are matched (so all directives are saved, then bindings).
* Because we are updating the blueprint, we only need to do this once.
*/
export function prefillHostVars(tView: TView, viewData: LViewData, totalHostVars: number): void {
  for (let i = 0; i < totalHostVars; i++) {
    viewData.push(NO_CHANGE);
    tView.blueprint.push(NO_CHANGE);
    tView.data.push(null);
  }
}

/**
 * Process a directive on the current node after its creation.
 */
function postProcessDirective<T>(
    viewData: LViewData, directive: T, def: DirectiveDef<T>, directiveDefIdx: number): void {
  const previousOrParentTNode = getPreviousOrParentTNode();
  postProcessBaseDirective(viewData, previousOrParentTNode, directive, def);
  ngDevMode && assertDefined(previousOrParentTNode, 'previousOrParentTNode');
  if (previousOrParentTNode && previousOrParentTNode.attrs) {
    setInputsFromAttrs(directiveDefIdx, directive, def.inputs, previousOrParentTNode);
  }

  if (def.contentQueries) {
    def.contentQueries(directiveDefIdx);
  }

  if (isComponentDef(def)) {
    const componentView = getComponentViewByIndex(previousOrParentTNode.index, viewData);
    componentView[CONTEXT] = directive;
  }
}

/**
 * A lighter version of postProcessDirective() that is used for the root component.
 */
function postProcessBaseDirective<T>(
    viewData: LViewData, previousOrParentTNode: TNode, directive: T, def: DirectiveDef<T>): void {
  const native = getNativeByTNode(previousOrParentTNode, viewData);

  ngDevMode && assertEqual(
                   viewData[BINDING_INDEX], getTView().bindingStartIndex,
                   'directives should be created before any bindings');
  ngDevMode && assertPreviousIsParent();

  attachPatchData(directive, viewData);
  if (native) {
    attachPatchData(native, viewData);
  }

  // TODO(misko): setUpAttributes should be a feature for better treeshakability.
  if (def.attributes != null && previousOrParentTNode.type == TNodeType.Element) {
    setUpAttributes(native as RElement, def.attributes as string[]);
  }
}



/**
* Matches the current node against all available selectors.
* If a component is matched (at most one), it is returned in first position in the array.
*/
function findDirectiveMatches(tView: TView, viewData: LViewData, tNode: TNode): DirectiveDef<any>[]|
    null {
  ngDevMode && assertEqual(getFirstTemplatePass(), true, 'should run on first template pass only');
  const registry = tView.directiveRegistry;
  let matches: any[]|null = null;
  if (registry) {
    for (let i = 0; i < registry.length; i++) {
      const def = registry[i] as ComponentDef<any>| DirectiveDef<any>;
      if (isNodeMatchingSelectorList(tNode, def.selectors !)) {
        matches || (matches = []);
        diPublicInInjector(
            getOrCreateNodeInjectorForNode(
                getPreviousOrParentTNode() as TElementNode | TContainerNode | TElementContainerNode,
                viewData),
            viewData, def.type);

        if (isComponentDef(def)) {
          if (tNode.flags & TNodeFlags.isComponent) throwMultipleComponentError(tNode);
          tNode.flags = TNodeFlags.isComponent;

          // The component is always stored first with directives after.
          matches.unshift(def);
        } else {
          matches.push(def);
        }
      }
    }
  }
  return matches;
}

/** Stores index of component's host element so it will be queued for view refresh during CD. */
export function queueComponentIndexForCheck(previousOrParentTNode: TNode): void {
  ngDevMode &&
      assertEqual(getFirstTemplatePass(), true, 'Should only be called in first template pass.');
  const tView = getTView();
  (tView.components || (tView.components = [])).push(previousOrParentTNode.index);
}

/** Stores index of directive and host element so it will be queued for binding refresh during CD.
*/
function queueHostBindingForCheck(tView: TView, def: DirectiveDef<any>| ComponentDef<any>): void {
  ngDevMode &&
      assertEqual(getFirstTemplatePass(), true, 'Should only be called in first template pass.');
  tView.expandoInstructions !.push(def.hostBindings || noop);
  if (def.hostVars) tView.expandoInstructions !.push(def.hostVars);
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
    index: number, def: DirectiveDef<any>| ComponentDef<any>,
    exportsMap: {[key: string]: number} | null) {
  if (exportsMap) {
    if (def.exportAs) exportsMap[def.exportAs] = index;
    if ((def as ComponentDef<any>).template) exportsMap[''] = index;
  }
}

/**
 * Initializes the flags on the current node, setting all indices to the initial index,
 * the directive count to 0, and adding the isComponent flag.
 * @param index the initial index
 */
export function initNodeFlags(tNode: TNode, index: number, numberOfDirectives: number) {
  ngDevMode && assertEqual(getFirstTemplatePass(), true, 'expected firstTemplatePass to be true');
  const flags = tNode.flags;
  ngDevMode && assertEqual(
                   flags === 0 || flags === TNodeFlags.isComponent, true,
                   'expected node flags to not be initialized');

  ngDevMode && assertNotEqual(
                   numberOfDirectives, TNodeFlags.DirectiveCountMask,
                   'Reached the max number of directives');
  // When the first directive is created on a node, save the index
  tNode.flags = index << TNodeFlags.DirectiveStartingIndexShift | flags & TNodeFlags.isComponent |
      numberOfDirectives;
  tNode.providerIndexes = index;
}

function baseResolveDirective<T>(
    tView: TView, viewData: LViewData, def: DirectiveDef<T>,
    directiveFactory: (t: Type<T>| null) => any) {
  tView.data.push(def);
  const nodeInjectorFactory = new NodeInjectorFactory(directiveFactory, isComponentDef(def), null);
  tView.blueprint.push(nodeInjectorFactory);
  viewData.push(nodeInjectorFactory);

  queueHostBindingForCheck(tView, def);
}

function addComponentLogic<T>(
    viewData: LViewData, previousOrParentTNode: TNode, def: ComponentDef<T>): void {
  const native = getNativeByTNode(previousOrParentTNode, viewData);

  const tView = getOrCreateTView(
      def.template, def.consts, def.vars, def.directiveDefs, def.pipeDefs, def.viewQuery);

  // Only component views should be added to the view tree directly. Embedded views are
  // accessed through their containers because they may be removed / re-added later.
  const componentView = addToViewTree(
      viewData, previousOrParentTNode.index as number,
      createLViewData(
          getRendererFactory().createRenderer(native as RElement, def), tView, null,
          def.onPush ? LViewFlags.Dirty : LViewFlags.CheckAlways, getCurrentSanitizer()));

  componentView[HOST_NODE] = previousOrParentTNode as TElementNode;

  // Component view will always be created before any injected LContainers,
  // so this is a regular element, wrap it with the component view
  componentView[HOST] = viewData[previousOrParentTNode.index];
  viewData[previousOrParentTNode.index] = componentView;

  if (getFirstTemplatePass()) {
    queueComponentIndexForCheck(previousOrParentTNode);
  }
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
 * @param hostNative The host element for the LContainer
 * @param hostTNode The host TNode for the LContainer
 * @param currentView The parent view of the LContainer
 * @param native The native comment element
 * @param isForViewContainerRef Optional a flag indicating the ViewContainerRef case
 * @returns LContainer
 */
export function createLContainer(
    hostNative: RElement | RComment,
    hostTNode: TElementNode | TContainerNode | TElementContainerNode, currentView: LViewData,
    native: RComment, isForViewContainerRef?: boolean): LContainer {
  return [
    isForViewContainerRef ? -1 : 0,          // active index
    [],                                      // views
    currentView,                             // parent
    null,                                    // next
    null,                                    // queries
    hostNative,                              // host native
    native,                                  // native
    getRenderParent(hostTNode, currentView)  // renderParent
  ];
}

/**
 * Creates an LContainer for an ng-template (dynamically-inserted view), e.g.
 *
 * <ng-template #foo>
 *    <div></div>
 * </ng-template>
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param consts The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrs The attrs attached to the container, if applicable
 * @param localRefs A set of local reference bindings on the element.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 */
export function template(
    index: number, templateFn: ComponentTemplate<any>| null, consts: number, vars: number,
    tagName?: string | null, attrs?: TAttributes | null, localRefs?: string[] | null,
    localRefExtractor?: LocalRefExtractor) {
  const viewData = getViewData();
  const tView = getTView();
  // TODO: consider a separate node type for templates
  const tNode = containerInternal(index, tagName || null, attrs || null);

  if (getFirstTemplatePass()) {
    tNode.tViews = createTView(
        -1, templateFn, consts, vars, tView.directiveRegistry, tView.pipeRegistry, null);
  }

  createDirectivesAndLocals(tView, viewData, localRefs, localRefExtractor);
  const currentQueries = getCurrentQueries();
  const previousOrParentTNode = getPreviousOrParentTNode();
  if (currentQueries) {
    setCurrentQueries(currentQueries.addNode(previousOrParentTNode as TContainerNode));
  }
  queueLifecycleHooks(tNode.flags, tView);
  setIsParent(false);
}

/**
 * Creates an LContainer for inline views, e.g.
 *
 * % if (showing) {
 *   <div></div>
 * % }
 *
 * @param index The index of the container in the data array
 */
export function container(index: number): void {
  const tNode = containerInternal(index, null, null);
  getFirstTemplatePass() && (tNode.tViews = []);
  setIsParent(false);
}

function containerInternal(
    index: number, tagName: string | null, attrs: TAttributes | null): TNode {
  const viewData = getViewData();
  ngDevMode && assertEqual(
                   viewData[BINDING_INDEX], getTView().bindingStartIndex,
                   'container nodes should be created before any bindings');

  const adjustedIndex = index + HEADER_OFFSET;
  const comment = getRenderer().createComment(ngDevMode ? 'container' : '');
  ngDevMode && ngDevMode.rendererCreateComment++;
  const tNode = createNodeAtIndex(index, TNodeType.Container, comment, tagName, attrs);
  const lContainer = viewData[adjustedIndex] =
      createLContainer(viewData[adjustedIndex], tNode, viewData, comment);

  appendChild(comment, tNode, viewData);

  // Containers are added to the current view tree instead of their embedded views
  // because views can be removed and re-inserted.
  addToViewTree(viewData, index + HEADER_OFFSET, lContainer);

  const currentQueries = getCurrentQueries();
  if (currentQueries) {
    // prepare place for matching nodes from views inserted into a given container
    lContainer[QUERIES] = currentQueries.container();
  }

  ngDevMode && assertNodeType(getPreviousOrParentTNode(), TNodeType.Container);
  return tNode;
}

/**
 * Sets a container up to receive views.
 *
 * @param index The index of the container in the data array
 */
export function containerRefreshStart(index: number): void {
  const viewData = getViewData();
  const tView = getTView();
  let previousOrParentTNode = loadInternal(index, tView.data) as TNode;
  setPreviousOrParentTNode(previousOrParentTNode);

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);
  setIsParent(true);

  viewData[index + HEADER_OFFSET][ACTIVE_INDEX] = 0;

  if (!getCheckNoChangesMode()) {
    // We need to execute init hooks here so ngOnInit hooks are called in top level views
    // before they are called in embedded views (for backwards compatibility).
    executeInitHooks(viewData, tView, getCreationMode());
  }
}

/**
 * Marks the end of the LContainer.
 *
 * Marking the end of LContainer is the time when to child views get inserted or removed.
 */
export function containerRefreshEnd(): void {
  let previousOrParentTNode = getPreviousOrParentTNode();
  if (getIsParent()) {
    setIsParent(false);
  } else {
    ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.View);
    ngDevMode && assertHasParent();
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode);
  }

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);

  const lContainer = getViewData()[previousOrParentTNode.index];
  const nextIndex = lContainer[ACTIVE_INDEX];

  // remove extra views at the end of the container
  while (nextIndex < lContainer[VIEWS].length) {
    removeView(lContainer, previousOrParentTNode as TContainerNode, nextIndex);
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
    if (current.length < HEADER_OFFSET && current[ACTIVE_INDEX] === -1) {
      const container = current as LContainer;
      for (let i = 0; i < container[VIEWS].length; i++) {
        const dynamicViewData = container[VIEWS][i];
        // The directives and pipes are not needed here as an existing view is only being refreshed.
        ngDevMode && assertDefined(dynamicViewData[TVIEW], 'TView must be allocated');
        renderEmbeddedTemplate(
            dynamicViewData, dynamicViewData[TVIEW], dynamicViewData[CONTEXT] !,
            RenderFlags.Update);
      }
    }
  }
}


/**
 * Looks for a view with a given view block id inside a provided LContainer.
 * Removes views that need to be deleted in the process.
 *
 * @param lContainer to search for views
 * @param tContainerNode to search for views
 * @param startIdx starting index in the views array to search from
 * @param viewBlockId exact view block id to look for
 * @returns index of a found view or -1 if not found
 */
function scanForView(
    lContainer: LContainer, tContainerNode: TContainerNode, startIdx: number,
    viewBlockId: number): LViewData|null {
  const views = lContainer[VIEWS];
  for (let i = startIdx; i < views.length; i++) {
    const viewAtPositionId = views[i][TVIEW].id;
    if (viewAtPositionId === viewBlockId) {
      return views[i];
    } else if (viewAtPositionId < viewBlockId) {
      // found a view that should not be at this position - remove
      removeView(lContainer, tContainerNode, i);
    } else {
      // found a view with id greater than the one we are searching for
      // which means that required view doesn't exist and can't be found at
      // later positions in the views array - stop the searchdef.cont here
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
export function embeddedViewStart(viewBlockId: number, consts: number, vars: number): RenderFlags {
  const viewData = getViewData();
  const previousOrParentTNode = getPreviousOrParentTNode();
  // The previous node can be a view node if we are processing an inline for loop
  const containerTNode = previousOrParentTNode.type === TNodeType.View ?
      previousOrParentTNode.parent ! :
      previousOrParentTNode;
  const lContainer = viewData[containerTNode.index] as LContainer;

  ngDevMode && assertNodeType(containerTNode, TNodeType.Container);
  let viewToRender = scanForView(
      lContainer, containerTNode as TContainerNode, lContainer[ACTIVE_INDEX] !, viewBlockId);

  if (viewToRender) {
    setIsParent(true);
    enterView(viewToRender, viewToRender[TVIEW].node);
  } else {
    // When we create a new LView, we always reset the state of the instructions.
    viewToRender = createLViewData(
        getRenderer(),
        getOrCreateEmbeddedTView(viewBlockId, consts, vars, containerTNode as TContainerNode), null,
        LViewFlags.CheckAlways, getCurrentSanitizer());

    if (lContainer[QUERIES]) {
      viewToRender[QUERIES] = lContainer[QUERIES] !.createView();
    }

    createViewNode(viewBlockId, viewToRender);
    enterView(viewToRender, viewToRender[TVIEW].node);
  }
  if (lContainer) {
    if (getCreationMode()) {
      // it is a new view, insert it into collection of views for a given container
      insertView(viewToRender, lContainer, viewData, lContainer[ACTIVE_INDEX] !, -1);
    }
    lContainer[ACTIVE_INDEX] !++;
  }
  return getRenderFlags(viewToRender);
}

/**
 * Initialize the TView (e.g. static data) for the active embedded view.
 *
 * Each embedded view block must create or retrieve its own TView. Otherwise, the embedded view's
 * static data for a particular node would overwrite the static data for a node in the view above
 * it with the same index (since it's in the same template).
 *
 * @param viewIndex The index of the TView in TNode.tViews
 * @param consts The number of nodes, local refs, and pipes in this template
 * @param vars The number of bindings and pure function bindings in this template
 * @param container The parent container in which to look for the view's static data
 * @returns TView
 */
function getOrCreateEmbeddedTView(
    viewIndex: number, consts: number, vars: number, parent: TContainerNode): TView {
  const tView = getTView();
  ngDevMode && assertNodeType(parent, TNodeType.Container);
  const containerTViews = parent.tViews as TView[];
  ngDevMode && assertDefined(containerTViews, 'TView expected');
  ngDevMode && assertEqual(Array.isArray(containerTViews), true, 'TViews should be in an array');
  if (viewIndex >= containerTViews.length || containerTViews[viewIndex] == null) {
    containerTViews[viewIndex] = createTView(
        viewIndex, null, consts, vars, tView.directiveRegistry, tView.pipeRegistry, null);
  }
  return containerTViews[viewIndex];
}

/** Marks the end of an embedded view. */
export function embeddedViewEnd(): void {
  const viewData = getViewData();
  const viewHost = viewData[HOST_NODE];
  refreshDescendantViews(viewData, null);
  leaveView(viewData[PARENT] !);
  setPreviousOrParentTNode(viewHost !);
  setIsParent(false);
}

/////////////

/**
 * Refreshes components by entering the component view and processing its bindings, queries, etc.
 *
 * @param adjustedElementIndex  Element index in LViewData[] (adjusted for HEADER_OFFSET)
 */
export function componentRefresh<T>(
    adjustedElementIndex: number, parentFirstTemplatePass: boolean, rf: RenderFlags | null): void {
  ngDevMode && assertDataInRange(adjustedElementIndex);
  const hostView = getComponentViewByIndex(adjustedElementIndex, getViewData());
  ngDevMode && assertNodeType(getTView().data[adjustedElementIndex] as TNode, TNodeType.Element);

  // Only attached CheckAlways components or attached, dirty OnPush components should be checked
  if (viewAttached(hostView) && hostView[FLAGS] & (LViewFlags.CheckAlways | LViewFlags.Dirty)) {
    parentFirstTemplatePass && syncViewWithBlueprint(hostView);
    detectChangesInternal(hostView, hostView[CONTEXT], rf);
  }
}

/**
 * Syncs an LViewData instance with its blueprint if they have gotten out of sync.
 *
 * Typically, blueprints and their view instances should always be in sync, so the loop here
 * will be skipped. However, consider this case of two components side-by-side:
 *
 * App template:
 * ```
 * <comp></comp>
 * <comp></comp>
 * ```
 *
 * The following will happen:
 * 1. App template begins processing.
 * 2. First <comp> is matched as a component and its LViewData is created.
 * 3. Second <comp> is matched as a component and its LViewData is created.
 * 4. App template completes processing, so it's time to check child templates.
 * 5. First <comp> template is checked. It has a directive, so its def is pushed to blueprint.
 * 6. Second <comp> template is checked. Its blueprint has been updated by the first
 * <comp> template, but its LViewData was created before this update, so it is out of sync.
 *
 * Note that embedded views inside ngFor loops will never be out of sync because these views
 * are processed as soon as they are created.
 *
 * @param componentView The view to sync
 */
function syncViewWithBlueprint(componentView: LViewData) {
  const componentTView = componentView[TVIEW];
  for (let i = componentView.length; i < componentTView.blueprint.length; i++) {
    componentView[i] = componentTView.blueprint[i];
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
  const componentNode = findComponentView(getViewData())[HOST_NODE] as TElementNode;

  if (!componentNode.projection) {
    const noOfNodeBuckets = selectors ? selectors.length + 1 : 1;
    const pData: (TNode | null)[] = componentNode.projection =
        new Array(noOfNodeBuckets).fill(null);
    const tails: (TNode | null)[] = pData.slice();

    let componentChild: TNode|null = componentNode.child;

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
const projectionNodeStack: (LViewData | TNode)[] = [];

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
  const viewData = getViewData();
  const tProjectionNode =
      createNodeAtIndex(nodeIndex, TNodeType.Projection, null, null, attrs || null);

  // We can't use viewData[HOST_NODE] because projection nodes can be nested in embedded views.
  if (tProjectionNode.projection === null) tProjectionNode.projection = selectorIndex;

  // `<ng-content>` has no content
  setIsParent(false);

  // re-distribution of projectable nodes is stored on a component's view level
  const componentView = findComponentView(viewData);
  const componentNode = componentView[HOST_NODE] as TElementNode;
  let nodeToProject = (componentNode.projection as(TNode | null)[])[selectorIndex];
  let projectedView = componentView[PARENT] !;
  let projectionNodeIndex = -1;

  while (nodeToProject) {
    if (nodeToProject.type === TNodeType.Projection) {
      // This node is re-projected, so we must go up the tree to get its projected nodes.
      const currentComponentView = findComponentView(projectedView);
      const currentComponentHost = currentComponentView[HOST_NODE] as TElementNode;
      const firstProjectedNode =
          (currentComponentHost.projection as(TNode | null)[])[nodeToProject.projection as number];

      if (firstProjectedNode) {
        projectionNodeStack[++projectionNodeIndex] = nodeToProject;
        projectionNodeStack[++projectionNodeIndex] = projectedView;

        nodeToProject = firstProjectedNode;
        projectedView = currentComponentView[PARENT] !;
        continue;
      }
    } else {
      // This flag must be set now or we won't know that this node is projected
      // if the nodes are inserted into a container later.
      nodeToProject.flags |= TNodeFlags.isProjected;
      appendProjectedNode(nodeToProject, tProjectionNode, viewData, projectedView);
    }

    // If we are finished with a list of re-projected nodes, we need to get
    // back to the root projection node that was re-projected.
    if (nodeToProject.next === null && projectedView !== componentView[PARENT] !) {
      projectedView = projectionNodeStack[projectionNodeIndex--] as LViewData;
      nodeToProject = projectionNodeStack[projectionNodeIndex--] as TNode;
    }
    nodeToProject = nodeToProject.next;
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
  const tView = getTView();
  const firstTemplatePass = getFirstTemplatePass();
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
function markDirtyIfOnPush(viewData: LViewData, viewIndex: number): void {
  const view = getComponentViewByIndex(viewIndex, viewData);
  if (!(view[FLAGS] & LViewFlags.CheckAlways)) {
    view[FLAGS] |= LViewFlags.Dirty;
  }
}

/** Wraps an event listener with preventDefault behavior. */
function wrapListenerWithPreventDefault(listenerFn: (e?: any) => any): EventListener {
  return function wrapListenerIn_preventDefault(e: Event) {
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

  while (currentView && !(currentView[FLAGS] & LViewFlags.IsRoot)) {
    currentView[FLAGS] |= LViewFlags.Dirty;
    currentView = currentView[PARENT] !;
  }
  currentView[FLAGS] |= LViewFlags.Dirty;
  ngDevMode && assertDefined(currentView[CONTEXT], 'rootContext should be defined');

  const rootContext = currentView[CONTEXT] as RootContext;
  scheduleTick(rootContext, RootContextFlags.DetectChanges);
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
export function scheduleTick<T>(rootContext: RootContext, flags: RootContextFlags) {
  const nothingScheduled = rootContext.flags === RootContextFlags.Empty;
  rootContext.flags |= flags;

  if (nothingScheduled && rootContext.clean == _CLEAN_PROMISE) {
    let res: null|((val: null) => void);
    rootContext.clean = new Promise<null>((r) => res = r);
    rootContext.scheduler(() => {
      if (rootContext.flags & RootContextFlags.DetectChanges) {
        rootContext.flags &= ~RootContextFlags.DetectChanges;
        tickRootContext(rootContext);
      }

      if (rootContext.flags & RootContextFlags.FlushPlayers) {
        rootContext.flags &= ~RootContextFlags.FlushPlayers;
        const playerHandler = rootContext.playerHandler;
        if (playerHandler) {
          playerHandler.flushPlayers();
        }
      }

      rootContext.clean = _CLEAN_PROMISE;
      res !(null);
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
    renderComponentOrTemplate(
        readPatchedLViewData(rootComponent) !, rootComponent, RenderFlags.Update);
  }
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
  detectChangesInternal(getComponentViewByInstance(component) !, component, null);
}

/**
 * Synchronously perform change detection on a root view and its components.
 *
 * @param lViewData The view which the change detection should be performed on.
 */
export function detectChangesInRootView(lViewData: LViewData): void {
  tickRootContext(lViewData[CONTEXT] as RootContext);
}


/**
 * Checks the change detector and its children, and throws if any changes are detected.
 *
 * This is used in development mode to verify that running change detection doesn't
 * introduce other changes.
 */
export function checkNoChanges<T>(component: T): void {
  setCheckNoChangesMode(true);
  try {
    detectChanges(component);
  } finally {
    setCheckNoChangesMode(false);
  }
}

/**
 * Checks the change detector on a root view and its components, and throws if any changes are
 * detected.
 *
 * This is used in development mode to verify that running change detection doesn't
 * introduce other changes.
 *
 * @param lViewData The view which the change detection should be checked on.
 */
export function checkNoChangesInRootView(lViewData: LViewData): void {
  setCheckNoChangesMode(true);
  try {
    detectChangesInRootView(lViewData);
  } finally {
    setCheckNoChangesMode(false);
  }
}

/** Checks the view of the component provided. Does not gate on dirty checks or execute doCheck. */
function detectChangesInternal<T>(hostView: LViewData, component: T, rf: RenderFlags | null) {
  const hostTView = hostView[TVIEW];
  const oldView = enterView(hostView, hostView[HOST_NODE]);
  const templateFn = hostTView.template !;
  const viewQuery = hostTView.viewQuery;

  try {
    namespaceHTML();
    createViewQuery(viewQuery, rf, hostView[FLAGS], component);
    templateFn(rf || getRenderFlags(hostView), component);
    refreshDescendantViews(hostView, rf);
    updateViewQuery(viewQuery, hostView[FLAGS], component);
  } finally {
    leaveView(oldView, rf === RenderFlags.Create);
  }
}

function createViewQuery<T>(
    viewQuery: ComponentQuery<{}>| null, renderFlags: RenderFlags | null, viewFlags: LViewFlags,
    component: T): void {
  if (viewQuery && (renderFlags === RenderFlags.Create ||
                    (renderFlags === null && (viewFlags & LViewFlags.CreationMode)))) {
    viewQuery(RenderFlags.Create, component);
  }
}

function updateViewQuery<T>(
    viewQuery: ComponentQuery<{}>| null, flags: LViewFlags, component: T): void {
  if (viewQuery && flags & RenderFlags.Update) {
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
  markViewDirty(getComponentViewByInstance(component));
}

///////////////////////////////
//// Bindings & interpolations
///////////////////////////////

/**
 * Creates a single value binding.
 *
 * @param value Value to diff
 */
export function bind<T>(value: T): T|NO_CHANGE {
  return bindingUpdated(getViewData()[BINDING_INDEX]++, value) ? value : NO_CHANGE;
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
    bindingUpdated(getViewData()[BINDING_INDEX]++, values[i]) && (different = true);
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
  const different = bindingUpdated(getViewData()[BINDING_INDEX]++, v0);
  return different ? prefix + stringify(v0) + suffix : NO_CHANGE;
}

/** Creates an interpolation binding with 2 expressions. */
export function interpolation2(
    prefix: string, v0: any, i0: string, v1: any, suffix: string): string|NO_CHANGE {
  const viewData = getViewData();
  const different = bindingUpdated2(viewData[BINDING_INDEX], v0, v1);
  viewData[BINDING_INDEX] += 2;

  return different ? prefix + stringify(v0) + i0 + stringify(v1) + suffix : NO_CHANGE;
}

/** Creates an interpolation binding with 3 expressions. */
export function interpolation3(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): string|
    NO_CHANGE {
  const viewData = getViewData();
  const different = bindingUpdated3(viewData[BINDING_INDEX], v0, v1, v2);
  viewData[BINDING_INDEX] += 3;

  return different ? prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + suffix :
                     NO_CHANGE;
}

/** Create an interpolation binding with 4 expressions. */
export function interpolation4(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    suffix: string): string|NO_CHANGE {
  const viewData = getViewData();
  const different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  viewData[BINDING_INDEX] += 4;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) +
          suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 5 expressions. */
export function interpolation5(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, suffix: string): string|NO_CHANGE {
  const viewData = getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated(viewData[BINDING_INDEX] + 4, v4) || different;
  viewData[BINDING_INDEX] += 5;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 6 expressions. */
export function interpolation6(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, suffix: string): string|NO_CHANGE {
  const viewData = getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated2(viewData[BINDING_INDEX] + 4, v4, v5) || different;
  viewData[BINDING_INDEX] += 6;

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
  const viewData = getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated3(viewData[BINDING_INDEX] + 4, v4, v5, v6) || different;
  viewData[BINDING_INDEX] += 7;

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
  const viewData = getViewData();
  let different = bindingUpdated4(viewData[BINDING_INDEX], v0, v1, v2, v3);
  different = bindingUpdated4(viewData[BINDING_INDEX] + 4, v4, v5, v6, v7) || different;
  viewData[BINDING_INDEX] += 8;

  return different ?
      prefix + stringify(v0) + i0 + stringify(v1) + i1 + stringify(v2) + i2 + stringify(v3) + i3 +
          stringify(v4) + i4 + stringify(v5) + i5 + stringify(v6) + i6 + stringify(v7) + suffix :
      NO_CHANGE;
}

/** Store a value in the `data` at a given `index`. */
export function store<T>(index: number, value: T): void {
  const tView = getTView();
  // We don't store any static data for local variables, so the first time
  // we see the template, we should store as null to avoid a sparse array
  const adjustedIndex = index + HEADER_OFFSET;
  if (adjustedIndex >= tView.data.length) {
    tView.data[adjustedIndex] = null;
  }
  getViewData()[adjustedIndex] = value;
}

/**
 * Retrieves a local reference from the current contextViewData.
 *
 * If the reference to retrieve is in a parent view, this instruction is used in conjunction
 * with a nextContext() call, which walks up the tree and updates the contextViewData instance.
 *
 * @param index The index of the local ref in contextViewData.
 */
export function reference<T>(index: number) {
  const contextViewData = getContextViewData();
  return loadInternal<T>(index, contextViewData);
}

export function loadQueryList<T>(queryListIdx: number): QueryList<T> {
  const viewData = getViewData();
  ngDevMode && assertDefined(
                   viewData[CONTENT_QUERIES],
                   'Content QueryList array should be defined if reading a query.');
  ngDevMode && assertDataInRange(queryListIdx, viewData[CONTENT_QUERIES] !);

  return viewData[CONTENT_QUERIES] ![queryListIdx];
}

/** Retrieves a value from current `viewData`. */
export function load<T>(index: number): T {
  return loadInternal<T>(index, getViewData());
}

/** Gets the current binding value. */
export function getBinding(bindingIndex: number): any {
  const viewData = getViewData();
  ngDevMode && assertDataInRange(viewData[bindingIndex]);
  ngDevMode &&
      assertNotEqual(viewData[bindingIndex], NO_CHANGE, 'Stored value should never be NO_CHANGE.');
  return viewData[bindingIndex];
}

/** Updates binding if changed, then returns whether it was updated. */
export function bindingUpdated(bindingIndex: number, value: any): boolean {
  const viewData = getViewData();
  const checkNoChangesMode = getCheckNoChangesMode();
  ngDevMode && assertNotEqual(value, NO_CHANGE, 'Incoming value should never be NO_CHANGE.');
  ngDevMode && assertLessThan(
                   bindingIndex, viewData.length, `Slot should have been initialized to NO_CHANGE`);

  if (viewData[bindingIndex] === NO_CHANGE) {
    viewData[bindingIndex] = value;
  } else if (isDifferent(viewData[bindingIndex], value, checkNoChangesMode)) {
    throwErrorIfNoChangesMode(getCreationMode(), checkNoChangesMode, viewData[bindingIndex], value);
    viewData[bindingIndex] = value;
  } else {
    return false;
  }
  return true;
}

/** Updates binding and returns the value. */
export function updateBinding(bindingIndex: number, value: any): any {
  return getViewData()[bindingIndex] = value;
}

/** Updates 2 bindings if changed, then returns whether either was updated. */
export function bindingUpdated2(bindingIndex: number, exp1: any, exp2: any): boolean {
  const different = bindingUpdated(bindingIndex, exp1);
  return bindingUpdated(bindingIndex + 1, exp2) || different;
}

/** Updates 3 bindings if changed, then returns whether any was updated. */
export function bindingUpdated3(bindingIndex: number, exp1: any, exp2: any, exp3: any): boolean {
  const different = bindingUpdated2(bindingIndex, exp1, exp2);
  return bindingUpdated(bindingIndex + 2, exp3) || different;
}

/** Updates 4 bindings if changed, then returns whether any was updated. */
export function bindingUpdated4(
    bindingIndex: number, exp1: any, exp2: any, exp3: any, exp4: any): boolean {
  const different = bindingUpdated2(bindingIndex, exp1, exp2);
  return bindingUpdated2(bindingIndex + 2, exp3, exp4) || different;
}


///////////////////////////////
//// DI
///////////////////////////////

/**
 * Returns the value associated to the given token from the injectors.
 *
 * `directiveInject` is intended to be used for directive, component and pipe factories.
 *  All other injection use `inject` which does not walk the node injector tree.
 *
 * Usage example (in factory function):
 *
 * class SomeDirective {
 *   constructor(directive: DirectiveA) {}
 *
 *   static ngDirectiveDef = defineDirective({
 *     type: SomeDirective,
 *     factory: () => new SomeDirective(directiveInject(DirectiveA))
 *   });
 * }
 *
 * @param token the type or token to inject
 * @param flags Injection flags
 * @returns the value from the injector or `null` when not found
 */
export function directiveInject<T>(token: Type<T>| InjectionToken<T>): T;
export function directiveInject<T>(token: Type<T>| InjectionToken<T>, flags: InjectFlags): T;
export function directiveInject<T>(
    token: Type<T>| InjectionToken<T>, flags = InjectFlags.Default): T|null {
  token = resolveForwardRef(token);
  return getOrCreateInjectable<T>(
      getPreviousOrParentTNode() as TElementNode | TContainerNode | TElementContainerNode,
      getViewData(), token, flags);
}

/**
 * Facade for the attribute injection from DI.
 */
export function injectAttribute(attrNameToInject: string): string|undefined {
  return injectAttributeImpl(getPreviousOrParentTNode(), attrNameToInject);
}

/**
 * Registers a QueryList, associated with a content query, for later refresh (part of a view
 * refresh).
 */
export function registerContentQuery<Q>(
    queryList: QueryList<Q>, currentDirectiveIndex: number): void {
  const viewData = getViewData();
  const tView = getTView();
  const savedContentQueriesLength =
      (viewData[CONTENT_QUERIES] || (viewData[CONTENT_QUERIES] = [])).push(queryList);
  if (getFirstTemplatePass()) {
    const tViewContentQueries = tView.contentQueries || (tView.contentQueries = []);
    const lastSavedDirectiveIndex =
        tView.contentQueries.length ? tView.contentQueries[tView.contentQueries.length - 2] : -1;
    if (currentDirectiveIndex !== lastSavedDirectiveIndex) {
      tViewContentQueries.push(currentDirectiveIndex, savedContentQueriesLength - 1);
    }
  }
}

export const CLEAN_PROMISE = _CLEAN_PROMISE;

function initializeTNodeInputs(tNode: TNode | null) {
  // If tNode.inputs is undefined, a listener has created outputs, but inputs haven't
  // yet been checked.
  if (tNode) {
    if (tNode.inputs === undefined) {
      // mark inputs as checked
      tNode.inputs = generatePropertyAliases(tNode.flags, BindingDirection.Input);
    }
    return tNode.inputs;
  }
  return null;
}

export function delegateToClassInput(tNode: TNode) {
  return tNode.flags & TNodeFlags.hasClassInput;
}
