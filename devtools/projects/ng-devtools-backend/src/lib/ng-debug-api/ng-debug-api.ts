/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ɵFrameworkAgnosticGlobalUtils as GlobalUtils} from '@angular/core';
import {getRoots} from '../component-tree/get-roots';
import {Framework} from '../component-tree/core-enums';

/** Returns a handle to window.ng APIs (global angular debugging). */
export const ngDebugClient = () => {
  if (typeof (window as any).ng === 'undefined') {
    throw new Error(
      'Angular DevTools: Angular debugging APIs are not available. Ensure that your Angular app is in development mode and does not invoke `enableProdMode()`.',
    );
  }
  return (window as any).ng as Partial<GlobalUtils>;
};

/** Type guard that checks whether a given debug API is supported within window.ng */
export function ngDebugApiIsSupported<T extends Partial<GlobalUtils>, K extends keyof T>(
  ng: T,
  api: K,
): ng is T & Record<K, NonNullable<T[K]>> {
  return typeof ng[api] === 'function';
}

/** Checks whether Dependency Injection debug API is supported within window.ng */
export function ngDebugDependencyInjectionApiIsSupported(): boolean {
  const ng = ngDebugClient();
  if (!ngDebugApiIsSupported(ng, 'getInjector')) {
    return false;
  }
  if (!ngDebugApiIsSupported(ng, 'ɵgetInjectorResolutionPath')) {
    return false;
  }
  if (!ngDebugApiIsSupported(ng, 'ɵgetDependenciesFromInjectable')) {
    return false;
  }
  if (!ngDebugApiIsSupported(ng, 'ɵgetInjectorProviders')) {
    return false;
  }
  if (!ngDebugApiIsSupported(ng, 'ɵgetInjectorMetadata')) {
    return false;
  }

  return true;
}

/** Checks whether Profiler API is supported within window.ng */
export function ngDebugProfilerApiIsSupported(): boolean {
  const ng = ngDebugClient();

  // Temporary solution. Convert to an eligible API when available.
  // https://github.com/angular/angular/pull/60585#discussion_r2017047132
  // If there is a Wiz application, make Profiler API unavailable.
  const roots = getRoots();
  return (
    !!roots.length &&
    !roots.some((el) => {
      const comp = ng.getComponent!(el)!;
      return ng.getDirectiveMetadata?.(comp)?.framework === Framework.Wiz;
    })
  );
}

/** Checks whether Router API is supported within window.ng */
export function ngDebugRoutesApiIsSupported(): boolean {
  const ng = ngDebugClient();

  // Temporary solution. Convert to `ɵgetLoadedRoutes` when available.
  // If there is a Wiz application, make Routes API unavailable.
  const roots = getRoots();
  return (
    !!roots.length &&
    !roots.some((el) => {
      const comp = ng.getComponent!(el)!;
      return ng.getDirectiveMetadata?.(comp)?.framework === Framework.Wiz;
    })
  );
}

/** Checks whether Signal Graph API is supported within window.ng */
export function ngDebugSignalGraphApiIsSupported(): boolean {
  const ng = ngDebugClient();
  return ngDebugApiIsSupported(ng, 'ɵgetSignalGraph');
}

/**
 * Checks if transfer state is available.
 * Transfer state is only relevant when Angular app uses Server-Side Rendering.
 */
export function ngDebugTransferStateApiIsSupported(): boolean {
  const ng = ngDebugClient();
  return ngDebugApiIsSupported(ng, 'ɵgetTransferState');
}
