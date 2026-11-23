/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, signal} from '@angular/core';

export interface AppData {
  fullVersion: string | undefined;
  majorVersion: number;
  minorVersion: number;
  patchVersion: number;
  devMode: boolean;
  hydration: boolean;
  ivy: boolean;
}

interface ConfigurableAppData {
  version: string | undefined;
  devMode: boolean;
  hydration: boolean;
  ivy: boolean;
}

/** A signal derivative containing information about the client app.  */
export interface AppDataSignal {
  /** Returns the app data read-only signal. */
  (): AppData;

  /** Initialize (set once) the app data. */
  init: (appData: ConfigurableAppData) => void;
}

export const APP_DATA = new InjectionToken<AppDataSignal>('APP_DATA', {
  providedIn: 'root',
  factory: () => {
    let isSet = false;
    const data = signal<AppData | undefined>(undefined);
    const dataReadonlySignal = data.asReadonly();

    const readonlyData = () => {
      const data = dataReadonlySignal();
      if (!data) {
        throw new Error('DevTools APP_DATA is not initialized.');
      }
      return data;
    };

    readonlyData.init = (appData: ConfigurableAppData) => {
      if (isSet) {
        throw new Error('App data signal is already set.');
      }
      const versions = appData.version ? appData.version.split('.').map((v) => Number(v)) : [];

      data.set({
        devMode: appData.devMode,
        hydration: appData.hydration,
        ivy: appData.ivy,
        fullVersion: appData.version,
        majorVersion: versions[0] ?? 0,
        minorVersion: versions[1] ?? 0,
        patchVersion: versions[2] ?? 0,
      });
      isSet = true;
    };

    return readonlyData;
  },
});
