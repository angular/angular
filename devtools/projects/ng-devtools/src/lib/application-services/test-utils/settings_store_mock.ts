/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Provider, signal} from '@angular/core';
import {SettingsStore} from '../settings_store';

export class SettingsStoreMock {
  private readonly signals = new Map<string, unknown>();

  get(key: string, initialValue: unknown) {
    const value = this.signals.get(key) ?? signal(initialValue);
    this.signals.set(key, value);
    return value;
  }
}

export const SETTINGS_STORE_MOCK: Provider = {
  provide: SettingsStore,
  useClass: SettingsStoreMock,
};
