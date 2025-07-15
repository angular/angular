/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {effect, inject, Injector, signal, WritableSignal} from '@angular/core';
import {ApplicationOperations} from '../application-operations';

export const SETTINGS_STORE_KEY = 'ng-dt-settings';

/** Provides an API for storing and preserving settings values. */
export class SettingsStore {
  private readonly appOperations = inject(ApplicationOperations);
  private readonly injector = inject(Injector);
  private readonly signals = new Map<string, WritableSignal<unknown>>();

  constructor(private data: {[key: string]: unknown}) {}

  /**
   * Create a settings value a provided key, as a writable signal.
   * If the item doesn't exist, a new one will be created.
   * Updates to the signal value are automatically stored in the storage.
   */
  create<T>(config: {key: string; category: string; initialValue: T}): WritableSignal<T> {
    const storeKey = `${config.key}@${config.category}`;
    const existing = this.signals.get(storeKey);
    if (existing) {
      return existing as WritableSignal<T>;
    }

    const initialValue = storeKey in this.data ? (this.data[storeKey] as T) : config.initialValue;
    const value = signal<T>(initialValue);
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
