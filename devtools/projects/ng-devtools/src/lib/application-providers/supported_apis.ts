/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, signal} from '@angular/core';
import {SupportedApis} from '../../../../protocol';

/** A signal derivative containing all DevTools supported APIs.  */
export interface SupportedApisSignal {
  /** Returns the supported APIs read-only signal. */
  (): SupportedApis;

  /** Initialize (set once) the supported APIs. */
  init: (supportedApis: SupportedApis) => void;
}

export const SUPPORTED_APIS = new InjectionToken<SupportedApisSignal>('SUPPORTED_APIS', {
  providedIn: 'root',
  factory: () => {
    let isSet = false;
    const apis = signal<SupportedApis>({
      profiler: false,
      dependencyInjection: false,
      routes: false,
      signals: false,
      transferState: false,
      signalPropertiesInspection: false,
    });

    const readonlyApis = () => apis.asReadonly()();
    readonlyApis.init = (supportedApis: SupportedApis) => {
      if (isSet) {
        throw new Error('Supported APIs signal is already set.');
      }
      apis.set(supportedApis);
      isSet = true;
    };

    return readonlyApis;
  },
});
