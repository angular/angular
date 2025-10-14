/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {INTERNAL_APPLICATION_ERROR_HANDLER} from '../../error_handler';
import {hasSkipHydrationAttrOnRElement} from '../../hydration/skip_hydration';
import {PRESERVE_HOST_CONTENT, PRESERVE_HOST_CONTENT_DEFAULT} from '../../hydration/tokens';
import {processTextNodeMarkersBeforeHydration} from '../../hydration/utils';
import {ViewEncapsulation} from '../../metadata/view';
import {
  validateAgainstEventAttributes,
  validateAgainstEventProperties,
} from '../../sanitization/sanitization';
import {assertIndexInRange, assertNotSame} from '../../util/assert';
import {escapeCommentText} from '../../util/dom';
import {normalizeDebugBindingName, normalizeDebugBindingValue} from '../../ng_reflect';
import {stringify} from '../../util/stringify';
import {assertFirstCreatePass, assertHasParent, assertLView} from '../assert';
import {attachPatchData} from '../context_discovery';
import {getNodeInjectable, getOrCreateNodeInjectorForNode} from '../di';
import {throwMultipleComponentError} from '../errors';
import {isComponentDef, isComponentHost, isDirectiveHost} from '../interfaces/type_checks';
import {
  CONTEXT,
  ENVIRONMENT,
  FLAGS,
  HEADER_OFFSET,
  INJECTOR,
  RENDERER,
  TVIEW,
} from '../interfaces/view';
import {assertTNodeType} from '../node_assert';
import {isNodeMatchingSelectorList} from '../node_selector_matcher';
import {profiler} from '../profiler';
import {
  getCurrentDirectiveIndex,
  getCurrentTNode,
  getElementDepthCount,
  getSelectedIndex,
  increaseElementDepthCount,
  isCurrentTNodeParent,
  isInCheckNoChangesMode,
  setCurrentDirectiveIndex,
  setCurrentTNode,
  setCurrentTNodeAsNotParent,
  setSelectedIndex,
  wasLastNodeCreated,
} from '../state';
import {NO_CHANGE} from '../tokens';
import {INTERPOLATION_DELIMITER} from '../util/misc_utils';
import {renderStringify} from '../util/stringify_utils';
import {getComponentLViewByIndex, getNativeByTNode, unwrapLView} from '../util/view_utils';
import {clearElementContents, setupStaticAttributes} from '../dom_node_manipulation';
import {createComponentLView} from '../view/construction';
import {selectIndexInternal} from './advance';
import {handleUnknownPropertyError, isPropertyValid, matchingSchemas} from './element_validation';
import {writeToDirectiveInput} from './write_to_directive_input';
import {isDetachedByI18n} from '../../i18n/utils';
import {appendChild} from '../node_manipulation';
export function executeTemplate(tView, lView, templateFn, rf, context) {
  const prevSelectedIndex = getSelectedIndex();
  const isUpdatePhase = rf & 2; /* RenderFlags.Update */
  try {
    setSelectedIndex(-1);
    if (isUpdatePhase && lView.length > HEADER_OFFSET) {
      // When we're updating, inherently select 0 so we don't
      // have to generate that instruction for most update blocks.
      selectIndexInternal(tView, lView, HEADER_OFFSET, !!ngDevMode && isInCheckNoChangesMode());
    }
    const preHookType = isUpdatePhase
      ? 2 /* ProfilerEvent.TemplateUpdateStart */
      : 0; /* ProfilerEvent.TemplateCreateStart */
    profiler(preHookType, context, templateFn);
    templateFn(rf, context);
  } finally {
    setSelectedIndex(prevSelectedIndex);
    const postHookType = isUpdatePhase
      ? 3 /* ProfilerEvent.TemplateUpdateEnd */
      : 1; /* ProfilerEvent.TemplateCreateEnd */
    profiler(postHookType, context, templateFn);
  }
}
/**
 * Creates directive instances.
 */
