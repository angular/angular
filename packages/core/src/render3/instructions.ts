/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectFlags, InjectionToken, Injector} from '../di';
import {resolveForwardRef} from '../di/forward_ref';
import {Type} from '../interface/type';
import {QueryList} from '../linker';
import {validateAttribute, validateProperty} from '../sanitization/sanitization';
import {Sanitizer} from '../sanitization/security';
import {StyleSanitizeFn} from '../sanitization/style_sanitizer';
import {assertDataInRange, assertDefined, assertEqual, assertLessThan, assertNotEqual} from '../util/assert';
import {isObservable} from '../util/lang';
import {normalizeDebugBindingName, normalizeDebugBindingValue} from '../util/ng_reflect';

import {assertHasParent, assertPreviousIsParent} from './assert';
import {bindingUpdated, bindingUpdated2, bindingUpdated3, bindingUpdated4} from './bindings';
import {attachPatchData, getComponentViewByInstance} from './context_discovery';
import {diPublicInInjector, getNodeInjectable, getOrCreateInjectable, getOrCreateNodeInjectorForNode, injectAttributeImpl} from './di';
import {throwMultipleComponentError} from './errors';
import {executeHooks, executeInitHooks, registerPostOrderHooks, registerPreOrderHooks} from './hooks';
import {ACTIVE_INDEX, LContainer, VIEWS} from './interfaces/container';
import {ComponentDef, ComponentQuery, ComponentTemplate, DirectiveDef, DirectiveDefListOrFactory, PipeDefListOrFactory, RenderFlags} from './interfaces/definition';
import {INJECTOR_BLOOM_PARENT_SIZE, NodeInjectorFactory} from './interfaces/injector';
import {AttributeMarker, InitialInputData, InitialInputs, LocalRefExtractor, PropertyAliasValue, PropertyAliases, TAttributes, TContainerNode, TElementContainerNode, TElementNode, TIcuContainerNode, TNode, TNodeFlags, TNodeProviderIndexes, TNodeType, TProjectionNode, TViewNode} from './interfaces/node';
import {PlayerFactory} from './interfaces/player';
import {CssSelectorList, NG_PROJECT_AS_ATTR_NAME} from './interfaces/projection';
import {LQueries} from './interfaces/query';
import {GlobalTargetResolver, ProceduralRenderer3, RComment, RElement, RText, Renderer3, RendererFactory3, isProceduralRenderer} from './interfaces/renderer';
import {SanitizerFn} from './interfaces/sanitization';
import {BINDING_INDEX, CLEANUP, CONTAINER_INDEX, CONTENT_QUERIES, CONTEXT, DECLARATION_VIEW, FLAGS, HEADER_OFFSET, HOST, HOST_NODE, INJECTOR, LView, LViewFlags, NEXT, OpaqueViewState, PARENT, QUERIES, RENDERER, RENDERER_FACTORY, RootContext, RootContextFlags, SANITIZER, TAIL, TVIEW, TView} from './interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from './node_assert';
import {appendChild, appendProjectedNode, createTextNode, getLViewChild, insertView, removeView} from './node_manipulation';
import {isNodeMatchingSelectorList, matchingSelectorIndex} from './node_selector_matcher';
import {OnChangesDirectiveWrapper, isOnChangesDirectiveWrapper, recordChange, unwrapOnChangesDirectiveWrapper} from './onchanges_util';
import {query} from './query';
import {decreaseElementDepthCount, enterView, getBindingsEnabled, getCheckNoChangesMode, getContextLView, getCurrentDirectiveDef, getCurrentViewQueryIndex, getElementDepthCount, getFirstTemplatePass, getIsParent, getLView, getPreviousOrParentTNode, increaseElementDepthCount, isCreationMode, leaveView, nextContextImpl, resetComponentState, setBindingRoot, setCheckNoChangesMode, setCurrentDirectiveDef, setCurrentViewQueryIndex, setFirstTemplatePass, setIsParent, setPreviousOrParentTNode} from './state';
import {getInitialClassNameValue, initializeStaticContext as initializeStaticStylingContext, patchContextWithStaticAttrs, renderInitialStylesAndClasses, renderStyling, updateClassProp as updateElementClassProp, updateContextWithBindings, updateStyleProp as updateElementStyleProp, updateStylingMap} from './styling/class_and_style_bindings';
import {BoundPlayerFactory} from './styling/player_factory';
import {createEmptyStylingContext, getStylingContext, hasClassInput, hasStyling, isAnimationProp} from './styling/util';
import {NO_CHANGE} from './tokens';
import {findComponentView, getCleanup, getComponentViewByIndex, getNativeByIndex, getNativeByTNode, getRootContext, getRootView, getTNode, getTViewCleanup, isComponent, isComponentDef, isContentQueryHost, loadInternal, readElementValue, readPatchedLView, renderStringify, storeCleanupWithContext} from './util';



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
export function refreshDescendantViews(lView: LView) {
  const tView = lView[TVIEW];
  // This needs to be set before children are processed to support recursive components
  tView.firstTemplatePass = false;
  setFirstTemplatePass(false);

  // If this is a creation pass, we should not call lifecycle hooks or evaluate bindings.
  // This will be done in the update pass.
  if (!isCreationMode(lView)) {
    const checkNoChangesMode = getCheckNoChangesMode();

    executeInitHooks(lView, tView, checkNoChangesMode);

    refreshDynamicEmbeddedViews(lView);

    // Content query results must be refreshed before content hooks are called.
    refreshContentQueries(tView);

    executeHooks(lView, tView.contentHooks, tView.contentCheckHooks, checkNoChangesMode);

    setHostBindings(tView, lView);
  }

  refreshChildComponents(tView.components);
}


