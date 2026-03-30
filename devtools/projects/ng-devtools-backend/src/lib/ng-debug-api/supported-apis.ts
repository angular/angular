/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SupportedApis} from '../../../../protocol';
import {
  ngDebugDependencyInjectionApiIsSupported,
  ngDebugProfilerApiIsSupported,
  ngDebugRoutesApiIsSupported,
  ngDebugSignalGraphApiIsSupported,
  ngDebugSignalPropertiesInspectionApiIsSupported,
  ngDebugSignalTransitiveDepsInspectionApiIsSupported,
  ngDebugTransferStateApiIsSupported,
} from './ng-debug-api';

/**
 * Returns an object with all available Devtools APIs.
 *
 * @returns `SupportedApis`
 */
export function getSupportedApis(): SupportedApis {
  const profiler = ngDebugProfilerApiIsSupported();
  const dependencyInjection = ngDebugDependencyInjectionApiIsSupported();
  const routes = ngDebugRoutesApiIsSupported();
  const signals = ngDebugSignalGraphApiIsSupported();
  const transferState = ngDebugTransferStateApiIsSupported();
  const signalPropertiesInspection = ngDebugSignalPropertiesInspectionApiIsSupported();
  const transitiveSignalDepsInspection = ngDebugSignalTransitiveDepsInspectionApiIsSupported();

  return {
    profiler,
    dependencyInjection,
    routes,
    signals,
    transferState,
    signalPropertiesInspection,
    transitiveSignalDepsInspection,
  };
}
