/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '../../metadata/schema';
import {validateAgainstEventProperties} from '../../sanitization/sanitization';
import {assertDataInRange} from '../../util/assert';
import {normalizeDebugBindingName, normalizeDebugBindingValue} from '../../util/ng_reflect';
import {assertLView} from '../assert';
import {DirectiveDef} from '../interfaces/definition';
import {PropertyAliasValue, PropertyAliases, TNode, TNodeType} from '../interfaces/node';
import {RComment, RElement, Renderer3, isProceduralRenderer} from '../interfaces/renderer';
import {SanitizerFn} from '../interfaces/sanitization';
import {BINDING_INDEX, FLAGS, HEADER_OFFSET, LView, LViewFlags, RENDERER, TData, TVIEW} from '../interfaces/view';
import {getLView} from '../state';
import {ANIMATION_PROP_PREFIX, isAnimationProp} from '../styling/util';
import {NO_CHANGE} from '../tokens';
import {INTERPOLATION_DELIMITER} from '../util/misc_utils';
import {getComponentViewByIndex, getNativeByIndex, getTNode, isComponent} from '../util/view_utils';

/**
 * Set the inputs of directives at the current node to corresponding value.
 *
 * @param lView the `LView` which contains the directives.
 * @param inputAliases mapping between the public "input" name and privately-known,
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

export function elementPropertyInternal<T>(
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

export function initializeTNodeInputs(tNode: TNode | null): PropertyAliases|null {
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
 * Consolidates all inputs or outputs of all directives on this logical node.
 *
 * @param tNodeFlags node flags
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

export const enum BindingDirection {
  Input,
  Output,
}
