/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MatCommonModule, MatOptionModule} from '@angular/material/core';
import {CommonModule} from '@angular/common';
import {CdkScrollableModule} from '@angular/cdk/scrolling';
import {OverlayModule} from '@angular/cdk/overlay';
import {MatAutocomplete} from './autocomplete';
import {
  MatAutocompleteTrigger,
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER,
} from './autocomplete-trigger';
import {MatAutocompleteOrigin} from './autocomplete-origin';

@NgModule({
  imports: [OverlayModule, MatOptionModule, MatCommonModule, CommonModule],
  exports: [
    CdkScrollableModule,
    MatAutocomplete,
    MatOptionModule,
    MatCommonModule,
    MatAutocompleteTrigger,
    MatAutocompleteOrigin,
  ],
  declarations: [MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteOrigin],
  providers: [MAT_AUTOCOMPLETE_SCROLL_STRATEGY_FACTORY_PROVIDER],
})
export class MatAutocompleteModule {}
