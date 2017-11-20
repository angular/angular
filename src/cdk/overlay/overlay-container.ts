/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, InjectionToken, Inject, Optional, SkipSelf, OnDestroy} from '@angular/core';
import {DOCUMENT} from '@angular/common';


/** Container inside which all overlays will render. */
@Injectable()
export class OverlayContainer implements OnDestroy {
  protected _containerElement: HTMLElement;

  constructor(@Inject(DOCUMENT) private _document: any) {}

  ngOnDestroy() {
    if (this._containerElement && this._containerElement.parentNode) {
      this._containerElement.parentNode.removeChild(this._containerElement);
    }
  }

  /**
   * This method returns the overlay container element. It will lazily
   * create the element the first time  it is called to facilitate using
   * the container in non-browser environments.
   * @returns the container element
   */
  getContainerElement(): HTMLElement {
    if (!this._containerElement) { this._createContainer(); }
    return this._containerElement;
  }

  /**
   * Create the overlay container element, which is simply a div
   * with the 'cdk-overlay-container' class on the document body.
   */
  protected _createContainer(): void {
    const container = this._document.createElement('div');

    container.classList.add('cdk-overlay-container');
    this._document.body.appendChild(container);
    this._containerElement = container;
  }
}

/** @docs-private */
export function OVERLAY_CONTAINER_PROVIDER_FACTORY(parentContainer: OverlayContainer,
  _document: any) {
  return parentContainer || new OverlayContainer(_document);
}

/** @docs-private */
export const OVERLAY_CONTAINER_PROVIDER = {
  // If there is already an OverlayContainer available, use that. Otherwise, provide a new one.
  provide: OverlayContainer,
  deps: [
    [new Optional(), new SkipSelf(), OverlayContainer],
    DOCUMENT as InjectionToken<any> // We need to use the InjectionToken somewhere to keep TS happy
  ],
  useFactory: OVERLAY_CONTAINER_PROVIDER_FACTORY
};
