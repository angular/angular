/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// headers.ts and url_params.ts are symlinked from @angular/http/client, and are
// re-exported here with legacy names. This does cause some code duplication if
// @angular/http and @angular/http/client are used in the same application, but
// allows for smaller bundles if either is used independently.

import {HttpHeaders} from './client/headers';
import {HttpQueryEncoder, HttpUrlParams} from './client/url_params';


/**
 * @experimental
 */
export const Headers = HttpHeaders;
export type Headers = HttpHeaders;

/**
 * @experimental
 */
export const URLSearchParams = HttpUrlParams;
export type URLSearchParams = HttpUrlParams;

/**
 * @experimental
 */
export const QueryEncoder = HttpQueryEncoder;
export type QueryEncoder = HttpQueryEncoder;
