/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TargetVersion} from '../../index';
import {VersionChanges} from '../transform-change-data';

export interface MaterialElementSelectorData {
  /** The element name to replace. */
  replace: string;
  /** The new name for the element. */
  replaceWith: string;
}

export const elementSelectors: VersionChanges<MaterialElementSelectorData> = {
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
