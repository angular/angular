/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class SliderStylesMigrator extends StyleMigrator {
  component = 'slider';

  deprecatedPrefixes = ['mat-slider'];

  mixinChanges = [
    {
      old: 'slider-theme',
      new: ['mdc-slider-theme', 'mdc-slider-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [{old: '.mat-slider', new: '.mat-mdc-slider'}];
}
