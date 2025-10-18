/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';

/**
 * Service that tracks active shadow DOM contexts and determines where styles should be applied
 * for IsolatedShadowDom encapsulation.
 */
@Injectable({providedIn: 'root'})
export class IsolatedStyleScopeService {
  // Track isolated shadow roots with their host elements
  private isolatedShadowRoots = new Map<ShadowRoot, Element>();
  // Track standard shadow roots with their host elements
  private standardShadowRoots = new Map<ShadowRoot, Element>();

  registerIsolatedShadowRoot(shadowRoot: ShadowRoot): void {
    this.isolatedShadowRoots.set(shadowRoot, shadowRoot.host);
  }

  registerStandardShadowRoot(shadowRoot: ShadowRoot): void {
    this.standardShadowRoots.set(shadowRoot, shadowRoot.host);
  }

  deregisterIsolatedShadowRoot(shadowRoot: ShadowRoot): void {
    this.isolatedShadowRoots.delete(shadowRoot);
  }

  deregisterStandardShadowRoot(shadowRoot: ShadowRoot): void {
    this.standardShadowRoots.delete(shadowRoot);
  }

  /**
   * Determines where styles should be applied by checking the immediate shadow DOM context.
   * Handles both projected content and elements inside shadow roots.
   */
  determineStyleTargets(element: HTMLElement): ShadowRoot[] {
    // Check if we're in an environment that supports ShadowRoot (browser only)
    if (typeof ShadowRoot === 'undefined') {
      return [];
    }

    // Priority 1: Check if element's parent is a shadow root host (handles projected content)
    const parent = element.parentElement;
    if (parent) {
      for (const [shadowRoot, host] of [...this.standardShadowRoots, ...this.isolatedShadowRoots]) {
        if (host === parent) {
          if (this.isIsolatedShadowRoot(shadowRoot)) {
            return [shadowRoot]; // Isolated: apply styles to this one root
          } else {
            return Array.from(this.standardShadowRoots.keys()); // Standard: apply to all standard roots
          }
        }
      }
    }

    // Priority 2: Check what shadow root context this element is in (handles elements inside shadow roots)
    const elementRoot = element.getRootNode();
    if (elementRoot instanceof ShadowRoot && this.isRegisteredShadowRoot(elementRoot)) {
      if (this.isIsolatedShadowRoot(elementRoot)) {
        return [elementRoot]; // Isolated: apply styles to this one root
      } else {
        return Array.from(this.standardShadowRoots.keys()); // Standard: apply to all standard roots
      }
    }

    // Element is not in a shadow root context, use broadcast behavior
    return [];
  }

  private isRegisteredShadowRoot(shadowRoot: ShadowRoot): boolean {
    return this.isolatedShadowRoots.has(shadowRoot) || this.standardShadowRoots.has(shadowRoot);
  }

  /**
   * Check if a shadow root is registered as an isolated shadow root
   */
  isIsolatedShadowRoot(shadowRoot: ShadowRoot): boolean {
    return this.isolatedShadowRoots.has(shadowRoot);
  }

  /**
   * Check if a shadow root is registered as a standard shadow root
   */
  isStandardShadowRoot(shadowRoot: ShadowRoot): boolean {
    return this.standardShadowRoots.has(shadowRoot);
  }
}
