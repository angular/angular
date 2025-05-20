/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference path="../../../../goog.d.ts" />

import {assertDefined} from '../../util/assert';
import {global} from '../../util/global';
import {setupFrameworkInjectorProfiler} from '../debug/framework_injector_profiler';
import {setProfiler} from '../profiler';
import {isSignal} from '../reactivity/api';

import {applyChanges} from './change_detection_utils';
import {getDeferBlocks} from './defer';
import {
  DirectiveDebugMetadata,
  getComponent,
  getContext,
  getDirectiveMetadata,
  getDirectives,
  getHostElement,
  getInjector,
  getListeners,
  getOwningComponent,
  getRootComponents,
} from './discovery_utils';
import {
  getDependenciesFromInjectable,
  getInjectorMetadata,
  getInjectorProviders,
  getInjectorResolutionPath,
} from './injector_discovery_utils';
import {getSignalGraph} from './signal_debug';

import {enableProfiling} from '../debug/chrome_dev_tools_performance';

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
export const GLOBAL_PUBLISH_EXPANDO_KEY = 'ng';

// Typing for externally published global util functions
// Ideally we should be able to use `NgGlobalPublishUtils` using declaration merging but that doesn't work with API extractor yet.
// Have included the typings to have type safety when working with editors that support it (VSCode).
interface NgGlobalPublishUtils {
  ɵgetLoadedRoutes(route: any): any;
}

const globalUtilsFunctions = {
  /**
   * Warning: functions that start with `ɵ` are considered *INTERNAL* and should not be relied upon
   * in application's code. The contract of those functions might be changed in any release and/or a
   * function can be removed completely.
   */
  'ɵgetDependenciesFromInjectable': getDependenciesFromInjectable,
  'ɵgetInjectorProviders': getInjectorProviders,
  'ɵgetInjectorResolutionPath': getInjectorResolutionPath,
  'ɵgetInjectorMetadata': getInjectorMetadata,
  'ɵsetProfiler': setProfiler,
  'ɵgetSignalGraph': getSignalGraph,
  'ɵgetDeferBlocks': getDeferBlocks,

  'getDirectiveMetadata': getDirectiveMetadata,
  'getComponent': getComponent,
  'getContext': getContext,
  'getListeners': getListeners,
  'getOwningComponent': getOwningComponent,
  'getHostElement': getHostElement,
  'getInjector': getInjector,
  'getRootComponents': getRootComponents,
  'getDirectives': getDirectives,
  'applyChanges': applyChanges,
  'isSignal': isSignal,

  'enableProfiling': enableProfiling,
};
type CoreGlobalUtilsFunctions = keyof typeof globalUtilsFunctions;
type ExternalGlobalUtilsFunctions = keyof NgGlobalPublishUtils;

let _published = false;
/**
 * Publishes a collection of default debug tools onto`window.ng`.
 *
 * These functions are available globally when Angular is in development
 * mode and are automatically stripped away from prod mode is on.
 */
export function publishDefaultGlobalUtils() {
  if (!_published) {
    _published = true;

    if (typeof window !== 'undefined') {
      // Only configure the injector profiler when running in the browser.
      setupFrameworkInjectorProfiler();
    }

    for (const [methodName, method] of Object.entries(globalUtilsFunctions)) {
      publishGlobalUtil(methodName as CoreGlobalUtilsFunctions, method);
    }
  }
}

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
export function publishGlobalUtil<K extends CoreGlobalUtilsFunctions>(
  name: K,
  fn: (typeof globalUtilsFunctions)[K],
): void {
  publishUtil(name, fn);
}

/**
 * Defines the framework-agnostic `ng` global type, not just the `@angular/core` implementation.
 *
 * `typeof globalUtilsFunctions` is specifically the `@angular/core` implementation, so we
 * overwrite some properties to make them more framework-agnostic. Longer term, we should define
 * the `ng` global type as an interface implemented by `globalUtilsFunctions` rather than a type
 * derived from it.
 */
export type FrameworkAgnosticGlobalUtils = Omit<
  typeof globalUtilsFunctions,
  'getDirectiveMetadata'
> & {
  getDirectiveMetadata(directiveOrComponentInstance: any): DirectiveDebugMetadata | null;
};

/**
 * Publishes the given function to `window.ng` from package other than @angular/core
 * So that it can be used from the browser console when an application is not in production.
 */
export function publishExternalGlobalUtil<K extends ExternalGlobalUtilsFunctions>(
  name: K,
  fn: NgGlobalPublishUtils[K],
): void {
  publishUtil(name, fn);
}

function publishUtil(name: string, fn: Function) {
  if (typeof COMPILED === 'undefined' || !COMPILED) {
    // Note: we can't export `ng` when using closure enhanced optimization as:
    // - closure declares globals itself for minified names, which sometimes clobber our `ng` global
    // - we can't declare a closure extern as the namespace `ng` is already used within Google
    //   for typings for AngularJS (via `goog.provide('ng....')`).
    const w = global;
    ngDevMode && assertDefined(fn, 'function not defined');

    w[GLOBAL_PUBLISH_EXPANDO_KEY] ??= {} as any;
    w[GLOBAL_PUBLISH_EXPANDO_KEY][name] = fn;
  }
}
