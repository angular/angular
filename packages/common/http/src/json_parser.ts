/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';

/**
 * A parser for JSON responses.
 *
 * @publicApi
 */
export abstract class HttpJsonParser {
  abstract parse(text: string): any;
}

/**
 * A default implementation of `HttpJsonParser` that uses the browser's `JSON.parse`.
 */
export class DefaultHttpJsonParser implements HttpJsonParser {
  parse(text: string): any {
    return JSON.parse(text);
  }
}

/**
 * An `InjectionToken` that can be used to provide a custom `HttpJsonParser`.
 *
 * @publicApi
 */
export const HTTP_JSON_PARSER = new InjectionToken<HttpJsonParser>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'HttpJsonParser' : '',
  {
    providedIn: 'root',
    factory: () => new DefaultHttpJsonParser(),
  },
);
