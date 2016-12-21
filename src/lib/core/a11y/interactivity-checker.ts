import {Injectable} from '@angular/core';
import {Platform} from '../platform/platform';

/**
 * The InteractivityChecker leans heavily on the ally.js accessibility utilities.
 * Methods like `isTabbable` are only covering specific edge-cases for the browsers which are
 * supported.
 */

/**
 * Utility for checking the interactivity of an element, such as whether is is focusable or
 * tabbable.
 */
@Injectable()
export class InteractivityChecker {

  constructor(private _platform: Platform) {}

  /**
   * Gets whether an element is disabled.
   *
   * @param element Element to be checked.
   * @returns Whether the element is disabled.
   */
  isDisabled(element: HTMLElement): boolean {
    // This does not capture some cases, such as a non-form control with a disabled attribute or
    // a form control inside of a disabled form, but should capture the most common cases.
    return element.hasAttribute('disabled');
  }

  /**
   * Gets whether an element is visible for the purposes of interactivity.
   *
   * This will capture states like `display: none` and `visibility: hidden`, but not things like
   * being clipped by an `overflow: hidden` parent or being outside the viewport.
   *
   * @returns Whether the element is visible.
   */
  isVisible(element: HTMLElement): boolean {
    return hasGeometry(element) && getComputedStyle(element).visibility === 'visible';
  }

  /**
   * Gets whether an element can be reached via Tab key.
   * Assumes that the element has already been checked with isFocusable.
   *
   * @param element Element to be checked.
   * @returns Whether the element is tabbable.
   */
  isTabbable(element: HTMLElement): boolean {

    let frameElement = getWindow(element).frameElement as HTMLElement;

    if (frameElement) {

      let frameType = frameElement && frameElement.nodeName.toLowerCase();

      // Frame elements inherit their tabindex onto all child elements.
      if (getTabIndexValue(frameElement) === -1) {
        return false;
      }

      // Webkit and Blink consider anything inside of an <object> element as non-tabbable.
      if ((this._platform.BLINK || this._platform.WEBKIT) && frameType === 'object') {
        return false;
      }

      // Webkit and Blink disable tabbing to an element inside of an invisible frame.
      if ((this._platform.BLINK || this._platform.WEBKIT) && !this.isVisible(frameElement)) {
        return false;
      }

    }

    let nodeName = element.nodeName.toLowerCase();
    let tabIndexValue = getTabIndexValue(element);

    if (element.hasAttribute('contenteditable')) {
      return tabIndexValue !== -1;
    }

    if (nodeName === 'iframe') {
      // The frames may be tabbable depending on content, but it's not possibly to reliably
      // investigate the content of the frames.
      return false;
    }

    if (nodeName === 'audio') {
      if (!element.hasAttribute('controls')) {
        // By default an <audio> element without the controls enabled is not tabbable.
        return false;
      } else if (this._platform.BLINK) {
        // In Blink <audio controls> elements are always tabbable.
        return true;
      }
    }

    if (nodeName === 'video') {
      if (!element.hasAttribute('controls') && this._platform.TRIDENT) {
        // In Trident a <video> element without the controls enabled is not tabbable.
        return false;
      } else if (this._platform.BLINK || this._platform.FIREFOX) {
        // In Chrome and Firefox <video controls> elements are always tabbable.
        return true;
      }
    }

    if (nodeName === 'object' && (this._platform.BLINK || this._platform.WEBKIT)) {
      // In all Blink and WebKit based browsers <object> elements are never tabbable.
      return false;
    }

    // In iOS the browser only considers some specific elements as tabbable.
    if (this._platform.WEBKIT && this._platform.IOS && !isPotentiallyTabbableIOS(element)) {
      return false;
    }

    return element.tabIndex >= 0;
  }

  /**
   * Gets whether an element can be focused by the user.
   *
   * @param element Element to be checked.
   * @returns Whether the element is focusable.
   */
  isFocusable(element: HTMLElement): boolean {
    // Perform checks in order of left to most expensive.
    // Again, naive approach that does not capture many edge cases and browser quirks.
    return isPotentiallyFocusable(element) && !this.isDisabled(element) && this.isVisible(element);
  }

}

/** Checks whether the specified element has any geometry / rectangles. */
function hasGeometry(element: HTMLElement): boolean {
  // Use logic from jQuery to check for an invisible element.
  // See https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js#L12
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

/** Gets whether an element's  */
function isNativeFormElement(element: Node) {
  let nodeName = element.nodeName.toLowerCase();
  return nodeName === 'input' ||
      nodeName === 'select' ||
      nodeName === 'button' ||
      nodeName === 'textarea';
}

/** Gets whether an element is an <input type="hidden">. */
function isHiddenInput(element: HTMLElement): boolean {
  return isInputElement(element) && element.type == 'hidden';
}

/** Gets whether an element is an anchor that has an href attribute. */
function isAnchorWithHref(element: HTMLElement): boolean {
  return isAnchorElement(element) && element.hasAttribute('href');
}

/** Gets whether an element is an input element. */
function isInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.nodeName == 'input';
}

/** Gets whether an element is an anchor element. */
function isAnchorElement(element: HTMLElement): element is HTMLAnchorElement {
  return element.nodeName.toLowerCase() == 'a';
}

/** Gets whether an element has a valid tabindex. */
function hasValidTabIndex(element: HTMLElement): boolean {
  if (!element.hasAttribute('tabindex') || element.tabIndex === undefined) {
    return false;
  }

  let tabIndex = element.getAttribute('tabindex');

  // IE11 parses tabindex="" as the value "-32768"
  if (tabIndex == '-32768') {
    return false;
  }

  return !!(tabIndex && !isNaN(parseInt(tabIndex, 10)));
}

/**
 * Returns the parsed tabindex from the element attributes instead of returning the
 * evaluated tabindex from the browsers defaults.
 */
function getTabIndexValue(element: HTMLElement): number {
  if (!hasValidTabIndex(element)) {
    return null;
  }

  // See browser issue in Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
  const tabIndex = parseInt(element.getAttribute('tabindex'), 10);

  return isNaN(tabIndex) ? -1 : tabIndex;
}

/** Checks whether the specified element is potentially tabbable on iOS */
function isPotentiallyTabbableIOS(element: HTMLElement): boolean {
  let nodeName = element.nodeName.toLowerCase();
  let inputType = nodeName === 'input' && (element as HTMLInputElement).type;

  return inputType === 'text'
      || inputType === 'password'
      || nodeName === 'select'
      || nodeName === 'textarea';
}

/**
 * Gets whether an element is potentially focusable without taking current visible/disabled state
 * into account.
 */
function isPotentiallyFocusable(element: HTMLElement): boolean {
  // Inputs are potentially focusable *unless* they're type="hidden".
  if (isHiddenInput(element)) {
    return false;
  }

  return isNativeFormElement(element) ||
      isAnchorWithHref(element) ||
      element.hasAttribute('contenteditable') ||
      hasValidTabIndex(element);
}

/** Gets the parent window of a DOM node with regards of being inside of an iframe. */
function getWindow(node: HTMLElement): Window {
  return node.ownerDocument.defaultView || window;
}
