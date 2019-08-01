/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injector} from '../../di';
import {ErrorHandler} from '../../error_handler';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SchemaMetadata} from '../../metadata/schema';
import {validateAgainstEventAttributes, validateAgainstEventProperties} from '../../sanitization/sanitization';
import {Sanitizer} from '../../sanitization/security';
import {assertDataInRange, assertDefined, assertDomNode, assertEqual, assertGreaterThan, assertNotEqual, assertNotSame} from '../../util/assert';
import {createNamedArrayType} from '../../util/named_array_type';
import {normalizeDebugBindingName, normalizeDebugBindingValue} from '../../util/ng_reflect';
import {assertFirstTemplatePass, assertLView} from '../assert';
import {attachPatchData, getComponentViewByInstance} from '../context_discovery';
import {diPublicInInjector, getNodeInjectable, getOrCreateNodeInjectorForNode} from '../di';
import {throwMultipleComponentError} from '../errors';
import {executeHooks, executePreOrderHooks, registerPreOrderHooks} from '../hooks';
import {ACTIVE_INDEX, CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {ComponentDef, ComponentTemplate, DirectiveDef, DirectiveDefListOrFactory, FactoryFn, PipeDefListOrFactory, RenderFlags, ViewQueriesFunction} from '../interfaces/definition';
import {INJECTOR_BLOOM_PARENT_SIZE, NodeInjectorFactory} from '../interfaces/injector';
import {AttributeMarker, InitialInputData, InitialInputs, LocalRefExtractor, PropertyAliasValue, PropertyAliases, TAttributes, TContainerNode, TElementContainerNode, TElementNode, TIcuContainerNode, TNode, TNodeFlags, TNodeProviderIndexes, TNodeType, TProjectionNode, TViewNode} from '../interfaces/node';
import {RComment, RElement, RText, Renderer3, RendererFactory3, isProceduralRenderer} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {isComponent, isComponentDef, isContentQueryHost, isLContainer, isRootView} from '../interfaces/type_checks';
import {BINDING_INDEX, CHILD_HEAD, CHILD_TAIL, CLEANUP, CONTEXT, DECLARATION_VIEW, ExpandoInstructions, FLAGS, HEADER_OFFSET, HOST, INJECTOR, InitPhaseState, LView, LViewFlags, NEXT, PARENT, RENDERER, RENDERER_FACTORY, RootContext, RootContextFlags, SANITIZER, TData, TVIEW, TView, T_HOST} from '../interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from '../node_assert';
import {isNodeMatchingSelectorList} from '../node_selector_matcher';
import {enterView, getBindingsEnabled, getCheckNoChangesMode, getIsParent, getLView, getNamespace, getPreviousOrParentTNode, getSelectedIndex, incrementActiveDirectiveId, isCreationMode, leaveView, namespaceHTMLInternal, setActiveHostElement, setBindingRoot, setCheckNoChangesMode, setCurrentDirectiveDef, setCurrentQueryIndex, setPreviousOrParentTNode, setSelectedIndex} from '../state';
import {renderStylingMap} from '../styling_next/bindings';
import {NO_CHANGE} from '../tokens';
import {ANIMATION_PROP_PREFIX, isAnimationProp} from '../util/attrs_utils';
import {INTERPOLATION_DELIMITER, renderStringify, stringifyForError} from '../util/misc_utils';
import {getLViewParent, getRootContext} from '../util/view_traversal_utils';
import {getComponentViewByIndex, getNativeByIndex, getNativeByTNode, getTNode, readPatchedLView, resetPreOrderHookFlags, unwrapRNode, viewAttachedToChangeDetector} from '../util/view_utils';

import {LCleanup, LViewBlueprint, MatchesArray, TCleanup, TNodeConstructor, TNodeInitialData, TNodeInitialInputs, TNodeLocalNames, TViewComponents, TViewConstructor, attachLContainerDebug, attachLViewDebug, cloneToLView, cloneToTViewData} from './lview_debug';
import {selectInternal} from './select';



/**
 * A permanent marker promise which signifies that the current CD tree is
 * clean.
 */
const _CLEAN_PROMISE = (() => Promise.resolve(null))();

export const enum BindingDirection {
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
  const creationMode = isCreationMode(lView);

  if (!creationMode) {
    // Resetting the bindingIndex of the current LView as the next steps may trigger change
    // detection.
    lView[BINDING_INDEX] = tView.bindingStartIndex;

    const checkNoChangesMode = getCheckNoChangesMode();

    executePreOrderHooks(lView, tView, checkNoChangesMode, undefined);

    refreshDynamicEmbeddedViews(lView);

    // Content query results must be refreshed before content hooks are called.
    if (tView.contentQueries !== null) {
      refreshContentQueries(tView, lView);
    }

    resetPreOrderHookFlags(lView);
    executeHooks(
        lView, tView.contentHooks, tView.contentCheckHooks, checkNoChangesMode,
        InitPhaseState.AfterContentInitHooksToBeRun, undefined);

    setHostBindings(tView, lView);
  } else {
    // This needs to be set before children are processed to support recursive components.
    // This must be set to false immediately after the first creation run because in an
    // ngFor loop, all the views will be created together before update mode runs and turns
    // off firstTemplatePass. If we don't set it here, instances will perform directive
    // matching, etc again and again.
    tView.firstTemplatePass = false;

    // We resolve content queries specifically marked as `static` in creation mode. Dynamic
    // content queries are resolved during change detection (i.e. update mode), after embedded
    // views are refreshed (see block above).
    if (tView.staticContentQueries) {
      refreshContentQueries(tView, lView);
    }
  }


  // We must materialize query results before child components are processed
  // in case a child component has projected a container. The LContainer needs
  // to exist so the embedded views are properly attached by the container.
  if (!creationMode || tView.staticViewQueries) {
    executeViewQueryFn(RenderFlags.Update, tView, lView[CONTEXT]);
  }

  const components = tView.components;
  if (components !== null) {
    refreshChildComponents(lView, components);
  }
}


/** Sets the host bindings for the current view. */
export function setHostBindings(tView: TView, viewData: LView): void {
  const selectedIndex = getSelectedIndex();
  try {
    if (tView.expandoInstructions !== null) {
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
            setActiveHostElement(currentElementIndex);

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
            const hostCtx = unwrapRNode(viewData[currentDirectiveIndex]);
            instruction(RenderFlags.Update, hostCtx, currentElementIndex);

            // Each directive gets a uniqueId value that is the same for both
            // create and update calls when the hostBindings function is called. The
            // directive uniqueId is not set anywhere--it is just incremented between
            // each hostBindings call and is useful for helping instruction code
            // uniquely determine which directive is currently active when executed.
            incrementActiveDirectiveId();
          }
          currentDirectiveIndex++;
        }
      }
    }
  } finally {
    setActiveHostElement(selectedIndex);
  }
}

/** Refreshes all content queries declared by directives in a given view */
function refreshContentQueries(tView: TView, lView: LView): void {
  const contentQueries = tView.contentQueries;
  if (contentQueries !== null) {
    for (let i = 0; i < contentQueries.length; i += 2) {
      const queryStartIdx = contentQueries[i];
      const directiveDefIdx = contentQueries[i + 1];
      if (directiveDefIdx !== -1) {
        const directiveDef = tView.data[directiveDefIdx] as DirectiveDef<any>;
        ngDevMode &&
            assertDefined(directiveDef.contentQueries, 'contentQueries function should be defined');
        setCurrentQueryIndex(queryStartIdx);
        directiveDef.contentQueries !(RenderFlags.Update, lView[directiveDefIdx], directiveDefIdx);
      }
    }
  }
}

