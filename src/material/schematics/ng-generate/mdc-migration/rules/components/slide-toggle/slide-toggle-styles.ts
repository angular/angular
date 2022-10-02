/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class SlideToggleStylesMigrator extends StyleMigrator {
  component = 'slide-toggle';

  deprecatedPrefixes = ['mat-slide-toggle'];

  mixinChanges = [
    {
      old: 'legacy-slide-toggle-theme',
      new: ['slide-toggle-theme'],
    },
    {
      old: 'legacy-slide-toggle-color',
      new: ['slide-toggle-color'],
    },
    {
      old: 'legacy-slide-toggle-typography',
      new: ['slide-toggle-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [{old: '.mat-slide-toggle', new: '.mat-mdc-slide-toggle'}];
}
