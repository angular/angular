/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Injectable,
  ɵunwrapRNode as unwrapRNode,
  eReadPatchedData as readPatchedData,
  ɵHOST as HOST,
  ɵPARENT as PARENT,
} from '@angular/core';

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
   * Determines where styles should be applied by checking the shadow DOM context.
   * Uses Angular's LView hierarchy combined with DOM checks for robustness.
   */
  determineStyleTargets(element: HTMLElement): ShadowRoot[] {
    if (typeof ShadowRoot === 'undefined') {
      return [];
    }

    // Check if element is already inside a shadow root
    const elementRoot = element.getRootNode();
    if (elementRoot instanceof ShadowRoot && this.isRegisteredShadowRoot(elementRoot)) {
      return this.getShadowRootsForContext(elementRoot);
    }

    // Try Angular's LView hierarchy with DOM ancestor checking
    try {
      const result = this.findShadowRootViaLView(element);
      if (result) {
        return result;
      }
    } catch (e) {
      // LView not available, return empty to use broadcast behavior
    }

    return [];
  }

  /**
   * Finds shadow root hosts using Angular's LView hierarchy.
   *
   * Note: With IsolatedShadowDom, ng-content projection is disabled and native <slot>
   * elements are used instead. This means projected content stays in the light DOM,
   * so we only need to check the LView hierarchy - no DOM walking required.
   */
  private findShadowRootViaLView(element: HTMLElement): ShadowRoot[] | null {
    const lView = readPatchedData(element);
    if (!lView || !Array.isArray(lView)) {
      return null;
    }

    // Traverse LView hierarchy to find component hosts
    let currentLView = lView;
    const visited = new Set<any>();

    while (currentLView && !visited.has(currentLView)) {
      visited.add(currentLView);

      const hostRNode = currentLView[HOST];
      if (hostRNode) {
        const hostElement = unwrapRNode(hostRNode);
        if (hostElement instanceof Element) {
          const shadowRoots = this.checkIfShadowRootHost(hostElement);
          if (shadowRoots) {
            return shadowRoots;
          }
        }
      }

      const parentLView = currentLView[PARENT];
      if (parentLView && Array.isArray(parentLView) && parentLView[HOST] !== undefined) {
        currentLView = parentLView as any;
      } else {
        break;
      }
    }

    return null;
  }

  /**
   * Checks if the given element is a shadow root host and returns appropriate shadow roots.
   */
  private checkIfShadowRootHost(element: Element): ShadowRoot[] | null {
    for (const [shadowRoot, host] of [...this.isolatedShadowRoots, ...this.standardShadowRoots]) {
      if (host === element) {
        return this.getShadowRootsForContext(shadowRoot);
      }
    }
    return null;
  }

  /**
   * Returns the appropriate shadow roots based on whether it's isolated or standard.
   */
  private getShadowRootsForContext(shadowRoot: ShadowRoot): ShadowRoot[] {
    if (this.isIsolatedShadowRoot(shadowRoot)) {
      return [shadowRoot];
    } else {
      return Array.from(this.standardShadowRoots.keys());
    }
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
