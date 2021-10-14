/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MethodCallUpgradeData, TargetVersion, VersionChanges} from '@angular/cdk/schematics';

export const methodCallChecks: VersionChanges<MethodCallUpgradeData> = {
  [TargetVersion.V11]: [
    {
      pr: 'https://github.com/angular/components/pull/20499',
      changes: [
        {
          className: 'MatTabNav',
          method: 'updateActiveLink',
          invalidArgCounts: [{count: 1, message: 'The "_element" parameter has been removed'}],
        },
      ],
    },
  ],
};
