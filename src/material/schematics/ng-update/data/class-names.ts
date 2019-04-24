/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameUpgradeData, TargetVersion, VersionChanges} from '@angular/cdk/schematics';

export const classNames: VersionChanges<ClassNameUpgradeData> = {
  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/material2/pull/10291',
      changes: [
        {
          replace: 'FloatPlaceholderType',
          replaceWith: 'FloatLabelType'
        },
        {
          replace: 'MAT_PLACEHOLDER_GLOBAL_OPTIONS',
          replaceWith: 'MAT_LABEL_GLOBAL_OPTIONS'
        },
        {
          replace: 'PlaceholderOptions',
          replaceWith: 'LabelOptions'
        }
      ]
    },
  ]
};
