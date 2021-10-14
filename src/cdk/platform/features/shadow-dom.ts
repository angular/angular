/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

let shadowDomIsSupported: boolean;

/** Checks whether the user's browser support Shadow DOM. */
export function _supportsShadowDom(): boolean {
  if (shadowDomIsSupported == null) {
    const head = typeof document !== 'undefined' ? document.head : null;
    shadowDomIsSupported = !!(head && ((head as any).createShadowRoot || head.attachShadow));
  }

  return shadowDomIsSupported;
}

/** Gets the shadow root of an element, if supported and the element is inside the Shadow DOM. */
export function _getShadowRoot(element: HTMLElement): ShadowRoot | null {
  if (_supportsShadowDom()) {
    const rootNode = element.getRootNode ? element.getRootNode() : null;

    // Note that this should be caught by `_supportsShadowDom`, but some
    // teams have been able to hit this code path on unsupported browsers.
    if (typeof ShadowRoot !== 'undefined' && ShadowRoot && rootNode instanceof ShadowRoot) {
      return rootNode;
    }
  }

  return null;
}

/**
 * Gets the currently-focused element on the page while
 * also piercing through Shadow DOM boundaries.
 */
export function _getFocusedElementPierceShadowDom(): HTMLElement | null {
  let activeElement =
    typeof document !== 'undefined' && document
      ? (document.activeElement as HTMLElement | null)
      : null;

  while (activeElement && activeElement.shadowRoot) {
    const newActiveElement = activeElement.shadowRoot.activeElement as HTMLElement | null;
    if (newActiveElement === activeElement) {
      break;
    } else {
      activeElement = newActiveElement;
    }
  }

  return activeElement;
}

/** Gets the target of an event while accounting for Shadow DOM. */
export function _getEventTarget<T extends EventTarget>(event: Event): T | null {
  // If an event is bound outside the Shadow DOM, the `event.target` will
  // point to the shadow root so we have to use `composedPath` instead.
  return (event.composedPath ? event.composedPath()[0] : event.target) as T | null;
}
