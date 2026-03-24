/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {
  inject,
  Inject,
  Injectable,
  Injector,
  ɵstartMeasuring as startMeasuring,
  ɵstopMeasuring as stopMeasuring,
} from '@angular/core';

import {serializeDocument} from './domino_adapter';
import {ENABLE_DOM_EMULATION} from './tokens';

/**
 * Representation of the current platform state.
 *
 * @publicApi
 */
@Injectable()
export class PlatformState {
  /* @internal */
  _enableDomEmulation = enableDomEmulation(inject(Injector));

  constructor(@Inject(DOCUMENT) private _doc: any) {}

  /**
   * Renders the current state of the platform to string.
   */
  renderToString(): string {
    if (ngDevMode && !this._enableDomEmulation && !window?.document) {
      throw new Error('Disabled DOM emulation should only run in browser environments');
    }

    const measuringLabel = 'renderToString';
    startMeasuring(measuringLabel);
    const rendered = this._enableDomEmulation
      ? serializeDocument(this._doc)
      : // In the case we run/test the platform-server in a browser environment
        this._doc.documentElement.outerHTML;
    stopMeasuring(measuringLabel);
    return rendered;
  }

  /**
   * Returns the current DOM state.
   */
  getDocument(): any {
    return this._doc;
  }

  /**
   * Renders the current state of the platform to an object containing the head and body.
   */
  renderToParts(): {head: string; body: string} {
    if (ngDevMode && !this._enableDomEmulation && !window?.document) {
      throw new Error('Disabled DOM emulation should only run in browser environments');
    }
    const measuringLabel = 'renderToParts';
    startMeasuring(measuringLabel);

    // Fallbacks if doc is somehow malformed
    const headHtml = this._doc.head?.innerHTML ?? '';
    const bodyHtml = this._doc.body?.innerHTML ?? '';

    stopMeasuring(measuringLabel);
    return {head: headHtml, body: bodyHtml};
  }
}

export function enableDomEmulation(injector: Injector): boolean {
  return injector.get(ENABLE_DOM_EMULATION, true);
}
