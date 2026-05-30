/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {Injectable, CSP_NONCE, inject, OnDestroy, PLATFORM_ID, forwardRef} from '@angular/core';

/**
 * Service that monitors validity state changes on native form elements.
 *
 * It works by dynamically installing a CSS transition on `input, textarea` `:valid`
 * and `:invalid` states, which allows us to intercept a `transitionstart` event
 * whenever the native validity state changes without an `input` event (e.g. clearing a date input).
 */
@Injectable({providedIn: 'root', useClass: forwardRef(() => AnimationInputValidityMonitor)})
export abstract class InputValidityMonitor {
  abstract watchValidity(element: HTMLInputElement, callback: () => void): void;
  abstract isBadInput(element: HTMLInputElement): boolean;
}

@Injectable()
export class AnimationInputValidityMonitor extends InputValidityMonitor implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly cspNonce = inject(CSP_NONCE, {optional: true});
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly injectedStyles = new WeakMap<Document | ShadowRoot, HTMLStyleElement>();

  /** Starts watching the given element for validity state changes. */
  override watchValidity(element: HTMLInputElement, callback: () => void): void {
    if (!this.isBrowser) {
      return;
    }

    const rootNode = element.getRootNode() as Document | ShadowRoot;
    if (!this.injectedStyles.has(rootNode)) {
      this.injectedStyles.set(rootNode, this.createTransitionStyle(rootNode));
    }

    element.addEventListener('animationstart', (event: Event) => {
      const animationEvent = event as AnimationEvent;
      if (
        animationEvent.animationName === 'ng-valid' ||
        animationEvent.animationName === 'ng-invalid'
      ) {
        callback();
      }
    });
  }

  override isBadInput(element: HTMLInputElement): boolean {
    return element.validity?.badInput ?? false;
  }

  private createTransitionStyle(rootNode: Document | ShadowRoot): HTMLStyleElement {
    const element = this.document.createElement('style');
    if (this.cspNonce) {
      element.nonce = this.cspNonce;
    }
    element.textContent = `
      @keyframes ng-valid {}
      @keyframes ng-invalid {}
      input:valid, textarea:valid {
        animation: ng-valid 0.001s;
      }
      input:invalid, textarea:invalid {
        animation: ng-invalid 0.001s;
      }
    `;
    if (rootNode.nodeType === 9 /* Node.DOCUMENT_NODE */) {
      (rootNode as Document).head?.appendChild(element);
    } else {
      rootNode.appendChild(element);
    }
    return element;
  }

  ngOnDestroy(): void {
    // We explicitly clean up the main document's injected style wrapper.
    this.injectedStyles.get(this.document)?.remove();

    // We do not need to iterate over ShadowRoots to clean them up.
    // The WeakMap drops the reference when the ShadowRoot is destroyed,
    // and the DOM subtree takes care of its own garbage collection.
  }
}