/** Refreshes child components in the current view. */
function refreshChildComponents(hostLView: LView, components: number[]): void {
  for (let i = 0; i < components.length; i++) {
    componentRefresh(hostLView, components[i]);
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

  const namespace = getNamespace();

  if (isProceduralRenderer(rendererToUse)) {
    native = rendererToUse.createElement(name, namespace);
  } else {
    if (namespace === null) {
      native = rendererToUse.createElement(name);
    } else {
      native = rendererToUse.createElementNS(namespace, name);
    }
  }
  return native;
}
export function createLView<T>(
    parentLView: LView | null, tView: TView, context: T | null, flags: LViewFlags,
    host: RElement | null, tHostNode: TViewNode | TElementNode | null,
    rendererFactory?: RendererFactory3 | null, renderer?: Renderer3 | null,
    sanitizer?: Sanitizer | null, injector?: Injector | null): LView {
  const lView = ngDevMode ? cloneToLView(tView.blueprint) : tView.blueprint.slice() as LView;
  lView[HOST] = host;
  lView[FLAGS] = flags | LViewFlags.CreationMode | LViewFlags.Attached | LViewFlags.FirstLViewPass;
  resetPreOrderHookFlags(lView);
  lView[PARENT] = lView[DECLARATION_VIEW] = parentLView;
  lView[CONTEXT] = context;
  lView[RENDERER_FACTORY] = (rendererFactory || parentLView && parentLView[RENDERER_FACTORY]) !;
  ngDevMode && assertDefined(lView[RENDERER_FACTORY], 'RendererFactory is required');
  lView[RENDERER] = (renderer || parentLView && parentLView[RENDERER]) !;
  ngDevMode && assertDefined(lView[RENDERER], 'Renderer is required');
  lView[SANITIZER] = sanitizer || parentLView && parentLView[SANITIZER] || null !;
  lView[INJECTOR as any] = injector || parentLView && parentLView[INJECTOR] || null;
  lView[T_HOST] = tHostNode;
  ngDevMode && attachLViewDebug(lView);
  return lView;
}

/**
 * Create and stores the TNode, and hooks it up to the tree.
 *
 * @param tView The current `TView`.
 * @param tHostNode This is a hack and we should not have to pass this value in. It is only used to
 * determine if the parent belongs to a different tView. Instead we should not have parentTView
 * point to TView other the current one.
 * @param index The index at which the TNode should be saved (null if view, since they are not
 * saved).
 * @param type The type of TNode to create
 * @param native The native element for this node, if applicable
 * @param name The tag name of the associated native element, if applicable
 * @param attrs Any attrs for the native element, if applicable
 */
export function getOrCreateTNode(
    tView: TView, tHostNode: TNode | null, index: number, type: TNodeType.Element,
    name: string | null, attrs: TAttributes | null): TElementNode;
export function getOrCreateTNode(
    tView: TView, tHostNode: TNode | null, index: number, type: TNodeType.Container,
    name: string | null, attrs: TAttributes | null): TContainerNode;
export function getOrCreateTNode(
    tView: TView, tHostNode: TNode | null, index: number, type: TNodeType.Projection, name: null,
    attrs: TAttributes | null): TProjectionNode;
export function getOrCreateTNode(
    tView: TView, tHostNode: TNode | null, index: number, type: TNodeType.ElementContainer,
    name: string | null, attrs: TAttributes | null): TElementContainerNode;
export function getOrCreateTNode(
    tView: TView, tHostNode: TNode | null, index: number, type: TNodeType.IcuContainer, name: null,
    attrs: TAttributes | null): TElementContainerNode;
export function getOrCreateTNode(
    tView: TView, tHostNode: TNode | null, index: number, type: TNodeType, name: string | null,
    attrs: TAttributes | null): TElementNode&TContainerNode&TElementContainerNode&TProjectionNode&
    TIcuContainerNode {
  // Keep this function short, so that the VM will inline it.
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = tView.data[adjustedIndex] as TNode ||
      createTNodeAtIndex(tView, tHostNode, adjustedIndex, type, name, attrs, index);
  setPreviousOrParentTNode(tNode, true);
  return tNode as TElementNode & TViewNode & TContainerNode & TElementContainerNode &
      TProjectionNode & TIcuContainerNode;
}

function createTNodeAtIndex(
    tView: TView, tHostNode: TNode | null, adjustedIndex: number, type: TNodeType,
    name: string | null, attrs: TAttributes | null, index: number) {
  const previousOrParentTNode = getPreviousOrParentTNode();
  const isParent = getIsParent();
  const parent =
      isParent ? previousOrParentTNode : previousOrParentTNode && previousOrParentTNode.parent;
  // Parents cannot cross component boundaries because components will be used in multiple places,
  // so it's only set if the view is the same.
  const parentInSameView = parent && parent !== tHostNode;
  const tParentNode = parentInSameView ? parent as TElementNode | TContainerNode : null;
  const tNode = tView.data[adjustedIndex] =
      createTNode(tView, tParentNode, type, adjustedIndex, name, attrs);
  // The first node is not always the one at index 0, in case of i18n, index 0 can be the
  // instruction `i18nStart` and the first node has the index 1 or more
  if (index === 0 || !tView.firstChild) {
    tView.firstChild = tNode;
  }
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
  return tNode;
}

export function assignTViewNodeToLView(
    tView: TView, tParentNode: TNode | null, index: number, lView: LView): TViewNode {
  // View nodes are not stored in data because they can be added / removed at runtime (which
  // would cause indices to change). Their TNodes are instead stored in tView.node.
  let tNode = tView.node;
  if (tNode == null) {
    ngDevMode && tParentNode &&
        assertNodeOfPossibleTypes(tParentNode, TNodeType.Element, TNodeType.Container);
    tView.node = tNode = createTNode(
        tView,
        tParentNode as TElementNode | TContainerNode | null,  //
        TNodeType.View, index, null, null) as TViewNode;
  }

  return lView[T_HOST] = tNode as TViewNode;
}


/**
 * When elements are created dynamically after a view blueprint is created (e.g. through
 * i18nApply() or ComponentFactory.create), we need to adjust the blueprint for future
 * template passes.
 *
 * @param view The LView containing the blueprint to adjust
 * @param numSlotsToAlloc The number of slots to alloc in the LView, should be >0
 */
export function allocExpando(view: LView, numSlotsToAlloc: number) {
  ngDevMode && assertGreaterThan(
                   numSlotsToAlloc, 0, 'The number of slots to alloc should be greater than 0');
  if (numSlotsToAlloc > 0) {
    const tView = view[TVIEW];
    if (tView.firstTemplatePass) {
      for (let i = 0; i < numSlotsToAlloc; i++) {
        tView.blueprint.push(null);
        tView.data.push(null);
        view.push(null);
      }

      // We should only increment the expando start index if there aren't already directives
      // and injectors saved in the "expando" section
      if (!tView.expandoInstructions) {
        tView.expandoStartIndex += numSlotsToAlloc;
      } else {
        // Since we're adding the dynamic nodes into the expando section, we need to let the host
        // bindings know that they should skip x slots
        tView.expandoInstructions.push(numSlotsToAlloc);
      }
    }
  }
}


//////////////////////////
//// Render
//////////////////////////

/**
 * Used for creating the LViewNode of a dynamic embedded view,
 * either through ViewContainerRef.createEmbeddedView() or TemplateRef.createEmbeddedView().
 * Such lViewNode will then be renderer with renderEmbeddedTemplate() (see below).
 */
export function createEmbeddedViewAndNode<T>(
    tView: TView, context: T, declarationView: LView, injectorIndex: number): LView {
  const _isParent = getIsParent();
  const _previousOrParentTNode = getPreviousOrParentTNode();
  setPreviousOrParentTNode(null !, true);

  const lView = createLView(declarationView, tView, context, LViewFlags.CheckAlways, null, null);
  lView[DECLARATION_VIEW] = declarationView;

  assignTViewNodeToLView(tView, null, -1, lView);

  if (tView.firstTemplatePass) {
    tView.node !.injectorIndex = injectorIndex;
  }

  setPreviousOrParentTNode(_previousOrParentTNode, _isParent);
  return lView;
}

/**
 * Used for rendering embedded views (e.g. dynamically created views)
 *
 * Dynamically created views must store/retrieve their TViews differently from component views
 * because their template functions are nested in the template functions of their hosts, creating
 * closures. If their host template happens to be an embedded template in a loop (e.g. ngFor
 * inside
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
    // Will become true if the `try` block executes with no errors.
    let safeToRunHooks = false;
    try {
      oldView = enterView(viewToRender, viewToRender[T_HOST]);
      resetPreOrderHookFlags(viewToRender);
      executeTemplate(viewToRender, tView.template !, getRenderFlags(viewToRender), context);
      refreshDescendantViews(viewToRender);
      safeToRunHooks = true;
    } finally {
      leaveView(oldView !, safeToRunHooks);
      setPreviousOrParentTNode(_previousOrParentTNode, _isParent);
    }
  }
}

export function renderComponentOrTemplate<T>(
    hostView: LView, context: T, templateFn?: ComponentTemplate<T>) {
  const rendererFactory = hostView[RENDERER_FACTORY];
  const oldView = enterView(hostView, hostView[T_HOST]);
  const normalExecutionPath = !getCheckNoChangesMode();
  const creationModeIsActive = isCreationMode(hostView);

  // Will become true if the `try` block executes with no errors.
  let safeToRunHooks = false;
  try {
    if (normalExecutionPath && !creationModeIsActive && rendererFactory.begin) {
      rendererFactory.begin();
    }

    if (creationModeIsActive) {
      // creation mode pass
      templateFn && executeTemplate(hostView, templateFn, RenderFlags.Create, context);

      refreshDescendantViews(hostView);
      hostView[FLAGS] &= ~LViewFlags.CreationMode;
    }

    // update mode pass
    resetPreOrderHookFlags(hostView);
    templateFn && executeTemplate(hostView, templateFn, RenderFlags.Update, context);
    refreshDescendantViews(hostView);
    safeToRunHooks = true;
  } finally {
    if (normalExecutionPath && !creationModeIsActive && rendererFactory.end) {
      rendererFactory.end();
    }
    leaveView(oldView, safeToRunHooks);
  }
}

function executeTemplate<T>(
    lView: LView, templateFn: ComponentTemplate<T>, rf: RenderFlags, context: T) {
  namespaceHTMLInternal();
  const prevSelectedIndex = getSelectedIndex();
  try {
    setActiveHostElement(null);
    if (rf & RenderFlags.Update) {
      // When we're updating, have an inherent ɵɵselect(0) so we don't have to generate that
      // instruction for most update blocks
      selectInternal(lView, 0);
    }
    templateFn(rf, context);
  } finally {
    setSelectedIndex(prevSelectedIndex);
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
//// Element
//////////////////////////

export function executeContentQueries(tView: TView, tNode: TNode, lView: LView) {
  if (isContentQueryHost(tNode)) {
    const start = tNode.directiveStart;
    const end = tNode.directiveEnd;
    for (let directiveIndex = start; directiveIndex < end; directiveIndex++) {
      const def = tView.data[directiveIndex] as DirectiveDef<any>;
      if (def.contentQueries) {
        def.contentQueries(RenderFlags.Create, lView[directiveIndex], directiveIndex);
      }
    }
  }
}


/**
 * Creates directive instances and populates local refs.
 *
 * @param localRefs Local refs of the node in question
 * @param localRefExtractor mapping function that extracts local ref value from TNode
 */
export function createDirectivesAndLocals(
    tView: TView, lView: LView, tNode: TElementNode | TContainerNode | TElementContainerNode,
    localRefExtractor: LocalRefExtractor = getNativeByTNode) {
  if (!getBindingsEnabled()) return;
  instantiateAllDirectives(tView, lView, tNode);
  invokeDirectivesHostBindings(tView, lView, tNode);
  saveResolvedLocalsInData(lView, tNode, localRefExtractor);
  setActiveHostElement(null);
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
 * @param def ComponentDef
 * @returns TView
 */
export function getOrCreateTView(def: ComponentDef<any>): TView {
  return def.tView || (def.tView = createTView(
                           -1, def.template, def.consts, def.vars, def.directiveDefs, def.pipeDefs,
                           def.viewQuery, def.schemas));
}


/**
 * Creates a TView instance
 *
 * @param viewIndex The viewBlockId for inline views, or -1 if it's a component/dynamic
 * @param templateFn Template function
 * @param consts The number of nodes, local refs, and pipes in this template
 * @param directives Registry of directives for this view
 * @param pipes Registry of pipes for this view
 * @param viewQuery View queries for this view
 * @param schemas Schemas for this view
 */
export function createTView(
    viewIndex: number, templateFn: ComponentTemplate<any>| null, consts: number, vars: number,
    directives: DirectiveDefListOrFactory | null, pipes: PipeDefListOrFactory | null,
    viewQuery: ViewQueriesFunction<any>| null, schemas: SchemaMetadata[] | null): TView {
  ngDevMode && ngDevMode.tView++;
  const bindingStartIndex = HEADER_OFFSET + consts;
  // This length does not yet contain host bindings from child directives because at this point,
  // we don't know which directives are active on this template. As soon as a directive is matched
  // that has a host binding, we will update the blueprint with that def's hostVars count.
  const initialViewLength = bindingStartIndex + vars;
  const blueprint = createViewBlueprint(bindingStartIndex, initialViewLength);
  return blueprint[TVIEW as any] = ngDevMode ?
      new TViewConstructor(
             viewIndex,   // id: number,
             blueprint,   // blueprint: LView,
             templateFn,  // template: ComponentTemplate<{}>|null,
             null,        // queries: TQueries|null
             viewQuery,   // viewQuery: ViewQueriesFunction<{}>|null,
             null !,      // node: TViewNode|TElementNode|null,
             cloneToTViewData(blueprint).fill(null, bindingStartIndex),  // data: TData,
             bindingStartIndex,  // bindingStartIndex: number,
             initialViewLength,  // expandoStartIndex: number,
             null,               // expandoInstructions: ExpandoInstructions|null,
             true,               // firstTemplatePass: boolean,
             false,              // staticViewQueries: boolean,
             false,              // staticContentQueries: boolean,
             null,               // preOrderHooks: HookData|null,
             null,               // preOrderCheckHooks: HookData|null,
             null,               // contentHooks: HookData|null,
             null,               // contentCheckHooks: HookData|null,
             null,               // viewHooks: HookData|null,
             null,               // viewCheckHooks: HookData|null,
             null,               // destroyHooks: HookData|null,
             null,               // cleanup: any[]|null,
             null,               // contentQueries: number[]|null,
             null,               // components: number[]|null,
             typeof directives === 'function' ?
                 directives() :
                 directives,  // directiveRegistry: DirectiveDefList|null,
             typeof pipes === 'function' ? pipes() : pipes,  // pipeRegistry: PipeDefList|null,
             null,                                           // firstChild: TNode|null,
             schemas,                                        // schemas: SchemaMetadata[]|null,
             ) :
      {
        id: viewIndex,
        blueprint: blueprint,
        template: templateFn,
        queries: null,
        viewQuery: viewQuery,
        node: null !,
        data: blueprint.slice().fill(null, bindingStartIndex),
        bindingStartIndex: bindingStartIndex,
        expandoStartIndex: initialViewLength,
        expandoInstructions: null,
        firstTemplatePass: true,
        staticViewQueries: false,
        staticContentQueries: false,
        preOrderHooks: null,
        preOrderCheckHooks: null,
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
        schemas: schemas,
      };
}

function createViewBlueprint(bindingStartIndex: number, initialViewLength: number): LView {
  const blueprint = ngDevMode ? new LViewBlueprint !() : [];

  for (let i = 0; i < initialViewLength; i++) {
    blueprint.push(i < bindingStartIndex ? null : NO_CHANGE);
  }
  blueprint[BINDING_INDEX] = bindingStartIndex;

  return blueprint as LView;
}

export function createError(text: string, token: any) {
  return new Error(`Renderer: ${text} [${stringifyForError(token)}]`);
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
 * Saves context for this cleanup function in LView.cleanupInstances.
 *
 * On the first template pass, saves in TView:
 * - Cleanup function
 * - Index of context we just saved in LView.cleanupInstances
 */
export function storeCleanupWithContext(lView: LView, context: any, cleanupFn: Function): void {
  const lCleanup = getCleanup(lView);
  lCleanup.push(context);

  if (lView[TVIEW].firstTemplatePass) {
    getTViewCleanup(lView).push(cleanupFn, lCleanup.length - 1);
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

// TODO: Remove this when the issue is resolved.
/**
 * Tsickle has a bug where it creates an infinite loop for a function returning itself.
 * This is a temporary type that will be removed when the issue is resolved.
 * https://github.com/angular/tsickle/issues/1009)
 */
export type TsickleIssue1009 = any;

/**
 * Constructs a TNode object from the arguments.
 *
 * @param tView `TView` to which this `TNode` belongs (used only in `ngDevMode`)
 * @param type The type of the node
 * @param adjustedIndex The index of the TNode in TView.data, adjusted for HEADER_OFFSET
 * @param tagName The tag name of the node
 * @param attrs The attributes defined on this node
 * @param tViews Any TViews attached to this node
 * @returns the TNode object
 */
export function createTNode(
    tView: TView, tParent: TElementNode | TContainerNode | null, type: TNodeType,
    adjustedIndex: number, tagName: string | null, attrs: TAttributes | null): TNode {
  ngDevMode && ngDevMode.tNode++;
  let injectorIndex = tParent ? tParent.injectorIndex : -1;
  return ngDevMode ? new TNodeConstructor(
                         tView,          // tView_: TView
                         type,           // type: TNodeType
                         adjustedIndex,  // index: number
                         injectorIndex,  // injectorIndex: number
                         -1,             // directiveStart: number
                         -1,             // directiveEnd: number
                         -1,             // propertyMetadataStartIndex: number
                         -1,             // propertyMetadataEndIndex: number
                         0,              // flags: TNodeFlags
                         0,              // providerIndexes: TNodeProviderIndexes
                         tagName,        // tagName: string|null
                         attrs,  // attrs: (string|AttributeMarker|(string|SelectorFlags)[])[]|null
                         null,   // localNames: (string|number)[]|null
                         undefined,  // initialInputs: (string[]|null)[]|null|undefined
                         undefined,  // inputs: PropertyAliases|null|undefined
                         undefined,  // outputs: PropertyAliases|null|undefined
                         null,       // tViews: ITView|ITView[]|null
                         null,       // next: ITNode|null
                         null,       // projectionNext: ITNode|null
                         null,       // child: ITNode|null
                         tParent,    // parent: TElementNode|TContainerNode|null
                         null,       // projection: number|(ITNode|RNode[])[]|null
                         null,       // styles: TStylingContext|null
                         null,       // classes: TStylingContext|null
                         ) :
                     {
                       type: type,
                       index: adjustedIndex,
                       injectorIndex: injectorIndex,
                       directiveStart: -1,
                       directiveEnd: -1,
                       propertyMetadataStartIndex: -1,
                       propertyMetadataEndIndex: -1,
                       flags: 0,
                       providerIndexes: 0,
                       tagName: tagName,
                       attrs: attrs,
                       localNames: null,
                       initialInputs: undefined,
                       inputs: undefined,
                       outputs: undefined,
                       tViews: null,
                       next: null,
                       projectionNext: null,
                       child: null,
                       parent: tParent,
                       projection: null,
                       styles: null,
                       classes: null,
                     };
}


/**
 * Consolidates all inputs or outputs of all directives on this logical node.
 *
 * @param tNode
 * @param direction whether to consider inputs or outputs
 * @returns PropertyAliases|null aggregate of all properties if any, `null` otherwise
 */
export function generatePropertyAliases(tNode: TNode, direction: BindingDirection): PropertyAliases|
    null {
  const tView = getLView()[TVIEW];
  let propStore: PropertyAliases|null = null;
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;

  if (end > start) {
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
          hasProperty ? propStore[publicName].push(i, publicName, internalName) :
                        (propStore[publicName] = [i, publicName, internalName]);
        }
      }
    }
  }
  return propStore;
}

/**
 * Mapping between attributes names that don't correspond to their element property names.
 * Note: this mapping has to be kept in sync with the equally named mapping in the template
 * type-checking machinery of ngtsc.
 */
const ATTR_TO_PROP: {[name: string]: string} = {
  'class': 'className',
  'for': 'htmlFor',
  'formaction': 'formAction',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex',
};

export function elementPropertyInternal<T>(
    index: number, propName: string, value: T, sanitizer?: SanitizerFn | null, nativeOnly?: boolean,
    loadRendererFn?: ((tNode: TNode, lView: LView) => Renderer3) | null): void {
  ngDevMode && assertNotSame(value, NO_CHANGE as any, 'Incoming value should never be NO_CHANGE.');
  const lView = getLView();
  const element = getNativeByIndex(index, lView) as RElement | RComment;
  const tNode = getTNode(index, lView);
  let inputData: PropertyAliases|null|undefined;
  let dataValue: PropertyAliasValue|undefined;
  if (!nativeOnly && (inputData = initializeTNodeInputs(tNode)) &&
      (dataValue = inputData[propName])) {
    setInputsForProperty(lView, dataValue, value);
    if (isComponent(tNode)) markDirtyIfOnPush(lView, index + HEADER_OFFSET);
    if (ngDevMode) {
      if (tNode.type === TNodeType.Element || tNode.type === TNodeType.Container) {
        /**
         * dataValue is an array containing runtime input or output names for the directives:
         * i+0: directive instance index
         * i+1: publicName
         * i+2: privateName
         *
         * e.g. [0, 'change', 'change-minified']
         * we want to set the reflected property with the privateName: dataValue[i+2]
         */
        for (let i = 0; i < dataValue.length; i += 3) {
          setNgReflectProperty(lView, element, tNode.type, dataValue[i + 2] as string, value);
        }
      }
    }
  } else if (tNode.type === TNodeType.Element) {
    propName = ATTR_TO_PROP[propName] || propName;

    if (ngDevMode) {
      validateAgainstEventProperties(propName);
      validateAgainstUnknownProperties(lView, element, propName, tNode);
      ngDevMode.rendererSetProperty++;
    }

    savePropertyDebugData(tNode, lView, propName, lView[TVIEW].data, nativeOnly);

    const renderer = loadRendererFn ? loadRendererFn(tNode, lView) : lView[RENDERER];
    // It is assumed that the sanitizer is only added when the compiler determines that the
    // property
    // is risky, so sanitization can be done without further checks.
    value = sanitizer != null ? (sanitizer(value, tNode.tagName || '', propName) as any) : value;
    if (isProceduralRenderer(renderer)) {
      renderer.setProperty(element as RElement, propName, value);
    } else if (!isAnimationProp(propName)) {
      (element as RElement).setProperty ? (element as any).setProperty(propName, value) :
                                          (element as any)[propName] = value;
    }
  } else if (tNode.type === TNodeType.Container) {
    // If the node is a container and the property didn't
    // match any of the inputs or schemas we should throw.
    if (ngDevMode && !matchingSchemas(lView, tNode.tagName)) {
      throw createUnknownPropertyError(propName, tNode);
    }
  }
}

/** If node is an OnPush component, marks its LView dirty. */
function markDirtyIfOnPush(lView: LView, viewIndex: number): void {
  ngDevMode && assertLView(lView);
  const childComponentLView = getComponentViewByIndex(viewIndex, lView);
  if (!(childComponentLView[FLAGS] & LViewFlags.CheckAlways)) {
    childComponentLView[FLAGS] |= LViewFlags.Dirty;
  }
}

export function setNgReflectProperty(
    lView: LView, element: RElement | RComment, type: TNodeType, attrName: string, value: any) {
  const renderer = lView[RENDERER];
  attrName = normalizeDebugBindingName(attrName);
  const debugValue = normalizeDebugBindingValue(value);
  if (type === TNodeType.Element) {
    if (value == null) {
      isProceduralRenderer(renderer) ? renderer.removeAttribute((element as RElement), attrName) :
                                       (element as RElement).removeAttribute(attrName);
    } else {
      isProceduralRenderer(renderer) ?
          renderer.setAttribute((element as RElement), attrName, debugValue) :
          (element as RElement).setAttribute(attrName, debugValue);
    }
  } else {
    const textContent = `bindings=${JSON.stringify({[attrName]: debugValue}, null, 2)}`;
    if (isProceduralRenderer(renderer)) {
      renderer.setValue((element as RComment), textContent);
    } else {
      (element as RComment).textContent = textContent;
    }
  }
}

function validateAgainstUnknownProperties(
    hostView: LView, element: RElement | RComment, propName: string, tNode: TNode) {
  // If the tag matches any of the schemas we shouldn't throw.
  if (matchingSchemas(hostView, tNode.tagName)) {
    return;
  }

  // If prop is not a known property of the HTML element...
  if (!(propName in element) &&
      // and we are in a browser context... (web worker nodes should be skipped)
      typeof Node === 'function' && element instanceof Node &&
      // and isn't a synthetic animation property...
      propName[0] !== ANIMATION_PROP_PREFIX) {
    // ... it is probably a user error and we should throw.
    throw createUnknownPropertyError(propName, tNode);
  }
}

function matchingSchemas(hostView: LView, tagName: string | null): boolean {
  const schemas = hostView[TVIEW].schemas;

  if (schemas !== null) {
    for (let i = 0; i < schemas.length; i++) {
      const schema = schemas[i];
      if (schema === NO_ERRORS_SCHEMA ||
          schema === CUSTOM_ELEMENTS_SCHEMA && tagName && tagName.indexOf('-') > -1) {
        return true;
      }
    }
  }

  return false;
}

/**
* Stores debugging data for this property binding on first template pass.
* This enables features like DebugElement.properties.
*/
function savePropertyDebugData(
    tNode: TNode, lView: LView, propName: string, tData: TData,
    nativeOnly: boolean | undefined): void {
  const lastBindingIndex = lView[BINDING_INDEX] - 1;

  // Bind/interpolation functions save binding metadata in the last binding index,
  // but leave the property name blank. If the interpolation delimiter is at the 0
  // index, we know that this is our first pass and the property name still needs to
  // be set.
  const bindingMetadata = tData[lastBindingIndex] as string;
  if (bindingMetadata[0] == INTERPOLATION_DELIMITER) {
    tData[lastBindingIndex] = propName + bindingMetadata;

    // We don't want to store indices for host bindings because they are stored in a
    // different part of LView (the expando section).
    if (!nativeOnly) {
      if (tNode.propertyMetadataStartIndex == -1) {
        tNode.propertyMetadataStartIndex = lastBindingIndex;
      }
      tNode.propertyMetadataEndIndex = lastBindingIndex + 1;
    }
  }
}

/**
* Creates an error that should be thrown when encountering an unknown property on an element.
* @param propName Name of the invalid property.
* @param tNode Node on which we encountered the error.
*/
function createUnknownPropertyError(propName: string, tNode: TNode): Error {
  return new Error(
      `Template error: Can't bind to '${propName}' since it isn't a known property of '${tNode.tagName}'.`);
}

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
  postProcessBaseDirective(viewData, rootTNode, directive);
  return directive;
}

/**
 * Resolve the matched directives on a node.
 */
export function resolveDirectives(
    tView: TView, lView: LView, tNode: TElementNode | TContainerNode | TElementContainerNode,
    localRefs: string[] | null): void {
  // Please make sure to have explicit type for `exportsMap`. Inferred type triggers bug in
  // tsickle.
  ngDevMode && assertFirstTemplatePass(tView);

  if (!getBindingsEnabled()) return;

  const directives: DirectiveDef<any>[]|null = findDirectiveMatches(tView, lView, tNode);
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
    const initialPreOrderHooksLength = (tView.preOrderHooks && tView.preOrderHooks.length) || 0;
    const initialPreOrderCheckHooksLength =
        (tView.preOrderCheckHooks && tView.preOrderCheckHooks.length) || 0;
    const nodeIndex = tNode.index - HEADER_OFFSET;
    for (let i = 0; i < directives.length; i++) {
      const def = directives[i] as DirectiveDef<any>;

      const directiveDefIdx = tView.data.length;
      baseResolveDirective(tView, lView, def, def.factory);

      saveNameToExportMap(tView.data !.length - 1, def, exportsMap);

      if (def.contentQueries) {
        tNode.flags |= TNodeFlags.hasContentQuery;
      }

      // Init hooks are queued now so ngOnInit is called in host components before
      // any projected components.
      registerPreOrderHooks(
          directiveDefIdx, def, tView, nodeIndex, initialPreOrderHooksLength,
          initialPreOrderCheckHooksLength);
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
  if (!tView.firstTemplatePass && start < end) {
    getOrCreateNodeInjectorForNode(
        tNode as TElementNode | TContainerNode | TElementContainerNode, lView);
  }
  for (let i = start; i < end; i++) {
    const def = tView.data[i] as DirectiveDef<any>;
    if (isComponentDef(def)) {
      addComponentLogic(lView, tNode, def as ComponentDef<any>);
    }
    const directive = getNodeInjectable(tView.data, lView !, i, tNode as TElementNode);
    postProcessDirective(lView, tNode, directive, def, i);
  }
}

function invokeDirectivesHostBindings(tView: TView, viewData: LView, tNode: TNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  const expando = tView.expandoInstructions !;
  const firstTemplatePass = tView.firstTemplatePass;
  const elementIndex = tNode.index - HEADER_OFFSET;
  const selectedIndex = getSelectedIndex();
  try {
    setActiveHostElement(elementIndex);

    for (let i = start; i < end; i++) {
      const def = tView.data[i] as DirectiveDef<any>;
      const directive = viewData[i];
      if (def.hostBindings) {
        invokeHostBindingsInCreationMode(def, expando, directive, tNode, firstTemplatePass);

        // Each directive gets a uniqueId value that is the same for both
        // create and update calls when the hostBindings function is called. The
        // directive uniqueId is not set anywhere--it is just incremented between
        // each hostBindings call and is useful for helping instruction code
        // uniquely determine which directive is currently active when executed.
        incrementActiveDirectiveId();
      } else if (firstTemplatePass) {
        expando.push(null);
      }
    }
  } finally {
    setActiveHostElement(selectedIndex);
  }
}

export function invokeHostBindingsInCreationMode(
    def: DirectiveDef<any>, expando: ExpandoInstructions, directive: any, tNode: TNode,
    firstTemplatePass: boolean) {
  const previousExpandoLength = expando.length;
  setCurrentDirectiveDef(def);
  const elementIndex = tNode.index - HEADER_OFFSET;
  def.hostBindings !(RenderFlags.Create, directive, elementIndex);
  setCurrentDirectiveDef(null);
  // `hostBindings` function may or may not contain `allocHostVars` call
  // (e.g. it may not if it only contains host listeners), so we need to check whether
  // `expandoInstructions` has changed and if not - we still push `hostBindings` to
  // expando block, to make sure we execute it for DI cycle
  if (previousExpandoLength === expando.length && firstTemplatePass) {
    expando.push(def.hostBindings);
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
 * Process a directive on the current node after its creation.
 */
function postProcessDirective<T>(
    lView: LView, hostTNode: TNode, directive: T, def: DirectiveDef<T>,
    directiveDefIdx: number): void {
  postProcessBaseDirective(lView, hostTNode, directive);
  if (hostTNode.attrs !== null) {
    setInputsFromAttrs(directiveDefIdx, directive, def, hostTNode);
  }

  if (isComponentDef(def)) {
    const componentView = getComponentViewByIndex(hostTNode.index, lView);
    componentView[CONTEXT] = directive;
  }
}

/**
 * A lighter version of postProcessDirective() that is used for the root component.
 */
function postProcessBaseDirective<T>(lView: LView, hostTNode: TNode, directive: T): void {
  ngDevMode && assertEqual(
                   lView[BINDING_INDEX], lView[TVIEW].bindingStartIndex,
                   'directives should be created before any bindings');
  attachPatchData(directive, lView);
  const native = getNativeByTNode(hostTNode, lView);
  if (native) {
    attachPatchData(native, lView);
  }
}


/**
* Matches the current node against all available selectors.
* If a component is matched (at most one), it is returned in first position in the array.
*/
function findDirectiveMatches(
    tView: TView, viewData: LView,
    tNode: TElementNode | TContainerNode | TElementContainerNode): DirectiveDef<any>[]|null {
  ngDevMode && assertFirstTemplatePass(tView);
  ngDevMode && assertNodeOfPossibleTypes(
                   tNode, TNodeType.Element, TNodeType.ElementContainer, TNodeType.Container);
  const registry = tView.directiveRegistry;
  let matches: any[]|null = null;
  if (registry) {
    for (let i = 0; i < registry.length; i++) {
      const def = registry[i] as ComponentDef<any>| DirectiveDef<any>;
      if (isNodeMatchingSelectorList(tNode, def.selectors !, /* isProjectionMode */ false)) {
        matches || (matches = ngDevMode ? new MatchesArray !() : []);
        diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, viewData), tView, def.type);

        if (isComponentDef(def)) {
          if (tNode.flags & TNodeFlags.isComponent) throwMultipleComponentError(tNode);
          markAsComponentHost(tView, tNode);
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

/**
 * Marks a given TNode as a component's host. This consists of:
 * - setting appropriate TNode flags;
 * - storing index of component's host element so it will be queued for view refresh during CD.
*/
export function markAsComponentHost(tView: TView, hostTNode: TNode): void {
  ngDevMode && assertFirstTemplatePass(tView);
  hostTNode.flags = TNodeFlags.isComponent;
  (tView.components || (tView.components = ngDevMode ? new TViewComponents !() : [
   ])).push(hostTNode.index);
}


/** Caches local names and their matching directive indices for query and template lookups. */
function cacheMatchingLocalNames(
    tNode: TNode, localRefs: string[] | null, exportsMap: {[key: string]: number}): void {
  if (localRefs) {
    const localNames: (string | number)[] = tNode.localNames =
        ngDevMode ? new TNodeLocalNames !() : [];

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
    tView: TView, viewData: LView, def: DirectiveDef<T>, directiveFactory: FactoryFn<T>) {
  tView.data.push(def);
  const nodeInjectorFactory = new NodeInjectorFactory(directiveFactory, isComponentDef(def), null);
  tView.blueprint.push(nodeInjectorFactory);
  viewData.push(nodeInjectorFactory);
}

function addComponentLogic<T>(lView: LView, hostTNode: TNode, def: ComponentDef<T>): void {
  const native = getNativeByTNode(hostTNode, lView);
  const tView = getOrCreateTView(def);

  // Only component views should be added to the view tree directly. Embedded views are
  // accessed through their containers because they may be removed / re-added later.
  const rendererFactory = lView[RENDERER_FACTORY];
  const componentView = addToViewTree(
      lView, createLView(
                 lView, tView, null, def.onPush ? LViewFlags.Dirty : LViewFlags.CheckAlways,
                 lView[hostTNode.index], hostTNode as TElementNode, rendererFactory,
                 rendererFactory.createRenderer(native as RElement, def)));

  componentView[T_HOST] = hostTNode as TElementNode;

  // Component view will always be created before any injected LContainers,
  // so this is a regular element, wrap it with the component view
  lView[hostTNode.index] = componentView;
}

export function elementAttributeInternal(
    index: number, name: string, value: any, lView: LView, sanitizer?: SanitizerFn | null,
    namespace?: string) {
  ngDevMode && assertNotSame(value, NO_CHANGE as any, 'Incoming value should never be NO_CHANGE.');
  ngDevMode && validateAgainstEventAttributes(name);
  const element = getNativeByIndex(index, lView) as RElement;
  const renderer = lView[RENDERER];
  if (value == null) {
    ngDevMode && ngDevMode.rendererRemoveAttribute++;
    isProceduralRenderer(renderer) ? renderer.removeAttribute(element, name, namespace) :
                                     element.removeAttribute(name);
  } else {
    ngDevMode && ngDevMode.rendererSetAttribute++;
    const tNode = getTNode(index, lView);
    const strValue =
        sanitizer == null ? renderStringify(value) : sanitizer(value, tNode.tagName || '', name);


    if (isProceduralRenderer(renderer)) {
      renderer.setAttribute(element, name, strValue, namespace);
    } else {
      namespace ? element.setAttributeNS(namespace, name, strValue) :
                  element.setAttribute(name, strValue);
    }
  }
}

/**
 * Sets initial input properties on directive instances from attribute data
 *
 * @param directiveIndex Index of the directive in directives array
 * @param instance Instance of the directive on which to set the initial inputs
 * @param def The directive def that contains the list of inputs
 * @param tNode The static data for this node
 */
function setInputsFromAttrs<T>(
    directiveIndex: number, instance: T, def: DirectiveDef<T>, tNode: TNode): void {
  let initialInputData = tNode.initialInputs as InitialInputData | undefined;
  if (initialInputData === undefined || directiveIndex >= initialInputData.length) {
    initialInputData = generateInitialInputs(directiveIndex, def.inputs, tNode);
  }

  const initialInputs: InitialInputs|null = initialInputData[directiveIndex];
  if (initialInputs) {
    const setInput = def.setInput;
    for (let i = 0; i < initialInputs.length;) {
      const publicName = initialInputs[i++];
      const privateName = initialInputs[i++];
      const value = initialInputs[i++];
      if (setInput) {
        def.setInput !(instance, value, publicName, privateName);
      } else {
        (instance as any)[privateName] = value;
      }
      if (ngDevMode) {
        const lView = getLView();
        const nativeElement = getNativeByTNode(tNode, lView) as RElement;
        setNgReflectProperty(lView, nativeElement, tNode.type, privateName, value);
      }
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
  const initialInputData: InitialInputData =
      tNode.initialInputs || (tNode.initialInputs = ngDevMode ? new TNodeInitialInputs !() : []);
  // Ensure that we don't create sparse arrays
  for (let i = initialInputData.length; i <= directiveIndex; i++) {
    initialInputData.push(null);
  }

  const attrs = tNode.attrs !;
  let i = 0;
  while (i < attrs.length) {
    const attrName = attrs[i];
    if (attrName === AttributeMarker.NamespaceURI) {
      // We do not allow inputs on namespaced attributes.
      i += 4;
      continue;
    } else if (attrName === AttributeMarker.ProjectAs) {
      // Skip over the `ngProjectAs` value.
      i += 2;
      continue;
    }

    // If we hit any other attribute markers, we're done anyway. None of those are valid inputs.
    if (typeof attrName === 'number') break;

    const minifiedInputName = inputs[attrName as string];
    const attrValue = attrs[i + 1];

    if (minifiedInputName !== undefined) {
      const inputsToStore: InitialInputs = initialInputData[directiveIndex] ||
          (initialInputData[directiveIndex] = ngDevMode ? new TNodeInitialData !() : []);
      inputsToStore.push(attrName as string, minifiedInputName, attrValue as string);
    }

    i += 2;
  }
  return initialInputData;
}

//////////////////////////
//// ViewContainer & View
//////////////////////////

// Not sure why I need to do `any` here but TS complains later.
const LContainerArray: any = ngDevMode && createNamedArrayType('LContainer');

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
    hostNative: RElement | RComment | LView, currentView: LView, native: RComment, tNode: TNode,
    isForViewContainerRef?: boolean): LContainer {
  ngDevMode && assertDomNode(native);
  ngDevMode && assertLView(currentView);
  // https://jsperf.com/array-literal-vs-new-array-really
  const lContainer: LContainer = new (ngDevMode ? LContainerArray : Array)(
      hostNative,  // host native
      true,        // Boolean `true` in this position signifies that this is an `LContainer`
      isForViewContainerRef ? -1 : 0,  // active index
      currentView,                     // parent
      null,                            // next
      null,                            // queries
      tNode,                           // t_host
      native,                          // native,
      null,                            // view refs
      );
  ngDevMode && attachLContainerDebug(lContainer);
  return lContainer;
}


/**
 * Goes over dynamic embedded views (ones created through ViewContainerRef APIs) and refreshes
 * them
 * by executing an associated template function.
 */
function refreshDynamicEmbeddedViews(lView: LView) {
  let viewOrContainer = lView[CHILD_HEAD];
  while (viewOrContainer !== null) {
    // Note: viewOrContainer can be an LView or an LContainer instance, but here we are only
    // interested in LContainer
    if (isLContainer(viewOrContainer) && viewOrContainer[ACTIVE_INDEX] === -1) {
      for (let i = CONTAINER_HEADER_OFFSET; i < viewOrContainer.length; i++) {
        const embeddedLView = viewOrContainer[i];
        // The directives and pipes are not needed here as an existing view is only being
        // refreshed.
        ngDevMode && assertDefined(embeddedLView[TVIEW], 'TView must be allocated');
        renderEmbeddedTemplate(embeddedLView, embeddedLView[TVIEW], embeddedLView[CONTEXT] !);
      }
    }
    viewOrContainer = viewOrContainer[NEXT];
  }
}



/////////////

/**
 * Refreshes components by entering the component view and processing its bindings, queries, etc.
 *
 * @param adjustedElementIndex  Element index in LView[] (adjusted for HEADER_OFFSET)
 */
export function componentRefresh(hostLView: LView, adjustedElementIndex: number): void {
  ngDevMode && assertDataInRange(hostLView, adjustedElementIndex);
  const componentView = getComponentViewByIndex(adjustedElementIndex, hostLView);
  ngDevMode &&
      assertNodeType(hostLView[TVIEW].data[adjustedElementIndex] as TNode, TNodeType.Element);

  // Only components in creation mode, attached CheckAlways
  // components or attached, dirty OnPush components should be checked
  if ((viewAttachedToChangeDetector(componentView) || isCreationMode(hostLView)) &&
      componentView[FLAGS] & (LViewFlags.CheckAlways | LViewFlags.Dirty)) {
    syncViewWithBlueprint(componentView);
    checkView(componentView, componentView[CONTEXT]);
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
    componentView.push(componentTView.blueprint[i]);
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
 * @param lViewOrLContainer The LView or LContainer to add to the view tree
 * @returns The state passed in
 */
export function addToViewTree<T extends LView|LContainer>(lView: LView, lViewOrLContainer: T): T {
  // TODO(benlesh/misko): This implementation is incorrect, because it always adds the LContainer
  // to
  // the end of the queue, which means if the developer retrieves the LContainers from RNodes out
  // of
  // order, the change detection will run out of order, as the act of retrieving the the
  // LContainer
  // from the RNode is what adds it to the queue.
  if (lView[CHILD_HEAD]) {
    lView[CHILD_TAIL] ![NEXT] = lViewOrLContainer;
  } else {
    lView[CHILD_HEAD] = lViewOrLContainer;
  }
  lView[CHILD_TAIL] = lViewOrLContainer;
  return lViewOrLContainer;
}

///////////////////////////////
//// Change detection
///////////////////////////////


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
export function markViewDirty(lView: LView): LView|null {
  while (lView) {
    lView[FLAGS] |= LViewFlags.Dirty;
    const parent = getLViewParent(lView);
    // Stop traversing up as soon as you find a root view that wasn't attached to any container
    if (isRootView(lView) && !parent) {
      return lView;
    }
    // continue otherwise
    lView = parent !;
  }
  return null;
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
export function scheduleTick(rootContext: RootContext, flags: RootContextFlags) {
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

export function tickRootContext(rootContext: RootContext) {
  for (let i = 0; i < rootContext.components.length; i++) {
    const rootComponent = rootContext.components[i];
    renderComponentOrTemplate(readPatchedLView(rootComponent) !, rootComponent);
  }
}

export function detectChangesInternal<T>(view: LView, context: T) {
  const rendererFactory = view[RENDERER_FACTORY];

  if (rendererFactory.begin) rendererFactory.begin();

  try {
    if (isCreationMode(view)) {
      checkView(view, context);  // creation mode pass
    }
    checkView(view, context);  // update mode pass
  } catch (error) {
    handleError(view, error);
    throw error;
  } finally {
    if (rendererFactory.end) rendererFactory.end();
  }
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
  const view = getComponentViewByInstance(component);
  checkNoChangesInternal<T>(view, component);
}

export function checkNoChangesInternal<T>(view: LView, context: T) {
  setCheckNoChangesMode(true);
  try {
    detectChangesInternal(view, context);
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

/** Checks the view of the component provided. Does not gate on dirty checks or execute doCheck.
 */
export function checkView<T>(hostView: LView, component: T) {
  const hostTView = hostView[TVIEW];
  const oldView = enterView(hostView, hostView[T_HOST]);
  const templateFn = hostTView.template !;
  const creationMode = isCreationMode(hostView);

  // Will become true if the `try` block executes with no errors.
  let safeToRunHooks = false;
  try {
    resetPreOrderHookFlags(hostView);
    creationMode && executeViewQueryFn(RenderFlags.Create, hostTView, component);
    executeTemplate(hostView, templateFn, getRenderFlags(hostView), component);
    refreshDescendantViews(hostView);
    safeToRunHooks = true;
  } finally {
    leaveView(oldView, safeToRunHooks);
  }
}

function executeViewQueryFn<T>(flags: RenderFlags, tView: TView, component: T): void {
  const viewQuery = tView.viewQuery;
  if (viewQuery !== null) {
    setCurrentQueryIndex(0);
    viewQuery(flags, component);
  }
}


///////////////////////////////
//// Bindings & interpolations
///////////////////////////////

/**
 * Creates binding metadata for a particular binding and stores it in
 * TView.data. These are generated in order to support DebugElement.properties.
 *
 * Each binding / interpolation will have one (including attribute bindings)
 * because at the time of binding, we don't know to which instruction the binding
 * belongs. It is always stored in TView.data at the index of the last binding
 * value in LView (e.g. for interpolation8, it would be stored at the index of
 * the 8th value).
 *
 * @param lView The LView that contains the current binding index.
 * @param prefix The static prefix string
 * @param suffix The static suffix string
 *
 * @returns Newly created binding metadata string for this binding or null
 */
export function storeBindingMetadata(lView: LView, prefix = '', suffix = ''): string|null {
  const tData = lView[TVIEW].data;
  const lastBindingIndex = lView[BINDING_INDEX] - 1;
  const value = INTERPOLATION_DELIMITER + prefix + INTERPOLATION_DELIMITER + suffix;

  return tData[lastBindingIndex] == null ? (tData[lastBindingIndex] = value) : null;
}

export const CLEAN_PROMISE = _CLEAN_PROMISE;

export function initializeTNodeInputs(tNode: TNode): PropertyAliases|null {
  // If tNode.inputs is undefined, a listener has created outputs, but inputs haven't
  // yet been checked.
  if (tNode.inputs === undefined) {
    // mark inputs as checked
    tNode.inputs = generatePropertyAliases(tNode, BindingDirection.Input);
  }
  return tNode.inputs;
}

export function getCleanup(view: LView): any[] {
  // top level variables should not be exported for performance reasons (PERF_NOTES.md)
  return view[CLEANUP] || (view[CLEANUP] = ngDevMode ? new LCleanup !() : []);
}

function getTViewCleanup(view: LView): any[] {
  return view[TVIEW].cleanup || (view[TVIEW].cleanup = ngDevMode ? new TCleanup !() : []);
}

/**
 * There are cases where the sub component's renderer needs to be included
 * instead of the current renderer (see the componentSyntheticHost* instructions).
 */
export function loadComponentRenderer(tNode: TNode, lView: LView): Renderer3 {
  const componentLView = lView[tNode.index] as LView;
  return componentLView[RENDERER];
}

/** Handles an error thrown in an LView. */
export function handleError(lView: LView, error: any): void {
  const injector = lView[INJECTOR];
  const errorHandler = injector ? injector.get(ErrorHandler, null) : null;
  errorHandler && errorHandler.handleError(error);
}

/**
 * Set the inputs of directives at the current node to corresponding value.
 *
 * @param lView the `LView` which contains the directives.
 * @param inputs mapping between the public "input" name and privately-known,
 * possibly minified, property names to write to.
 * @param value Value to set.
 */
export function setInputsForProperty(lView: LView, inputs: PropertyAliasValue, value: any): void {
  const tView = lView[TVIEW];
  for (let i = 0; i < inputs.length;) {
    const index = inputs[i++] as number;
    const publicName = inputs[i++] as string;
    const privateName = inputs[i++] as string;
    const instance = lView[index];
    ngDevMode && assertDataInRange(lView, index);
    const def = tView.data[index] as DirectiveDef<any>;
    const setInput = def.setInput;
    if (setInput) {
      def.setInput !(instance, value, publicName, privateName);
    } else {
      instance[privateName] = value;
    }
  }
}

/**
 * Updates a text binding at a given index in a given LView.
 */
export function textBindingInternal(lView: LView, index: number, value: string): void {
  ngDevMode && assertNotSame(value, NO_CHANGE as any, 'value should not be NO_CHANGE');
  ngDevMode && assertDataInRange(lView, index + HEADER_OFFSET);
  const element = getNativeByIndex(index, lView) as any as RText;
  ngDevMode && assertDefined(element, 'native element should exist');
  ngDevMode && ngDevMode.rendererSetText++;
  const renderer = lView[RENDERER];
  isProceduralRenderer(renderer) ? renderer.setValue(element, value) : element.textContent = value;
}

/**
 * Renders all initial styling (class and style values) on to the element from the tNode.
 *
 * All initial styling data (i.e. any values extracted from the `style` or `class` attributes
 * on an element) are collected into the `tNode.styles` and `tNode.classes` data structures.
 * These values are populated during the creation phase of an element and are then later
 * applied once the element is instantiated. This function applies each of the static
 * style and class entries to the element.
 */
export function renderInitialStyling(renderer: Renderer3, native: RElement, tNode: TNode) {
  renderStylingMap(renderer, native, tNode.classes, true);
  renderStylingMap(renderer, native, tNode.styles, false);
}
