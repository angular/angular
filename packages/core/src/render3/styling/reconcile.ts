/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {ArrayMap} from '../../util/array_utils';
import {ProceduralRenderer3, RElement, Renderer3, isProceduralRenderer} from '../interfaces/renderer';
import {computeClassChanges} from './class_differ';
import {computeStyleChanges} from './style_differ';


/**
 * Writes new `className` value in the DOM node.
 *
 * In its simplest form this function just writes the `newValue` into the `element.className`
 * property.
 *
 * However, under some circumstances this is more complex because there could be other code which
 * has added `class` information to the DOM element. In such a case writing our new value would
 * clobber what is already on the element and would result in incorrect behavior.
 *
 * To solve the above the function first reads the `element.className` to see if it matches the
 * `expectedValue`. (In our case `expectedValue` is just last value written into the DOM.) In this
 * way we can detect to see if anyone has modified the DOM since our last write.
 * - If we detect no change we simply write: `element.className = newValue`.
 * - If we do detect change than we compute the difference between the `expectedValue` and
 * `newValue` and than use `element.classList.add` and `element.classList.remove` to modify the
 * DOM.
 *
 * NOTE: Some platforms (such as NativeScript and WebWorkers) will not have `element.className`
 * available and reading the value will result in `undefined` This means that for those platforms we
 * will always fail the check and will always use  `element.classList.add` and
 * `element.classList.remove` to modify the `element`. (A good mental model is that we can do
 * `element.className === expectedValue` but we may never know the actual value of
 * `element.className`)
 *
 * @param renderer Renderer to use
 * @param element The element which needs to be updated.
 * @param expectedValue The expected (previous/old) value of the class list which we will use to
 *        check if out of bounds modification has happened to the `element`.
 * @param newValue The new class list to write.
 */
export function writeAndReconcileClass(
    renderer: Renderer3, element: RElement, expectedValue: string, newValue: string): void {
  if (element.className === expectedValue) {
    // This is the simple/fast case where no one has written into element without our knowledge.
    if (isProceduralRenderer(renderer)) {
      (renderer as ProceduralRenderer3).setAttribute(element, 'class', newValue);
    } else {
      element.className = newValue;
    }
  } else {
    // The expected value is not the same as last value. Something changed the DOM element without
    // our knowledge so we need to do reconciliation instead.
    reconcileClassNames(renderer, element, expectedValue, newValue);
  }
}

/**
* Writes new `cssText` value in the DOM node.
*
* In its simplest form this function just writes the `newValue` into the `element.style.cssText`
* property.
*
* However, under some circumstances this is more complex because there could be other code which
* has added `style` information to the DOM element. In such a case writing our new value would
* clobber what is already on the element and would result in incorrect behavior.
*
* To solve the above the function first reads the `element.style.cssText` to see if it matches the
* `expectedValue`. (In our case `expectedValue` is just last value written into the DOM.) In this
* way we can detect to see if anyone has modified the DOM since our last write.
* - If we detect no change we simply write: `element.style.cssText = newValue`
* - If we do detect change than we compute the difference between the `expectedValue` and
* `newValue` and than use `element.style[property]` to modify the DOM.
*
* NOTE: Some platforms (such as NativeScript and WebWorkers) will not have `element.style`
* available and reading the value will result in `undefined` This means that for those platforms we
* will always fail the check and will always use  `element.style[property]` to
* modify the `element`. (A good mental model is that we can do `element.style.cssText ===
* expectedValue` but we may never know the actual value of `element.style.cssText`)
*
* @param renderer Renderer to use
* @param element The element which needs to be updated.
* @param expectedValue The expected (previous/old) value of the class list to write.
* @param newValue The new class list to write
*/
export function writeAndReconcileStyle(
    renderer: Renderer3, element: RElement, expectedValue: string, newValue: string): void {
  const style = (element as HTMLElement).style;
  if (style != null && style.cssText === expectedValue) {
    // This is the simple/fast case where no one has written into element without our knowledge.
    if (isProceduralRenderer(renderer)) {
      (renderer as ProceduralRenderer3).setAttribute(element, 'style', newValue);
    } else {
      style.cssText = newValue;
    }
  } else {
    // The expected value is not the same as last value. Something changed the DOM element without
    // our knowledge so we need to do reconciliation instead.
    reconcileStyleNames(renderer, element, expectedValue, newValue);
  }
}


