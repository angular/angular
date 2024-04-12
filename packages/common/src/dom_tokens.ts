/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, InjectionToken} from '@angular/core';

/**
 * A DI Token representing the main rendering context.
 * In a browser and SSR this is the DOM Document.
 * When using SSR, that document is created by [Domino](https://github.com/angular/domino).
 *
 * @publicApi
 */
export const DOCUMENT = new InjectionToken<Document>(ngDevMode ? 'DocumentToken' : '');

/**
 * A DI token representing a reference to the main the DOM Document.
 * Unlike `DOCUMENT`, this always has a value even if DOM emulation is disabled.
 *
 * @publicApi
 */
export const DOCUMENT_REF = new InjectionToken<ElementRef<Document>>(
  ngDevMode ? 'DocumentRefToken' : '',
);
