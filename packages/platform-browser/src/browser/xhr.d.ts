/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { XhrFactory } from '@angular/common';
/**
 * A factory for `HttpXhrBackend` that uses the `XMLHttpRequest` browser API.
 */
export declare class BrowserXhr implements XhrFactory {
    build(): XMLHttpRequest;
}