/** Sets the host bindings for the current view. */
export function setHostBindings(tView: TView, viewData: LView): void {
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
          bindingRootIndex += INJECTOR_BLOOM_PARENT_SIZE + providerCount;

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
        if (instruction !== null) {
          viewData[BINDING_INDEX] = bindingRootIndex;
          instruction(
              RenderFlags.Update, unwrapOnChangesDirectiveWrapper(viewData[currentDirectiveIndex]),
              currentElementIndex);
        }
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
function refreshChildComponents(components: number[] | null): void {
  if (components != null) {
    for (let i = 0; i < components.length; i++) {
      componentRefresh(components[i]);
    }
  }
}

export function createLView<T>(
    parentLView: LView | null, tView: TView, context: T | null, flags: LViewFlags,
    rendererFactory?: RendererFactory3 | null, renderer?: Renderer3 | null,
    sanitizer?: Sanitizer | null, injector?: Injector | null): LView {
  const lView = tView.blueprint.slice() as LView;
  lView[FLAGS] = flags | LViewFlags.CreationMode | LViewFlags.Attached | LViewFlags.RunInit |
      LViewFlags.FirstLViewPass;
  lView[PARENT] = lView[DECLARATION_VIEW] = parentLView;
  lView[CONTEXT] = context;
  lView[RENDERER_FACTORY] = (rendererFactory || parentLView && parentLView[RENDERER_FACTORY]) !;
  ngDevMode && assertDefined(lView[RENDERER_FACTORY], 'RendererFactory is required');
  lView[RENDERER] = (renderer || parentLView && parentLView[RENDERER]) !;
  ngDevMode && assertDefined(lView[RENDERER], 'Renderer is required');
  lView[SANITIZER] = sanitizer || parentLView && parentLView[SANITIZER] || null !;
  lView[INJECTOR as any] = injector || parentLView && parentLView[INJECTOR] || null;
  return lView;
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
    index: number, type: TNodeType.ElementContainer, native: RComment, name: string | null,
    attrs: TAttributes | null): TElementContainerNode;
export function createNodeAtIndex(
    index: number, type: TNodeType.IcuContainer, native: RComment, name: null,
    attrs: TAttributes | null): TElementContainerNode;
export function createNodeAtIndex(
    index: number, type: TNodeType, native: RText | RElement | RComment | null, name: string | null,
    attrs: TAttributes | null): TElementNode&TContainerNode&TElementContainerNode&TProjectionNode&
    TIcuContainerNode {
  const lView = getLView();
  const tView = lView[TVIEW];
  const adjustedIndex = index + HEADER_OFFSET;
  ngDevMode &&
      assertLessThan(adjustedIndex, lView.length, `Slot should have been initialized with null`);
  lView[adjustedIndex] = native;

  let tNode = tView.data[adjustedIndex] as TNode;
  if (tNode == null) {
    // TODO(misko): Refactor createTNode so that it does not depend on LView.
    tNode = tView.data[adjustedIndex] = createTNode(lView, type, adjustedIndex, name, attrs, null);
  }

  // Now link ourselves into the tree.
  // We need this even if tNode exists, otherwise we might end up pointing to unexisting tNodes when
  // we use i18n (especially with ICU expressions that update the DOM during the update phase).
  const previousOrParentTNode = getPreviousOrParentTNode();
  const isParent = getIsParent();
  if (previousOrParentTNode) {
    if (isParent && previousOrParentTNode.child == null &&
        (tNode.parent !== null || previousOrParentTNode.type === TNodeType.View)) {
      // We are in the same view, which means we are adding content node to the parent view.
      previousOrParentTNode.child = tNode;
    } else if (!isParent) {
      previousOrParentTNode.next = tNode;
    }
  }

  if (tView.firstChild == null) {
    tView.firstChild = tNode;
  }

  setPreviousOrParentTNode(tNode);
  setIsParent(true);
  return tNode as TElementNode & TViewNode & TContainerNode & TElementContainerNode &
      TProjectionNode & TIcuContainerNode;
}

export function createViewNode(index: number, view: LView) {
  // View nodes are not stored in data because they can be added / removed at runtime (which
  // would cause indices to change). Their TNodes are instead stored in tView.node.
  if (view[TVIEW].node == null) {
    view[TVIEW].node = createTNode(view, TNodeType.View, index, null, null, null) as TViewNode;
  }

  return view[HOST_NODE] = view[TVIEW].node as TViewNode;
}


/**
 * When elements are created dynamically after a view blueprint is created (e.g. through
 * i18nApply() or ComponentFactory.create), we need to adjust the blueprint for future
 * template passes.
 */
export function allocExpando(view: LView) {
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
    providedRendererFactory: RendererFactory3, hostView: LView | null,
    directives?: DirectiveDefListOrFactory | null, pipes?: PipeDefListOrFactory | null,
    sanitizer?: Sanitizer | null): LView {
  if (hostView == null) {
    resetComponentState();
    const renderer = providedRendererFactory.createRenderer(null, null);

    // We need to create a root view so it's possible to look up the host element through its index
    const hostLView = createLView(
        null, createTView(-1, null, 1, 0, null, null, null), {},
        LViewFlags.CheckAlways | LViewFlags.IsRoot, providedRendererFactory, renderer);
    enterView(hostLView, null);  // SUSPECT! why do we need to enter the View?

    const componentTView =
        getOrCreateTView(templateFn, consts, vars, directives || null, pipes || null, null);
    hostView = createLView(
        hostLView, componentTView, context, LViewFlags.CheckAlways, providedRendererFactory,
        renderer, sanitizer);
    hostView[HOST_NODE] = createNodeAtIndex(0, TNodeType.Element, hostNode, null, null);
  }
  renderComponentOrTemplate(hostView, context, templateFn);
  return hostView;
}

/**
 * Used for creating the LViewNode of a dynamic embedded view,
 * either through ViewContainerRef.createEmbeddedView() or TemplateRef.createEmbeddedView().
 * Such lViewNode will then be renderer with renderEmbeddedTemplate() (see below).
 */
export function createEmbeddedViewAndNode<T>(
    tView: TView, context: T, declarationView: LView, renderer: Renderer3, queries: LQueries | null,
    injectorIndex: number): LView {
  const _isParent = getIsParent();
  const _previousOrParentTNode = getPreviousOrParentTNode();
  setIsParent(true);
  setPreviousOrParentTNode(null !);

  const lView = createLView(declarationView, tView, context, LViewFlags.CheckAlways);
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
export function renderEmbeddedTemplate<T>(viewToRender: LView, tView: TView, context: T) {
  const _isParent = getIsParent();
  const _previousOrParentTNode = getPreviousOrParentTNode();
  let oldView: LView;
  if (viewToRender[FLAGS] & LViewFlags.IsRoot) {
    // This is a root view inside the view tree
    tickRootContext(getRootContext(viewToRender));
  } else {
    try {
      setIsParent(true);
      setPreviousOrParentTNode(null !);

      oldView = enterView(viewToRender, viewToRender[HOST_NODE]);
      namespaceHTML();
      tView.template !(getRenderFlags(viewToRender), context);
      // This must be set to false immediately after the first creation run because in an
      // ngFor loop, all the views will be created together before update mode runs and turns
      // off firstTemplatePass. If we don't set it here, instances will perform directive
      // matching, etc again and again.
      viewToRender[TVIEW].firstTemplatePass = false;
      setFirstTemplatePass(false);

      refreshDescendantViews(viewToRender);
    } finally {
      leaveView(oldView !);
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
    hostView: LView, context: T, templateFn?: ComponentTemplate<T>) {
  const rendererFactory = hostView[RENDERER_FACTORY];
  const oldView = enterView(hostView, hostView[HOST_NODE]);
  const normalExecutionPath = !getCheckNoChangesMode();
  const creationModeIsActive = isCreationMode(hostView);
  try {
    if (normalExecutionPath && !creationModeIsActive && rendererFactory.begin) {
      rendererFactory.begin();
    }

    if (creationModeIsActive) {
      // creation mode pass
      if (templateFn) {
        namespaceHTML();
        templateFn(RenderFlags.Create, context !);
      }

      refreshDescendantViews(hostView);
      hostView[FLAGS] &= ~LViewFlags.CreationMode;
    }

    // update mode pass
    templateFn && templateFn(RenderFlags.Update, context !);
    refreshDescendantViews(hostView);
  } finally {
    if (normalExecutionPath && !creationModeIsActive && rendererFactory.end) {
      rendererFactory.end();
    }
    leaveView(oldView);
  }
}

/**
 * This function returns the default configuration of rendering flags depending on when the
 * template is in creation mode or update mode. Update block and create block are
 * always run separately.
 */
function getRenderFlags(view: LView): RenderFlags {
  return isCreationMode(view) ? RenderFlags.Create : RenderFlags.Update;
}

//////////////////////////
//// Namespace
//////////////////////////

let _currentNamespace: string|null = null;

export function namespaceSVG() {
  _currentNamespace = 'http://www.w3.org/2000/svg';
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
 * @param attrs Statically bound set of attributes, classes, and styles to be written into the DOM
 *              element on creation. Use [AttributeMarker] to denote the meaning of this array.
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
 * @param index Index of the element in the LView array
 * @param attrs Set of attributes to be used when matching directives.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Even if this instruction accepts a set of attributes no actual attribute values are propagated to
 * the DOM (as a comment node can't have attributes). Attributes are here only for directive
 * matching purposes and setting initial inputs of directives.
 */
export function elementContainerStart(
    index: number, attrs?: TAttributes | null, localRefs?: string[] | null): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  const renderer = lView[RENDERER];
  const tagName = 'ng-container';
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], tView.bindingStartIndex,
                   'element containers should be created before any bindings');

  ngDevMode && ngDevMode.rendererCreateComment++;
  const native = renderer.createComment(ngDevMode ? tagName : '');

  ngDevMode && assertDataInRange(lView, index - 1);
  const tNode =
      createNodeAtIndex(index, TNodeType.ElementContainer, native, tagName, attrs || null);

  appendChild(native, tNode, lView);
  createDirectivesAndLocals(tView, lView, localRefs);
  attachPatchData(native, lView);
}

/** Mark the end of the <ng-container>. */
export function elementContainerEnd(): void {
  let previousOrParentTNode = getPreviousOrParentTNode();
  const lView = getLView();
  const tView = lView[TVIEW];
  if (getIsParent()) {
    setIsParent(false);
  } else {
    ngDevMode && assertHasParent(getPreviousOrParentTNode());
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode);
  }

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.ElementContainer);
  const currentQueries = lView[QUERIES];
  if (currentQueries) {
    lView[QUERIES] = currentQueries.addNode(previousOrParentTNode as TElementContainerNode);
  }

  registerPostOrderHooks(tView, previousOrParentTNode);
}

/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param name Name of the DOM Node
 * @param attrs Statically bound set of attributes, classes, and styles to be written into the DOM
 *              element on creation. Use [AttributeMarker] to denote the meaning of this array.
 * @param localRefs A set of local reference bindings on the element.
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 */
export function elementStart(
    index: number, name: string, attrs?: TAttributes | null, localRefs?: string[] | null): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], tView.bindingStartIndex,
                   'elements should be created before any bindings ');

  ngDevMode && ngDevMode.rendererCreateElement++;

  const native = elementCreate(name);

  ngDevMode && assertDataInRange(lView, index - 1);

  const tNode = createNodeAtIndex(index, TNodeType.Element, native !, name, attrs || null);

  if (attrs) {
    // it's important to only prepare styling-related datastructures once for a given
    // tNode and not each time an element is created. Also, the styling code is designed
    // to be patched and constructed at various points, but only up until the first element
    // is created. Then the styling context is locked and can only be instantiated for each
    // successive element that is created.
    if (tView.firstTemplatePass && !tNode.stylingTemplate && hasStyling(attrs)) {
      tNode.stylingTemplate = initializeStaticStylingContext(attrs);
    }
    setUpAttributes(native, attrs);
  }

  appendChild(native, tNode, lView);
  createDirectivesAndLocals(tView, lView, localRefs);

  // any immediate children of a component or template container must be pre-emptively
  // monkey-patched with the component view data so that the element can be inspected
  // later on using any element discovery utility methods (see `element_discovery.ts`)
  if (getElementDepthCount() === 0) {
    attachPatchData(native, lView);
  }
  increaseElementDepthCount();

  // if a directive contains a host binding for "class" then all class-based data will
  // flow through that (except for `[class.prop]` bindings). This also includes initial
  // static class values as well. (Note that this will be fixed once map-based `[style]`
  // and `[class]` bindings work for multiple directives.)
  if (tView.firstTemplatePass) {
    const inputData = initializeTNodeInputs(tNode);
    if (inputData && inputData.hasOwnProperty('class')) {
      tNode.flags |= TNodeFlags.hasClassInput;
    }
  }

  // There is no point in rendering styles when a class directive is present since
  // it will take that over for us (this will be removed once #FW-882 is in).
  if (tNode.stylingTemplate && (tNode.flags & TNodeFlags.hasClassInput) === 0) {
    renderInitialStylesAndClasses(native, tNode.stylingTemplate, lView[RENDERER]);
  }
}

/**
 * Creates a native element from a tag name, using a renderer.
 * @param name the tag name
 * @param overriddenRenderer Optional A renderer to override the default one
 * @returns the element created
 */
export function elementCreate(name: string, overriddenRenderer?: Renderer3): RElement {
  let native: RElement;
  const rendererToUse = overriddenRenderer || getLView()[RENDERER];

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
    tView: TView, lView: LView, localRefs: string[] | null | undefined,
    localRefExtractor: LocalRefExtractor = getNativeByTNode) {
  if (!getBindingsEnabled()) return;
  const previousOrParentTNode = getPreviousOrParentTNode();
  if (getFirstTemplatePass()) {
    ngDevMode && ngDevMode.firstTemplatePass++;

    resolveDirectives(
        tView, lView, findDirectiveMatches(tView, lView, previousOrParentTNode),
        previousOrParentTNode, localRefs || null);
  } else {
    // During first template pass, queries are created or cloned when first requested
    // using `getOrCreateCurrentQueries`. For subsequent template passes, we clone
    // any current LQueries here up-front if the current node hosts a content query.
    if (isContentQueryHost(getPreviousOrParentTNode()) && lView[QUERIES]) {
      lView[QUERIES] = lView[QUERIES] !.clone();
    }
  }
  instantiateAllDirectives(tView, lView, previousOrParentTNode);
  invokeDirectivesHostBindings(tView, lView, previousOrParentTNode);
  saveResolvedLocalsInData(lView, previousOrParentTNode, localRefExtractor);
}

