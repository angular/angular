/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import {assertDefined, assertString} from '../../util/assert';
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
 * - If we do detect change then we compute the difference between the `expectedValue` and
 * `newValue` and then use `element.classList.add` and `element.classList.remove` to modify the
 * DOM.
 *
 * NOTE: Some platforms (such as NativeScript and WebWorkers) will not have `element.className`
 * available and reading the value will result in `undefined`. This means that for those platforms
 * we will always fail the check and will always use  `element.classList.add` and
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
  ngDevMode && assertDefined(element, 'Expecting DOM element');
  ngDevMode && assertString(expectedValue, '\'oldValue\' should be a string');
  ngDevMode && assertString(newValue, '\'newValue\' should be a string');
  if (element.className === expectedValue) {
    writeDirectClass(renderer, element, newValue);
  } else {
    // The expected value is not the same as last value. Something changed the DOM element without
    // our knowledge so we need to do reconciliation instead.
    reconcileClassNames(renderer, element, expectedValue, newValue);
  }
}

/**
 * Write `className` to `RElement`.
 *
 * This function does direct write without any reconciliation. Used for writing initial values, so
 * that static styling values do not pull in the style parser.
 *
 * @param renderer Renderer to use
 * @param element The element which needs to be updated.
 * @param newValue The new class list to write.
 */
export function writeDirectClass(renderer: Renderer3, element: RElement, newValue: string) {
  ngDevMode && assertString(newValue, '\'newValue\' should be a string');
  if (isProceduralRenderer(renderer)) {
    if (newValue === '') {
      // There are tests in `google3` which expect `element.getAttribute('class')` to be `null`.
      // TODO(commit): add test case
      renderer.removeAttribute(element, 'class');
    } else {
      renderer.setAttribute(element, 'class', newValue);
    }
  } else {
    element.className = newValue;
  }
  ngDevMode && ngDevMode.rendererSetClassName++;
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
* - If we do detect change then we compute the difference between the `expectedValue` and
* `newValue` and then use `element.style[property]` to modify the DOM.
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
  ngDevMode && assertDefined(element, 'Expecting DOM element');
  ngDevMode && assertString(expectedValue, '\'expectedValue\' should be a string');
  ngDevMode && assertString(newValue, '\'newValue\' should be a string');
  const style = expectedValue === null ? null : (element as HTMLElement).style;
  if (expectedValue === null || style != null && (style !.cssText === expectedValue)) {
    writeDirectStyle(renderer, element, newValue);
  } else {
    // The expected value is not the same as last value. Something changed the DOM element without
    // our knowledge so we need to do reconciliation instead.
    reconcileStyleNames(renderer, element, expectedValue, newValue);
  }
}

/**
 * Write `cssText` to `RElement`.
 *
 * This function does direct write without any reconciliation. Used for writing initial values, so
 * that static styling values do not pull in the style parser.
 *
 * @param renderer Renderer to use
 * @param element The element which needs to be updated.
 * @param newValue The new class list to write.
 */
export function writeDirectStyle(renderer: Renderer3, element: RElement, newValue: string) {
  ngDevMode && assertString(newValue, '\'newValue\' should be a string');
  if (isProceduralRenderer(renderer)) {
    renderer.setAttribute(element, 'style', newValue);
  } else {
    (element as HTMLElement).style.cssText = newValue;
  }
  ngDevMode && ngDevMode.rendererSetStyle++;
}

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
  computeClassChanges(oldValue, newValue).forEach((classValue, className) => {
    if (classValue === true) {
      if (isProcedural) {
        (renderer as ProceduralRenderer3).addClass(element, className);
      } else {
        (element as HTMLElement).classList.add(className);
      }
      ngDevMode && ngDevMode.rendererAddClass++;
    } else if (classValue === false) {
      if (isProcedural) {
        (renderer as ProceduralRenderer3).removeClass(element, className);
      } else {
        (element as HTMLElement).classList.remove(className);
      }
      ngDevMode && ngDevMode.rendererRemoveClass++;
    }
  });
}

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
  const changes = computeStyleChanges(oldValue, newValue);
  changes.forEach((styleValue, styleName) => {
    const newValue = styleValue.new;
    if (newValue === null) {
      if (isProcedural) {
        (renderer as ProceduralRenderer3).removeStyle(element, styleName);
      } else {
        (element as HTMLElement).style.removeProperty(styleName);
      }
      ngDevMode && ngDevMode.rendererRemoveStyle++;
    } else if (styleValue.old !== newValue) {
      if (isProcedural) {
        (renderer as ProceduralRenderer3).setStyle(element, styleName, newValue);
      } else {
        (element as HTMLElement).style.setProperty(styleName, newValue);
      }
      ngDevMode && ngDevMode.rendererSetStyle++;
    }
  });
}
