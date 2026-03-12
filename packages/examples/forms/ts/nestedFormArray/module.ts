/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {NestedFormArray} from './nested_form_array_example';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule],
  declarations: [NestedFormArray],
  bootstrap: [NestedFormArray],
})
export class AppModule {}

export {NestedFormArray as AppComponent};