/**
 * Takes a list of local names and indices and pushes the resolved local variable values
 * to LView in the same order as they are loaded in the template with load().
 */
function saveResolvedLocalsInData(
    viewData: LView, tNode: TNode, localRefExtractor: LocalRefExtractor): void {
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
    data: blueprint.slice(),  // Fill in to match HEADER_OFFSET in LView
    childIndex: -1,           // Children set in addToViewTree(), if any
    bindingStartIndex: bindingStartIndex,
    viewQueryStartIndex: initialViewLength,
    expandoStartIndex: initialViewLength,
    expandoInstructions: null,
    firstTemplatePass: true,
    changesHooks: null,
    initHooks: null,
    checkHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    cleanup: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof directives === 'function' ? directives() : directives,
    pipeRegistry: typeof pipes === 'function' ? pipes() : pipes,
    firstChild: null,
  };
}

function createViewBlueprint(bindingStartIndex: number, initialViewLength: number): LView {
  const blueprint = new Array(initialViewLength)
                        .fill(null, 0, bindingStartIndex)
                        .fill(NO_CHANGE, bindingStartIndex) as LView;
  blueprint[CONTAINER_INDEX] = -1;
  blueprint[BINDING_INDEX] = bindingStartIndex;
  return blueprint;
}

/**
 * Assigns all attribute values to the provided element via the inferred renderer.
 *
 * This function accepts two forms of attribute entries:
 *
 * default: (key, value):
 *  attrs = [key1, value1, key2, value2]
 *
 * namespaced: (NAMESPACE_MARKER, uri, name, value)
 *  attrs = [NAMESPACE_MARKER, uri, name, value, NAMESPACE_MARKER, uri, name, value]
 *
 * The `attrs` array can contain a mix of both the default and namespaced entries.
 * The "default" values are set without a marker, but if the function comes across
 * a marker value then it will attempt to set a namespaced value. If the marker is
 * not of a namespaced value then the function will quit and return the index value
 * where it stopped during the iteration of the attrs array.
 *
 * See [AttributeMarker] to understand what the namespace marker value is.
 *
 * Note that this instruction does not support assigning style and class values to
 * an element. See `elementStart` and `elementHostAttrs` to learn how styling values
 * are applied to an element.
 *
 * @param native The element that the attributes will be assigned to
 * @param attrs The attribute array of values that will be assigned to the element
 * @returns the index value that was last accessed in the attributes array
 */
function setUpAttributes(native: RElement, attrs: TAttributes): number {
  const renderer = getLView()[RENDERER];
  const isProc = isProceduralRenderer(renderer);

  let i = 0;
  while (i < attrs.length) {
    const value = attrs[i];
    if (typeof value === 'number') {
      // only namespaces are supported. Other value types (such as style/class
      // entries) are not supported in this function.
      if (value !== AttributeMarker.NamespaceURI) {
        break;
      }

      // we just landed on the marker value ... therefore
      // we should skip to the next entry
      i++;

      const namespaceURI = attrs[i++] as string;
      const attrName = attrs[i++] as string;
      const attrVal = attrs[i++] as string;
      ngDevMode && ngDevMode.rendererSetAttribute++;
      isProc ?
          (renderer as ProceduralRenderer3).setAttribute(native, attrName, attrVal, namespaceURI) :
          native.setAttributeNS(namespaceURI, attrName, attrVal);
    } else {
      /// attrName is string;
      const attrName = value as string;
      const attrVal = attrs[++i];
      if (attrName !== NG_PROJECT_AS_ATTR_NAME) {
        // Standard attributes
        ngDevMode && ngDevMode.rendererSetAttribute++;
        if (isAnimationProp(attrName)) {
          if (isProc) {
            (renderer as ProceduralRenderer3).setProperty(native, attrName, attrVal);
          }
        } else {
          isProc ?
              (renderer as ProceduralRenderer3)
                  .setAttribute(native, attrName as string, attrVal as string) :
              native.setAttribute(attrName as string, attrVal as string);
        }
      }
      i++;
    }
  }

  // another piece of code may iterate over the same attributes array. Therefore
  // it may be helpful to return the exact spot where the attributes array exited
  // whether by running into an unsupported marker or if all the static values were
  // iterated over.
  return i;
}

export function createError(text: string, token: any) {
  return new Error(`Renderer: ${text} [${renderStringify(token)}]`);
}


/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param elementOrSelector Render element or CSS selector to locate the element.
 */
export function locateHostElement(
    factory: RendererFactory3, elementOrSelector: RElement | string): RElement|null {
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
 * @param useCapture Whether or not to use capture in event listener
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 */
export function listener(
    eventName: string, listenerFn: (e?: any) => any, useCapture = false,
    eventTargetResolver?: GlobalTargetResolver): void {
  listenerInternal(eventName, listenerFn, useCapture, eventTargetResolver);
}

/**
 * Registers a synthetic host listener (e.g. `(@foo.start)`) on a component.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host listener (e.g. `@HostListener('@foo.start')`) properly gets rendered
 * in the component's renderer. Normally all host listeners are evaluated with the
 * parent component's renderer, but, in the case of animation @triggers, they need
 * to be evaluated with the sub component's renderer (because that's where the
 * animation triggers are defined).
 *
 * Do not use this instruction as a replacement for `listener`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 */
export function componentHostSyntheticListener<T>(
    eventName: string, listenerFn: (e?: any) => any, useCapture = false,
    eventTargetResolver?: GlobalTargetResolver): void {
  listenerInternal(eventName, listenerFn, useCapture, eventTargetResolver, loadComponentRenderer);
}

function listenerInternal(
    eventName: string, listenerFn: (e?: any) => any, useCapture = false,
    eventTargetResolver?: GlobalTargetResolver,
    loadRendererFn?: ((tNode: TNode, lView: LView) => Renderer3) | null): void {
  const lView = getLView();
  const tNode = getPreviousOrParentTNode();
  const tView = lView[TVIEW];
  const firstTemplatePass = tView.firstTemplatePass;
  const tCleanup: false|any[] = firstTemplatePass && (tView.cleanup || (tView.cleanup = []));
  ngDevMode && assertNodeOfPossibleTypes(
                   tNode, TNodeType.Element, TNodeType.Container, TNodeType.ElementContainer);

  // add native event listener - applicable to elements only
  if (tNode.type === TNodeType.Element) {
    const native = getNativeByTNode(tNode, lView) as RElement;
    const resolved = eventTargetResolver ? eventTargetResolver(native) : {} as any;
    const target = resolved.target || native;
    ngDevMode && ngDevMode.rendererAddEventListener++;
    const renderer = loadRendererFn ? loadRendererFn(tNode, lView) : lView[RENDERER];
    const lCleanup = getCleanup(lView);
    const lCleanupIndex = lCleanup.length;
    let useCaptureOrSubIdx: boolean|number = useCapture;

    // In order to match current behavior, native DOM event listeners must be added for all
    // events (including outputs).
    if (isProceduralRenderer(renderer)) {
      // The first argument of `listen` function in Procedural Renderer is:
      // - either a target name (as a string) in case of global target (window, document, body)
      // - or element reference (in all other cases)
      const cleanupFn = renderer.listen(resolved.name || target, eventName, listenerFn);
      lCleanup.push(listenerFn, cleanupFn);
      useCaptureOrSubIdx = lCleanupIndex + 1;
    } else {
      const wrappedListener = wrapListenerWithPreventDefault(listenerFn);
      target.addEventListener(eventName, wrappedListener, useCapture);
      lCleanup.push(wrappedListener);
    }

    const idxOrTargetGetter = eventTargetResolver ?
        (_lView: LView) => eventTargetResolver(readElementValue(_lView[tNode.index])).target :
        tNode.index;
    tCleanup && tCleanup.push(eventName, idxOrTargetGetter, lCleanupIndex, useCaptureOrSubIdx);
  }

  // subscribe to directive outputs
  if (tNode.outputs === undefined) {
    // if we create TNode here, inputs must be undefined so we know they still need to be
    // checked
    tNode.outputs = generatePropertyAliases(tNode, BindingDirection.Output);
  }

  const outputs = tNode.outputs;
  let props: PropertyAliasValue|undefined;
  if (outputs && (props = outputs[eventName])) {
    const propsLength = props.length;
    if (propsLength) {
      const lCleanup = getCleanup(lView);
      // Subscribe to listeners for each output, and setup clean up for each.
      for (let i = 0; i < propsLength;) {
        const directiveIndex = props[i++] as number;
        const minifiedName = props[i++] as string;
        const declaredName = props[i++] as string;
        ngDevMode && assertDataInRange(lView, directiveIndex as number);
        const directive = unwrapOnChangesDirectiveWrapper(lView[directiveIndex]);
        const output = directive[minifiedName];

        if (ngDevMode && !isObservable(output)) {
          throw new Error(
              `@Output ${minifiedName} not initialized in '${directive.constructor.name}'.`);
        }

        const subscription = output.subscribe(listenerFn);
        const idx = lCleanup.length;
        lCleanup.push(listenerFn, subscription);
        tCleanup && tCleanup.push(eventName, tNode.index, idx, -(idx + 1));
      }
    }
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
export function storeCleanupFn(view: LView, cleanupFn: Function): void {
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
    ngDevMode && assertHasParent(getPreviousOrParentTNode());
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode);
  }
  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Element);
  const lView = getLView();
  const currentQueries = lView[QUERIES];
  if (currentQueries) {
    lView[QUERIES] = currentQueries.addNode(previousOrParentTNode as TElementNode);
  }

  registerPostOrderHooks(getLView()[TVIEW], previousOrParentTNode);
  decreaseElementDepthCount();

  // this is fired at the end of elementEnd because ALL of the stylingBindings code
  // (for directives and the template) have now executed which means the styling
  // context can be instantiated properly.
  if (hasClassInput(previousOrParentTNode)) {
    const stylingContext = getStylingContext(previousOrParentTNode.index, lView);
    setInputsForProperty(
        lView, previousOrParentTNode.inputs !, 'class', getInitialClassNameValue(stylingContext));
  }
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
    ngDevMode && validateAttribute(name);
    const lView = getLView();
    const renderer = lView[RENDERER];
    const element = getNativeByIndex(index, lView);
    if (value == null) {
      ngDevMode && ngDevMode.rendererRemoveAttribute++;
      isProceduralRenderer(renderer) ? renderer.removeAttribute(element, name) :
                                       element.removeAttribute(name);
    } else {
      ngDevMode && ngDevMode.rendererSetAttribute++;
      const tNode = getTNode(index, lView);
      const strValue =
          sanitizer == null ? renderStringify(value) : sanitizer(value, tNode.tagName || '', name);
      isProceduralRenderer(renderer) ? renderer.setAttribute(element, name, strValue) :
                                       element.setAttribute(name, strValue);
    }
  }
}

