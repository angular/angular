/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from '../../update-tool/target-version';
import {VersionChanges} from '../../update-tool/version-changes';

export interface MethodCallUpgradeData {
  className: string;
  method: string;
  invalidArgCounts: {count: number, message: string}[];
}

export const methodCallChecks: VersionChanges<MethodCallUpgradeData> = {
  [TargetVersion.V9]: [{
    pr: 'https://github.com/angular/components/pull/17084',
    changes: [{
      className: 'DropListRef',
      method: 'drop',
      invalidArgCounts: [{count: 4, message: 'The "distance" parameter is required'}]
    }]
  }],
  [TargetVersion.V8]: [],
  [TargetVersion.V7]: [],
  [TargetVersion.V6]: [{
    pr: 'https://github.com/angular/components/pull/10325',
    changes: [{
      className: 'FocusMonitor',
      method: 'monitor',
      invalidArgCounts: [{count: 3, message: 'The "renderer" argument has been removed'}]
    }]
  }]
};
