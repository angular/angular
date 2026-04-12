/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';

/**
 * A factory for `HttpXhrBackend` that uses the `XMLHttpRequest` browser API.
 */
@Injectable({providedIn: 'root'})
export class BrowserXhr implements XhrFactory {
  build(): XMLHttpRequest {
    return new XMLHttpRequest();
  }
}

/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root', useExisting: BrowserXhr})
export abstract class XhrFactory {
  abstract build(): XMLHttpRequest;
}