/**
 * Update a property on an element.
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
 * @param nativeOnly Whether or not we should only set native properties and skip input check
 * (this is necessary for host property bindings)
 */
export function elementProperty<T>(
    index: number, propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null,
    nativeOnly?: boolean): void {
  elementPropertyInternal(index, propName, value, sanitizer, nativeOnly);
}

/**
 * Updates a synthetic host binding (e.g. `[@foo]`) on a component.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host binding (e.g. `@HostBinding('@foo')`) properly gets rendered in
 * the component's renderer. Normally all host bindings are evaluated with the parent
 * component's renderer, but, in the case of animation @triggers, they need to be
 * evaluated with the sub component's renderer (because that's where the animation
 * triggers are defined).
 *
 * Do not use this instruction as a replacement for `elementProperty`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @param nativeOnly Whether or not we should only set native properties and skip input check
 * (this is necessary for host property bindings)
 */
export function componentHostSyntheticProperty<T>(
    index: number, propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null,
    nativeOnly?: boolean) {
  elementPropertyInternal(index, propName, value, sanitizer, nativeOnly, loadComponentRenderer);
}

function elementPropertyInternal<T>(
    index: number, propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null,
    nativeOnly?: boolean,
    loadRendererFn?: ((tNode: TNode, lView: LView) => Renderer3) | null): void {
  if (value === NO_CHANGE) return;
  const lView = getLView();
  const element = getNativeByIndex(index, lView) as RElement | RComment;
  const tNode = getTNode(index, lView);
  let inputData: PropertyAliases|null|undefined;
  let dataValue: PropertyAliasValue|undefined;
  if (!nativeOnly && (inputData = initializeTNodeInputs(tNode)) &&
      (dataValue = inputData[propName])) {
    setInputsForProperty(lView, inputData, propName, value);
    if (isComponent(tNode)) markDirtyIfOnPush(lView, index + HEADER_OFFSET);
    if (ngDevMode) {
      if (tNode.type === TNodeType.Element || tNode.type === TNodeType.Container) {
        setNgReflectProperties(lView, element, tNode.type, dataValue, value);
      }
    }
  } else if (tNode.type === TNodeType.Element) {
    if (ngDevMode) {
      validateProperty(propName);
      ngDevMode.rendererSetProperty++;
    }
    const renderer = loadRendererFn ? loadRendererFn(tNode, lView) : lView[RENDERER];
    // It is assumed that the sanitizer is only added when the compiler determines that the property
    // is risky, so sanitization can be done without further checks.
    value = sanitizer != null ? (sanitizer(value, tNode.tagName || '', propName) as any) : value;
    if (isProceduralRenderer(renderer)) {
      renderer.setProperty(element as RElement, propName, value);
    } else if (!isAnimationProp(propName)) {
      (element as RElement).setProperty ? (element as any).setProperty(propName, value) :
                                          (element as any)[propName] = value;
    }
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
    lView: LView, type: TNodeType, adjustedIndex: number, tagName: string | null,
    attrs: TAttributes | null, tViews: TView[] | null): TNode {
  const previousOrParentTNode = getPreviousOrParentTNode();
  ngDevMode && ngDevMode.tNode++;
  const parent =
      getIsParent() ? previousOrParentTNode : previousOrParentTNode && previousOrParentTNode.parent;

  // Parents cannot cross component boundaries because components will be used in multiple places,
  // so it's only set if the view is the same.
  const parentInSameView = parent && lView && parent !== lView[HOST_NODE];
  const tParent = parentInSameView ? parent as TElementNode | TContainerNode : null;

  return {
    type: type,
    index: adjustedIndex,
    injectorIndex: tParent ? tParent.injectorIndex : -1,
    directiveStart: -1,
    directiveEnd: -1,
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
 * Set the inputs of directives at the current node to corresponding value.
 *
 * @param lView the `LView` which contains the directives.
 * @param inputAliases mapping between the public "input" name and privately-known,
 * possibly minified, property names to write to.
 * @param publicName public binding name. (This is the `<div [publicName]=value>`)
 * @param value Value to set.
 */
function setInputsForProperty(
    lView: LView, inputAliases: PropertyAliases, publicName: string, value: any): void {
  const inputs = inputAliases[publicName];
  for (let i = 0; i < inputs.length;) {
    const directiveIndex = inputs[i++] as number;
    const privateName = inputs[i++] as string;
    const declaredName = inputs[i++] as string;
    ngDevMode && assertDataInRange(lView, directiveIndex);
    recordChangeAndUpdateProperty(lView[directiveIndex], declaredName, privateName, value);
  }
}

function setNgReflectProperties(
    lView: LView, element: RElement | RComment, type: TNodeType, inputs: PropertyAliasValue,
    value: any) {
  for (let i = 0; i < inputs.length;) {
    const directiveIndex = inputs[i++] as number;
    const privateName = inputs[i++] as string;
    const declaredName = inputs[i++] as string;
    const renderer = lView[RENDERER];
    const attrName = normalizeDebugBindingName(privateName);
    const debugValue = normalizeDebugBindingValue(value);
    if (type === TNodeType.Element) {
      isProceduralRenderer(renderer) ?
          renderer.setAttribute((element as RElement), attrName, debugValue) :
          (element as RElement).setAttribute(attrName, debugValue);
    } else if (value !== undefined) {
      const value = `bindings=${JSON.stringify({[attrName]: debugValue}, null, 2)}`;
      if (isProceduralRenderer(renderer)) {
        renderer.setValue((element as RComment), value);
      } else {
        (element as RComment).textContent = value;
      }
    }
  }
}

/**
 * Consolidates all inputs or outputs of all directives on this logical node.
 *
 * @param tNodeFlags node flags
 * @param direction whether to consider inputs or outputs
 * @returns PropertyAliases|null aggregate of all properties if any, `null` otherwise
 */
function generatePropertyAliases(tNode: TNode, direction: BindingDirection): PropertyAliases|null {
  const tView = getLView()[TVIEW];
  let propStore: PropertyAliases|null = null;
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;

  if (end > start) {
    const isInput = direction === BindingDirection.Input;
    const defs = tView.data;

    for (let i = start; i < end; i++) {
      const directiveDef = defs[i] as DirectiveDef<any>;
      const publicToMinifiedNames: {[publicName: string]: string} =
          isInput ? directiveDef.inputs : directiveDef.outputs;
      const publicToDeclaredNames: {[publicName: string]: string}|null =
          isInput ? directiveDef.declaredInputs : null;
      for (let publicName in publicToMinifiedNames) {
        if (publicToMinifiedNames.hasOwnProperty(publicName)) {
          propStore = propStore || {};
          const minifiedName = publicToMinifiedNames[publicName];
          const declaredName =
              publicToDeclaredNames ? publicToDeclaredNames[publicName] : minifiedName;
          const aliases: PropertyAliasValue = propStore.hasOwnProperty(publicName) ?
              propStore[publicName] :
              propStore[publicName] = [];
          aliases.push(i, minifiedName, declaredName);
        }
      }
    }
  }
  return propStore;
}

/**
 * Assign any inline style values to the element during creation mode.
 *
 * This instruction is meant to be called during creation mode to register all
 * dynamic style and class bindings on the element. Note for static values (no binding)
 * see `elementStart` and `elementHostAttrs`.
 *
 * @param classBindingNames An array containing bindable class names.
 *        The `elementClassProp` refers to the class name by index in this array.
 *        (i.e. `['foo', 'bar']` means `foo=0` and `bar=1`).
 * @param styleBindingNames An array containing bindable style properties.
 *        The `elementStyleProp` refers to the class name by index in this array.
 *        (i.e. `['width', 'height']` means `width=0` and `height=1`).
 * @param styleSanitizer An optional sanitizer function that will be used to sanitize any CSS
 *        property values that are applied to the element (during rendering).
 *        Note that the sanitizer instance itself is tied to the `directive` (if  provided).
 * @param directive A directive instance the styling is associated with. If not provided
 *        current view's controller instance is assumed.
 *
 * @publicApi
 */
export function elementStyling(
    classBindingNames?: string[] | null, styleBindingNames?: string[] | null,
    styleSanitizer?: StyleSanitizeFn | null, directive?: {}): void {
  const tNode = getPreviousOrParentTNode();
  if (!tNode.stylingTemplate) {
    tNode.stylingTemplate = createEmptyStylingContext();
  }
  updateContextWithBindings(
      tNode.stylingTemplate !, directive || null, classBindingNames, styleBindingNames,
      styleSanitizer, hasClassInput(tNode));
}

/**
 * Assign static attribute values to a host element.
 *
 * This instruction will assign static attribute values as well as class and style
 * values to an element within the host bindings function. Since attribute values
 * can consist of different types of values, the `attrs` array must include the values in
 * the following format:
 *
 * attrs = [
 *   // static attributes (like `title`, `name`, `id`...)
 *   attr1, value1, attr2, value,
 *
 *   // a single namespace value (like `x:id`)
 *   NAMESPACE_MARKER, namespaceUri1, name1, value1,
 *
 *   // another single namespace value (like `x:name`)
 *   NAMESPACE_MARKER, namespaceUri2, name2, value2,
 *
 *   // a series of CSS classes that will be applied to the element (no spaces)
 *   CLASSES_MARKER, class1, class2, class3,
 *
 *   // a series of CSS styles (property + value) that will be applied to the element
 *   STYLES_MARKER, prop1, value1, prop2, value2
 * ]
 *
 * All non-class and non-style attributes must be defined at the start of the list
 * first before all class and style values are set. When there is a change in value
 * type (like when classes and styles are introduced) a marker must be used to separate
 * the entries. The marker values themselves are set via entries found in the
 * [AttributeMarker] enum.
 *
 * NOTE: This instruction is meant to used from `hostBindings` function only.
 *
 * @param directive A directive instance the styling is associated with.
 * @param attrs An array of static values (attributes, classes and styles) with the correct marker
 * values.
 *
 * @publicApi
 */
export function elementHostAttrs(directive: any, attrs: TAttributes) {
  const tNode = getPreviousOrParentTNode();
  if (!tNode.stylingTemplate) {
    tNode.stylingTemplate = initializeStaticStylingContext(attrs);
  }
  const lView = getLView();
  const native = getNativeByTNode(tNode, lView) as RElement;
  const i = setUpAttributes(native, attrs);
  patchContextWithStaticAttrs(tNode.stylingTemplate, attrs, i, directive);
}

/**
 * Apply styling binding to the element.
 *
 * This instruction is meant to be run after `elementStyle` and/or `elementStyleProp`.
 * if any styling bindings have changed then the changes are flushed to the element.
 *
 *
 * @param index Index of the element's with which styling is associated.
 * @param directive Directive instance that is attempting to change styling. (Defaults to the
 *        component of the current view).
components
 *
 * @publicApi
 */
export function elementStylingApply(index: number, directive?: any): void {
  const lView = getLView();
  const isFirstRender = (lView[FLAGS] & LViewFlags.FirstLViewPass) !== 0;
  const totalPlayersQueued = renderStyling(
      getStylingContext(index + HEADER_OFFSET, lView), lView[RENDERER], lView, isFirstRender, null,
      null, directive);
  if (totalPlayersQueued > 0) {
    const rootContext = getRootContext(lView);
    scheduleTick(rootContext, RootContextFlags.FlushPlayers);
  }
}

/**
 * Update a style bindings value on an element.
 *
 * If the style value is `null` then it will be removed from the element
 * (or assigned a different value depending if there are any styles placed
 * on the element with `elementStyle` or any styles that are present
 * from when the element was created (with `elementStyling`).
 *
 * (Note that the styling element is updated as part of `elementStylingApply`.)
 *
 * @param index Index of the element's with which styling is associated.
 * @param styleIndex Index of style to update. This index value refers to the
 *        index of the style in the style bindings array that was passed into
 *        `elementStlyingBindings`.
 * @param value New value to write (null to remove). Note that if a directive also
 *        attempts to write to the same binding value then it will only be able to
 *        do so if the template binding value is `null` (or doesn't exist at all).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *        Note that when a suffix is provided then the underlying sanitizer will
 *        be ignored.
 * @param directive Directive instance that is attempting to change styling. (Defaults to the
 *        component of the current view).
components
 *
 * @publicApi
 */
export function elementStyleProp(
    index: number, styleIndex: number, value: string | number | String | PlayerFactory | null,
    suffix?: string | null, directive?: {}): void {
  let valueToAdd: string|null = null;
  if (value !== null) {
    if (suffix) {
      // when a suffix is applied then it will bypass
      // sanitization entirely (b/c a new string is created)
      valueToAdd = renderStringify(value) + suffix;
    } else {
      // sanitization happens by dealing with a String value
      // this means that the string value will be passed through
      // into the style rendering later (which is where the value
      // will be sanitized before it is applied)
      valueToAdd = value as any as string;
    }
  }
  updateElementStyleProp(
      getStylingContext(index + HEADER_OFFSET, getLView()), styleIndex, valueToAdd, directive);
}

/**
 * Add or remove a class via a class binding on a DOM element.
 *
 * This instruction is meant to handle the [class.foo]="exp" case and, therefore,
 * the class itself must already be applied using `elementStyling` within
 * the creation block.
 *
 * @param index Index of the element's with which styling is associated.
 * @param classIndex Index of class to toggle. This index value refers to the
 *        index of the class in the class bindings array that was passed into
 *        `elementStlyingBindings` (which is meant to be called before this
 *        function is).
 * @param value A true/false value which will turn the class on or off.
 * @param directive Directive instance that is attempting to change styling. (Defaults to the
 *        component of the current view).
components
 *
 * @publicApi
 */
export function elementClassProp(
    index: number, classIndex: number, value: boolean | PlayerFactory, directive?: {}): void {
  const onOrOffClassValue =
      (value instanceof BoundPlayerFactory) ? (value as BoundPlayerFactory<boolean>) : (!!value);
  updateElementClassProp(
      getStylingContext(index + HEADER_OFFSET, getLView()), classIndex, onOrOffClassValue,
      directive);
}

/**
 * Update style and/or class bindings using object literal.
 *
 * This instruction is meant apply styling via the `[style]="exp"` and `[class]="exp"` template
 * bindings. When styles are applied to the Element they will then be placed with respect to
 * any styles set with `elementStyleProp`. If any styles are set to `null` then they will be
 * removed from the element.
 *
 * (Note that the styling instruction will not be applied until `elementStylingApply` is called.)
 *
 * @param index Index of the element's with which styling is associated.
 * @param classes A key/value style map of CSS classes that will be added to the given element.
 *        Any missing classes (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's list of CSS classes.
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 * @param directive Directive instance that is attempting to change styling. (Defaults to the
 *        component of the current view).
 *
 * @publicApi
 */
export function elementStylingMap<T>(
    index: number, classes: {[key: string]: any} | string | NO_CHANGE | null,
    styles?: {[styleName: string]: any} | NO_CHANGE | null, directive?: {}): void {
  if (directive != undefined)
    return hackImplementationOfElementStylingMap(
        index, classes, styles, directive);  // supported in next PR
  const lView = getLView();
  const tNode = getTNode(index, lView);
  const stylingContext = getStylingContext(index + HEADER_OFFSET, lView);
  if (hasClassInput(tNode) && classes !== NO_CHANGE) {
    const initialClasses = getInitialClassNameValue(stylingContext);
    const classInputVal =
        (initialClasses.length ? (initialClasses + ' ') : '') + (classes as string);
    setInputsForProperty(lView, tNode.inputs !, 'class', classInputVal);
  } else {
    updateStylingMap(stylingContext, classes, styles);
  }
}

/* START OF HACK BLOCK */
function hackImplementationOfElementStylingMap<T>(
    index: number, classes: {[key: string]: any} | string | NO_CHANGE | null,
    styles?: {[styleName: string]: any} | NO_CHANGE | null, directive?: {}): void {
  throw new Error('unimplemented. Should not be needed by ViewEngine compatibility');
}
/* END OF HACK BLOCK */

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
  const lView = getLView();
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], lView[TVIEW].bindingStartIndex,
                   'text nodes should be created before any bindings');
  ngDevMode && ngDevMode.rendererCreateTextNode++;
  const textNative = createTextNode(value, lView[RENDERER]);
  const tNode = createNodeAtIndex(index, TNodeType.Element, textNative, null, null);

  // Text nodes are self closing.
  setIsParent(false);
  appendChild(textNative, tNode, lView);
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
    const lView = getLView();
    ngDevMode && assertDataInRange(lView, index + HEADER_OFFSET);
    const element = getNativeByIndex(index, lView) as any as RText;
    ngDevMode && assertDefined(element, 'native element should exist');
    ngDevMode && ngDevMode.rendererSetText++;
    const renderer = lView[RENDERER];
    isProceduralRenderer(renderer) ? renderer.setValue(element, renderStringify(value)) :
                                     element.textContent = renderStringify(value);
  }
}

