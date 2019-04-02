/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '../../metadata/schema';
import {validateAgainstEventProperties} from '../../sanitization/sanitization';
import {normalizeDebugBindingName, normalizeDebugBindingValue} from '../../util/ng_reflect';
import {assertLView} from '../assert';
import {bindingUpdated} from '../bindings';
import {PropertyAliasValue, PropertyAliases, TNode, TNodeType} from '../interfaces/node';
import {RComment, RElement, Renderer3, isProceduralRenderer} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {BINDING_INDEX, FLAGS, HEADER_OFFSET, LView, LViewFlags, RENDERER, TData, TVIEW} from '../interfaces/view';
import {getLView, getSelectedIndex} from '../state';
import {ANIMATION_PROP_PREFIX, isAnimationProp} from '../styling/util';
import {NO_CHANGE} from '../tokens';
import {INTERPOLATION_DELIMITER} from '../util/misc_utils';
import {getComponentViewByIndex, getNativeByIndex, getTNode, isComponent} from '../util/view_utils';
import {TsickleIssue1009, initializeTNodeInputs, loadComponentRenderer, setInputsForProperty, storeBindingMetadata} from './shared';

/**
 * Update a property on a selected element.
 *
 * Operates on the element selected by index via the {@link select} instruction.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled
 *
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @param nativeOnly Whether or not we should only set native properties and skip input check
 * (this is necessary for host property bindings)
 * @returns This function returns itself so that it may be chained
 * (e.g. `property('name', ctx.name)('title', ctx.title)`)
 */
export function property<T>(
    propName: string, value: T, sanitizer?: SanitizerFn | null,
    nativeOnly?: boolean): TsickleIssue1009 {
  const index = getSelectedIndex();
  const bindReconciledValue = bind(value);
  elementPropertyInternal(index, propName, bindReconciledValue, sanitizer, nativeOnly);
  return property;
}

/**
 * Creates a single value binding.
 *
 * @param value Value to diff
 */
export function bind<T>(value: T): T|NO_CHANGE {
  const lView = getLView();
  const bindingIndex = lView[BINDING_INDEX]++;
  storeBindingMetadata(lView);
  return bindingUpdated(lView, bindingIndex, value) ? value : NO_CHANGE;
}

/**
* **TODO: Remove this function after `property` is in use**
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

/**
* Mapping between attributes names that don't correspond to their element property names.
*/
const ATTR_TO_PROP: {[name: string]: string} = {
  'class': 'className',
  'for': 'htmlFor',
  'formaction': 'formAction',
  'innerHtml': 'innerHTML',
  'readonly': 'readOnly',
  'tabindex': 'tabIndex',
};

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
    setInputsForProperty(lView, dataValue, value);
    if (isComponent(tNode)) markDirtyIfOnPush(lView, index + HEADER_OFFSET);
    if (ngDevMode) {
      if (tNode.type === TNodeType.Element || tNode.type === TNodeType.Container) {
        setNgReflectProperties(lView, element, tNode.type, dataValue, value);
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

/** If node is an OnPush component, marks its LView dirty. */
function markDirtyIfOnPush(lView: LView, viewIndex: number): void {
  ngDevMode && assertLView(lView);
  const childComponentLView = getComponentViewByIndex(viewIndex, lView);
  if (!(childComponentLView[FLAGS] & LViewFlags.CheckAlways)) {
    childComponentLView[FLAGS] |= LViewFlags.Dirty;
  }
}

function setNgReflectProperties(
    lView: LView, element: RElement | RComment, type: TNodeType, inputs: PropertyAliasValue,
    value: any) {
  for (let i = 0; i < inputs.length; i += 3) {
    const renderer = lView[RENDERER];
    const attrName = normalizeDebugBindingName(inputs[i + 2] as string);
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
    throw new Error(
        `Template error: Can't bind to '${propName}' since it isn't a known property of '${tNode.tagName}'.`);
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
