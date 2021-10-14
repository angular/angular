/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {Injectable} from '@angular/core';

/**
 * Configuration for the isFocusable method.
 */
export class IsFocusableConfig {
  /**
   * Whether to count an element as focusable even if it is not currently visible.
   */
  ignoreVisibility: boolean = false;
}

// The InteractivityChecker leans heavily on the ally.js accessibility utilities.
// Methods like `isTabbable` are only covering specific edge-cases for the browsers which are
// supported.

/**
 * Utility for checking the interactivity of an element, such as whether is is focusable or
 * tabbable.
 */
@Injectable({providedIn: 'root'})
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
    // Nothing is tabbable on the server 😎
    if (!this._platform.isBrowser) {
      return false;
    }

    const frameElement = getFrameElement(getWindow(element));

    if (frameElement) {
      // Frame elements inherit their tabindex onto all child elements.
      if (getTabIndexValue(frameElement) === -1) {
        return false;
      }

      // Browsers disable tabbing to an element inside of an invisible frame.
      if (!this.isVisible(frameElement)) {
        return false;
      }
    }

    let nodeName = element.nodeName.toLowerCase();
    let tabIndexValue = getTabIndexValue(element);

    if (element.hasAttribute('contenteditable')) {
      return tabIndexValue !== -1;
    }

    if (nodeName === 'iframe' || nodeName === 'object') {
      // The frame or object's content may be tabbable depending on the content, but it's
      // not possibly to reliably detect the content of the frames. We always consider such
      // elements as non-tabbable.
      return false;
    }

    // In iOS, the browser only considers some specific elements as tabbable.
    if (this._platform.WEBKIT && this._platform.IOS && !isPotentiallyTabbableIOS(element)) {
      return false;
    }

    if (nodeName === 'audio') {
      // Audio elements without controls enabled are never tabbable, regardless
      // of the tabindex attribute explicitly being set.
      if (!element.hasAttribute('controls')) {
        return false;
      }
      // Audio elements with controls are by default tabbable unless the
      // tabindex attribute is set to `-1` explicitly.
      return tabIndexValue !== -1;
    }

    if (nodeName === 'video') {
      // For all video elements, if the tabindex attribute is set to `-1`, the video
      // is not tabbable. Note: We cannot rely on the default `HTMLElement.tabIndex`
      // property as that one is set to `-1` in Chrome, Edge and Safari v13.1. The
      // tabindex attribute is the source of truth here.
      if (tabIndexValue === -1) {
        return false;
      }
      // If the tabindex is explicitly set, and not `-1` (as per check before), the
      // video element is always tabbable (regardless of whether it has controls or not).
      if (tabIndexValue !== null) {
        return true;
      }
      // Otherwise (when no explicit tabindex is set), a video is only tabbable if it
      // has controls enabled. Firefox is special as videos are always tabbable regardless
      // of whether there are controls or not.
      return this._platform.FIREFOX || element.hasAttribute('controls');
    }

    return element.tabIndex >= 0;
  }

  /**
   * Gets whether an element can be focused by the user.
   *
   * @param element Element to be checked.
   * @param config The config object with options to customize this method's behavior
   * @returns Whether the element is focusable.
   */
  isFocusable(element: HTMLElement, config?: IsFocusableConfig): boolean {
    // Perform checks in order of left to most expensive.
    // Again, naive approach that does not capture many edge cases and browser quirks.
    return (
      isPotentiallyFocusable(element) &&
      !this.isDisabled(element) &&
      (config?.ignoreVisibility || this.isVisible(element))
    );
  }
}

/**
 * Returns the frame element from a window object. Since browsers like MS Edge throw errors if
 * the frameElement property is being accessed from a different host address, this property
 * should be accessed carefully.
 */
function getFrameElement(window: Window) {
  try {
    return window.frameElement as HTMLElement;
  } catch {
    return null;
  }
}

/** Checks whether the specified element has any geometry / rectangles. */
function hasGeometry(element: HTMLElement): boolean {
  // Use logic from jQuery to check for an invisible element.
  // See https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js#L12
  return !!(
    element.offsetWidth ||
    element.offsetHeight ||
    (typeof element.getClientRects === 'function' && element.getClientRects().length)
  );
}

/** Gets whether an element's  */
function isNativeFormElement(element: Node) {
  let nodeName = element.nodeName.toLowerCase();
  return (
    nodeName === 'input' ||
    nodeName === 'select' ||
    nodeName === 'button' ||
    nodeName === 'textarea'
  );
}

/** Gets whether an element is an `<input type="hidden">`. */
function isHiddenInput(element: HTMLElement): boolean {
  return isInputElement(element) && element.type == 'hidden';
}

/** Gets whether an element is an anchor that has an href attribute. */
function isAnchorWithHref(element: HTMLElement): boolean {
  return isAnchorElement(element) && element.hasAttribute('href');
}

/** Gets whether an element is an input element. */
function isInputElement(element: HTMLElement): element is HTMLInputElement {
  return element.nodeName.toLowerCase() == 'input';
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
  return !!(tabIndex && !isNaN(parseInt(tabIndex, 10)));
}

/**
 * Returns the parsed tabindex from the element attributes instead of returning the
 * evaluated tabindex from the browsers defaults.
 */
function getTabIndexValue(element: HTMLElement): number | null {
  if (!hasValidTabIndex(element)) {
    return null;
  }

  // See browser issue in Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
  const tabIndex = parseInt(element.getAttribute('tabindex') || '', 10);

  return isNaN(tabIndex) ? -1 : tabIndex;
}

/** Checks whether the specified element is potentially tabbable on iOS */
function isPotentiallyTabbableIOS(element: HTMLElement): boolean {
  let nodeName = element.nodeName.toLowerCase();
  let inputType = nodeName === 'input' && (element as HTMLInputElement).type;

  return (
    inputType === 'text' ||
    inputType === 'password' ||
    nodeName === 'select' ||
    nodeName === 'textarea'
  );
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

  return (
    isNativeFormElement(element) ||
    isAnchorWithHref(element) ||
    element.hasAttribute('contenteditable') ||
    hasValidTabIndex(element)
  );
}

/** Gets the parent window of a DOM node with regards of being inside of an iframe. */
function getWindow(node: HTMLElement): Window {
  // ownerDocument is null if `node` itself *is* a document.
  return (node.ownerDocument && node.ownerDocument.defaultView) || window;
}