//////////////////////////
//// Directive
//////////////////////////

/**
 * Instantiate a root component.
 */
export function instantiateRootComponent<T>(
    tView: TView, viewData: LView, def: ComponentDef<T>): T {
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
    tView: TView, viewData: LView, directives: DirectiveDef<any>[] | null, tNode: TNode,
    localRefs: string[] | null): void {
  // Please make sure to have explicit type for `exportsMap`. Inferred type triggers bug in tsickle.
  ngDevMode && assertEqual(getFirstTemplatePass(), true, 'should run on first template pass only');
  const exportsMap: ({[key: string]: number} | null) = localRefs ? {'': -1} : null;
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

      saveNameToExportMap(tView.data !.length - 1, def, exportsMap);

      // Init hooks are queued now so ngOnInit is called in host components before
      // any projected components.
      registerPreOrderHooks(directiveDefIdx, def, tView);
    }
  }
  if (exportsMap) cacheMatchingLocalNames(tNode, localRefs, exportsMap);
}

/**
 * Instantiate all the directives that were previously resolved on the current node.
 */
function instantiateAllDirectives(tView: TView, lView: LView, tNode: TNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  if (!getFirstTemplatePass() && start < end) {
    getOrCreateNodeInjectorForNode(
        tNode as TElementNode | TContainerNode | TElementContainerNode, lView);
  }
  for (let i = start; i < end; i++) {
    const def = tView.data[i] as DirectiveDef<any>;
    if (isComponentDef(def)) {
      addComponentLogic(lView, tNode, def as ComponentDef<any>);
    }
    const directive = getNodeInjectable(tView.data, lView !, i, tNode as TElementNode);

    postProcessDirective(lView, directive, def, i);
  }
}

