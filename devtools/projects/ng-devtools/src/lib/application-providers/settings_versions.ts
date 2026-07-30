/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ThemePreference} from '../application-services/theme_types';

export const DATA_VERSION_KEY = '__v';

// Note: Any changes to the settings items should be accompanied
// by a migration along with a version bump.
export const LATEST_DATA_VERSION = 2;

// We keep all versions because:
// 1. We can validate the correctness of our migrations via unit tests.
// 2. We have a complete historical record of legacy data objects.
export type SettingsData = SettingsDataV1 | SettingsDataV2;

interface SettingsDataBase {
  [DATA_VERSION_KEY]: number;
}

// Please refer to this doc before updating the settings items:
// https://github.com/angular/angular/blob/main/devtools/docs/settings.md
//
// WARNING: Please do NOT change or delete existing version items (only addition is allowed).
// Create a new one instead.
// Any changes to the settings items should be accompanied by a migration.
// Check `settings_provider.ts`.

export interface SettingsDataV2 extends SettingsDataBase {
  [DATA_VERSION_KEY]: 2;
  'show_comment_nodes@components': boolean;
  'performance_track@profiling': boolean;
  'theme@general': ThemePreference;
  'active_tab@general': string;
  'show_hydration_overlays@components': boolean;
}

export interface SettingsDataV1 extends SettingsDataBase {
  [DATA_VERSION_KEY]: 1;
  'show_comment_nodes@general': boolean;
  'timing_api_enabled@general': boolean;
  'theme@general': ThemePreference;
  'activeTab@general': string;
  'show_hydration_overlays@components': boolean;
  'router_graph_enabled@general': boolean;
  'signal_graph_enabled@general': boolean;
  'transfer_state_enabled@general': boolean;
}
