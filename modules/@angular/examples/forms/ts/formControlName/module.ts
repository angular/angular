/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {FormControlNameComp} from './form_control_name_example';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule],
  declarations: [FormControlNameComp],
  bootstrap: [FormControlNameComp]
})
export class AppModule {
}
