/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import type { ɵFrameworkAgnosticGlobalUtils as GlobalUtils } from '@angular/core';
/** Returns a handle to window.ng APIs (global angular debugging). */
export declare const ngDebugClient: () => Partial<GlobalUtils>;
/** Type guard that checks whether a given debug API is supported within window.ng */
export declare function ngDebugApiIsSupported<T extends Partial<GlobalUtils>, K extends keyof T>(ng: T, api: K): ng is T & Record<K, NonNullable<T[K]>>;
/** Checks whether Dependency Injection debug API is supported within window.ng */
export declare function ngDebugDependencyInjectionApiIsSupported(): boolean;
/** Checks whether Profiler API is supported within window.ng */
export declare function ngDebugProfilerApiIsSupported(): boolean;
/** Checks whether Router API is supported within window.ng */
export declare function ngDebugRoutesApiIsSupported(): boolean;
/** Checks whether Signal Graph API is supported within window.ng */
export declare function ngDebugSignalGraphApiIsSupported(): boolean;
/**
 * Checks if transfer state is available.
 * Transfer state is only relevant when Angular app uses Server-Side Rendering.
 */
export declare function ngDebugTransferStateApiIsSupported(): boolean;
/** Checks whether signal properties inspection API is supported within window.ng */
export declare function ngDebugSignalPropertiesInspectionApiIsSupported(): boolean;
