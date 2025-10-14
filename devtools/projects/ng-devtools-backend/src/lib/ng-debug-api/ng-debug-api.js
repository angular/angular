/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getAppRoots} from '../component-tree/get-roots';
import {Framework} from '../component-tree/core-enums';
/** Returns a handle to window.ng APIs (global angular debugging). */
export const ngDebugClient = () => {
  if (typeof window.ng === 'undefined') {
    throw new Error(
      'Angular DevTools: Angular debugging APIs are not available. Ensure that your Angular app is in development mode and does not invoke `enableProdMode()`.',
    );
  }
  return window.ng;
};
/** Type guard that checks whether a given debug API is supported within window.ng */
export function ngDebugApiIsSupported(ng, api) {
  return typeof ng[api] === 'function';
}
/** Checks whether Dependency Injection debug API is supported within window.ng */
export function ngDebugDependencyInjectionApiIsSupported() {
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
export function ngDebugProfilerApiIsSupported() {
  const ng = ngDebugClient();
  // Temporary solution. Convert to an eligible API when available.
  // https://github.com/angular/angular/pull/60585#discussion_r2017047132
  // If there is a Wiz application, make Profiler API unavailable.
  const roots = getAppRoots();
  return (
    !!roots.length &&
    !roots.some((el) => {
      const comp = ng.getComponent(el);
      return ng.getDirectiveMetadata?.(comp)?.framework === Framework.Wiz;
    })
  );
}
/** Checks whether Router API is supported within window.ng */
export function ngDebugRoutesApiIsSupported() {
  const ng = ngDebugClient();
  return (
    ngDebugApiIsSupported(ng, 'ɵgetLoadedRoutes') &&
    ngDebugApiIsSupported(ng, 'ɵgetRouterInstance') &&
    ngDebugApiIsSupported(ng, 'ɵnavigateByUrl')
  );
}
/** Checks whether Signal Graph API is supported within window.ng */
export function ngDebugSignalGraphApiIsSupported() {
  const ng = ngDebugClient();
  return ngDebugApiIsSupported(ng, 'ɵgetSignalGraph');
}
/**
 * Checks if transfer state is available.
 * Transfer state is only relevant when Angular app uses Server-Side Rendering.
 */
export function ngDebugTransferStateApiIsSupported() {
  const ng = ngDebugClient();
  return ngDebugApiIsSupported(ng, 'ɵgetTransferState');
}
/** Checks whether signal properties inspection API is supported within window.ng */
export function ngDebugSignalPropertiesInspectionApiIsSupported() {
  const ng = ngDebugClient();
  // If all apps are Angular, make the API available.
  const roots = getAppRoots();
  return (
    !!roots.length &&
    roots.every((el) => {
      const comp = ng.getComponent(el);
      const fw = ng.getDirectiveMetadata?.(comp)?.framework;
      // `framework` might be optional in the case of `AngularDirectiveDebugMetadata`.
      return !fw || fw === Framework.Angular;
    })
  );
}
//# sourceMappingURL=ng-debug-api.js.map
