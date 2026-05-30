/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Fake Http package with partial API coverage. Modify as needed.

export type HttpResourceRef<T> = any;

export declare function httpResource(...args: any): HttpResourceRef<any>;
