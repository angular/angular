/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatOptionModule, MatCommonModule} from '@angular/material/core';
import {MatAutocomplete} from './autocomplete';
import {
  MatAutocompleteTrigger,
} from './autocomplete-trigger';

@NgModule({
  imports: [MatOptionModule, OverlayModule, MatCommonModule, CommonModule],
  exports: [MatAutocomplete, MatOptionModule, MatAutocompleteTrigger, MatCommonModule],
  declarations: [MatAutocomplete, MatAutocompleteTrigger],
})
export class MatAutocompleteModule {}
