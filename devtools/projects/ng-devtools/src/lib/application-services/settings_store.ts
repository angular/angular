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

type KeyCategoryPair<Key extends string, Category extends string> = `${Key}@${Category}`;

type ValueFor<T, Key extends string, Category extends string> =
  KeyCategoryPair<Key, Category> extends keyof T ? T[KeyCategoryPair<Key, Category>] : never;

/** Provides an API for storing and preserving settings values. */
export class SettingsStore<T extends object> {
  private readonly appOperations = inject(ApplicationOperations);
  private readonly injector = inject(Injector);
  private readonly signals = new Map<string, WritableSignal<unknown>>();

  constructor(private data: T) {}

  /**
   * Create a settings value a provided key, as a writable signal.
   * If the item doesn't exist, a new one will be created.
   * Updates to the signal value are automatically stored in the storage.
   */
  create<Key extends string, Category extends string>(config: {
    key: Key;
    category: Category;
    initialValue: ValueFor<T, Key, Category>;
  }): WritableSignal<ValueFor<T, Key, Category>> {
    const data = this.data as {[key: string]: unknown};
    const storeKey = `${config.key}@${config.category}`;
    const existing = this.signals.get(storeKey);
    if (existing) {
      return existing as WritableSignal<ValueFor<T, Key, Category>>;
    }

    const initialValue =
      storeKey in this.data ? (data[storeKey] as ValueFor<T, Key, Category>) : config.initialValue;
    const value = signal(initialValue);
    this.signals.set(storeKey, value);

    effect(
      () => {
        data[storeKey] = value();
        this.appOperations.setStorageItems({[SETTINGS_STORE_KEY]: this.data});
      },
      {injector: this.injector},
    );

    return value;
  }
}
