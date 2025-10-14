/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { setProfiler } from '../profiler';
import { isSignal } from '../reactivity/api';
import { applyChanges } from './change_detection_utils';
import { getDeferBlocks } from './defer';
import { DirectiveDebugMetadata, getComponent, getContext, getDirectiveMetadata, getDirectives, getHostElement, getInjector, getListeners, getOwningComponent, getRootComponents } from './discovery_utils';
import { getDependenciesFromInjectable, getInjectorMetadata, getInjectorProviders, getInjectorResolutionPath } from './injector_discovery_utils';
import { getSignalGraph } from './signal_debug';
import { enableProfiling } from '../debug/chrome_dev_tools_performance';
import { getTransferState } from './transfer_state_utils';
/**
 * This file introduces series of globally accessible debug tools
 * to allow for the Angular debugging story to function.
 *
 * To see this in action run the following command:
 *
 *   bazel run //packages/core/test/bundling/todo:devserver
 *
 *  Then load `localhost:5432` and start using the console tools.
 */
/**
 * This value reflects the property on the window where the dev
 * tools are patched (window.ng).
 * */
export declare const GLOBAL_PUBLISH_EXPANDO_KEY = "ng";
export interface ExternalGlobalUtils {
    ɵgetLoadedRoutes(route: any): any;
    ɵnavigateByUrl(router: any, url: string): any;
    ɵgetRouterInstance(injector: any): any;
}
declare const globalUtilsFunctions: {
    /**
     * Warning: functions that start with `ɵ` are considered *INTERNAL* and should not be relied upon
     * in application's code. The contract of those functions might be changed in any release and/or a
     * function can be removed completely.
     */
    ɵgetDependenciesFromInjectable: typeof getDependenciesFromInjectable;
    ɵgetInjectorProviders: typeof getInjectorProviders;
    ɵgetInjectorResolutionPath: typeof getInjectorResolutionPath;
    ɵgetInjectorMetadata: typeof getInjectorMetadata;
    ɵsetProfiler: typeof setProfiler;
    ɵgetSignalGraph: typeof getSignalGraph;
    ɵgetDeferBlocks: typeof getDeferBlocks;
    ɵgetTransferState: typeof getTransferState;
    getDirectiveMetadata: typeof getDirectiveMetadata;
    getComponent: typeof getComponent;
    getContext: typeof getContext;
    getListeners: typeof getListeners;
    getOwningComponent: typeof getOwningComponent;
    getHostElement: typeof getHostElement;
    getInjector: typeof getInjector;
    getRootComponents: typeof getRootComponents;
    getDirectives: typeof getDirectives;
    applyChanges: typeof applyChanges;
    isSignal: typeof isSignal;
    enableProfiling: typeof enableProfiling;
};
type CoreGlobalUtilsFunctions = keyof typeof globalUtilsFunctions;
/**
 * Publishes a collection of default debug tools onto`window.ng`.
 *
 * These functions are available globally when Angular is in development
 * mode and are automatically stripped away from prod mode is on.
 */
export declare function publishDefaultGlobalUtils(): void;
/**
 * Default debug tools available under `window.ng`.
 */
export type GlobalDevModeUtils = {
    [GLOBAL_PUBLISH_EXPANDO_KEY]: typeof globalUtilsFunctions;
};
/**
 * Publishes the given function to `window.ng` so that it can be
 * used from the browser console when an application is not in production.
 */
export declare function publishGlobalUtil<K extends CoreGlobalUtilsFunctions>(name: K, fn: (typeof globalUtilsFunctions)[K]): void;
/**
 * Defines the framework-agnostic `ng` global type, not just the `@angular/core` implementation.
 *
 * `typeof globalUtilsFunctions` is specifically the `@angular/core` implementation, so we
 * overwrite some properties to make them more framework-agnostic. Longer term, we should define
 * the `ng` global type as an interface implemented by `globalUtilsFunctions` rather than a type
 * derived from it.
 */
export type FrameworkAgnosticGlobalUtils = Omit<typeof globalUtilsFunctions, 'getDirectiveMetadata'> & {
    getDirectiveMetadata(directiveOrComponentInstance: any): DirectiveDebugMetadata | null;
} & ExternalGlobalUtils;
/**
 * Publishes the given function to `window.ng` from package other than @angular/core
 * So that it can be used from the browser console when an application is not in production.
 */
export declare function publishExternalGlobalUtil<K extends keyof ExternalGlobalUtils>(name: K, fn: ExternalGlobalUtils[K]): void;
export {};
