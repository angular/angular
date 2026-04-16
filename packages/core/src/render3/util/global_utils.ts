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
import {Signal, isSignal} from '../reactivity/api';

import {applyChanges} from './change_detection_utils';
import {getControlFlowBlocks} from './control_flow';
import {
  AngularComponentDebugMetadata,
  AngularDirectiveDebugMetadata,
  DirectiveDebugMetadata,
  Listener,
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
import {DebugSignalGraph, getSignalGraph} from './signal_debug';

import {enableProfiling} from '../debug/chrome_dev_tools_performance';
import {getTransferState} from './transfer_state_utils';
import {InjectionToken} from '../../di/injection_token';
import {Injector} from '../../di/injector';
import {InjectedService, ProviderRecord} from '../debug/injector_profiler';

import {Type} from '../../interface/type';
import {RElement} from '../interfaces/renderer_dom';
import {type Profiler} from '../../../primitives/devtools';
import {ControlFlowBlock} from './control_flow_types';

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
interface NonCoreGlobalUtils {
  ɵgetLoadedRoutes(route: any): any;
  ɵnavigateByUrl(router: any, url: string): any;
  ɵgetRouterInstance(injector: any): any;
}

/**
 * A type of the internal (meaning inside google3) global utils. This definition needs to exist
 * in a place where it can be used by DevTools and also synced into google3 and consumed internally.
 *
 * Since versioning in google3 works differently, we do not have the same constraint as
 * {@link ExternalCoreGlobalUtils}. We can change these definitions more or less as much as we want
 * without fear of breaking applications on older framework versions (note that http://go/build-horizon
 * does technically apply). The trade-off is that external Angular developers cannot use such APIs,
 * as they would be broken whenever the APIs changed.
 *
 * `InternalCoreGlobalUtils` serves as a "beta" channel for new APIs which can be implemented and supported
 * in DevTools. We can then iterate and change these APIs, landing whatever breaking changes necessary,
 * and update DevTools accordingly without actually breaking any users. Once a given function's design
 * fully validated, we can move it to {@link ExternalCoreGlobalUtils} and ship the function externally in
 * Angular. This allows fast iteration on new global utils and only applies Angular's long-lived
 * versioning constraint when we are ready to accept it.
 */
interface InternalCoreGlobalUtils {}

/**
 * The set of external (meaning outside google3) global utils implemented by `@angular/core`.
 * Other packages may provided their own global utilities with their own types. Any functions
 * which have *ever* been in this set exist in long-lived public Angular versions which DevTools
 * needs to support.
 */
export interface ExternalCoreGlobalUtils {
  ɵgetDependenciesFromInjectable<T>(
    injector: Injector,
    token: Type<T> | InjectionToken<T>,
  ): {instance: T; dependencies: Omit<InjectedService, 'injectedIn'>[]} | undefined;
  ɵgetInjectorProviders(injector: Injector): ProviderRecord[];
  ɵgetInjectorResolutionPath(injector: Injector): Injector[];
  ɵgetInjectorMetadata(
    injector: Injector,
  ):
    | {type: 'element'; source: RElement}
    | {type: 'environment'; source: string | null}
    | {type: 'null'; source: null}
    | null;
  ɵsetProfiler(profiler: Profiler | null): () => void;
  ɵgetSignalGraph(injector: Injector): DebugSignalGraph;
  ɵgetControlFlowBlocks(node: Node): ControlFlowBlock[];
  ɵgetTransferState(injector: Injector): Record<string, unknown>;

  getDirectiveMetadata(
    directiveOrComponentInstance: any,
  ): AngularComponentDebugMetadata | AngularDirectiveDebugMetadata | null;
  getComponent<T>(element: Element): T | null;
  getContext<T extends {}>(element: Element): T | null;
  getListeners(element: Element): Listener[];
  getOwningComponent<T>(elementOrDir: Element | {}): T | null;
  getHostElement(componentOrDirective: {}): Element;
  getInjector(elementOrDir: Element | {}): Injector;
  getRootComponents(elementOrDir: Element | {}): {}[];
  getDirectives(node: Node): {}[];
  applyChanges(component: {}): void;
  isSignal(value: unknown): value is Signal<unknown>;
  enableProfiling(): void;
}

const externalCoreGlobalUtils: ExternalCoreGlobalUtils = {
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
  'ɵgetControlFlowBlocks': getControlFlowBlocks,
  'ɵgetTransferState': getTransferState,

  getDirectiveMetadata,
  getComponent,
  getContext,
  getListeners,
  getOwningComponent,
  getHostElement,
  getInjector,
  getRootComponents,
  getDirectives,
  applyChanges,
  isSignal,

  enableProfiling,
};

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

    for (const [methodName, method] of Object.entries(externalCoreGlobalUtils)) {
      publishGlobalUtil(methodName as keyof ExternalCoreGlobalUtils, method);
    }
  }
}

/**
 * Publishes the given function to `window.ng` so that it can be
 * used from the browser console when an application is not in production.
 */
export function publishGlobalUtil<K extends keyof ExternalCoreGlobalUtils>(
  name: K,
  fn: ExternalCoreGlobalUtils[K],
): void {
  publishUtil(name, fn);
}

/**
 * Defines the framework-agnostic `ng` global type, not just the `@angular/core` implementation.
 *
 * ExternalCoreGlobalUtils is specifically the `@angular/core` implementation, so we
 * overwrite some properties to make them more framework-agnostic.
 */
export type FrameworkAgnosticGlobalUtils = Omit<ExternalCoreGlobalUtils, 'getDirectiveMetadata'> & {
  getDirectiveMetadata(directiveOrComponentInstance: any): DirectiveDebugMetadata | null;
} & InternalCoreGlobalUtils &
  NonCoreGlobalUtils;

/**
 * Publishes the given function to `window.ng` from package other than @angular/core
 * So that it can be used from the browser console when an application is not in production.
 */
export function publishNonCoreGlobalUtil<K extends keyof NonCoreGlobalUtils>(
  name: K,
  fn: NonCoreGlobalUtils[K],
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
