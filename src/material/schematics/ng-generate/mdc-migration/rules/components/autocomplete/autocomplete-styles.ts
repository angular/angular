/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class AutocompleteStylesMigrator extends StyleMigrator {
  component = 'autocomplete';

  deprecatedPrefixes = ['mat-autocomplete'];

  mixinChanges = [
    {
      old: 'legacy-autocomplete-theme',
      new: ['autocomplete-theme', 'autocomplete-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [{old: '.mat-autocomplete', new: '.mat-mdc-autocomplete'}];
}
