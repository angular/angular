/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AsyncObservablePipeComponent, AsyncPromisePipeComponent} from './async_pipe';
import {DatePipeComponent} from './date_pipe';
import {I18nPluralPipeComponent, I18nSelectPipeComponent} from './i18n_pipe';
import {JsonPipeComponent} from './json_pipe';
import {LowerUpperPipeComponent} from './lowerupper_pipe';
import {CurrencyPipeComponent, NumberPipeComponent, PercentPipeComponent} from './number_pipe';
import {SlicePipeListComponent, SlicePipeStringComponent} from './slice_pipe';

@Component({
  selector: 'example-app',
  template: `
    <h1>Pipe Example</h1>

    <h2><code>async</code></h2>
    <async-promise-pipe></async-promise-pipe>
    <async-observable-pipe></async-observable-pipe>

    <h2><code>date</code></h2>
    <date-pipe></date-pipe>
    
    <h2><code>json</code></h2>
    <json-pipe></json-pipe>

    <h2><code>lower</code>, <code>upper</code></h2>
    <lowerupper-pipe></lowerupper-pipe>

    <h2><code>number</code></h2>
    <number-pipe></number-pipe>
    <percent-pipe></percent-pipe>
    <currency-pipe></currency-pipe>

    <h2><code>slice</code></h2>
    <slice-string-pipe></slice-string-pipe>
    <slice-list-pipe></slice-list-pipe>

    <h2><code>i18n</code></h2>
    <i18n-plural-pipe></i18n-plural-pipe>
    <i18n-select-pipe></i18n-select-pipe>
  `
})
export class ExampleAppComponent {
}

@NgModule({
  declarations: [
    AsyncPromisePipeComponent, AsyncObservablePipeComponent, ExampleAppComponent, JsonPipeComponent,
    DatePipeComponent, LowerUpperPipeComponent, NumberPipeComponent, PercentPipeComponent,
    CurrencyPipeComponent, SlicePipeStringComponent, SlicePipeListComponent,
    I18nPluralPipeComponent, I18nSelectPipeComponent
  ],
  imports: [BrowserModule],
  bootstrap: [ExampleAppComponent]
})
export class AppModule {
}
