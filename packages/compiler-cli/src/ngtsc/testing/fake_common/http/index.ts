/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Fake Http package with partial API coverage. Modify as needed.

import {ResourceRef} from '@angular/core';

export interface HttpResourceRef<T> extends ResourceRef<T> {}

export declare function httpResource(...args: any): HttpResourceRef<any>;
