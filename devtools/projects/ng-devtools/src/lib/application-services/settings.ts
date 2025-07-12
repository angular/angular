/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from '@angular/core';
import {SettingsStore} from './settings_store';
import {Theme} from './theme_types';
import {WINDOW} from '../application-providers/window_provider';

export class Settings {
  private readonly settingsStore = inject(SettingsStore);
  private readonly win = inject(WINDOW);

  private get prefersDarkMode(): boolean {
    return this.win.matchMedia && this.win.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  readonly showCommentNodes = this.settingsStore.create({
    key: 'show_comment_nodes',
    category: 'general',
    initialValue: false,
  });

  readonly routerGraphEnabled = this.settingsStore.create({
    key: 'router_graph_enabled',
    category: 'general',
    initialValue: false,
  });

  readonly timingAPIEnabled = this.settingsStore.create({
    key: 'timing_api_enabled',
    category: 'general',
    initialValue: false,
  });

  readonly signalGraphEnabled = this.settingsStore.create({
    key: 'signal_graph_enabled',
    category: 'general',
    initialValue: false,
  });

  readonly currentTheme = this.settingsStore.create<Theme>({
    key: 'theme',
    category: 'general',
    initialValue: this.prefersDarkMode ? 'dark-theme' : 'light-theme',
  });
}