export function createDirectivesInstances(tView, lView, tNode) {
  instantiateAllDirectives(tView, lView, tNode);
  if ((tNode.flags & 64) /* TNodeFlags.hasHostBindings */ === 64 /* TNodeFlags.hasHostBindings */) {
    invokeDirectivesHostBindings(tView, lView, tNode);
  }
}
/**
 * Takes a list of local names and indices and pushes the resolved local variable values
 * to LView in the same order as they are loaded in the template with load().
 */
export function saveResolvedLocalsInData(viewData, tNode, localRefExtractor = getNativeByTNode) {
  const localNames = tNode.localNames;
  if (localNames !== null) {
    let localIndex = tNode.index + 1;
    for (let i = 0; i < localNames.length; i += 2) {
      const index = localNames[i + 1];
      const value = index === -1 ? localRefExtractor(tNode, viewData) : viewData[index];
      viewData[localIndex++] = value;
    }
  }
}
/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param renderer the renderer used to locate the element.
 * @param elementOrSelector Render element or CSS selector to locate the element.
 * @param encapsulation View Encapsulation defined for component that requests host element.
 * @param injector Root view injector instance.
 */
export function locateHostElement(renderer, elementOrSelector, encapsulation, injector) {
  // Note: we use default value for the `PRESERVE_HOST_CONTENT` here even though it's a
  // tree-shakable one (providedIn:'root'). This code path can be triggered during dynamic
  // component creation (after calling ViewContainerRef.createComponent) when an injector
  // instance can be provided. The injector instance might be disconnected from the main DI
  // tree, thus the `PRESERVE_HOST_CONTENT` would not be able to instantiate. In this case, the
  // default value will be used.
  const preserveHostContent = injector.get(PRESERVE_HOST_CONTENT, PRESERVE_HOST_CONTENT_DEFAULT);
  // When using native Shadow DOM, do not clear host element to allow native slot
  // projection.
  const preserveContent =
    preserveHostContent ||
    encapsulation === ViewEncapsulation.ShadowDom ||
    encapsulation === ViewEncapsulation.IsolatedShadowDom;
  const rootElement = renderer.selectRootElement(elementOrSelector, preserveContent);
  applyRootElementTransform(rootElement);
  return rootElement;
}
/**
 * Applies any root element transformations that are needed. If hydration is enabled,
 * this will process corrupted text nodes.
 *
 * @param rootElement the app root HTML Element
 */
export function applyRootElementTransform(rootElement) {
  _applyRootElementTransformImpl(rootElement);
}
/**
 * Reference to a function that applies transformations to the root HTML element
 * of an app. When hydration is enabled, this processes any corrupt text nodes
 * so they are properly hydratable on the client.
 *
 * @param rootElement the app root HTML Element
 */
let _applyRootElementTransformImpl = () => null;
/**
 * Processes text node markers before hydration begins. This replaces any special comment
 * nodes that were added prior to serialization are swapped out to restore proper text
 * nodes before hydration.
 *
 * @param rootElement the app root HTML Element
 */
