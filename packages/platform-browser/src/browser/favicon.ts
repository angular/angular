/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, inject} from '@angular/core';

import {getDOM} from '../dom/dom_adapter';
import {DOCUMENT} from '../dom/dom_tokens';

/**
 * Factory to create Favicon service.
 */
export function createFavicon() {
  return new Favicon(inject(DOCUMENT));
}

/**
 * A service that can be used to get and set the favicon of a current HTML document.
 *
 * Since an Angular application can't be bootstrapped on the entire HTML document (`<html>` tag)
 * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
 * (representing the `<title>` tag). Instead, this service can be used to set and get the current
 * title value.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root', useFactory: createFavicon, deps: []})
export class Favicon {
  constructor(@Inject(DOCUMENT) private _doc: any) {}
  /**
   * Get the favicon of the current HTML document.
   */
  getFavicon() { return getDOM().querySelector(this._doc, 'link[rel*=\'icon\']'); }

  /**
   * Set the favicon of the current HTML document.
   * @param newFaviconURL
   */
  setFavicon(newFaviconURL: string) {
    const link =
        getDOM().querySelector(this._doc, 'link[rel*=\'icon\']') || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = newFaviconURL;
    getDOM().getElementsByTagName(this._doc, 'head')[0].appendChild(link);
  }
}
