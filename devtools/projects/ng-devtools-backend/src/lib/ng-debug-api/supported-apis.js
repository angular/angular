/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ngDebugDependencyInjectionApiIsSupported,
  ngDebugProfilerApiIsSupported,
  ngDebugRoutesApiIsSupported,
  ngDebugSignalGraphApiIsSupported,
  ngDebugSignalPropertiesInspectionApiIsSupported,
  ngDebugTransferStateApiIsSupported,
} from './ng-debug-api';
/**
 * Returns an object with all available Devtools APIs.
 *
 * @returns `SupportedApis`
 */
export function getSupportedApis() {
  const profiler = ngDebugProfilerApiIsSupported();
  const dependencyInjection = ngDebugDependencyInjectionApiIsSupported();
  const routes = ngDebugRoutesApiIsSupported();
  const signals = ngDebugSignalGraphApiIsSupported();
  const transferState = ngDebugTransferStateApiIsSupported();
  const signalPropertiesInspection = ngDebugSignalPropertiesInspectionApiIsSupported();
  return {
    profiler,
    dependencyInjection,
    routes,
    signals,
    transferState,
    signalPropertiesInspection,
  };
}
//# sourceMappingURL=supported-apis.js.map
