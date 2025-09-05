/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Provider, signal, WritableSignal} from '@angular/core';
import {Settings} from '../settings';
import {SettingsStore} from '../settings_store';
import {ThemePreference} from '../theme_types';

export class SettingsMock extends Settings {
  routerGraphEnabled = signal(false);
  showCommentNodes = signal(false);
  signalGraphEnabled = signal(false);
  timingAPIEnabled = signal(false);
  theme = signal<ThemePreference>('system');
  activeTab = signal('Components');
}

export const SETTINGS_MOCK: Provider[] = [
  {
    provide: SettingsStore,
    useClass: class {
      create(config: unknown): WritableSignal<unknown> {
        return signal<unknown>(null);
      }
    },
  },
  {
    provide: Settings,
    useClass: SettingsMock,
  },
];
