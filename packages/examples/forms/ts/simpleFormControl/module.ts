/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {SimpleFormControl} from './simple_form_control_example';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule],
  declarations: [SimpleFormControl],
  bootstrap: [SimpleFormControl]
})
export class AppModule {
}

export {SimpleFormControl as AppComponent};
