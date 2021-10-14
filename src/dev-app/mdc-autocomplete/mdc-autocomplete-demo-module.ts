/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material-experimental/mdc-autocomplete';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {RouterModule} from '@angular/router';
import {MdcAutocompleteDemo} from './mdc-autocomplete-demo';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterModule.forChild([{path: '', component: MdcAutocompleteDemo}]),
  ],
  declarations: [MdcAutocompleteDemo],
})
export class MdcAutocompleteDemoModule {}
