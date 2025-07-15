/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideAppInitializer, inject, Provider, EnvironmentProviders} from '@angular/core';
import {SETTINGS_STORE_KEY, SettingsStore} from '../application-services/settings_store';
import {ApplicationOperations} from '../application-operations';
import {Settings} from '../application-services/settings';

const DATA_VERSION_KEY = '__v';
const LATEST_DATA_VERSION = 1;

export function provideSettings(): (Provider | EnvironmentProviders)[] {
  let savedSettings: {[key: string]: unknown};

  return [
    provideAppInitializer(async () => {
      const appOperations = inject(ApplicationOperations);
      const keyedItem = await appOperations.getStorageItems([SETTINGS_STORE_KEY]);
      const data = (keyedItem[SETTINGS_STORE_KEY] ?? {}) as {[key: string]: unknown};
      applyMigrations(data, appOperations);

      savedSettings = data;
    }),
    {
      provide: SettingsStore,
      useFactory: () => new SettingsStore(savedSettings),
    },
    Settings,
  ];
}

function applyMigrations(data: {[key: string]: unknown}, appOperations: ApplicationOperations) {
  const dataVer = data[DATA_VERSION_KEY];
  if (dataVer === LATEST_DATA_VERSION) {
    return;
  }

  // Apply any migration to the data here.

  data[DATA_VERSION_KEY] = LATEST_DATA_VERSION;
  appOperations.setStorageItems({[SETTINGS_STORE_KEY]: data});
}
