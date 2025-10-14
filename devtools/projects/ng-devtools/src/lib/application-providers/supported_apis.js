/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken, signal} from '@angular/core';
export const SUPPORTED_APIS = new InjectionToken('SUPPORTED_APIS', {
  providedIn: 'root',
  factory: () => {
    let isSet = false;
    const apis = signal({
      profiler: false,
      dependencyInjection: false,
      routes: false,
      signals: false,
      transferState: false,
      signalPropertiesInspection: false,
    });
    const apisReadonlySignal = apis.asReadonly();
    const readonlyApis = () => apisReadonlySignal();
    readonlyApis.init = (supportedApis) => {
      if (isSet) {
        throw new Error('Supported APIs signal is already set.');
      }
      apis.set(supportedApis);
      isSet = true;
    };
    return readonlyApis;
  },
});
//# sourceMappingURL=supported_apis.js.map
