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

export const DATA_VERSION_KEY = '__v';

// Note: Any changes to the settings items should be accompanied
// by a migration along with a version bump.
const LATEST_DATA_VERSION = 2;

export function provideSettings(): (Provider | EnvironmentProviders)[] {
  let savedSettings: {[key: string]: unknown};

  return [
    provideAppInitializer(async () => {
      const appOperations = inject(ApplicationOperations);
      const keyedItem = await appOperations.getStorageItems([SETTINGS_STORE_KEY]);
      const data = (keyedItem[SETTINGS_STORE_KEY] ?? {}) as {[key: string]: unknown};
      savedSettings = applyMigrations(data, appOperations);
    }),
    {
      provide: SettingsStore,
      useFactory: () => new SettingsStore(savedSettings),
    },
    Settings,
  ];
}

/**
 * Migrates the provided data to the latest data format, if needed.
 * Returns a new object with the migrated data.
 *
 * @param data Non-migrated data
 * @param appOperations
 * @returns New migrated data object
 */
export function applyMigrations(
  data: {[key: string]: unknown},
  appOperations: ApplicationOperations,
): {[key: string]: unknown} {
  const dataCopy = structuredClone(data);
  const dataVer = dataCopy[DATA_VERSION_KEY];

  if (dataVer === LATEST_DATA_VERSION) {
    return dataCopy;
  }

  /**
   * Any changes to the data format must be handled in this part of the code
   * by comparing the data versions and applying the respective changes to
   * that data. All migrations should be kept and applied in chronological order
   * starting from oldest to latest/newest. The exact approach how this is performed
   * is up to the developer.
   *
   * Example:
   *
   * Data v1 (initial format; provided data): { 'theme': 'd' };
   * Data v2 (older format): { 'theme-option': 'dark' };
   * Data v3 (latest format): { 'theme-setting': 'dark-theme' };
   *
   * // Migrate data from v1 to v2
   * if (dataVer === 1) {
   *   const themeMap = {
   *     'd': 'dark',
   *     'l': 'light',
   *   };
   *   dataCopy['theme-option'] = themeMap[dataCopy['theme']];
   *   delete dataCopy['theme'];
   *   dataCopy[DATA_VERSION_KEY] = 2;
   * }
   *
   * // Migrate data from v2 to v3 (latest)
   * if (dataVer === 2) {
   *   const themeMap = {
   *     'dark': 'dark-theme',
   *     'light': 'light-theme',
   *   };
   *   dataCopy['theme-setting'] = themeMap[dataCopy['theme-option']];
   *   delete dataCopy['theme-option']
   *   dataCopy[DATA_VERSION_KEY] = 3;
   * }
   *
   */

  // APPLY ANY MIGRATIONS TO THE DATA HERE.

  // V1 -> V2 migration
  if (dataVer === 1) {
    const newData = dataCopy;
    // Convert `timing_api_enabled` (cat: `general`) key to `performance_track` (cat: `profiling`).
    newData['performance_track@profiling'] = dataCopy['timing_api_enabled@general'];
    delete dataCopy['timing_api_enabled@general'];

    // Convert `activeTab` (cat: `general`) key to `active_tab` (cat: `general`).
    dataCopy['active_tab@general'] = dataCopy['activeTab@general'];
    delete dataCopy['activeTab@general'];

    // Flag no logner needed. The feature has been promoted to stable.
    delete dataCopy['router_graph_enabled@general'];

    // Flag no logner needed. The feature has been promoted to stable.
    delete dataCopy['signal_graph_enabled@general'];

    // Flag no logner needed. The feature has been promoted to stable.
    delete dataCopy['transfer_state_enabled@general'];

    // Update the data instance version to V2.
    dataCopy[DATA_VERSION_KEY] = 2;
  }

  dataCopy[DATA_VERSION_KEY] = LATEST_DATA_VERSION;
  appOperations.setStorageItems({[SETTINGS_STORE_KEY]: dataCopy});

  return dataCopy;
}
