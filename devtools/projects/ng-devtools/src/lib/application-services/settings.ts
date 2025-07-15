/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from '@angular/core';
import {SettingsStore} from './settings_store';

export class Settings {
  private readonly settingsStore = inject(SettingsStore);

  readonly dummy = this.settingsStore.create({
    key: 'dummy',
    category: 'general',
    initialValue: true,
  });
}
