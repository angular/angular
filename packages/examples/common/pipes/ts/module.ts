/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AsyncObservablePipeComponent, AsyncPromisePipeComponent} from './async_pipe';
import {CurrencyPipeComponent} from './currency_pipe';
import {DatePipeComponent, DeprecatedDatePipeComponent} from './date_pipe';
import {I18nPluralPipeComponent, I18nSelectPipeComponent} from './i18n_pipe';
import {JsonPipeComponent} from './json_pipe';
import {KeyValuePipeComponent} from './keyvalue_pipe';
import {LowerUpperPipeComponent} from './lowerupper_pipe';
import {NumberPipeComponent} from './number_pipe';
import {PercentPipeComponent} from './percent_pipe';
import {SlicePipeListComponent, SlicePipeStringComponent} from './slice_pipe';
import {TitleCasePipeComponent} from './titlecase_pipe';

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

    <h2><code>titlecase</code></h2>
    <titlecase-pipe></titlecase-pipe>

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

    <h2><code>keyvalue</code></h2>
    <keyvalue-pipe></keyvalue-pipe>
  `
})
export class AppComponent {
}

@NgModule({
  declarations: [
    AsyncPromisePipeComponent, AsyncObservablePipeComponent, AppComponent, JsonPipeComponent,
    DatePipeComponent, DeprecatedDatePipeComponent, LowerUpperPipeComponent, TitleCasePipeComponent,
    NumberPipeComponent, PercentPipeComponent, CurrencyPipeComponent, SlicePipeStringComponent,
    SlicePipeListComponent, I18nPluralPipeComponent, I18nSelectPipeComponent, KeyValuePipeComponent
  ],
  imports: [BrowserModule],
})
export class AppModule {
}
