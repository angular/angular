/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {effect, inject, Injector, signal} from '@angular/core';
import {ApplicationOperations} from '../application-operations';
export const SETTINGS_STORE_KEY = 'ng-dt-settings';
/** Provides an API for storing and preserving settings values. */
export class SettingsStore {
  constructor(data) {
    this.data = data;
    this.appOperations = inject(ApplicationOperations);
    this.injector = inject(Injector);
    this.signals = new Map();
  }
  /**
   * Create a settings value a provided key, as a writable signal.
   * If the item doesn't exist, a new one will be created.
   * Updates to the signal value are automatically stored in the storage.
   */
  create(config) {
    const storeKey = `${config.key}@${config.category}`;
    const existing = this.signals.get(storeKey);
    if (existing) {
      return existing;
    }
    const initialValue = storeKey in this.data ? this.data[storeKey] : config.initialValue;
    const value = signal(initialValue);
    this.signals.set(storeKey, value);
    effect(
      () => {
        this.data[storeKey] = value();
        this.appOperations.setStorageItems({[SETTINGS_STORE_KEY]: this.data});
      },
      {injector: this.injector},
    );
    return value;
  }
}
//# sourceMappingURL=settings_store.js.map
