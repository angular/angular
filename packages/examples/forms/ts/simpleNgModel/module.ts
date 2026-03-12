/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {SimpleNgModelComp} from './simple_ng_model_example';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [SimpleNgModelComp],
  bootstrap: [SimpleNgModelComp],
})
export class AppModule {}

export {SimpleNgModelComp as AppComponent};
