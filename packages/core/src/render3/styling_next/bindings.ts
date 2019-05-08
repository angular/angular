/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
import {ProceduralRenderer3, RElement, Renderer3, RendererStyleFlags3, isProceduralRenderer} from '../interfaces/renderer';
import {ApplyStylingFn, StylingBindingData, TStylingContext, TStylingContextIndex} from './interfaces';
import {allowStylingFlush, getGuardMask, getProp, getValue, getValuesCount, isContextLocked, lockContext} from './util';


/**
 * This file contains the core logic for styling in Angular.
 *
 * All styling bindings (i.e. `[style]`, `[style.prop]`, `[class]` and `[class.name]`)
 * will have their values be applied through the logic in this file.
 *
 * When a binding is encountered (e.g. `<div [style.width]="w">`) then
 * the binding data will be populated into a `TStylingContext` data-structure.
 * There is only one `TStylingContext` per `TNode` and each element instance
 * will update its style/class binding values in concert with the styling
 * context.
 *
 * To learn more about the algorithm see `TStylingContext`.
 */

// the values below are global to all styling code below. Each value
// will either increment or mutate each time a styling instruction is
// executed. Do not modify the values below.
let currentStyleIndex = 0;
let currentClassIndex = 0;
let stylesBitMask = 0;
let classesBitMask = 0;
let deferredBindingQueue: (TStylingContext | number | string | null)[] = [];

const DEFAULT_BINDING_VALUE = null;
const DEFAULT_SIZE_VALUE = 1;
const DEFAULT_MASK_VALUE = 0;
export const DEFAULT_BINDING_INDEX_VALUE = -1;
export const BIT_MASK_APPLY_ALL = -1;


/**
 * Visits a class-based binding and updates the new value (if changed).
 *
 * This function is called each time a class-based styling instruction
 * is executed. It's important that it's always called (even if the value
 * has not changed) so that the inner counter index value is incremented.
 * This way, each instruction is always guaranteed to get the same counter
 * state each time its called (which then allows the `TStylingContext`
 * and the bit mask values to be in sync).
 */
export function updateClassBinding(
    context: TStylingContext, data: StylingBindingData, prop: string, bindingIndex: number,
    value: boolean | null | undefined, deferRegistration: boolean): void {
  const index = currentClassIndex++;
  if (updateBindingData(context, data, index, prop, bindingIndex, value, deferRegistration)) {
    classesBitMask |= 1 << index;
  }
}

/**
 * Visits a style-based binding and updates the new value (if changed).
 *
 * This function is called each time a style-based styling instruction
 * is executed. It's important that it's always called (even if the value
 * has not changed) so that the inner counter index value is incremented.
 * This way, each instruction is always guaranteed to get the same counter
 * state each time its called (which then allows the `TStylingContext`
 * and the bit mask values to be in sync).
 */
export function updateStyleBinding(
    context: TStylingContext, data: StylingBindingData, prop: string, bindingIndex: number,
    value: String | string | number | null | undefined, deferRegistration: boolean): void {
  const index = currentStyleIndex++;
  if (updateBindingData(context, data, index, prop, bindingIndex, value, deferRegistration)) {
    stylesBitMask |= 1 << index;
  }
}

function updateBindingData(
    context: TStylingContext, data: StylingBindingData, counterIndex: number, prop: string,
    bindingIndex: number, value: string | String | number | boolean | null | undefined,
    deferRegistration?: boolean): boolean {
  if (!isContextLocked(context)) {
    if (deferRegistration) {
      deferBindingRegistration(context, counterIndex, prop, bindingIndex);
    } else {
      deferredBindingQueue.length && flushDeferredBindings();

      // this will only happen during the first update pass of the
      // context. The reason why we can't use `tNode.firstTemplatePass`
      // here is because its not guaranteed to be true when the first
      // update pass is executed (remember that all styling instructions
      // are run in the update phase, and, as a result, are no more
      // styling instructions that are run in the creation phase).
      registerBinding(context, counterIndex, prop, bindingIndex);
    }
  }

  if (data[bindingIndex] !== value) {
    data[bindingIndex] = value;
    return true;
  }
  return false;
}

/**
 * Schedules a binding registration to be run at a later point.
 *
 * The reasoning for this feature is to ensure that styling
 * bindings are registered in the correct order for when
 * directives/components have a super/sub class inheritance
 * chains. Each directive's styling bindings must be
 * registered into the context in reverse order. Therefore all
 * bindings will be buffered in reverse order and then applied
 * after the inheritance chain exits.
 */
