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

export function provideSettings(): (Provider | EnvironmentProviders)[] {
  let savedSettings: {[key: string]: unknown};

  return [
    provideAppInitializer(async () => {
      const appOperations = inject(ApplicationOperations);
      const keyedItem = await appOperations.getStorageItems([SETTINGS_STORE_KEY]);
      savedSettings = (keyedItem[SETTINGS_STORE_KEY] ?? {}) as {[key: string]: unknown};
    }),
    {
      provide: SettingsStore,
      useFactory: () => new SettingsStore(savedSettings),
    },
    Settings,
  ];
}
