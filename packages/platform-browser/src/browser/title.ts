/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable} from '@angular/core';

import {getDOM} from '../dom/dom_adapter';
import {DOCUMENT} from '../dom/dom_tokens';


/**
 * A service that can be used to get and set the title of a current HTML document.
 *
 * Since an Angular application can't be bootstrapped on the entire HTML document (`<html>` tag)
 * it is not possible to bind to the `text` property of the `HTMLTitleElement` elements
 * (representing the `<title>` tag). Instead, this service can be used to set and get the current
 * title value.
 *
 *
 * The [Title](api/platform-browser/Title) service is a simple class that provides an API
 * for getting and setting the current HTML document title:

* * `getTitle() : string`&mdash;Gets the title of the current HTML document.

* * `setTitle( newTitle : string )`&mdash;Sets the title of the current HTML document.

 * You can inject the `Title` service into the root `AppComponent` and expose a
 * bindable `setTitle` method that calls it:


 * {@example platform-browser/browser/title.ts region='class'}

 *
 *
 *  @experimental
 */
@Injectable()
export class Title {
  constructor(@Inject(DOCUMENT) private _doc: any) {}
  /**
   * Get the title of the current HTML document.
   * @returns {string}
   */
  getTitle(): string { return getDOM().getTitle(this._doc); }

  /**
   * Set the title of the current HTML document.
   * @param newTitle
   */
  setTitle(newTitle: string) { getDOM().setTitle(this._doc, newTitle); }
}
