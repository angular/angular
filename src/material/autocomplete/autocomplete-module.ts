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
import {MatCommonModule} from '@angular/material/core';
import {MatLegacyOptionModule} from '@angular/material/legacy-core';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {MatAutocomplete} from './autocomplete';
import {
  MatAutocompleteTrigger,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
} from './autocomplete-trigger';
import {MatAutocompleteOrigin} from './autocomplete-origin';

@NgModule({
  imports: [OverlayModule, MatLegacyOptionModule, MatCommonModule, CommonModule],
  exports: [
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatAutocompleteOrigin,
    CdkScrollableModule,
    MatLegacyOptionModule,
    MatCommonModule,
  ],
  declarations: [MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteOrigin],
  providers: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatAutocompleteModule {}