function deferBindingRegistration(
    context: TStylingContext, counterIndex: number, prop: string, bindingIndex: number) {
  deferredBindingQueue.splice(0, 0, context, counterIndex, prop, bindingIndex);
}

/**
 * Flushes the collection of deferred bindings and causes each entry
 * to be registered into the context.
 */
function flushDeferredBindings() {
  let i = 0;
  while (i < deferredBindingQueue.length) {
    const context = deferredBindingQueue[i++] as TStylingContext;
    const count = deferredBindingQueue[i++] as number;
    const prop = deferredBindingQueue[i++] as string;
    const bindingIndex = deferredBindingQueue[i++] as number | null;
    registerBinding(context, count, prop, bindingIndex);
  }
  deferredBindingQueue.length = 0;
}

/**
 * Registers the provided binding (prop + bindingIndex) into the context.
 *
 * This function is shared between bindings that are assigned immediately
 * (via `updateBindingData`) and at a deferred stage. When called, it will
 * figure out exactly where to place the binding data in the context.
 *
 * It is needed because it will either update or insert a styling property
 * into the context at the correct spot.
 *
 * When called, one of two things will happen:
 *
 * 1) If the property already exists in the context then it will just add
 *    the provided `bindingValue` to the end of the binding sources region
 *    for that particular property.
 *
 *    - If the binding value is a number then it will be added as a new
 *      binding index source next to the other binding sources for the property.
 *
 *    - Otherwise, if the binding value is a string/boolean/null type then it will
 *      replace the default value for the property if the default value is `null`.
 *
 * 2) If the property does not exist then it will be inserted into the context.
 *    The styling context relies on all properties being stored in alphabetical
 *    order, so it knows exactly where to store it.
 *
 *    When inserted, a default `null` value is created for the property which exists
 *    as the default value for the binding. If the bindingValue property is inserted
 *    and it is either a string, number or null value then that will replace the default
 *    value.
 */
export function registerBinding(
    context: TStylingContext, countId: number, prop: string,
    bindingValue: number | null | string | boolean) {
  let i = TStylingContextIndex.ValuesStartPosition;
  let found = false;
  while (i < context.length) {
    const valuesCount = getValuesCount(context, i);
    const p = getProp(context, i);
    found = prop <= p;
    if (found) {
      // all style/class bindings are sorted by property name
      if (prop < p) {
        allocateNewContextEntry(context, i, prop);
      }
      addBindingIntoContext(context, i, bindingValue, countId);
      break;
    }
    i += TStylingContextIndex.BindingsStartOffset + valuesCount;
  }

  if (!found) {
    allocateNewContextEntry(context, context.length, prop);
    addBindingIntoContext(context, i, bindingValue, countId);
  }
}

function allocateNewContextEntry(context: TStylingContext, index: number, prop: string) {
  context.splice(index, 0, DEFAULT_MASK_VALUE, DEFAULT_SIZE_VALUE, prop, DEFAULT_BINDING_VALUE);
}

/**
 * Inserts a new binding value into a styling property tuple in the `TStylingContext`.
 *
 * A bindingValue is inserted into a context during the first update pass
 * of a template or host bindings function. When this occurs, two things
 * happen:
 *
 * - If the bindingValue value is a number then it is treated as a bindingIndex
 *   value (a index in the `LView`) and it will be inserted next to the other
 *   binding index entries.
 *
 * - Otherwise the binding value will update the default value for the property
 *   and this will only happen if the default value is `null`.
 */
function addBindingIntoContext(
    context: TStylingContext, index: number, bindingValue: number | string | boolean | null,
    countId: number) {
  const valuesCount = getValuesCount(context, index);

  // -1 is used because we want the last value that's in the list (not the next slot)
  const lastValueIndex = index + TStylingContextIndex.BindingsStartOffset + valuesCount - 1;

  if (typeof bindingValue === 'number') {
    context.splice(lastValueIndex, 0, bindingValue);
    (context[index + TStylingContextIndex.ValuesCountOffset] as number)++;
    (context[index + TStylingContextIndex.MaskOffset] as number) |= 1 << countId;
  } else if (typeof bindingValue === 'string' && context[lastValueIndex] == null) {
    context[lastValueIndex] = bindingValue;
  }
}

/**
 * Applies all class entries in the provided context to the provided element.
 */
