/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, Component, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

import {TriggerComponent} from './trigger';

@Component({
  selector: 'dep',
  template: 'dep',
})
export class DepComponent {
}

@NgModule({
  declarations: [DepComponent, TriggerComponent],
  imports: [BrowserModule],
  bootstrap: [TriggerComponent],
})
export class Module {
}

(window as any).appReady = platformBrowser().bootstrapModule(Module, {ngZone: 'noop'});
