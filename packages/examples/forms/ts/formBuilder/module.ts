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
import {DisabledFormControlComponent, FormBuilderComp} from './form_builder_example';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule],
  declarations: [FormBuilderComp, DisabledFormControlComponent],
  bootstrap: [FormBuilderComp]
})
export class AppModule {
}

export {FormBuilderComp as AppComponent};
