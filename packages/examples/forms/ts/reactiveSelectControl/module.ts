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
import {ReactiveSelectComp} from './reactive_select_control_example';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule],
  declarations: [ReactiveSelectComp],
  bootstrap: [ReactiveSelectComp],
})
export class AppModule {}

export {ReactiveSelectComp as AppComponent};
