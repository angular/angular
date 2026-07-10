/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationOperations} from '../application-operations';
import {applyMigrations, DATA_VERSION_KEY} from './settings_provider';

function migrate(data: SettingsData) {
  return applyMigrations(
    data as unknown as {[key: string]: string},
    {
      setStorageItems: () => {},
    } as unknown as ApplicationOperations,
  );
}

describe('applyMigrations', () => {
  it('should successfully migrate from V1 to V2', () => {
    const v1: SettingsDataV1 = {
      [DATA_VERSION_KEY]: 1,
      'show_comment_nodes@general': true,
      'timing_api_enabled@general': true,
      'theme@general': 'dark',
      'activeTab@general': 'Profiler',
      'show_hydration_overlays@components': false,
      'router_graph_enabled@general': true,
      'signal_graph_enabled@general': false,
      'transfer_state_enabled@general': true,
    };

    expect(migrate(v1)).toEqual({
      [DATA_VERSION_KEY]: 2,
      'show_comment_nodes@general': true,
      'performance_track@profiling': true,
      'theme@general': 'dark',
      'active_tab@general': 'Profiler',
      'show_hydration_overlays@components': false,
    } satisfies SettingsDataV2);
  });
});

// We keep all versions because:
// 1. We can validate the correctness of our migrations via unit tests.
// 2. We have a complete historical record of legacy data objects.
type SettingsData = SettingsDataV1 | SettingsDataV2;

interface SettingsDataV2 {
  [DATA_VERSION_KEY]: 2;
  'show_comment_nodes@general': boolean;
  'performance_track@profiling': boolean;
  'theme@general': string;
  'active_tab@general': string;
  'show_hydration_overlays@components': boolean;
}

interface SettingsDataV1 {
  [DATA_VERSION_KEY]: 1;
  'show_comment_nodes@general': boolean;
  'timing_api_enabled@general': boolean;
  'theme@general': string;
  'activeTab@general': string;
  'show_hydration_overlays@components': boolean;
  'router_graph_enabled@general': boolean;
  'signal_graph_enabled@general': boolean;
  'transfer_state_enabled@general': boolean;
}
