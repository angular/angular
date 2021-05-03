/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {InnerComponent} from './#inner/component';
import {AppComponent} from './app.component';
import * as ParsingCases from './parsing-cases';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [
    AppComponent,
    InnerComponent,
    ParsingCases.CounterDirective,
    ParsingCases.HintModel,
    ParsingCases.NumberModel,
    ParsingCases.StringModel,
    ParsingCases.TemplateReference,
    ParsingCases.TestComponent,
    ParsingCases.TestPipe,
    ParsingCases.WithContextDirective,
    ParsingCases.CompoundCustomButtonDirective,
    ParsingCases.EventSelectorDirective,
  ]
})
export class AppModule {
}
