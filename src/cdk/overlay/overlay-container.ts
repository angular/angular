/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {
  Inject,
  Injectable,
  InjectionToken,
  OnDestroy,
  Optional,
  SkipSelf,
} from '@angular/core';
import {Platform} from '@angular/cdk/platform';

/**
 * Whether we're in a testing environment.
 * TODO(crisbeto): remove this once we have an overlay testing module.
 */
const isTestEnvironment: boolean = typeof window !== 'undefined' && !!window &&
  !!((window as any).__karma__ || (window as any).jasmine);

/** Container inside which all overlays will render. */
@Injectable({providedIn: 'root'})
export class OverlayContainer implements OnDestroy {
  protected _containerElement: HTMLElement;
  protected _document: Document;

  constructor(
    @Inject(DOCUMENT) document: any,
    /**
     * @deprecated `platform` parameter to become required.
     * @breaking-change 10.0.0
     */
    protected _platform?: Platform) {
    this._document = document;
  }

  ngOnDestroy() {
    const container = this._containerElement;

    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }

  /**
   * This method returns the overlay container element. It will lazily
   * create the element the first time  it is called to facilitate using
   * the container in non-browser environments.
   * @returns the container element
   */
  getContainerElement(): HTMLElement {
    if (!this._containerElement) {
      this._createContainer();
    }

    return this._containerElement;
  }

  /**
   * Create the overlay container element, which is simply a div
   * with the 'cdk-overlay-container' class on the document body.
   */
  protected _createContainer(): void {
    // @breaking-change 10.0.0 Remove null check for `_platform`.
    const isBrowser = this._platform ? this._platform.isBrowser : typeof window !== 'undefined';
    const containerClass = 'cdk-overlay-container';

    if (isBrowser || isTestEnvironment) {
      const oppositePlatformContainers =
          this._document.querySelectorAll(`.${containerClass}[platform="server"], ` +
                                          `.${containerClass}[platform="test"]`);

      // Remove any old containers from the opposite platform.
      // This can happen when transitioning from the server to the client.
      for (let i = 0; i < oppositePlatformContainers.length; i++) {
        oppositePlatformContainers[i].parentNode!.removeChild(oppositePlatformContainers[i]);
      }
    }

    const container = this._document.createElement('div');
    container.classList.add(containerClass);

    // A long time ago we kept adding new overlay containers whenever a new app was instantiated,
    // but at some point we added logic which clears the duplicate ones in order to avoid leaks.
    // The new logic was a little too aggressive since it was breaking some legitimate use cases.
    // To mitigate the problem we made it so that only containers from a different platform are
    // cleared, but the side-effect was that people started depending on the overly-aggressive
    // logic to clean up their tests for them. Until we can introduce an overlay-specific testing
    // module which does the cleanup, we try to detect that we're in a test environment and we
    // always clear the container. See #17006.
    // TODO(crisbeto): remove the test environment check once we have an overlay testing module.
    if (isTestEnvironment) {
      container.setAttribute('platform', 'test');
    } else if (!isBrowser) {
      container.setAttribute('platform', 'server');
    }

    this._document.body.appendChild(container);
    this._containerElement = container;
  }
}


/** @docs-private @deprecated @breaking-change 8.0.0 */
export function OVERLAY_CONTAINER_PROVIDER_FACTORY(parentContainer: OverlayContainer,
  _document: any) {
  return parentContainer || new OverlayContainer(_document);
}

/** @docs-private @deprecated @breaking-change 8.0.0 */
export const OVERLAY_CONTAINER_PROVIDER = {
  // If there is already an OverlayContainer available, use that. Otherwise, provide a new one.
  provide: OverlayContainer,
  deps: [
    [new Optional(), new SkipSelf(), OverlayContainer],
    DOCUMENT as InjectionToken<any> // We need to use the InjectionToken somewhere to keep TS happy
  ],
  useFactory: OVERLAY_CONTAINER_PROVIDER_FACTORY
};
