/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from '@angular/core';
import {SettingsStore} from './settings_store';
import {SettingsDataV2} from '../application-providers/settings_versions';

// If you need to update an item, please refer to `settings_versions.ts` and this doc:
// https://github.com/angular/angular/blob/main/devtools/docs/settings.md
export class Settings {
  private readonly settingsStore = inject(SettingsStore<SettingsDataV2>);

  readonly showCommentNodes = this.settingsStore.create({
    key: 'show_comment_nodes',
    category: 'components',
    initialValue: false,
  });

  readonly performanceTrack = this.settingsStore.create({
    key: 'performance_track',
    category: 'profiling',
    initialValue: false,
  });

  readonly theme = this.settingsStore.create({
    key: 'theme',
    category: 'general',
    initialValue: 'system',
  });

  readonly activeTab = this.settingsStore.create({
    key: 'active_tab',
    category: 'general',
    initialValue: 'Components',
  });

  readonly showHydrationOverlays = this.settingsStore.create({
    key: 'show_hydration_overlays',
    category: 'components',
    initialValue: false,
  });
}