export function applyClasses(
    renderer: Renderer3 | ProceduralRenderer3 | null, data: StylingBindingData,
    context: TStylingContext, element: RElement, directiveIndex: number) {
  if (allowStylingFlush(context, directiveIndex)) {
    const isFirstPass = isContextLocked(context);
    isFirstPass && lockContext(context);
    applyStyling(context, renderer, element, data, classesBitMask, setClass, isFirstPass);
    currentClassIndex = 0;
    classesBitMask = 0;
  }
}

/**
 * Applies all style entries in the provided context to the provided element.
 */
export function applyStyles(
    renderer: Renderer3 | ProceduralRenderer3 | null, data: StylingBindingData,
    context: TStylingContext, element: RElement, directiveIndex: number) {
  if (allowStylingFlush(context, directiveIndex)) {
    const isFirstPass = isContextLocked(context);
    isFirstPass && lockContext(context);
    applyStyling(context, renderer, element, data, stylesBitMask, setStyle, isFirstPass);
    currentStyleIndex = 0;
    stylesBitMask = 0;
  }
}

/**
 * Runs through the provided styling context and applies each value to
 * the provided element (via the renderer) if one or more values are present.
 *
 * Note that this function is not designed to be called in isolation (use
 * `applyClasses` and `applyStyles` to actually apply styling values).
 */
export function applyStyling(
    context: TStylingContext, renderer: Renderer3 | ProceduralRenderer3 | null, element: RElement,
    bindingData: StylingBindingData, bitMask: number, applyStylingFn: ApplyStylingFn,
    forceApplyDefaultValues?: boolean) {
  deferredBindingQueue.length && flushDeferredBindings();

  if (bitMask) {
    let processAllEntries = bitMask === BIT_MASK_APPLY_ALL;
    let i = TStylingContextIndex.ValuesStartPosition;
    while (i < context.length) {
      const valuesCount = getValuesCount(context, i);
      const guardMask = getGuardMask(context, i);

      // the guard mask value is non-zero if and when
      // there are binding values present for the property.
      // If there are ONLY static values (i.e. `style="prop:val")
      // then the guard value will stay as zero.
      const processEntry =
          processAllEntries || (guardMask ? (bitMask & guardMask) : forceApplyDefaultValues);
      if (processEntry) {
        const prop = getProp(context, i);
        const limit = valuesCount - 1;
        for (let j = 0; j <= limit; j++) {
          const isFinalValue = j === limit;
          const bindingValue = getValue(context, i, j);
          const bindingIndex =
              isFinalValue ? DEFAULT_BINDING_INDEX_VALUE : (bindingValue as number);
          const valueToApply: string|null = isFinalValue ? bindingValue : bindingData[bindingIndex];
          if (isValueDefined(valueToApply) || isFinalValue) {
            applyStylingFn(renderer, element, prop, valueToApply, bindingIndex);
            break;
          }
        }
      }
      i += TStylingContextIndex.BindingsStartOffset + valuesCount;
    }
  }
}

function isValueDefined(value: any) {
  // the reason why null is compared against is because
  // a CSS class value that is set to `false` must be
  // respected (otherwise it would be treated as falsy).
  // Empty string values are because developers usually
  // set a value to an empty string to remove it.
  return value != null && value !== '';
}

/**
 * Assigns a style value to a style property for the given element.
 */
const setStyle: ApplyStylingFn =
    (renderer: Renderer3 | null, native: any, prop: string, value: string | null) => {
      if (value) {
        // opacity, z-index and flexbox all have number values
        // and these need to be converted into strings so that
        // they can be assigned properly.
        value = value.toString();
        ngDevMode && ngDevMode.rendererSetStyle++;
        renderer && isProceduralRenderer(renderer) ?
            renderer.setStyle(native, prop, value, RendererStyleFlags3.DashCase) :
            native.style.setProperty(prop, value);
      } else {
        ngDevMode && ngDevMode.rendererRemoveStyle++;
        renderer && isProceduralRenderer(renderer) ?
            renderer.removeStyle(native, prop, RendererStyleFlags3.DashCase) :
            native.style.removeProperty(prop);
      }
    };

/**
 * Adds/removes the provided className value to the provided element.
 */
const setClass: ApplyStylingFn =
    (renderer: Renderer3 | null, native: any, className: string, value: any) => {
      if (className !== '') {
        if (value) {
          ngDevMode && ngDevMode.rendererAddClass++;
          renderer && isProceduralRenderer(renderer) ? renderer.addClass(native, className) :
                                                       native.classList.add(className);
        } else {
          ngDevMode && ngDevMode.rendererRemoveClass++;
          renderer && isProceduralRenderer(renderer) ? renderer.removeClass(native, className) :
                                                       native.classList.remove(className);
        }
      }
    };
