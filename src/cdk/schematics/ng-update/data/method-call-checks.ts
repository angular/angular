/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from '../target-version';
import {VersionChanges} from '../upgrade-data';

export interface MethodCallUpgradeData {
  className: string;
  method: string;
  invalidArgCounts: {
    count: number,
    message: string
  }[];
}

export const methodCallChecks: VersionChanges<MethodCallUpgradeData> = {
  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/material2/pull/10325',
      changes: [
        {
          className: 'FocusMonitor',
          method: 'monitor',
          invalidArgCounts: [
            {
              count: 3,
              message: 'The "renderer" argument has been removed'
            }
          ]
        }
      ]
    }
  ]
};
