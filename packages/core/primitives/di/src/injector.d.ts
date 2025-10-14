/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Constructor, InjectionToken } from './injection_token';
import { NotFound } from './not_found';
export interface Injector {
    retrieve<T>(token: InjectionToken<T>, options?: unknown): T | NotFound;
}
export declare function getCurrentInjector(): Injector | undefined | null;
export declare function setCurrentInjector(injector: Injector | null | undefined): Injector | undefined | null;
export declare function inject<T>(token: InjectionToken<T> | Constructor<T>): T;
