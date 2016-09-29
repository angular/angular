import {Injectable} from '@angular/core';

/**
 * Utility for checking the interactivity of an element, such as whether is is focusable or
 * tabbable.
 *
 * NOTE: Currently does not capture any special element behaviors, browser quirks, or edge cases.
 * This is a basic/naive starting point onto which further behavior will be added.
 *
 * This class uses instance methods instead of static functions so that alternate implementations
 * can be injected.
 *
 * TODO(jelbourn): explore using ally.js directly for its significantly more robust
 * checks (need to evaluate payload size, performance, and compatibility with tree-shaking).
 */
@Injectable()
export class InteractivityChecker {

  /** Gets whether an element is disabled. */
  isDisabled(element: HTMLElement) {
    // This does not capture some cases, such as a non-form control with a disabled attribute or
    // a form control inside of a disabled form, but should capture the most common cases.
    return element.hasAttribute('disabled');
  }

  /**
   * Gets whether an element is visible for the purposes of interactivity.
   *
   * This will capture states like `display: none` and `visibility: hidden`, but not things like
   * being clipped by an `overflow: hidden` parent or being outside the viewport.
   */
  isVisible(element: HTMLElement) {
    // There are additional special cases that this does not capture, but this will work for
    // the most common cases.

    // Use logic from jQuery to check for `display: none`.
    // See https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js#L12
    if (!(element.offsetWidth || element.offsetHeight || element.getClientRects().length)) {
      return false;
    }

    // Check for css `visibility` property.
    // TODO(jelbourn): do any browsers we support return an empty string instead of 'visible'?
    return getComputedStyle(element).getPropertyValue('visibility') == 'visible';
  }

  /**
   * Gets whether an element can be reached via Tab key.
   * Assumes that the element has already been checked with isFocusable.
   */
  isTabbable(element: HTMLElement) {
    // Again, naive approach that does not capture many special cases and browser quirks.
    return element.tabIndex >= 0;
  }

  /** Gets whether an element can be focused by the user. */
  isFocusable(element: HTMLElement): boolean {
    // Perform checks in order of left to most expensive.
    // Again, naive approach that does not capture many edge cases and browser quirks.
    return isPotentiallyFocusable(element) && !this.isDisabled(element) && this.isVisible(element);
  }
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