/**
 * Map which keeps track of what should be done with each class name.
 *
 * Key represents class name.
 * Value is represented by:
 * - `false` The token should be deleted. (It was in old list, but not in new list.)
 * - `null` The token should be ignored. (It was present in old list as well as new list.)
 * - `true` the token should be added. (It was only present in the new value)
 */
const changes: ArrayMap<boolean|null> = [] as any;

/**
 * Writes to `classNames` by computing the difference between `oldValue` and `newValue` and using
 * `classList.add` and `classList.remove`.
 *
 * NOTE: Keep this a separate function so that `writeAndReconcileClass` is small and subject to
 * inlining. (We expect that this function will be called rarely.)
 *
 * @param renderer Renderer to use when updating DOM.
 * @param element The native element to update.
 * @param oldValue Old value of `classNames`.
 * @param newValue New value of `classNames`.
 */
function reconcileClassNames(
    renderer: Renderer3, element: RElement, oldValue: string, newValue: string) {
  const isProcedural = isProceduralRenderer(renderer);
  // Reset all of the state arrays.
  changes.length = changes.length = 0;
  computeClassChanges(oldValue, newValue, changes);
  for (let i = 0; i < changes.length; i++) {
    const className = changes[i++] as string;
    const classValue = changes[i] as boolean | null;
    if (classValue === true) {
      if (isProcedural) {
        (renderer as ProceduralRenderer3).addClass(element, className);
      } else {
        (element as HTMLElement).classList.add(className);
      }
    } else if (classValue === false) {
      if (isProcedural) {
        (renderer as ProceduralRenderer3).removeClass(element, className);
      } else {
        (element as HTMLElement).classList.remove(className);
      }
    }
  }
}


/**
 * Reusable array for storing removal keys when computing reconciliations.
 *
 * This array will contain a set of keys which need to be removed from the DOM element.
 */
const removals: ArrayMap<string> = [] as any;


/**
 * Reusable array for storing insert keys when computing reconciliations.
 *
 * This array will contain a set of keys which need to be added to the DOM element.
 */
const additions: ArrayMap<string> = [] as any;

/**
 * Writes to `styles` by computing the difference between `oldValue` and `newValue` and using
 * `styles.setProperty` and `styles.removeProperty`.
 *
 * NOTE: Keep this a separate function so that `writeAndReconcileStyle` is small and subject to
 * inlining. (We expect that this function will be called rarely.)
 *
 * @param renderer Renderer to use when updating DOM.
 * @param element The DOM element to update.
 * @param oldValue Old value of `classNames`.
 * @param newValue New value of `classNames`.
 */
function reconcileStyleNames(
    renderer: Renderer3, element: RElement, oldValue: string, newValue: string) {
  const isProcedural = isProceduralRenderer(renderer);
  // Reset all of the state arrays.
  removals.length = additions.length = 0;
  computeStyleChanges(oldValue, newValue, removals, additions);
  for (let i = 0; i < removals.length; i = i + 2) {
    const styleName = removals[i];
    if (isProcedural) {
      (renderer as ProceduralRenderer3).removeStyle(element, styleName);
    } else {
      (element as HTMLElement).style.removeProperty(styleName);
    }
  }
  for (let i = 0; i < additions.length; i++) {
    const styleName: string = additions[i++];
    const styleValue: string = additions[i];
    if (isProcedural) {
      (renderer as ProceduralRenderer3).setStyle(element, styleName, styleValue);
    } else {
      (element as HTMLElement).style.setProperty(styleName, styleValue);
    }
  }
}
