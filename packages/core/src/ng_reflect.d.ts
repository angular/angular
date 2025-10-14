/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentProviders, InjectionToken } from './di/index';
/** Defines the default value of the `NG_REFLECT_ATTRS_FLAG` flag. */
export declare const NG_REFLECT_ATTRS_FLAG_DEFAULT = false;
/**
 * Defines an internal flag that indicates whether the runtime code should be
 * producing `ng-reflect-*` attributes.
 */
export declare const NG_REFLECT_ATTRS_FLAG: InjectionToken<boolean>;
/**
 * Enables the logic to produce `ng-reflect-*` attributes on elements with bindings.
 *
 * Note: this is a dev-mode only setting and it will have no effect in production mode.
 * In production mode, the `ng-reflect-*` attributes are *never* produced by Angular.
 *
 * Important: using and relying on the `ng-reflect-*` attributes is not recommended,
 * they are deprecated and only present for backwards compatibility. Angular will stop
 * producing them in one of the future versions.
 *
 * @publicApi
 */
export declare function provideNgReflectAttributes(): EnvironmentProviders;
export declare function normalizeDebugBindingName(name: string): string;
export declare function normalizeDebugBindingValue(value: any): string;
