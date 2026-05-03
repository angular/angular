/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from '@angular/core';
import {SettingsStore} from './settings_store';
import {ThemePreference} from './theme_types';

// Note: Any changes to the settings items should be accompanied by a migration.
// Check settings_provider.ts
export class Settings {
  private readonly settingsStore = inject(SettingsStore);

  readonly showCommentNodes = this.settingsStore.create({
    key: 'show_comment_nodes',
    category: 'general', // Good candidate for migration to `components`
    initialValue: false,
  });

  readonly timingAPIEnabled = this.settingsStore.create({
    key: 'timing_api_enabled',
    category: 'general', // Good candidate for migration to `profiler`
    initialValue: false,
  });

  readonly theme = this.settingsStore.create<ThemePreference>({
    key: 'theme',
    category: 'general',
    initialValue: 'system',
  });

  readonly activeTab = this.settingsStore.create({
    key: 'activeTab',
    category: 'general',
    initialValue: 'Components',
  });

  readonly showHydrationOverlays = this.settingsStore.create({
    key: 'show_hydration_overlays',
    category: 'components',
    initialValue: false,
  });
}
