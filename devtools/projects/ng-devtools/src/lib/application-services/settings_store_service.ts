/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  effect,
  EnvironmentInjector,
  inject,
  Injectable,
  runInInjectionContext,
  signal,
  WritableSignal,
} from '@angular/core';
import {ApplicationOperations} from '../application-operations';

const SETTINGS_STORE_KEY = 'ng-dt-settings';

@Injectable()
/** Provides an API for storing and preserving settings values. */
export class SettingsStoreService {
  private readonly appOperations = inject(ApplicationOperations);
  private readonly envInjector = inject(EnvironmentInjector);
  private data: {[key: string]: unknown} = {};

  private resolveValuesLoaded!: () => void;
  private readonly valuesLoaded = new Promise<void>((res) => {
    this.resolveValuesLoaded = res;
  });

  constructor() {
    this.loadSettingsValues();
  }

  /**
   * Get a settings value from the storage by a provided key, as a writable signal.
   * If the item doesn't exist, a new one will be created.
   * Updates to the signal value are automatically stored in the storage.
   *
   * @param key Unique key (Prefer format: `<name_of_value/option>@<location>`)
   * @param initialValue Initial value of the writable signal
   * @returns A writable signal that represents the value.
   */
  get<T>(key: string, initialValue: T): WritableSignal<T> {
    // Create the signal with its initial value and return it synchronously.
    const value = signal<T>(initialValue);

    this.valuesLoaded.then(() => {
      if (key in this.data) {
        // When the data is loaded and if the key exists, update the signal value.
        value.set(this.data[key] as T);
      }

      runInInjectionContext(this.envInjector, () => {
        effect(() => {
          // Update the storage when the signal is updated.
          this.data[key] = value();
          this.appOperations.setStorageItems({[SETTINGS_STORE_KEY]: this.data});
        });
      });
    });

    return value;
  }

  private async loadSettingsValues() {
    const storageItem = (await this.appOperations.getStorageItems([SETTINGS_STORE_KEY])) ?? {};
    this.data = (storageItem[SETTINGS_STORE_KEY] ?? {}) as {[key: string]: unknown};
    this.resolveValuesLoaded();
  }
}
