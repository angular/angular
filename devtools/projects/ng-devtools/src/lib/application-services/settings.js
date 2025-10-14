/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject} from '@angular/core';
import {SettingsStore} from './settings_store';
// Note: Any changes to the settings items should be accompanied by a migration.
// Check settings_provider.ts
export class Settings {
  constructor() {
    this.settingsStore = inject(SettingsStore);
    this.showCommentNodes = this.settingsStore.create({
      key: 'show_comment_nodes',
      category: 'general',
      initialValue: false,
    });
    this.routerGraphEnabled = this.settingsStore.create({
      key: 'router_graph_enabled',
      category: 'general',
      initialValue: false,
    });
    this.timingAPIEnabled = this.settingsStore.create({
      key: 'timing_api_enabled',
      category: 'general',
      initialValue: false,
    });
    this.signalGraphEnabled = this.settingsStore.create({
      key: 'signal_graph_enabled',
      category: 'general',
      initialValue: false,
    });
    this.transferStateEnabled = this.settingsStore.create({
      key: 'transfer_state_enabled',
      category: 'general',
      initialValue: false,
    });
    this.theme = this.settingsStore.create({
      key: 'theme',
      category: 'general',
      initialValue: 'system',
    });
    this.activeTab = this.settingsStore.create({
      key: 'activeTab',
      category: 'general',
      initialValue: 'Components',
    });
  }
}
//# sourceMappingURL=settings.js.map
