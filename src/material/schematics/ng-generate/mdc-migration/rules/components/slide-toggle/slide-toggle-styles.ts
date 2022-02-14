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

  deprecatedPrefix = 'mat-slide-toggle';

  mixinChanges = [
    {
      old: 'slide-toggle-theme',
      new: ['mdc-slide-toggle-theme', 'mdc-slide-toggle-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [{old: '.mat-slide-toggle', new: '.mat-mdc-slide-toggle'}];
}
