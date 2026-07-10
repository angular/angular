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

// WARNING: Any changes to the settings items should be accompanied by a migration.
// Check settings_provider.ts
// Please keep in sync the validation tests in settings_provider_spec.ts as well.
export class Settings {
  private readonly settingsStore = inject(SettingsStore);

  readonly showCommentNodes = this.settingsStore.create({
    key: 'show_comment_nodes',
    category: 'general', // Good candidate for migration to `components`
    initialValue: false,
  });

  readonly performanceTrack = this.settingsStore.create({
    key: 'performance_track',
    category: 'profiling',
    initialValue: false,
  });

  readonly theme = this.settingsStore.create<ThemePreference>({
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
