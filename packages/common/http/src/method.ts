/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Common HTTP methods that can be used, both in lowercase or uppercase.
 *
 * Based on:
 * - https://datatracker.ietf.org/doc/html/rfc7231#section-4 for
 * `'GET'|'HEAD'|'POST'|'PUT'|'DELETE'|'CONNECT'|'OPTIONS'|'TRACE'`
 * - https://datatracker.ietf.org/doc/html/rfc5789#section-2 for `'PATCH`'
 * - `'JSONP'` as a special one for jsonp support.
 */
export type HttpMethod = 'GET'|'HEAD'|'POST'|'PUT'|'DELETE'|'CONNECT'|'OPTIONS'|'TRACE'|'PATCH'|
    'JSONP'|'get'|'head'|'post'|'put'|'delete'|'connect'|'options'|'trace'|'patch'|'jsonp';