function invokeDirectivesHostBindings(tView: TView, viewData: LView, tNode: TNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  const expando = tView.expandoInstructions !;
  const firstTemplatePass = getFirstTemplatePass();
  for (let i = start; i < end; i++) {
    const def = tView.data[i] as DirectiveDef<any>;
    const directive = unwrapOnChangesDirectiveWrapper(viewData[i]);
    if (def.hostBindings) {
      const previousExpandoLength = expando.length;
      setCurrentDirectiveDef(def);
      def.hostBindings !(RenderFlags.Create, directive, tNode.index - HEADER_OFFSET);
      setCurrentDirectiveDef(null);
      // `hostBindings` function may or may not contain `allocHostVars` call
      // (e.g. it may not if it only contains host listeners), so we need to check whether
      // `expandoInstructions` has changed and if not - we still push `hostBindings` to
      // expando block, to make sure we execute it for DI cycle
      if (previousExpandoLength === expando.length && firstTemplatePass) {
        expando.push(def.hostBindings);
      }
    } else if (firstTemplatePass) {
      expando.push(null);
    }
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
function prefillHostVars(tView: TView, lView: LView, totalHostVars: number): void {
  ngDevMode &&
      assertEqual(getFirstTemplatePass(), true, 'Should only be called in first template pass.');
  for (let i = 0; i < totalHostVars; i++) {
    lView.push(NO_CHANGE);
    tView.blueprint.push(NO_CHANGE);
    tView.data.push(null);
  }
}

/**
 * Process a directive on the current node after its creation.
 */
function postProcessDirective<T>(
    lView: LView, directive: T, def: DirectiveDef<T>, directiveDefIdx: number): void {
  if (def.onChanges) {
    // We have onChanges, wrap it so that we can track changes.
    lView[directiveDefIdx] = new OnChangesDirectiveWrapper(lView[directiveDefIdx]);
  }

  const previousOrParentTNode = getPreviousOrParentTNode();
  postProcessBaseDirective(lView, previousOrParentTNode, directive, def);
  ngDevMode && assertDefined(previousOrParentTNode, 'previousOrParentTNode');
  if (previousOrParentTNode && previousOrParentTNode.attrs) {
    setInputsFromAttrs(lView, directiveDefIdx, def, previousOrParentTNode);
  }

  if (def.contentQueries) {
    def.contentQueries(directiveDefIdx);
  }

  if (isComponentDef(def)) {
    const componentView = getComponentViewByIndex(previousOrParentTNode.index, lView);
    componentView[CONTEXT] = directive;
  }
}

/**
 * A lighter version of postProcessDirective() that is used for the root component.
 */
function postProcessBaseDirective<T>(
    lView: LView, previousOrParentTNode: TNode, directive: T, def: DirectiveDef<T>): void {
  const native = getNativeByTNode(previousOrParentTNode, lView);

  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], lView[TVIEW].bindingStartIndex,
                   'directives should be created before any bindings');
  ngDevMode && assertPreviousIsParent(getIsParent());

  attachPatchData(directive, lView);
  if (native) {
    attachPatchData(native, lView);
  }
}



