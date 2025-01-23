/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../../di/injector';
import {ErrorHandler} from '../../error_handler';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {DehydratedView} from '../../hydration/interfaces';
import {hasSkipHydrationAttrOnRElement} from '../../hydration/skip_hydration';
import {PRESERVE_HOST_CONTENT, PRESERVE_HOST_CONTENT_DEFAULT} from '../../hydration/tokens';
import {processTextNodeMarkersBeforeHydration} from '../../hydration/utils';
import {DoCheck, OnChanges, OnInit} from '../../interface/lifecycle_hooks';
import {Writable} from '../../interface/type';
import {SchemaMetadata} from '../../metadata/schema';
import {ViewEncapsulation} from '../../metadata/view';
import {
  validateAgainstEventAttributes,
  validateAgainstEventProperties,
} from '../../sanitization/sanitization';
import {
  assertDefined,
  assertEqual,
  assertGreaterThan,
  assertGreaterThanOrEqual,
  assertIndexInRange,
  assertNotEqual,
  assertNotSame,
  assertSame,
} from '../../util/assert';
import {escapeCommentText} from '../../util/dom';
import {normalizeDebugBindingName, normalizeDebugBindingValue} from '../../util/ng_reflect';
import {stringify} from '../../util/stringify';
import {
  assertFirstCreatePass,
  assertFirstUpdatePass,
  assertLView,
  assertNoDuplicateDirectives,
  assertTNodeForLView,
} from '../assert';
import {attachPatchData} from '../context_discovery';
import {getFactoryDef} from '../definition_factory';
import {diPublicInInjector, getNodeInjectable, getOrCreateNodeInjectorForNode} from '../di';
import {throwMultipleComponentError} from '../errors';
import {AttributeMarker} from '../interfaces/attribute_marker';
import {CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {
  ComponentDef,
  ComponentTemplate,
  DirectiveDef,
  DirectiveDefListOrFactory,
  HostDirectiveBindingMap,
  HostDirectiveDefs,
  PipeDefListOrFactory,
  RenderFlags,
  ViewQueriesFunction,
} from '../interfaces/definition';
import {NodeInjectorFactory} from '../interfaces/injector';
import {InputFlags} from '../interfaces/input_flags';
import {getUniqueLViewId} from '../interfaces/lview_tracking';
import {
  InitialInputData,
  InitialInputs,
  LocalRefExtractor,
  NodeInputBindings,
  NodeOutputBindings,
  TAttributes,
  TConstantsOrFactory,
  TContainerNode,
  TDirectiveHostNode,
  TElementContainerNode,
  TElementNode,
  TNode,
  TNodeFlags,
  TNodeType,
} from '../interfaces/node';
import {Renderer} from '../interfaces/renderer';
import {RComment, RElement} from '../interfaces/renderer_dom';
import {SanitizerFn} from '../interfaces/sanitization';
import {isComponentDef, isComponentHost} from '../interfaces/type_checks';
import {
  CHILD_HEAD,
  CHILD_TAIL,
  CONTEXT,
  DECLARATION_COMPONENT_VIEW,
  DECLARATION_VIEW,
  EMBEDDED_VIEW_INJECTOR,
  ENVIRONMENT,
  FLAGS,
  HEADER_OFFSET,
  HOST,
  HostBindingOpCodes,
  HYDRATION,
  ID,
  INJECTOR,
  LView,
  LViewEnvironment,
  LViewFlags,
  NEXT,
  PARENT,
  RENDERER,
  T_HOST,
  TData,
  TVIEW,
  TView,
  TViewType,
} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {isInlineTemplate, isNodeMatchingSelectorList} from '../node_selector_matcher';
import {profiler} from '../profiler';
import {ProfilerEvent} from '../profiler_types';
import {
  getBindingsEnabled,
  getCurrentDirectiveIndex,
  getSelectedIndex,
  isInCheckNoChangesMode,
  setCurrentDirectiveIndex,
  setSelectedIndex,
} from '../state';
import {NO_CHANGE} from '../tokens';
import {mergeHostAttrs} from '../util/attrs_utils';
import {INTERPOLATION_DELIMITER} from '../util/misc_utils';
import {renderStringify} from '../util/stringify_utils';
import {
  getComponentLViewByIndex,
  getNativeByTNode,
  resetPreOrderHookFlags,
  unwrapLView,
} from '../util/view_utils';

import {clearElementContents} from '../dom_node_manipulation';
import {selectIndexInternal} from './advance';
import {ɵɵdirectiveInject} from './di';
import {handleUnknownPropertyError, isPropertyValid, matchingSchemas} from './element_validation';
import {writeToDirectiveInput} from './write_to_directive_input';

export function createLView<T>(
  parentLView: LView | null,
  tView: TView,
  context: T | null,
  flags: LViewFlags,
  host: RElement | null,
  tHostNode: TNode | null,
  environment: LViewEnvironment | null,
  renderer: Renderer | null,
  injector: Injector | null,
  embeddedViewInjector: Injector | null,
  hydrationInfo: DehydratedView | null,
): LView<T> {
  const lView = tView.blueprint.slice() as LView;
  lView[HOST] = host;
  lView[FLAGS] =
    flags |
    LViewFlags.CreationMode |
    LViewFlags.Attached |
    LViewFlags.FirstLViewPass |
    LViewFlags.Dirty |
    LViewFlags.RefreshView;
  if (
    embeddedViewInjector !== null ||
    (parentLView && parentLView[FLAGS] & LViewFlags.HasEmbeddedViewInjector)
  ) {
    lView[FLAGS] |= LViewFlags.HasEmbeddedViewInjector;
  }
  resetPreOrderHookFlags(lView);
  ngDevMode && tView.declTNode && parentLView && assertTNodeForLView(tView.declTNode, parentLView);
  lView[PARENT] = lView[DECLARATION_VIEW] = parentLView;
  lView[CONTEXT] = context;
  lView[ENVIRONMENT] = (environment || (parentLView && parentLView[ENVIRONMENT]))!;
  ngDevMode && assertDefined(lView[ENVIRONMENT], 'LViewEnvironment is required');
  lView[RENDERER] = (renderer || (parentLView && parentLView[RENDERER]))!;
  ngDevMode && assertDefined(lView[RENDERER], 'Renderer is required');
  lView[INJECTOR as any] = injector || (parentLView && parentLView[INJECTOR]) || null;
  lView[T_HOST] = tHostNode;
  lView[ID] = getUniqueLViewId();
  lView[HYDRATION] = hydrationInfo;
  lView[EMBEDDED_VIEW_INJECTOR as any] = embeddedViewInjector;

  ngDevMode &&
    assertEqual(
      tView.type == TViewType.Embedded ? parentLView !== null : true,
      true,
      'Embedded views must have parentLView',
    );
  lView[DECLARATION_COMPONENT_VIEW] =
    tView.type == TViewType.Embedded ? parentLView![DECLARATION_COMPONENT_VIEW] : lView;
  return lView as LView<T>;
}

/**
 * When elements are created dynamically after a view blueprint is created (e.g. through
 * i18nApply()), we need to adjust the blueprint for future
 * template passes.
 *
 * @param tView `TView` associated with `LView`
 * @param lView The `LView` containing the blueprint to adjust
 * @param numSlotsToAlloc The number of slots to alloc in the LView, should be >0
 * @param initialValue Initial value to store in blueprint
 */
export function allocExpando(
  tView: TView,
  lView: LView,
  numSlotsToAlloc: number,
  initialValue: any,
): number {
  if (numSlotsToAlloc === 0) return -1;
  if (ngDevMode) {
    assertFirstCreatePass(tView);
    assertSame(tView, lView[TVIEW], '`LView` must be associated with `TView`!');
    assertEqual(tView.data.length, lView.length, 'Expecting LView to be same size as TView');
    assertEqual(
      tView.data.length,
      tView.blueprint.length,
      'Expecting Blueprint to be same size as TView',
    );
    assertFirstUpdatePass(tView);
  }
  const allocIdx = lView.length;
  for (let i = 0; i < numSlotsToAlloc; i++) {
    lView.push(initialValue);
    tView.blueprint.push(initialValue);
    tView.data.push(null);
  }
  return allocIdx;
}

export function executeTemplate<T>(
  tView: TView,
  lView: LView<T>,
  templateFn: ComponentTemplate<T>,
  rf: RenderFlags,
  context: T,
) {
  const prevSelectedIndex = getSelectedIndex();
  const isUpdatePhase = rf & RenderFlags.Update;
  try {
    setSelectedIndex(-1);
    if (isUpdatePhase && lView.length > HEADER_OFFSET) {
      // When we're updating, inherently select 0 so we don't
      // have to generate that instruction for most update blocks.
      selectIndexInternal(tView, lView, HEADER_OFFSET, !!ngDevMode && isInCheckNoChangesMode());
    }

    const preHookType = isUpdatePhase
      ? ProfilerEvent.TemplateUpdateStart
      : ProfilerEvent.TemplateCreateStart;
    profiler(preHookType, context as unknown as {});
    templateFn(rf, context);
  } finally {
    setSelectedIndex(prevSelectedIndex);

    const postHookType = isUpdatePhase
      ? ProfilerEvent.TemplateUpdateEnd
      : ProfilerEvent.TemplateCreateEnd;
    profiler(postHookType, context as unknown as {});
  }
}

/**
 * Creates directive instances.
 */
export function createDirectivesInstancesInInstruction(
  tView: TView,
  lView: LView,
  tNode: TDirectiveHostNode,
) {
  if (!getBindingsEnabled()) return;
  attachPatchData(getNativeByTNode(tNode, lView), lView);
  createDirectivesInstances(tView, lView, tNode);
}

/**
 * Creates directive instances.
 */
export function createDirectivesInstances(tView: TView, lView: LView, tNode: TDirectiveHostNode) {
  instantiateAllDirectives(tView, lView, tNode);
  if ((tNode.flags & TNodeFlags.hasHostBindings) === TNodeFlags.hasHostBindings) {
    invokeDirectivesHostBindings(tView, lView, tNode);
  }
}

/**
 * Takes a list of local names and indices and pushes the resolved local variable values
 * to LView in the same order as they are loaded in the template with load().
 */
export function saveResolvedLocalsInData(
  viewData: LView,
  tNode: TDirectiveHostNode,
  localRefExtractor: LocalRefExtractor = getNativeByTNode,
): void {
  const localNames = tNode.localNames;
  if (localNames !== null) {
    let localIndex = tNode.index + 1;
    for (let i = 0; i < localNames.length; i += 2) {
      const index = localNames[i + 1] as number;
      const value =
        index === -1
          ? localRefExtractor(
              tNode as TElementNode | TContainerNode | TElementContainerNode,
              viewData,
            )
          : viewData[index];
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
export function getOrCreateComponentTView(def: ComponentDef<any>): TView {
  const tView = def.tView;

  // Create a TView if there isn't one, or recreate it if the first create pass didn't
  // complete successfully since we can't know for sure whether it's in a usable shape.
  if (tView === null || tView.incompleteFirstPass) {
    // Declaration node here is null since this function is called when we dynamically create a
    // component and hence there is no declaration.
    const declTNode = null;
    return (def.tView = createTView(
      TViewType.Component,
      declTNode,
      def.template,
      def.decls,
      def.vars,
      def.directiveDefs,
      def.pipeDefs,
      def.viewQuery,
      def.schemas,
      def.consts,
      def.id,
    ));
  }

  return tView;
}

/**
 * Creates a TView instance
 *
 * @param type Type of `TView`.
 * @param declTNode Declaration location of this `TView`.
 * @param templateFn Template function
 * @param decls The number of nodes, local refs, and pipes in this template
 * @param directives Registry of directives for this view
 * @param pipes Registry of pipes for this view
 * @param viewQuery View queries for this view
 * @param schemas Schemas for this view
 * @param consts Constants for this view
 */
export function createTView(
  type: TViewType,
  declTNode: TNode | null,
  templateFn: ComponentTemplate<any> | null,
  decls: number,
  vars: number,
  directives: DirectiveDefListOrFactory | null,
  pipes: PipeDefListOrFactory | null,
  viewQuery: ViewQueriesFunction<any> | null,
  schemas: SchemaMetadata[] | null,
  constsOrFactory: TConstantsOrFactory | null,
  ssrId: string | null,
): TView {
  ngDevMode && ngDevMode.tView++;
  const bindingStartIndex = HEADER_OFFSET + decls;
  // This length does not yet contain host bindings from child directives because at this point,
  // we don't know which directives are active on this template. As soon as a directive is matched
  // that has a host binding, we will update the blueprint with that def's hostVars count.
  const initialViewLength = bindingStartIndex + vars;
  const blueprint = createViewBlueprint(bindingStartIndex, initialViewLength);
  const consts = typeof constsOrFactory === 'function' ? constsOrFactory() : constsOrFactory;
  const tView = (blueprint[TVIEW as any] = {
    type: type,
    blueprint: blueprint,
    template: templateFn,
    queries: null,
    viewQuery: viewQuery,
    declTNode: declTNode,
    data: blueprint.slice().fill(null, bindingStartIndex),
    bindingStartIndex: bindingStartIndex,
    expandoStartIndex: initialViewLength,
    hostBindingOpCodes: null,
    firstCreatePass: true,
    firstUpdatePass: true,
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
    consts: consts,
    incompleteFirstPass: false,
    ssrId,
  });
  if (ngDevMode) {
    // For performance reasons it is important that the tView retains the same shape during runtime.
    // (To make sure that all of the code is monomorphic.) For this reason we seal the object to
    // prevent class transitions.
    Object.seal(tView);
  }
  return tView;
}

function createViewBlueprint(bindingStartIndex: number, initialViewLength: number): LView {
  const blueprint = [];

  for (let i = 0; i < initialViewLength; i++) {
    blueprint.push(i < bindingStartIndex ? null : NO_CHANGE);
  }

  return blueprint as LView;
}

/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param renderer the renderer used to locate the element.
 * @param elementOrSelector Render element or CSS selector to locate the element.
 * @param encapsulation View Encapsulation defined for component that requests host element.
 * @param injector Root view injector instance.
 */
export function locateHostElement(
  renderer: Renderer,
  elementOrSelector: RElement | string,
  encapsulation: ViewEncapsulation,
  injector: Injector,
): RElement {
  // Note: we use default value for the `PRESERVE_HOST_CONTENT` here even though it's a
  // tree-shakable one (providedIn:'root'). This code path can be triggered during dynamic
  // component creation (after calling ViewContainerRef.createComponent) when an injector
  // instance can be provided. The injector instance might be disconnected from the main DI
  // tree, thus the `PRESERVE_HOST_CONTENT` would not be able to instantiate. In this case, the
  // default value will be used.
  const preserveHostContent = injector.get(PRESERVE_HOST_CONTENT, PRESERVE_HOST_CONTENT_DEFAULT);

  // When using native Shadow DOM, do not clear host element to allow native slot
  // projection.
  const preserveContent = preserveHostContent || encapsulation === ViewEncapsulation.ShadowDom;
  const rootElement = renderer.selectRootElement(elementOrSelector, preserveContent);
  applyRootElementTransform(rootElement as HTMLElement);
  return rootElement;
}

/**
 * Applies any root element transformations that are needed. If hydration is enabled,
 * this will process corrupted text nodes.
 *
 * @param rootElement the app root HTML Element
 */
export function applyRootElementTransform(rootElement: HTMLElement) {
  _applyRootElementTransformImpl(rootElement as HTMLElement);
}

/**
 * Reference to a function that applies transformations to the root HTML element
 * of an app. When hydration is enabled, this processes any corrupt text nodes
 * so they are properly hydratable on the client.
 *
 * @param rootElement the app root HTML Element
 */
let _applyRootElementTransformImpl: typeof applyRootElementTransformImpl = () => null;

/**
 * Processes text node markers before hydration begins. This replaces any special comment
 * nodes that were added prior to serialization are swapped out to restore proper text
 * nodes before hydration.
 *
 * @param rootElement the app root HTML Element
 */
export function applyRootElementTransformImpl(rootElement: HTMLElement) {
  if (hasSkipHydrationAttrOnRElement(rootElement)) {
    // Handle a situation when the `ngSkipHydration` attribute is applied
    // to the root node of an application. In this case, we should clear
    // the contents and render everything from scratch.
    clearElementContents(rootElement as RElement);
  } else {
    processTextNodeMarkersBeforeHydration(rootElement);
  }
}

/**
 * Sets the implementation for the `applyRootElementTransform` function.
 */
export function enableApplyRootElementTransformImpl() {
  _applyRootElementTransformImpl = applyRootElementTransformImpl;
}

/** Mode for capturing node bindings. */
const enum CaptureNodeBindingMode {
  Inputs,
  Outputs,
}

/**
 * Captures node input bindings for the given directive based on the inputs metadata.
 * This will be called multiple times to combine inputs from various directives on a node.
 *
 * The host binding alias map is used to alias and filter out properties for host directives.
 * If the mapping is provided, it'll act as an allowlist, as well as a mapping of what public
 * name inputs/outputs should be exposed under.
 */
function captureNodeBindings<T>(
  mode: CaptureNodeBindingMode.Inputs,
  inputs: DirectiveDef<T>['inputs'],
  directiveIndex: number,
  bindingsResult: NodeInputBindings | null,
  hostDirectiveAliasMap: HostDirectiveBindingMap | null,
): NodeInputBindings | null;
/**
 * Captures node output bindings for the given directive based on the output metadata.
 * This will be called multiple times to combine inputs from various directives on a node.
 *
 * The host binding alias map is used to alias and filter out properties for host directives.
 * If the mapping is provided, it'll act as an allowlist, as well as a mapping of what public
 * name inputs/outputs should be exposed under.
 */
function captureNodeBindings<T>(
  mode: CaptureNodeBindingMode.Outputs,
  outputs: DirectiveDef<T>['outputs'],
  directiveIndex: number,
  bindingsResult: NodeOutputBindings | null,
  hostDirectiveAliasMap: HostDirectiveBindingMap | null,
): NodeOutputBindings | null;

function captureNodeBindings<T>(
  mode: CaptureNodeBindingMode,
  aliasMap: DirectiveDef<T>['inputs'] | DirectiveDef<T>['outputs'],
  directiveIndex: number,
  bindingsResult: NodeInputBindings | NodeOutputBindings | null,
  hostDirectiveAliasMap: HostDirectiveBindingMap | null,
): NodeInputBindings | NodeOutputBindings | null {
  for (let publicName in aliasMap) {
    if (!aliasMap.hasOwnProperty(publicName)) {
      continue;
    }

    const value = aliasMap[publicName];
    if (value === undefined) {
      continue;
    }

    bindingsResult ??= {};

    let internalName: string;
    let inputFlags = InputFlags.None;

    // For inputs, the value might be an array capturing additional
    // input flags.
    if (Array.isArray(value)) {
      internalName = value[0];
      inputFlags = value[1];
    } else {
      internalName = value;
    }

    // If there are no host directive mappings, we want to remap using the alias map from the
    // definition itself. If there is an alias map, it has two functions:
    // 1. It serves as an allowlist of bindings that are exposed by the host directives. Only the
    // ones inside the host directive map will be exposed on the host.
    // 2. The public name of the property is aliased using the host directive alias map, rather
    // than the alias map from the definition.
    let finalPublicName: string = publicName;
    if (hostDirectiveAliasMap !== null) {
      // If there is no mapping, it's not part of the allowlist and this input/output
      // is not captured and should be ignored.
      if (!hostDirectiveAliasMap.hasOwnProperty(publicName)) {
        continue;
      }
      finalPublicName = hostDirectiveAliasMap[publicName];
    }

    if (mode === CaptureNodeBindingMode.Inputs) {
      addPropertyBinding(
        bindingsResult as NodeInputBindings,
        directiveIndex,
        finalPublicName,
        internalName,
        inputFlags,
      );
    } else {
      addPropertyBinding(
        bindingsResult as NodeOutputBindings,
        directiveIndex,
        finalPublicName,
        internalName,
      );
    }
  }
  return bindingsResult;
}

function addPropertyBinding(
  bindings: NodeInputBindings,
  directiveIndex: number,
  publicName: string,
  internalName: string,
  inputFlags: InputFlags,
): void;
function addPropertyBinding(
  bindings: NodeOutputBindings,
  directiveIndex: number,
  publicName: string,
  internalName: string,
): void;

function addPropertyBinding(
  bindings: NodeInputBindings | NodeOutputBindings,
  directiveIndex: number,
  publicName: string,
  internalName: string,
  inputFlags?: InputFlags,
) {
  let values: (typeof bindings)[typeof publicName];

  if (bindings.hasOwnProperty(publicName)) {
    (values = bindings[publicName]).push(directiveIndex, internalName);
  } else {
    values = bindings[publicName] = [directiveIndex, internalName];
  }

  if (inputFlags !== undefined) {
    (values as NodeInputBindings[typeof publicName]).push(inputFlags);
  }
}

/**
 * Initializes data structures required to work with directive inputs and outputs.
 * Initialization is done for all directives matched on a given TNode.
 */
function initializeInputAndOutputAliases(
  tView: TView,
  tNode: TNode,
  hostDirectiveDefinitionMap: HostDirectiveDefs | null,
): void {
  ngDevMode && assertFirstCreatePass(tView);

  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  const tViewData = tView.data;

  const tNodeAttrs = tNode.attrs;
  const inputsFromAttrs: InitialInputData = [];
  let inputsStore: NodeInputBindings | null = null;
  let outputsStore: NodeOutputBindings | null = null;

  for (let directiveIndex = start; directiveIndex < end; directiveIndex++) {
    const directiveDef = tViewData[directiveIndex] as DirectiveDef<any>;
    const aliasData = hostDirectiveDefinitionMap
      ? hostDirectiveDefinitionMap.get(directiveDef)
      : null;
    const aliasedInputs = aliasData ? aliasData.inputs : null;
    const aliasedOutputs = aliasData ? aliasData.outputs : null;

    inputsStore = captureNodeBindings(
      CaptureNodeBindingMode.Inputs,
      directiveDef.inputs,
      directiveIndex,
      inputsStore,
      aliasedInputs,
    );
    outputsStore = captureNodeBindings(
      CaptureNodeBindingMode.Outputs,
      directiveDef.outputs,
      directiveIndex,
      outputsStore,
      aliasedOutputs,
    );
    // Do not use unbound attributes as inputs to structural directives, since structural
    // directive inputs can only be set using microsyntax (e.g. `<div *dir="exp">`).
    // TODO(FW-1930): microsyntax expressions may also contain unbound/static attributes, which
    // should be set for inline templates.
    const initialInputs =
      inputsStore !== null && tNodeAttrs !== null && !isInlineTemplate(tNode)
        ? generateInitialInputs(inputsStore, directiveIndex, tNodeAttrs)
        : null;
    inputsFromAttrs.push(initialInputs);
  }

  if (inputsStore !== null) {
    if (inputsStore.hasOwnProperty('class')) {
      tNode.flags |= TNodeFlags.hasClassInput;
    }
    if (inputsStore.hasOwnProperty('style')) {
      tNode.flags |= TNodeFlags.hasStyleInput;
    }
  }

  tNode.initialInputs = inputsFromAttrs;
  tNode.inputs = inputsStore;
  tNode.outputs = outputsStore;
}

/**
 * Mapping between attributes names that don't correspond to their element property names.
 *
 * Performance note: this function is written as a series of if checks (instead of, say, a property
 * object lookup) for performance reasons - the series of `if` checks seems to be the fastest way of
 * mapping property names. Do NOT change without benchmarking.
 *
 * Note: this mapping has to be kept in sync with the equally named mapping in the template
 * type-checking machinery of ngtsc.
 */
function mapPropName(name: string): string {
  if (name === 'class') return 'className';
  if (name === 'for') return 'htmlFor';
  if (name === 'formaction') return 'formAction';
  if (name === 'innerHtml') return 'innerHTML';
  if (name === 'readonly') return 'readOnly';
  if (name === 'tabindex') return 'tabIndex';
  return name;
}

export function elementPropertyInternal<T>(
  tView: TView,
  tNode: TNode,
  lView: LView,
  propName: string,
  value: T,
  renderer: Renderer,
  sanitizer: SanitizerFn | null | undefined,
  nativeOnly: boolean,
): void {
  ngDevMode && assertNotSame(value, NO_CHANGE as any, 'Incoming value should never be NO_CHANGE.');
  const element = getNativeByTNode(tNode, lView) as RElement | RComment;
  let inputData = tNode.inputs;
  let dataValue: NodeInputBindings[typeof propName] | undefined;
  if (!nativeOnly && inputData != null && (dataValue = inputData[propName])) {
    setInputsForProperty(tView, lView, dataValue, propName, value);
    if (isComponentHost(tNode)) markDirtyIfOnPush(lView, tNode.index);
    if (ngDevMode) {
      setNgReflectProperties(lView, element, tNode.type, dataValue, value);
    }
  } else if (tNode.type & TNodeType.AnyRNode) {
    propName = mapPropName(propName);

    if (ngDevMode) {
      validateAgainstEventProperties(propName);
      if (!isPropertyValid(element, propName, tNode.value, tView.schemas)) {
        handleUnknownPropertyError(propName, tNode.value, tNode.type, lView);
      }
      ngDevMode.rendererSetProperty++;
    }

    // It is assumed that the sanitizer is only added when the compiler determines that the
    // property is risky, so sanitization can be done without further checks.
    value = sanitizer != null ? (sanitizer(value, tNode.value || '', propName) as any) : value;
    renderer.setProperty(element as RElement, propName, value);
  } else if (tNode.type & TNodeType.AnyContainer) {
    // If the node is a container and the property didn't
    // match any of the inputs or schemas we should throw.
    if (ngDevMode && !matchingSchemas(tView.schemas, tNode.value)) {
      handleUnknownPropertyError(propName, tNode.value, tNode.type, lView);
    }
  }
}

/** If node is an OnPush component, marks its LView dirty. */
export function markDirtyIfOnPush(lView: LView, viewIndex: number): void {
  ngDevMode && assertLView(lView);
  const childComponentLView = getComponentLViewByIndex(viewIndex, lView);
  if (!(childComponentLView[FLAGS] & LViewFlags.CheckAlways)) {
    childComponentLView[FLAGS] |= LViewFlags.Dirty;
  }
}

function setNgReflectProperty(
  lView: LView,
  element: RElement | RComment,
  type: TNodeType,
  attrName: string,
  value: any,
) {
  const renderer = lView[RENDERER];
  attrName = normalizeDebugBindingName(attrName);
  const debugValue = normalizeDebugBindingValue(value);
  if (type & TNodeType.AnyRNode) {
    if (value == null) {
      renderer.removeAttribute(element as RElement, attrName);
    } else {
      renderer.setAttribute(element as RElement, attrName, debugValue);
    }
  } else {
    const textContent = escapeCommentText(
      `bindings=${JSON.stringify({[attrName]: debugValue}, null, 2)}`,
    );
    renderer.setValue(element as RComment, textContent);
  }
}

export function setNgReflectProperties(
  lView: LView,
  element: RElement | RComment,
  type: TNodeType,
  dataValue: NodeInputBindings[string],
  value: any,
) {
  if (type & (TNodeType.AnyRNode | TNodeType.Container)) {
    /**
     * dataValue is an array containing runtime input or output names for the directives:
     * i+0: directive instance index
     * i+1: privateName
     *
     * e.g. [0, 'change', 'change-minified']
     * we want to set the reflected property with the privateName: dataValue[i+1]
     */
    for (let i = 0; i < dataValue.length; i += 3) {
      setNgReflectProperty(lView, element, type, dataValue[i + 1] as string, value);
    }
  }
}

/**
 * Resolve the matched directives on a node.
 */
export function resolveDirectives(
  tView: TView,
  lView: LView,
  tNode: TElementNode | TContainerNode | TElementContainerNode,
  localRefs: string[] | null,
): void {
  // Please make sure to have explicit type for `exportsMap`. Inferred type triggers bug in
  // tsickle.
  ngDevMode && assertFirstCreatePass(tView);

  if (getBindingsEnabled()) {
    const exportsMap: {[key: string]: number} | null = localRefs === null ? null : {'': -1};
    const matchedDirectiveDefs = findDirectiveDefMatches(tView, tNode);

    if (matchedDirectiveDefs !== null) {
      const [directiveDefs, hostDirectiveDefs] = resolveHostDirectives(
        tView,
        tNode,
        matchedDirectiveDefs,
      );
      initializeDirectives(tView, lView, tNode, directiveDefs, exportsMap, hostDirectiveDefs);
    }
    if (exportsMap) cacheMatchingLocalNames(tNode, localRefs, exportsMap);
  }

  // Merge the template attrs last so that they have the highest priority.
  tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, tNode.attrs);
}

/** Initializes the data structures necessary for a list of directives to be instantiated. */
export function initializeDirectives(
  tView: TView,
  lView: LView<unknown>,
  tNode: TElementNode | TContainerNode | TElementContainerNode,
  directives: DirectiveDef<unknown>[],
  exportsMap: {[key: string]: number} | null,
  hostDirectiveDefs: HostDirectiveDefs | null,
) {
  ngDevMode && assertFirstCreatePass(tView);

  // Publishes the directive types to DI so they can be injected. Needs to
  // happen in a separate pass before the TNode flags have been initialized.
  for (let i = 0; i < directives.length; i++) {
    diPublicInInjector(getOrCreateNodeInjectorForNode(tNode, lView), tView, directives[i].type);
  }

  initTNodeFlags(tNode, tView.data.length, directives.length);

  // When the same token is provided by several directives on the same node, some rules apply in
  // the viewEngine:
  // - viewProviders have priority over providers
  // - the last directive in NgModule.declarations has priority over the previous one
  // So to match these rules, the order in which providers are added in the arrays is very
  // important.
  for (let i = 0; i < directives.length; i++) {
    const def = directives[i];
    if (def.providersResolver) def.providersResolver(def);
  }
  let preOrderHooksFound = false;
  let preOrderCheckHooksFound = false;
  let directiveIdx = allocExpando(tView, lView, directives.length, null);
  ngDevMode &&
    assertSame(
      directiveIdx,
      tNode.directiveStart,
      'TNode.directiveStart should point to just allocated space',
    );

  for (let i = 0; i < directives.length; i++) {
    const def = directives[i];
    // Merge the attrs in the order of matches. This assumes that the first directive is the
    // component itself, so that the component has the least priority.
    tNode.mergedAttrs = mergeHostAttrs(tNode.mergedAttrs, def.hostAttrs);

    configureViewWithDirective(tView, tNode, lView, directiveIdx, def);
    saveNameToExportMap(directiveIdx, def, exportsMap);

    if (def.contentQueries !== null) tNode.flags |= TNodeFlags.hasContentQuery;
    if (def.hostBindings !== null || def.hostAttrs !== null || def.hostVars !== 0)
      tNode.flags |= TNodeFlags.hasHostBindings;

    const lifeCycleHooks: Partial<OnChanges & OnInit & DoCheck> = def.type.prototype;
    // Only push a node index into the preOrderHooks array if this is the first
    // pre-order hook found on this node.
    if (
      !preOrderHooksFound &&
      (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngOnInit || lifeCycleHooks.ngDoCheck)
    ) {
      // We will push the actual hook function into this array later during dir instantiation.
      // We cannot do it now because we must ensure hooks are registered in the same
      // order that directives are created (i.e. injection order).
      (tView.preOrderHooks ??= []).push(tNode.index);
      preOrderHooksFound = true;
    }

    if (!preOrderCheckHooksFound && (lifeCycleHooks.ngOnChanges || lifeCycleHooks.ngDoCheck)) {
      (tView.preOrderCheckHooks ??= []).push(tNode.index);
      preOrderCheckHooksFound = true;
    }

    directiveIdx++;
  }

  initializeInputAndOutputAliases(tView, tNode, hostDirectiveDefs);
}

/**
 * Add `hostBindings` to the `TView.hostBindingOpCodes`.
 *
 * @param tView `TView` to which the `hostBindings` should be added.
 * @param tNode `TNode` the element which contains the directive
 * @param directiveIdx Directive index in view.
 * @param directiveVarsIdx Where will the directive's vars be stored
 * @param def `ComponentDef`/`DirectiveDef`, which contains the `hostVars`/`hostBindings` to add.
 */
export function registerHostBindingOpCodes(
  tView: TView,
  tNode: TNode,
  directiveIdx: number,
  directiveVarsIdx: number,
  def: ComponentDef<any> | DirectiveDef<any>,
): void {
  ngDevMode && assertFirstCreatePass(tView);

  const hostBindings = def.hostBindings;
  if (hostBindings) {
    let hostBindingOpCodes = tView.hostBindingOpCodes;
    if (hostBindingOpCodes === null) {
      hostBindingOpCodes = tView.hostBindingOpCodes = [] as any as HostBindingOpCodes;
    }
    const elementIndx = ~tNode.index;
    if (lastSelectedElementIdx(hostBindingOpCodes) != elementIndx) {
      // Conditionally add select element so that we are more efficient in execution.
      // NOTE: this is strictly not necessary and it trades code size for runtime perf.
      // (We could just always add it.)
      hostBindingOpCodes.push(elementIndx);
    }
    hostBindingOpCodes.push(directiveIdx, directiveVarsIdx, hostBindings);
  }
}

/**
 * Returns the last selected element index in the `HostBindingOpCodes`
 *
 * For perf reasons we don't need to update the selected element index in `HostBindingOpCodes` only
 * if it changes. This method returns the last index (or '0' if not found.)
 *
 * Selected element index are only the ones which are negative.
 */
function lastSelectedElementIdx(hostBindingOpCodes: HostBindingOpCodes): number {
  let i = hostBindingOpCodes.length;
  while (i > 0) {
    const value = hostBindingOpCodes[--i];
    if (typeof value === 'number' && value < 0) {
      return value;
    }
  }
  return 0;
}

/**
 * Instantiate all the directives that were previously resolved on the current node.
 */
function instantiateAllDirectives(tView: TView, lView: LView, tNode: TDirectiveHostNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;

  // The component view needs to be created before creating the node injector
  // since it is used to inject some special symbols like `ChangeDetectorRef`.
  if (isComponentHost(tNode)) {
    ngDevMode && assertTNodeType(tNode, TNodeType.AnyRNode);
    createComponentLView(
      lView,
      tNode as TElementNode,
      tView.data[start + tNode.componentOffset] as ComponentDef<unknown>,
    );
  }

  if (!tView.firstCreatePass) {
    getOrCreateNodeInjectorForNode(tNode, lView);
  }

  const initialInputs = tNode.initialInputs;
  for (let i = start; i < end; i++) {
    const def = tView.data[i] as DirectiveDef<any>;
    const directive = getNodeInjectable(lView, tView, i, tNode);
    attachPatchData(directive, lView);

    if (initialInputs !== null) {
      setInputsFromAttrs(lView, i - start, directive, def, tNode, initialInputs!);
    }

    if (isComponentDef(def)) {
      const componentView = getComponentLViewByIndex(tNode.index, lView);
      componentView[CONTEXT] = getNodeInjectable(lView, tView, i, tNode);
    }
  }
}

export function invokeDirectivesHostBindings(tView: TView, lView: LView, tNode: TNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  const elementIndex = tNode.index;
  const currentDirectiveIndex = getCurrentDirectiveIndex();
  try {
    setSelectedIndex(elementIndex);
    for (let dirIndex = start; dirIndex < end; dirIndex++) {
      const def = tView.data[dirIndex] as DirectiveDef<unknown>;
      const directive = lView[dirIndex];
      setCurrentDirectiveIndex(dirIndex);
      if (def.hostBindings !== null || def.hostVars !== 0 || def.hostAttrs !== null) {
        invokeHostBindingsInCreationMode(def, directive);
      }
    }
  } finally {
    setSelectedIndex(-1);
    setCurrentDirectiveIndex(currentDirectiveIndex);
  }
}

/**
 * Invoke the host bindings in creation mode.
 *
 * @param def `DirectiveDef` which may contain the `hostBindings` function.
 * @param directive Instance of directive.
 */
export function invokeHostBindingsInCreationMode(def: DirectiveDef<any>, directive: any) {
  if (def.hostBindings !== null) {
    def.hostBindings!(RenderFlags.Create, directive);
  }
}

/**
 * Matches the current node against all available selectors.
 * If a component is matched (at most one), it is returned in first position in the array.
 */
function findDirectiveDefMatches(
  tView: TView,
  tNode: TElementNode | TContainerNode | TElementContainerNode,
): DirectiveDef<unknown>[] | null {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && assertTNodeType(tNode, TNodeType.AnyRNode | TNodeType.AnyContainer);

  const registry = tView.directiveRegistry;
  let matches: DirectiveDef<unknown>[] | null = null;
  if (registry) {
    for (let i = 0; i < registry.length; i++) {
      const def = registry[i] as ComponentDef<any> | DirectiveDef<any>;
      if (isNodeMatchingSelectorList(tNode, def.selectors!, /* isProjectionMode */ false)) {
        matches ??= [];

        if (isComponentDef(def)) {
          if (ngDevMode) {
            assertTNodeType(
              tNode,
              TNodeType.Element,
              `"${tNode.value}" tags cannot be used as component hosts. ` +
                `Please use a different tag to activate the ${stringify(def.type)} component.`,
            );

            if (matches.length && isComponentDef(matches[0])) {
              throwMultipleComponentError(tNode, matches.find(isComponentDef)!.type, def.type);
            }
          }

          matches.unshift(def);
        } else {
          matches.push(def);
        }
      }
    }
  }

  return matches;
}

export function resolveHostDirectives(
  tView: TView,
  tNode: TNode,
  matches: DirectiveDef<unknown>[],
): [matches: DirectiveDef<unknown>[], hostDirectiveDefs: HostDirectiveDefs | null] {
  const allDirectiveDefs: DirectiveDef<unknown>[] = [];
  let hostDirectiveDefs: HostDirectiveDefs | null = null;

  for (const def of matches) {
    if (def.findHostDirectiveDefs !== null) {
      // TODO(pk): probably could return matches instead of taking in an array to fill in?
      hostDirectiveDefs ??= new Map();
      // Components are inserted at the front of the matches array so that their lifecycle
      // hooks run before any directive lifecycle hooks. This appears to be for ViewEngine
      // compatibility. This logic doesn't make sense with host directives, because it
      // would allow the host directives to undo any overrides the host may have made.
      // To handle this case, the host directives of components are inserted at the beginning
      // of the array, followed by the component. As such, the insertion order is as follows:
      // 1. Host directives belonging to the selector-matched component.
      // 2. Selector-matched component.
      // 3. Host directives belonging to selector-matched directives.
      // 4. Selector-matched directives.
      def.findHostDirectiveDefs(def, allDirectiveDefs, hostDirectiveDefs);
    }

    if (isComponentDef(def)) {
      allDirectiveDefs.push(def);
      markAsComponentHost(tView, tNode, allDirectiveDefs.length - 1);
    }
  }

  if (isComponentHost(tNode)) {
    allDirectiveDefs.push(...matches.slice(1));
  } else {
    allDirectiveDefs.push(...matches);
  }

  if (ngDevMode) {
    assertNoDuplicateDirectives(allDirectiveDefs);
  }

  return [allDirectiveDefs, hostDirectiveDefs];
}

/**
 * Marks a given TNode as a component's host. This consists of:
 * - setting the component offset on the TNode.
 * - storing index of component's host element so it will be queued for view refresh during CD.
 */
export function markAsComponentHost(tView: TView, hostTNode: TNode, componentOffset: number): void {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && assertGreaterThan(componentOffset, -1, 'componentOffset must be great than -1');
  hostTNode.componentOffset = componentOffset;
  (tView.components ??= []).push(hostTNode.index);
}

/** Caches local names and their matching directive indices for query and template lookups. */
function cacheMatchingLocalNames(
  tNode: TNode,
  localRefs: string[] | null,
  exportsMap: {[key: string]: number},
): void {
  if (localRefs) {
    const localNames: (string | number)[] = (tNode.localNames = []);

    // Local names must be stored in tNode in the same order that localRefs are defined
    // in the template to ensure the data is loaded in the same slots as their refs
    // in the template (for template queries).
    for (let i = 0; i < localRefs.length; i += 2) {
      const index = exportsMap[localRefs[i + 1]];
      if (index == null)
        throw new RuntimeError(
          RuntimeErrorCode.EXPORT_NOT_FOUND,
          ngDevMode && `Export of name '${localRefs[i + 1]}' not found!`,
        );
      localNames.push(localRefs[i], index);
    }
  }
}

/**
 * Builds up an export map as directives are created, so local refs can be quickly mapped
 * to their directive instances.
 */
function saveNameToExportMap(
  directiveIdx: number,
  def: DirectiveDef<any> | ComponentDef<any>,
  exportsMap: {[key: string]: number} | null,
) {
  if (exportsMap) {
    if (def.exportAs) {
      for (let i = 0; i < def.exportAs.length; i++) {
        exportsMap[def.exportAs[i]] = directiveIdx;
      }
    }
    if (isComponentDef(def)) exportsMap[''] = directiveIdx;
  }
}

/**
 * Initializes the flags on the current node, setting all indices to the initial index,
 * the directive count to 0, and adding the isComponent flag.
 * @param index the initial index
 */
function initTNodeFlags(tNode: TNode, index: number, numberOfDirectives: number) {
  ngDevMode &&
    assertNotEqual(
      numberOfDirectives,
      tNode.directiveEnd - tNode.directiveStart,
      'Reached the max number of directives',
    );
  tNode.flags |= TNodeFlags.isDirectiveHost;
  // When the first directive is created on a node, save the index
  tNode.directiveStart = index;
  tNode.directiveEnd = index + numberOfDirectives;
  tNode.providerIndexes = index;
}

/**
 * Setup directive for instantiation.
 *
 * We need to create a `NodeInjectorFactory` which is then inserted in both the `Blueprint` as well
 * as `LView`. `TView` gets the `DirectiveDef`.
 *
 * @param tView `TView`
 * @param tNode `TNode`
 * @param lView `LView`
 * @param directiveIndex Index where the directive will be stored in the Expando.
 * @param def `DirectiveDef`
 */
export function configureViewWithDirective<T>(
  tView: TView,
  tNode: TNode,
  lView: LView,
  directiveIndex: number,
  def: DirectiveDef<T>,
): void {
  ngDevMode &&
    assertGreaterThanOrEqual(directiveIndex, HEADER_OFFSET, 'Must be in Expando section');
  tView.data[directiveIndex] = def;
  const directiveFactory =
    def.factory || ((def as Writable<DirectiveDef<T>>).factory = getFactoryDef(def.type, true));
  // Even though `directiveFactory` will already be using `ɵɵdirectiveInject` in its generated code,
  // we also want to support `inject()` directly from the directive constructor context so we set
  // `ɵɵdirectiveInject` as the inject implementation here too.
  const nodeInjectorFactory = new NodeInjectorFactory(
    directiveFactory,
    isComponentDef(def),
    ɵɵdirectiveInject,
  );
  tView.blueprint[directiveIndex] = nodeInjectorFactory;
  lView[directiveIndex] = nodeInjectorFactory;

  registerHostBindingOpCodes(
    tView,
    tNode,
    directiveIndex,
    allocExpando(tView, lView, def.hostVars, NO_CHANGE),
    def,
  );
}

/**
 * Gets the initial set of LView flags based on the component definition that the LView represents.
 * @param def Component definition from which to determine the flags.
 */
export function getInitialLViewFlagsFromDef(def: ComponentDef<unknown>): LViewFlags {
  let flags = LViewFlags.CheckAlways;
  if (def.signals) {
    flags = LViewFlags.SignalView;
  } else if (def.onPush) {
    flags = LViewFlags.Dirty;
  }
  return flags;
}

function createComponentLView<T>(
  lView: LView,
  hostTNode: TElementNode,
  def: ComponentDef<T>,
): LView {
  const native = getNativeByTNode(hostTNode, lView) as RElement;
  const tView = getOrCreateComponentTView(def);

  // Only component views should be added to the view tree directly. Embedded views are
  // accessed through their containers because they may be removed / re-added later.
  const rendererFactory = lView[ENVIRONMENT].rendererFactory;
  const componentView = addToEndOfViewTree(
    lView,
    createLView(
      lView,
      tView,
      null,
      getInitialLViewFlagsFromDef(def),
      native,
      hostTNode as TElementNode,
      null,
      rendererFactory.createRenderer(native, def),
      null,
      null,
      null,
    ),
  );

  // Component view will always be created before any injected LContainers,
  // so this is a regular element, wrap it with the component view
  return (lView[hostTNode.index] = componentView);
}

export function elementAttributeInternal(
  tNode: TNode,
  lView: LView,
  name: string,
  value: any,
  sanitizer: SanitizerFn | null | undefined,
  namespace: string | null | undefined,
) {
  if (ngDevMode) {
    assertNotSame(value, NO_CHANGE as any, 'Incoming value should never be NO_CHANGE.');
    validateAgainstEventAttributes(name);
    assertTNodeType(
      tNode,
      TNodeType.Element,
      `Attempted to set attribute \`${name}\` on a container node. ` +
        `Host bindings are not valid on ng-container or ng-template.`,
    );
  }
  const element = getNativeByTNode(tNode, lView) as RElement;
  setElementAttribute(lView[RENDERER], element, namespace, tNode.value, name, value, sanitizer);
}

export function setElementAttribute(
  renderer: Renderer,
  element: RElement,
  namespace: string | null | undefined,
  tagName: string | null,
  name: string,
  value: any,
  sanitizer: SanitizerFn | null | undefined,
) {
  if (value == null) {
    ngDevMode && ngDevMode.rendererRemoveAttribute++;
    renderer.removeAttribute(element, name, namespace);
  } else {
    ngDevMode && ngDevMode.rendererSetAttribute++;
    const strValue =
      sanitizer == null ? renderStringify(value) : sanitizer(value, tagName || '', name);

    renderer.setAttribute(element, name, strValue as string, namespace);
  }
}

/**
 * Sets initial input properties on directive instances from attribute data
 *
 * @param lView Current LView that is being processed.
 * @param directiveIndex Index of the directive in directives array
 * @param instance Instance of the directive on which to set the initial inputs
 * @param def The directive def that contains the list of inputs
 * @param tNode The static data for this node
 */
function setInputsFromAttrs<T>(
  lView: LView,
  directiveIndex: number,
  instance: T,
  def: DirectiveDef<T>,
  tNode: TNode,
  initialInputData: InitialInputData,
): void {
  const initialInputs: InitialInputs | null = initialInputData![directiveIndex];
  if (initialInputs !== null) {
    for (let i = 0; i < initialInputs.length; ) {
      const publicName = initialInputs[i++] as string;
      const privateName = initialInputs[i++] as string;
      const flags = initialInputs[i++] as InputFlags;
      const value = initialInputs[i++] as string;

      writeToDirectiveInput<T>(def, instance, publicName, privateName, flags, value);

      if (ngDevMode) {
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
 * @param inputs Input alias map that was generated from the directive def inputs.
 * @param directiveIndex Index of the directive that is currently being processed.
 * @param attrs Static attrs on this node.
 */
function generateInitialInputs(
  inputs: NodeInputBindings,
  directiveIndex: number,
  attrs: TAttributes,
): InitialInputs | null {
  let inputsToStore: InitialInputs | null = null;
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

    if (inputs.hasOwnProperty(attrName as string)) {
      if (inputsToStore === null) inputsToStore = [];

      // Find the input's public name from the input store. Note that we can be found easier
      // through the directive def, but we want to do it using the inputs store so that it can
      // account for host directive aliases.
      const inputConfig = inputs[attrName as string];
      for (let j = 0; j < inputConfig.length; j += 3) {
        if (inputConfig[j] === directiveIndex) {
          inputsToStore.push(
            attrName as string,
            inputConfig[j + 1] as string,
            inputConfig[j + 2] as InputFlags,
            attrs[i + 1] as string,
          );
          // A directive can't have multiple inputs with the same name so we can break here.
          break;
        }
      }
    }

    i += 2;
  }
  return inputsToStore;
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
  hostNative: RElement | RComment | LView,
  currentView: LView,
  native: RComment,
  tNode: TNode,
): LContainer {
  ngDevMode && assertLView(currentView);
  const lContainer: LContainer = [
    hostNative, // host native
    true, // Boolean `true` in this position signifies that this is an `LContainer`
    0, // flags
    currentView, // parent
    null, // next
    tNode, // t_host
    null, // dehydrated views
    native, // native,
    null, // view refs
    null, // moved views
  ];
  ngDevMode &&
    assertEqual(
      lContainer.length,
      CONTAINER_HEADER_OFFSET,
      'Should allocate correct number of slots for LContainer header.',
    );
  return lContainer;
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
export function addToEndOfViewTree<T extends LView | LContainer>(
  lView: LView,
  lViewOrLContainer: T,
): T {
  // TODO(benlesh/misko): This implementation is incorrect, because it always adds the LContainer
  // to the end of the queue, which means if the developer retrieves the LContainers from RNodes out
  // of order, the change detection will run out of order, as the act of retrieving the the
  // LContainer from the RNode is what adds it to the queue.
  if (lView[CHILD_HEAD]) {
    lView[CHILD_TAIL]![NEXT] = lViewOrLContainer;
  } else {
    lView[CHILD_HEAD] = lViewOrLContainer;
  }
  lView[CHILD_TAIL] = lViewOrLContainer;
  return lViewOrLContainer;
}

///////////////////////////////
//// Bindings & interpolations
///////////////////////////////

/**
 * Stores meta-data for a property binding to be used by TestBed's `DebugElement.properties`.
 *
 * In order to support TestBed's `DebugElement.properties` we need to save, for each binding:
 * - a bound property name;
 * - a static parts of interpolated strings;
 *
 * A given property metadata is saved at the binding's index in the `TView.data` (in other words, a
 * property binding metadata will be stored in `TView.data` at the same index as a bound value in
 * `LView`). Metadata are represented as `INTERPOLATION_DELIMITER`-delimited string with the
 * following format:
 * - `propertyName` for bound properties;
 * - `propertyName�prefix�interpolation_static_part1�..interpolation_static_partN�suffix` for
 * interpolated properties.
 *
 * @param tData `TData` where meta-data will be saved;
 * @param tNode `TNode` that is a target of the binding;
 * @param propertyName bound property name;
 * @param bindingIndex binding index in `LView`
 * @param interpolationParts static interpolation parts (for property interpolations)
 */
export function storePropertyBindingMetadata(
  tData: TData,
  tNode: TNode,
  propertyName: string,
  bindingIndex: number,
  ...interpolationParts: string[]
) {
  // Binding meta-data are stored only the first time a given property instruction is processed.
  // Since we don't have a concept of the "first update pass" we need to check for presence of the
  // binding meta-data to decide if one should be stored (or if was stored already).
  if (tData[bindingIndex] === null) {
    if (tNode.inputs == null || !tNode.inputs[propertyName]) {
      const propBindingIdxs = tNode.propertyBindings || (tNode.propertyBindings = []);
      propBindingIdxs.push(bindingIndex);
      let bindingMetadata = propertyName;
      if (interpolationParts.length > 0) {
        bindingMetadata +=
          INTERPOLATION_DELIMITER + interpolationParts.join(INTERPOLATION_DELIMITER);
      }
      tData[bindingIndex] = bindingMetadata;
    }
  }
}

/**
 * There are cases where the sub component's renderer needs to be included
 * instead of the current renderer (see the componentSyntheticHost* instructions).
 */
export function loadComponentRenderer(
  currentDef: DirectiveDef<any> | null,
  tNode: TNode,
  lView: LView,
): Renderer {
  // TODO(FW-2043): the `currentDef` is null when host bindings are invoked while creating root
  // component (see packages/core/src/render3/component.ts). This is not consistent with the process
  // of creating inner components, when current directive index is available in the state. In order
  // to avoid relying on current def being `null` (thus special-casing root component creation), the
  // process of creating root component should be unified with the process of creating inner
  // components.
  if (currentDef === null || isComponentDef(currentDef)) {
    lView = unwrapLView(lView[tNode.index])!;
  }
  return lView[RENDERER];
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
 * @param tView The current TView
 * @param lView the `LView` which contains the directives.
 * @param inputs mapping between the public "input" name and privately-known,
 *        possibly minified, property names to write to.
 * @param value Value to set.
 */
export function setInputsForProperty(
  tView: TView,
  lView: LView,
  inputs: NodeInputBindings[typeof publicName],
  publicName: string,
  value: unknown,
): void {
  for (let i = 0; i < inputs.length; ) {
    const index = inputs[i++] as number;
    const privateName = inputs[i++] as string;
    const flags = inputs[i++] as InputFlags;
    const instance = lView[index];
    ngDevMode && assertIndexInRange(lView, index);
    const def = tView.data[index] as DirectiveDef<any>;

    writeToDirectiveInput(def, instance, publicName, privateName, flags, value);
  }
}
