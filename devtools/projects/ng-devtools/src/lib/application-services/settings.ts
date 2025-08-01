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
}