/**
* Matches the current node against all available selectors.
* If a component is matched (at most one), it is returned in first position in the array.
*/
function findDirectiveMatches(tView: TView, viewData: LView, tNode: TNode): DirectiveDef<any>[]|
    null {
  ngDevMode && assertEqual(getFirstTemplatePass(), true, 'should run on first template pass only');
  const registry = tView.directiveRegistry;
  let matches: any[]|null = null;
  if (registry) {
    for (let i = 0; i < registry.length; i++) {
      const def = registry[i] as ComponentDef<any>| DirectiveDef<any>;
      if (isNodeMatchingSelectorList(tNode, def.selectors !, /* isProjectionMode */ false)) {
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
  const tView = getLView()[TVIEW];
  (tView.components || (tView.components = [])).push(previousOrParentTNode.index);
}

/**
 * Stores host binding fn and number of host vars so it will be queued for binding refresh during
 * CD.
*/
function queueHostBindingForCheck(
    tView: TView, def: DirectiveDef<any>| ComponentDef<any>, hostVars: number): void {
  ngDevMode &&
      assertEqual(getFirstTemplatePass(), true, 'Should only be called in first template pass.');
  const expando = tView.expandoInstructions !;
  const length = expando.length;
  // Check whether a given `hostBindings` function already exists in expandoInstructions,
  // which can happen in case directive definition was extended from base definition (as a part of
  // the `InheritDefinitionFeature` logic). If we found the same `hostBindings` function in the
  // list, we just increase the number of host vars associated with that function, but do not add it
  // into the list again.
  if (length >= 2 && expando[length - 2] === def.hostBindings) {
    expando[length - 1] = (expando[length - 1] as number) + hostVars;
  } else {
    expando.push(def.hostBindings !, hostVars);
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
    index: number, def: DirectiveDef<any>| ComponentDef<any>,
    exportsMap: {[key: string]: number} | null) {
  if (exportsMap) {
    if (def.exportAs) {
      for (let i = 0; i < def.exportAs.length; i++) {
        exportsMap[def.exportAs[i]] = index;
      }
    }
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
                   numberOfDirectives, tNode.directiveEnd - tNode.directiveStart,
                   'Reached the max number of directives');
  // When the first directive is created on a node, save the index
  tNode.flags = flags & TNodeFlags.isComponent;
  tNode.directiveStart = index;
  tNode.directiveEnd = index + numberOfDirectives;
  tNode.providerIndexes = index;
}

function baseResolveDirective<T>(
    tView: TView, viewData: LView, def: DirectiveDef<T>,
    directiveFactory: (t: Type<T>| null) => any) {
  tView.data.push(def);
  const nodeInjectorFactory =
      new NodeInjectorFactory(directiveFactory, isComponentDef(def), false, null);
  tView.blueprint.push(nodeInjectorFactory);
  viewData.push(nodeInjectorFactory);
}

function addComponentLogic<T>(
    lView: LView, previousOrParentTNode: TNode, def: ComponentDef<T>): void {
  const native = getNativeByTNode(previousOrParentTNode, lView);

  const tView = getOrCreateTView(
      def.template, def.consts, def.vars, def.directiveDefs, def.pipeDefs, def.viewQuery);

  // Only component views should be added to the view tree directly. Embedded views are
  // accessed through their containers because they may be removed / re-added later.
  const rendererFactory = lView[RENDERER_FACTORY];
  const componentView = addToViewTree(
      lView, previousOrParentTNode.index as number,
      createLView(
          lView, tView, null, def.onPush ? LViewFlags.Dirty : LViewFlags.CheckAlways,
          rendererFactory, lView[RENDERER_FACTORY].createRenderer(native as RElement, def)));

  componentView[HOST_NODE] = previousOrParentTNode as TElementNode;

  // Component view will always be created before any injected LContainers,
  // so this is a regular element, wrap it with the component view
  componentView[HOST] = lView[previousOrParentTNode.index];
  lView[previousOrParentTNode.index] = componentView;

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
    lView: LView, directiveIndex: number, def: DirectiveDef<any>, tNode: TNode): void {
  let initialInputData = tNode.initialInputs as InitialInputData | undefined;
  if (initialInputData === undefined || directiveIndex >= initialInputData.length) {
    initialInputData = generateInitialInputs(directiveIndex, def, tNode);
  }

  const initialInputs: InitialInputs|null = initialInputData[directiveIndex];
  if (initialInputs) {
    const directiveOrWrappedDirective = lView[directiveIndex];

    for (let i = 0; i < initialInputs.length;) {
      const privateName = initialInputs[i++];
      const declaredName = initialInputs[i++];
      const attrValue = initialInputs[i++];
      recordChangeAndUpdateProperty(
          directiveOrWrappedDirective, declaredName, privateName, attrValue);
    }
  }
}

/**
 * Checks to see if the instanced passed as `directiveOrWrappedDirective` is wrapped in {@link
 * OnChangesDirectiveWrapper} or not.
 * If it is, it will update the related {@link SimpleChanges} object with the change to signal
 * `ngOnChanges` hook
 * should fire, then it will unwrap the instance. After that, it will set the property with the key
 * provided
 * in `privateName` on the instance with the passed value.
 * @param directiveOrWrappedDirective The directive instance or a directive instance wrapped in
 * {@link OnChangesDirectiveWrapper}
 * @param declaredName The original, declared name of the property to update.
 * @param privateName The private, possibly minified name of the property to update.
 * @param value The value to update the property with.
 */
function recordChangeAndUpdateProperty<T, K extends keyof T>(
    directiveOrWrappedDirective: OnChangesDirectiveWrapper<T>| T, declaredName: string,
    privateName: K, value: any) {
  let instance: T;
  if (isOnChangesDirectiveWrapper(directiveOrWrappedDirective)) {
    instance = unwrapOnChangesDirectiveWrapper(directiveOrWrappedDirective);
    recordChange(directiveOrWrappedDirective, declaredName, value);
  } else {
    instance = directiveOrWrappedDirective;
  }
  instance[privateName] = value;
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
    directiveIndex: number, directiveDef: DirectiveDef<any>, tNode: TNode): InitialInputData {
  const initialInputData: InitialInputData = tNode.initialInputs || (tNode.initialInputs = []);
  initialInputData[directiveIndex] = null;

  const attrs = tNode.attrs !;
  let i = 0;
  while (i < attrs.length) {
    const attrName = attrs[i];
    // If we hit Select-Only, Classes or Styles, we're done anyway. None of those are valid inputs.
    if (attrName === AttributeMarker.SelectOnly || attrName === AttributeMarker.Classes ||
        attrName === AttributeMarker.Styles)
      break;
    if (attrName === AttributeMarker.NamespaceURI) {
      // We do not allow inputs on namespaced attributes.
      i += 4;
      continue;
    }
    const privateName = directiveDef.inputs[attrName];
    const declaredName = directiveDef.declaredInputs[attrName];
    const attrValue = attrs[i + 1];

    if (privateName !== undefined) {
      const inputsToStore: InitialInputs =
          initialInputData[directiveIndex] || (initialInputData[directiveIndex] = []);
      inputsToStore.push(privateName, declaredName, attrValue as string);
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
    hostNative: RElement | RComment, currentView: LView, native: RComment,
    isForViewContainerRef?: boolean): LContainer {
  return [
    isForViewContainerRef ? -1 : 0,  // active index
    [],                              // views
    currentView,                     // parent
    null,                            // next
    null,                            // queries
    hostNative,                      // host native
    native,                          // native
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
  const lView = getLView();
  const tView = lView[TVIEW];
  // TODO: consider a separate node type for templates
  const tNode = containerInternal(index, tagName || null, attrs || null);

  if (getFirstTemplatePass()) {
    tNode.tViews = createTView(
        -1, templateFn, consts, vars, tView.directiveRegistry, tView.pipeRegistry, null);
  }

  createDirectivesAndLocals(tView, lView, localRefs, localRefExtractor);
  const currentQueries = lView[QUERIES];
  const previousOrParentTNode = getPreviousOrParentTNode();
  const native = getNativeByTNode(previousOrParentTNode, lView);
  attachPatchData(native, lView);
  if (currentQueries) {
    lView[QUERIES] = currentQueries.addNode(previousOrParentTNode as TContainerNode);
  }
  registerPostOrderHooks(tView, tNode);
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
  const lView = getLView();
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], lView[TVIEW].bindingStartIndex,
                   'container nodes should be created before any bindings');

  const adjustedIndex = index + HEADER_OFFSET;
  const comment = lView[RENDERER].createComment(ngDevMode ? 'container' : '');
  ngDevMode && ngDevMode.rendererCreateComment++;
  const tNode = createNodeAtIndex(index, TNodeType.Container, comment, tagName, attrs);
  const lContainer = lView[adjustedIndex] = createLContainer(lView[adjustedIndex], lView, comment);

  appendChild(comment, tNode, lView);

  // Containers are added to the current view tree instead of their embedded views
  // because views can be removed and re-inserted.
  addToViewTree(lView, index + HEADER_OFFSET, lContainer);

  const currentQueries = lView[QUERIES];
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
  const lView = getLView();
  const tView = lView[TVIEW];
  let previousOrParentTNode = loadInternal(tView.data, index) as TNode;
  setPreviousOrParentTNode(previousOrParentTNode);

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);
  setIsParent(true);

  lView[index + HEADER_OFFSET][ACTIVE_INDEX] = 0;

  // We need to execute init hooks here so ngOnInit hooks are called in top level views
  // before they are called in embedded views (for backwards compatibility).
  executeInitHooks(lView, tView, getCheckNoChangesMode());
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
    ngDevMode && assertHasParent(previousOrParentTNode);
    previousOrParentTNode = previousOrParentTNode.parent !;
    setPreviousOrParentTNode(previousOrParentTNode);
  }

  ngDevMode && assertNodeType(previousOrParentTNode, TNodeType.Container);

  const lContainer = getLView()[previousOrParentTNode.index];
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
function refreshDynamicEmbeddedViews(lView: LView) {
  for (let current = getLViewChild(lView); current !== null; current = current[NEXT]) {
    // Note: current can be an LView or an LContainer instance, but here we are only interested
    // in LContainer. We can tell it's an LContainer because its length is less than the LView
    // header.
    if (current.length < HEADER_OFFSET && current[ACTIVE_INDEX] === -1) {
      const container = current as LContainer;
      for (let i = 0; i < container[VIEWS].length; i++) {
        const dynamicViewData = container[VIEWS][i];
        // The directives and pipes are not needed here as an existing view is only being refreshed.
        ngDevMode && assertDefined(dynamicViewData[TVIEW], 'TView must be allocated');
        renderEmbeddedTemplate(dynamicViewData, dynamicViewData[TVIEW], dynamicViewData[CONTEXT] !);
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
    viewBlockId: number): LView|null {
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
  const lView = getLView();
  const previousOrParentTNode = getPreviousOrParentTNode();
  // The previous node can be a view node if we are processing an inline for loop
  const containerTNode = previousOrParentTNode.type === TNodeType.View ?
      previousOrParentTNode.parent ! :
      previousOrParentTNode;
  const lContainer = lView[containerTNode.index] as LContainer;

  ngDevMode && assertNodeType(containerTNode, TNodeType.Container);
  let viewToRender = scanForView(
      lContainer, containerTNode as TContainerNode, lContainer[ACTIVE_INDEX] !, viewBlockId);

  if (viewToRender) {
    setIsParent(true);
    enterView(viewToRender, viewToRender[TVIEW].node);
  } else {
    // When we create a new LView, we always reset the state of the instructions.
    viewToRender = createLView(
        lView,
        getOrCreateEmbeddedTView(viewBlockId, consts, vars, containerTNode as TContainerNode), null,
        LViewFlags.CheckAlways);

    if (lContainer[QUERIES]) {
      viewToRender[QUERIES] = lContainer[QUERIES] !.createView();
    }

    createViewNode(viewBlockId, viewToRender);
    enterView(viewToRender, viewToRender[TVIEW].node);
  }
  if (lContainer) {
    if (isCreationMode(viewToRender)) {
      // it is a new view, insert it into collection of views for a given container
      insertView(viewToRender, lContainer, lView, lContainer[ACTIVE_INDEX] !, -1);
    }
    lContainer[ACTIVE_INDEX] !++;
  }
  return isCreationMode(viewToRender) ? RenderFlags.Create | RenderFlags.Update :
                                        RenderFlags.Update;
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
  const tView = getLView()[TVIEW];
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
  const lView = getLView();
  const viewHost = lView[HOST_NODE];

  if (isCreationMode(lView)) {
    refreshDescendantViews(lView);  // creation mode pass
    lView[FLAGS] &= ~LViewFlags.CreationMode;
  }
  refreshDescendantViews(lView);  // update mode pass
  leaveView(lView[PARENT] !);
  setPreviousOrParentTNode(viewHost !);
  setIsParent(false);
}

/////////////

/**
 * Refreshes components by entering the component view and processing its bindings, queries, etc.
 *
 * @param adjustedElementIndex  Element index in LView[] (adjusted for HEADER_OFFSET)
 */
export function componentRefresh<T>(adjustedElementIndex: number): void {
  const lView = getLView();
  ngDevMode && assertDataInRange(lView, adjustedElementIndex);
  const hostView = getComponentViewByIndex(adjustedElementIndex, lView);
  ngDevMode && assertNodeType(lView[TVIEW].data[adjustedElementIndex] as TNode, TNodeType.Element);

  // Only attached CheckAlways components or attached, dirty OnPush components should be checked
  if (viewAttached(hostView) && hostView[FLAGS] & (LViewFlags.CheckAlways | LViewFlags.Dirty)) {
    syncViewWithBlueprint(hostView);
    checkView(hostView, hostView[CONTEXT]);
  }
}

/**
 * Syncs an LView instance with its blueprint if they have gotten out of sync.
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
 * 2. First <comp> is matched as a component and its LView is created.
 * 3. Second <comp> is matched as a component and its LView is created.
 * 4. App template completes processing, so it's time to check child templates.
 * 5. First <comp> template is checked. It has a directive, so its def is pushed to blueprint.
 * 6. Second <comp> template is checked. Its blueprint has been updated by the first
 * <comp> template, but its LView was created before this update, so it is out of sync.
 *
 * Note that embedded views inside ngFor loops will never be out of sync because these views
 * are processed as soon as they are created.
 *
 * @param componentView The view to sync
 */
function syncViewWithBlueprint(componentView: LView) {
  const componentTView = componentView[TVIEW];
  for (let i = componentView.length; i < componentTView.blueprint.length; i++) {
    componentView[i] = componentTView.blueprint[i];
  }
}

/** Returns a boolean for whether the view is attached */
export function viewAttached(view: LView): boolean {
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
  const componentNode = findComponentView(getLView())[HOST_NODE] as TElementNode;

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
      }
      componentChild.next = null;
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
const projectionNodeStack: (LView | TNode)[] = [];

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
  const lView = getLView();
  const tProjectionNode =
      createNodeAtIndex(nodeIndex, TNodeType.Projection, null, null, attrs || null);

  // We can't use viewData[HOST_NODE] because projection nodes can be nested in embedded views.
  if (tProjectionNode.projection === null) tProjectionNode.projection = selectorIndex;

  // `<ng-content>` has no content
  setIsParent(false);

  // re-distribution of projectable nodes is stored on a component's view level
  const componentView = findComponentView(lView);
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
      appendProjectedNode(nodeToProject, tProjectionNode, lView, projectedView);
    }

    // If we are finished with a list of re-projected nodes, we need to get
    // back to the root projection node that was re-projected.
    if (nodeToProject.next === null && projectedView !== componentView[PARENT] !) {
      projectedView = projectionNodeStack[projectionNodeIndex--] as LView;
      nodeToProject = projectionNodeStack[projectionNodeIndex--] as TNode;
    }
    nodeToProject = nodeToProject.next;
  }
}

/**
 * Adds LView or LContainer to the end of the current view tree.
 *
 * This structure will be used to traverse through nested views to remove listeners
 * and call onDestroy callbacks.
 *
 * @param lView The view where LView or LContainer should be added
 * @param adjustedHostIndex Index of the view's host node in LView[], adjusted for header
 * @param state The LView or LContainer to add to the view tree
 * @returns The state passed in
 */
export function addToViewTree<T extends LView|LContainer>(
    lView: LView, adjustedHostIndex: number, state: T): T {
  const tView = lView[TVIEW];
  const firstTemplatePass = getFirstTemplatePass();
  if (lView[TAIL]) {
    lView[TAIL] ![NEXT] = state;
  } else if (firstTemplatePass) {
    tView.childIndex = adjustedHostIndex;
  }
  lView[TAIL] = state;
  return state;
}

///////////////////////////////
//// Change detection
///////////////////////////////

/** If node is an OnPush component, marks its LView dirty. */
function markDirtyIfOnPush(lView: LView, viewIndex: number): void {
  const childComponentLView = getComponentViewByIndex(viewIndex, lView);
  if (!(childComponentLView[FLAGS] & LViewFlags.CheckAlways)) {
    childComponentLView[FLAGS] |= LViewFlags.Dirty;
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

/**
 * Marks current view and all ancestors dirty.
 *
 * Returns the root view because it is found as a byproduct of marking the view tree
 * dirty, and can be used by methods that consume markViewDirty() to easily schedule
 * change detection. Otherwise, such methods would need to traverse up the view tree
 * an additional time to get the root view and schedule a tick on it.
 *
 * @param lView The starting LView to mark dirty
 * @returns the root LView
 */
export function markViewDirty(lView: LView): LView {
  while (lView && !(lView[FLAGS] & LViewFlags.IsRoot)) {
    lView[FLAGS] |= LViewFlags.Dirty;
    lView = lView[PARENT] !;
  }
  lView[FLAGS] |= LViewFlags.Dirty;
  return lView;
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
    renderComponentOrTemplate(readPatchedLView(rootComponent) !, rootComponent);
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
  const view = getComponentViewByInstance(component) !;
  detectChangesInternal<T>(view, component);
}

export function detectChangesInternal<T>(view: LView, context: T) {
  const rendererFactory = view[RENDERER_FACTORY];

  if (rendererFactory.begin) rendererFactory.begin();

  if (isCreationMode(view)) {
    checkView(view, context);  // creation mode pass
  }
  checkView(view, context);  // update mode pass

  if (rendererFactory.end) rendererFactory.end();
}

/**
 * Synchronously perform change detection on a root view and its components.
 *
 * @param lView The view which the change detection should be performed on.
 */
export function detectChangesInRootView(lView: LView): void {
  tickRootContext(lView[CONTEXT] as RootContext);
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
 * @param lView The view which the change detection should be checked on.
 */
export function checkNoChangesInRootView(lView: LView): void {
  setCheckNoChangesMode(true);
  try {
    detectChangesInRootView(lView);
  } finally {
    setCheckNoChangesMode(false);
  }
}

/** Checks the view of the component provided. Does not gate on dirty checks or execute doCheck. */
export function checkView<T>(hostView: LView, component: T) {
  const hostTView = hostView[TVIEW];
  const oldView = enterView(hostView, hostView[HOST_NODE]);
  const templateFn = hostTView.template !;
  const viewQuery = hostTView.viewQuery;

  try {
    namespaceHTML();
    invokeViewQueryCreate(viewQuery, hostView, component);
    templateFn(getRenderFlags(hostView), component);
    refreshDescendantViews(hostView);
    invokeViewQueryUpdate(viewQuery, hostView, component);
  } finally {
    leaveView(oldView);
  }
}

function invokeViewQueryCreate<T>(
    viewQuery: ComponentQuery<{}>| null, view: LView, component: T): void {
  if (viewQuery && isCreationMode(view)) {
    setCurrentViewQueryIndex(view[TVIEW].viewQueryStartIndex);
    viewQuery(RenderFlags.Create, component);
  }
}

function invokeViewQueryUpdate<T>(
    viewQuery: ComponentQuery<{}>| null, view: LView, component: T): void {
  if (viewQuery && !isCreationMode(view)) {
    setCurrentViewQueryIndex(view[TVIEW].viewQueryStartIndex);
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
 *
 * @publicApi
 */
export function markDirty<T>(component: T) {
  ngDevMode && assertDefined(component, 'component');
  const rootView = markViewDirty(getComponentViewByInstance(component));

  ngDevMode && assertDefined(rootView[CONTEXT], 'rootContext should be defined');
  scheduleTick(rootView[CONTEXT] as RootContext, RootContextFlags.DetectChanges);
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
  const lView = getLView();
  return bindingUpdated(lView, lView[BINDING_INDEX]++, value) ? value : NO_CHANGE;
}

/**
 * Allocates the necessary amount of slots for host vars.
 *
 * @param count Amount of vars to be allocated
 */
export function allocHostVars(count: number): void {
  if (!getFirstTemplatePass()) return;
  const lView = getLView();
  const tView = lView[TVIEW];
  queueHostBindingForCheck(tView, getCurrentDirectiveDef() !, count);
  prefillHostVars(tView, lView, count);
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
  const lView = getLView();

  let bindingIndex = lView[BINDING_INDEX];
  for (let i = 1; i < values.length; i += 2) {
    // Check if bindings (odd indexes) have changed
    bindingUpdated(lView, bindingIndex++, values[i]) && (different = true);
  }
  lView[BINDING_INDEX] = bindingIndex;

  if (!different) {
    return NO_CHANGE;
  }

  // Build the updated content
  let content = values[0];
  for (let i = 1; i < values.length; i += 2) {
    content += renderStringify(values[i]) + values[i + 1];
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
  const lView = getLView();
  const different = bindingUpdated(lView, lView[BINDING_INDEX], v0);
  lView[BINDING_INDEX] += 1;
  return different ? prefix + renderStringify(v0) + suffix : NO_CHANGE;
}

/** Creates an interpolation binding with 2 expressions. */
export function interpolation2(
    prefix: string, v0: any, i0: string, v1: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const different = bindingUpdated2(lView, lView[BINDING_INDEX], v0, v1);
  lView[BINDING_INDEX] += 2;

  return different ? prefix + renderStringify(v0) + i0 + renderStringify(v1) + suffix : NO_CHANGE;
}

/** Creates an interpolation binding with 3 expressions. */
export function interpolation3(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix: string): string|
    NO_CHANGE {
  const lView = getLView();
  const different = bindingUpdated3(lView, lView[BINDING_INDEX], v0, v1, v2);
  lView[BINDING_INDEX] += 3;

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + suffix :
      NO_CHANGE;
}

/** Create an interpolation binding with 4 expressions. */
export function interpolation4(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const different = bindingUpdated4(lView, lView[BINDING_INDEX], v0, v1, v2, v3);
  lView[BINDING_INDEX] += 4;

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 5 expressions. */
export function interpolation5(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated(lView, bindingIndex + 4, v4) || different;
  lView[BINDING_INDEX] += 5;

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 6 expressions. */
export function interpolation6(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated2(lView, bindingIndex + 4, v4, v5) || different;
  lView[BINDING_INDEX] += 6;

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 7 expressions. */
export function interpolation7(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix: string): string|
    NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated3(lView, bindingIndex + 4, v4, v5, v6) || different;
  lView[BINDING_INDEX] += 7;

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 +
          renderStringify(v6) + suffix :
      NO_CHANGE;
}

/** Creates an interpolation binding with 8 expressions. */
export function interpolation8(
    prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any,
    i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any,
    suffix: string): string|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX];
  let different = bindingUpdated4(lView, bindingIndex, v0, v1, v2, v3);
  different = bindingUpdated4(lView, bindingIndex + 4, v4, v5, v6, v7) || different;
  lView[BINDING_INDEX] += 8;

  return different ?
      prefix + renderStringify(v0) + i0 + renderStringify(v1) + i1 + renderStringify(v2) + i2 +
          renderStringify(v3) + i3 + renderStringify(v4) + i4 + renderStringify(v5) + i5 +
          renderStringify(v6) + i6 + renderStringify(v7) + suffix :
      NO_CHANGE;
}

/** Store a value in the `data` at a given `index`. */
export function store<T>(index: number, value: T): void {
  const lView = getLView();
  const tView = lView[TVIEW];
  // We don't store any static data for local variables, so the first time
  // we see the template, we should store as null to avoid a sparse array
  const adjustedIndex = index + HEADER_OFFSET;
  if (adjustedIndex >= tView.data.length) {
    tView.data[adjustedIndex] = null;
  }
  lView[adjustedIndex] = value;
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
  const contextLView = getContextLView();
  return loadInternal<T>(contextLView, index);
}

export function loadQueryList<T>(queryListIdx: number): QueryList<T> {
  const lView = getLView();
  ngDevMode &&
      assertDefined(
          lView[CONTENT_QUERIES], 'Content QueryList array should be defined if reading a query.');
  ngDevMode && assertDataInRange(lView[CONTENT_QUERIES] !, queryListIdx);

  return lView[CONTENT_QUERIES] ![queryListIdx];
}

/** Retrieves a value from current `viewData`. */
export function load<T>(index: number): T {
  return loadInternal<T>(getLView(), index);
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
      getLView(), token, flags);
}

/**
 * Facade for the attribute injection from DI.
 */
export function injectAttribute(attrNameToInject: string): string|null {
  return injectAttributeImpl(getPreviousOrParentTNode(), attrNameToInject);
}

/**
 * Registers a QueryList, associated with a content query, for later refresh (part of a view
 * refresh).
 */
export function registerContentQuery<Q>(
    queryList: QueryList<Q>, currentDirectiveIndex: number): void {
  const viewData = getLView();
  const tView = viewData[TVIEW];
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

/**
 * Creates new QueryList, stores the reference in LView and returns QueryList.
 *
 * @param predicate The type for which the query will search
 * @param descend Whether or not to descend into children
 * @param read What to save in the query
 * @returns QueryList<T>
 */
export function createViewQuery<T>(
    // TODO: "read" should be an AbstractType (FW-486)
    predicate: Type<any>| string[], descend?: boolean, read?: any): QueryList<T> {
  const lView = getLView();
  const tView = lView[TVIEW];
  if (tView.firstTemplatePass) {
    tView.expandoStartIndex++;
  }
  const index = getCurrentViewQueryIndex();
  const viewQuery: QueryList<T> = query<T>(predicate, descend, read);
  store(index, viewQuery);
  setCurrentViewQueryIndex(index + 1);
  return viewQuery;
}

/**
 * Loads current View Query and moves the pointer/index to the next View Query in LView.
 */
export function loadViewQuery<T>(): T {
  const index = getCurrentViewQueryIndex();
  setCurrentViewQueryIndex(index + 1);
  return load<T>(index);
}

export const CLEAN_PROMISE = _CLEAN_PROMISE;

function initializeTNodeInputs(tNode: TNode | null): PropertyAliases|null {
  // If tNode.inputs is undefined, a listener has created outputs, but inputs haven't
  // yet been checked.
  if (tNode) {
    if (tNode.inputs === undefined) {
      // mark inputs as checked
      tNode.inputs = generatePropertyAliases(tNode, BindingDirection.Input);
    }
    return tNode.inputs;
  }
  return null;
}


/**
 * Returns the current OpaqueViewState instance.
 *
 * Used in conjunction with the restoreView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 */
export function getCurrentView(): OpaqueViewState {
  return getLView() as any as OpaqueViewState;
}

/**
 * There are cases where the sub component's renderer needs to be included
 * instead of the current renderer (see the componentSyntheticHost* instructions).
 */
function loadComponentRenderer(tNode: TNode, lView: LView): Renderer3 {
  const componentLView = lView[tNode.index] as LView;
  return componentLView[RENDERER];
}