export function applyRootElementTransformImpl(rootElement) {
  if (hasSkipHydrationAttrOnRElement(rootElement)) {
    // Handle a situation when the `ngSkipHydration` attribute is applied
    // to the root node of an application. In this case, we should clear
    // the contents and render everything from scratch.
    clearElementContents(rootElement);
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
/**
 * Mapping between attributes names that don't correspond to their element property names.
 *
 * Performance note: this function is written as a series of if checks (instead of, say, a property
 * object lookup) for performance reasons - the series of `if` checks seems to be the fastest way of
 * mapping property names. Do NOT change without benchmarking.
 *
 * Note: this mapping has to be kept in sync with the equivalent mappings in the compiler.
 */
function mapPropName(name) {
  if (name === 'class') return 'className';
  if (name === 'for') return 'htmlFor';
  if (name === 'formaction') return 'formAction';
  if (name === 'innerHtml') return 'innerHTML';
  if (name === 'readonly') return 'readOnly';
  if (name === 'tabindex') return 'tabIndex';
  return name;
}
export function setPropertyAndInputs(tNode, lView, propName, value, renderer, sanitizer) {
  ngDevMode && assertNotSame(value, NO_CHANGE, 'Incoming value should never be NO_CHANGE.');
  const tView = lView[TVIEW];
  const hasSetInput = setAllInputsForProperty(tNode, tView, lView, propName, value);
  if (hasSetInput) {
    isComponentHost(tNode) && markDirtyIfOnPush(lView, tNode.index);
    ngDevMode && setNgReflectProperties(lView, tView, tNode, propName, value);
    return; // Stop propcessing if we've matched at least one input.
  }
  // If the property is going to a DOM node, we have to remap it.
  if (tNode.type & 3 /* TNodeType.AnyRNode */) {
    propName = mapPropName(propName);
  }
  setDomProperty(tNode, lView, propName, value, renderer, sanitizer);
}
/**
 * Sets a DOM property on a specific node.
 * @param tNode TNode on which to set the value.
 * @param lView View in which the node is located.
 * @param propName Name of the property.
 * @param value Value to set on the property.
 * @param renderer Renderer to use when setting the property.
 * @param sanitizer Function used to sanitize the value before setting it.
 */
export function setDomProperty(tNode, lView, propName, value, renderer, sanitizer) {
  if (tNode.type & 3 /* TNodeType.AnyRNode */) {
    const element = getNativeByTNode(tNode, lView);
    if (ngDevMode) {
      validateAgainstEventProperties(propName);
      if (!isPropertyValid(element, propName, tNode.value, lView[TVIEW].schemas)) {
        handleUnknownPropertyError(propName, tNode.value, tNode.type, lView);
      }
    }
    // It is assumed that the sanitizer is only added when the compiler determines that the
    // property is risky, so sanitization can be done without further checks.
    value = sanitizer != null ? sanitizer(value, tNode.value || '', propName) : value;
    renderer.setProperty(element, propName, value);
  } else if (tNode.type & 12 /* TNodeType.AnyContainer */) {
    // If the node is a container and the property didn't
    // match any of the inputs or schemas we should throw.
    if (ngDevMode && !matchingSchemas(lView[TVIEW].schemas, tNode.value)) {
      handleUnknownPropertyError(propName, tNode.value, tNode.type, lView);
    }
  }
}
/** If node is an OnPush component, marks its LView dirty. */
export function markDirtyIfOnPush(lView, viewIndex) {
  ngDevMode && assertLView(lView);
  const childComponentLView = getComponentLViewByIndex(viewIndex, lView);
  if (!((childComponentLView[FLAGS] & 16) /* LViewFlags.CheckAlways */)) {
    childComponentLView[FLAGS] |= 64 /* LViewFlags.Dirty */;
  }
}
function setNgReflectProperty(lView, tNode, attrName, value) {
  const environment = lView[ENVIRONMENT];
  if (!environment.ngReflect) {
    return;
  }
  const element = getNativeByTNode(tNode, lView);
  const renderer = lView[RENDERER];
  attrName = normalizeDebugBindingName(attrName);
  const debugValue = normalizeDebugBindingValue(value);
  if (tNode.type & 3 /* TNodeType.AnyRNode */) {
    if (value == null) {
      renderer.removeAttribute(element, attrName);
    } else {
      renderer.setAttribute(element, attrName, debugValue);
    }
  } else {
    const textContent = escapeCommentText(
      `bindings=${JSON.stringify({[attrName]: debugValue}, null, 2)}`,
    );
    renderer.setValue(element, textContent);
  }
}
export function setNgReflectProperties(lView, tView, tNode, publicName, value) {
  const environment = lView[ENVIRONMENT];
  if (
    !environment.ngReflect ||
    !(tNode.type & (3 /* TNodeType.AnyRNode */ | 4) /* TNodeType.Container */)
  ) {
    return;
  }
  const inputConfig = tNode.inputs?.[publicName];
  const hostInputConfig = tNode.hostDirectiveInputs?.[publicName];
  if (hostInputConfig) {
    for (let i = 0; i < hostInputConfig.length; i += 2) {
      const index = hostInputConfig[i];
      const publicName = hostInputConfig[i + 1];
      const def = tView.data[index];
      setNgReflectProperty(lView, tNode, def.inputs[publicName][0], value);
    }
  }
  // Note: we set the private name of the input as the reflected property, not the public one.
  if (inputConfig) {
    for (const index of inputConfig) {
      const def = tView.data[index];
      setNgReflectProperty(lView, tNode, def.inputs[publicName][0], value);
    }
  }
}
/**
 * Instantiate all the directives that were previously resolved on the current node.
 */
function instantiateAllDirectives(tView, lView, tNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  // The component view needs to be created before creating the node injector
  // since it is used to inject some special symbols like `ChangeDetectorRef`.
  if (isComponentHost(tNode)) {
    ngDevMode && assertTNodeType(tNode, 3 /* TNodeType.AnyRNode */);
    createComponentLView(lView, tNode, tView.data[start + tNode.componentOffset]);
  }
  if (!tView.firstCreatePass) {
    getOrCreateNodeInjectorForNode(tNode, lView);
  }
  const initialInputs = tNode.initialInputs;
  for (let i = start; i < end; i++) {
    const def = tView.data[i];
    const directive = getNodeInjectable(lView, tView, i, tNode);
    attachPatchData(directive, lView);
    if (initialInputs !== null) {
      setInputsFromAttrs(lView, i - start, directive, def, tNode, initialInputs);
    }
    if (isComponentDef(def)) {
      const componentView = getComponentLViewByIndex(tNode.index, lView);
      componentView[CONTEXT] = getNodeInjectable(lView, tView, i, tNode);
    }
  }
}
export function invokeDirectivesHostBindings(tView, lView, tNode) {
  const start = tNode.directiveStart;
  const end = tNode.directiveEnd;
  const elementIndex = tNode.index;
  const currentDirectiveIndex = getCurrentDirectiveIndex();
  try {
    setSelectedIndex(elementIndex);
    for (let dirIndex = start; dirIndex < end; dirIndex++) {
      const def = tView.data[dirIndex];
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
export function invokeHostBindingsInCreationMode(def, directive) {
  if (def.hostBindings !== null) {
    def.hostBindings(1 /* RenderFlags.Create */, directive);
  }
}
/**
 * Matches the current node against all available selectors.
 * If a component is matched (at most one), it is returned in first position in the array.
 */
export function findDirectiveDefMatches(tView, tNode) {
  ngDevMode && assertFirstCreatePass(tView);
  ngDevMode && assertTNodeType(tNode, 3 /* TNodeType.AnyRNode */ | 12 /* TNodeType.AnyContainer */);
  const registry = tView.directiveRegistry;
  let matches = null;
  if (registry) {
    for (let i = 0; i < registry.length; i++) {
      const def = registry[i];
      if (isNodeMatchingSelectorList(tNode, def.selectors, /* isProjectionMode */ false)) {
        matches ??= [];
        if (isComponentDef(def)) {
          if (ngDevMode) {
            assertTNodeType(
              tNode,
              2 /* TNodeType.Element */,
              `"${tNode.value}" tags cannot be used as component hosts. ` +
                `Please use a different tag to activate the ${stringify(def.type)} component.`,
            );
            if (matches.length && isComponentDef(matches[0])) {
              throwMultipleComponentError(tNode, matches.find(isComponentDef).type, def.type);
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
export function elementAttributeInternal(tNode, lView, name, value, sanitizer, namespace) {
  if (ngDevMode) {
    assertNotSame(value, NO_CHANGE, 'Incoming value should never be NO_CHANGE.');
    validateAgainstEventAttributes(name);
    assertTNodeType(
      tNode,
      2 /* TNodeType.Element */,
      `Attempted to set attribute \`${name}\` on a container node. ` +
        `Host bindings are not valid on ng-container or ng-template.`,
    );
  }
  const element = getNativeByTNode(tNode, lView);
  setElementAttribute(lView[RENDERER], element, namespace, tNode.value, name, value, sanitizer);
}
export function setElementAttribute(renderer, element, namespace, tagName, name, value, sanitizer) {
  if (value == null) {
    renderer.removeAttribute(element, name, namespace);
  } else {
    const strValue =
      sanitizer == null ? renderStringify(value) : sanitizer(value, tagName || '', name);
    renderer.setAttribute(element, name, strValue, namespace);
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
function setInputsFromAttrs(lView, directiveIndex, instance, def, tNode, initialInputData) {
  const initialInputs = initialInputData[directiveIndex];
  if (initialInputs !== null) {
    for (let i = 0; i < initialInputs.length; i += 2) {
      const lookupName = initialInputs[i];
      const value = initialInputs[i + 1];
      writeToDirectiveInput(def, instance, lookupName, value);
      if (ngDevMode) {
        setNgReflectProperty(lView, tNode, def.inputs[lookupName][0], value);
      }
    }
  }
}
/** Shared code between instructions that indicate the start of an element. */
export function elementLikeStartShared(tNode, lView, index, name, locateOrCreateNativeNode) {
  const adjustedIndex = HEADER_OFFSET + index;
  const tView = lView[TVIEW];
  const native = locateOrCreateNativeNode(tView, lView, tNode, name, index);
  lView[adjustedIndex] = native;
  setCurrentTNode(tNode, true);
  // It's important that this runs before we've instantiated the directives.
  const isElement = tNode.type === 2; /* TNodeType.Element */
  if (isElement) {
    setupStaticAttributes(lView[RENDERER], native, tNode);
    // any immediate children of a component or template container must be pre-emptively
    // monkey-patched with the component view data so that the element can be inspected
    // later on using any element discovery utility methods (see `element_discovery.ts`)
    if (getElementDepthCount() === 0 || isDirectiveHost(tNode)) {
      attachPatchData(native, lView);
    }
    increaseElementDepthCount();
  } else {
    attachPatchData(native, lView);
  }
  if (wasLastNodeCreated() && (!isElement || !isDetachedByI18n(tNode))) {
    // In the i18n case, the translation may have removed this element, so only add it if it is not
    // detached. See `TNodeType.Placeholder` and `LFrame.inI18n` for more context.
    appendChild(tView, lView, native, tNode);
  }
  return tNode;
}
/** Shared code between instructions that indicate the end of an element. */
export function elementLikeEndShared(tNode) {
  let currentTNode = tNode;
  if (isCurrentTNodeParent()) {
    setCurrentTNodeAsNotParent();
  } else {
    ngDevMode && assertHasParent(getCurrentTNode());
    currentTNode = currentTNode.parent;
    setCurrentTNode(currentTNode, false);
  }
  return currentTNode;
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
  tData,
  tNode,
  propertyName,
  bindingIndex,
  ...interpolationParts
) {
  // Binding meta-data are stored only the first time a given property instruction is processed.
  // Since we don't have a concept of the "first update pass" we need to check for presence of the
  // binding meta-data to decide if one should be stored (or if was stored already).
  if (tData[bindingIndex] === null) {
    if (!tNode.inputs?.[propertyName] && !tNode.hostDirectiveInputs?.[propertyName]) {
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
export function loadComponentRenderer(currentDef, tNode, lView) {
  // TODO(FW-2043): the `currentDef` is null when host bindings are invoked while creating root
  // component (see packages/core/src/render3/component.ts). This is not consistent with the process
  // of creating inner components, when current directive index is available in the state. In order
  // to avoid relying on current def being `null` (thus special-casing root component creation), the
  // process of creating root component should be unified with the process of creating inner
  // components.
  if (currentDef === null || isComponentDef(currentDef)) {
    lView = unwrapLView(lView[tNode.index]);
  }
  return lView[RENDERER];
}
/** Handles an error thrown in an LView. */
export function handleUncaughtError(lView, error) {
  const injector = lView[INJECTOR];
  if (!injector) {
    return;
  }
  let errorHandler;
  try {
    errorHandler = injector.get(INTERNAL_APPLICATION_ERROR_HANDLER, null);
  } catch {
    errorHandler = null;
  }
  errorHandler?.(error);
}
/**
 * Set all directive inputs with the specific public name on the node.
 *
 * @param tNode TNode on which the input is being set.
 * @param tView Current TView
 * @param lView `LView` which contains the directives.
 * @param publicName Public name of the input being set.
 * @param value Value to set.
 */
export function setAllInputsForProperty(tNode, tView, lView, publicName, value) {
  const inputs = tNode.inputs?.[publicName];
  const hostDirectiveInputs = tNode.hostDirectiveInputs?.[publicName];
  let hasMatch = false;
  if (hostDirectiveInputs) {
    for (let i = 0; i < hostDirectiveInputs.length; i += 2) {
      const index = hostDirectiveInputs[i];
      ngDevMode && assertIndexInRange(lView, index);
      const publicName = hostDirectiveInputs[i + 1];
      const def = tView.data[index];
      writeToDirectiveInput(def, lView[index], publicName, value);
      hasMatch = true;
    }
  }
  if (inputs) {
    for (const index of inputs) {
      ngDevMode && assertIndexInRange(lView, index);
      const instance = lView[index];
      const def = tView.data[index];
      writeToDirectiveInput(def, instance, publicName, value);
      hasMatch = true;
    }
  }
  return hasMatch;
}
/**
 * Sets an input value only on a specific directive and its host directives.
 * @param tNode TNode on which the input is being set.
 * @param tView Current TView
 * @param lView `LView` which contains the directives.
 * @param target Directive on which to set the input.
 * @param publicName Public name of the input being set.
 * @param value Value to set.
 */
export function setDirectiveInput(tNode, tView, lView, target, publicName, value) {
  let hostIndex = null;
  let hostDirectivesStart = null;
  let hostDirectivesEnd = null;
  let hasSet = false;
  if (ngDevMode && !tNode.directiveToIndex?.has(target.type)) {
    throw new Error(`Node does not have a directive with type ${target.type.name}`);
  }
  const data = tNode.directiveToIndex.get(target.type);
  if (typeof data === 'number') {
    hostIndex = data;
  } else {
    [hostIndex, hostDirectivesStart, hostDirectivesEnd] = data;
  }
  if (
    hostDirectivesStart !== null &&
    hostDirectivesEnd !== null &&
    tNode.hostDirectiveInputs?.hasOwnProperty(publicName)
  ) {
    const hostDirectiveInputs = tNode.hostDirectiveInputs[publicName];
    for (let i = 0; i < hostDirectiveInputs.length; i += 2) {
      const index = hostDirectiveInputs[i];
      if (index >= hostDirectivesStart && index <= hostDirectivesEnd) {
        ngDevMode && assertIndexInRange(lView, index);
        const def = tView.data[index];
        const hostDirectivePublicName = hostDirectiveInputs[i + 1];
        writeToDirectiveInput(def, lView[index], hostDirectivePublicName, value);
        hasSet = true;
      } else if (index > hostDirectivesEnd) {
        // Directives here are in ascending order so we can stop looking once we're past the range.
        break;
      }
    }
  }
  if (hostIndex !== null && target.inputs.hasOwnProperty(publicName)) {
    ngDevMode && assertIndexInRange(lView, hostIndex);
    writeToDirectiveInput(target, lView[hostIndex], publicName, value);
    hasSet = true;
  }
  return hasSet;
}
//# sourceMappingURL=shared.js.map
