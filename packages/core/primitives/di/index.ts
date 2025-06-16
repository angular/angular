/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {setCurrentInjector, getCurrentInjector, inject} from './src/injector';
export type {Injector} from './src/injector';
export {NOT_FOUND, NotFoundError, isNotFound} from './src/not_found';
export type {NotFound} from './src/not_found';
export type {InjectionToken, ɵɵInjectableDeclaration} from './src/injection_token';
export {registerInjectable} from './src/injection_token';
