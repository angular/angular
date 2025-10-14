/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { Injector } from './injector';
export declare class NullInjector implements Injector {
    get(token: any, notFoundValue?: any): any;
}
