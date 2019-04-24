/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementSelectorUpgradeData, TargetVersion, VersionChanges} from '@angular/cdk/schematics';

export const elementSelectors: VersionChanges<ElementSelectorUpgradeData> = {
  [TargetVersion.V6]: [
    {
      pr: 'https://github.com/angular/material2/pull/10297',
      changes: [
        {
          replace: 'mat-input-container',
          replaceWith: 'mat-form-field'
        }
      ]
    }
  ]
};
