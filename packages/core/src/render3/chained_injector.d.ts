/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di/injector';
import { InjectOptions } from '../di/interface/injector';
import { ProviderToken } from '../di/provider_token';
/**
 * Injector that looks up a value using a specific injector, before falling back to the module
 * injector. Used primarily when creating components or embedded views dynamically.
 */
export declare class ChainedInjector implements Injector {
    injector: Injector;
    parentInjector: Injector;
    constructor(injector: Injector, parentInjector: Injector);
    get<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions): T;
}
