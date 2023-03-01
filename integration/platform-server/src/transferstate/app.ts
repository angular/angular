/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {TransferStateComponent} from './transfer-state.component';

@NgModule({
  declarations: [TransferStateComponent],
  bootstrap: [TransferStateComponent],
  imports: [
    BrowserModule.withServerTransition({appId: 'ts'}),
  ],
})
export class TransferStateModule {
}
