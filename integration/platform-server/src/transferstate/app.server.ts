/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ServerModule, ServerTransferStateModule} from '@angular/platform-server';

import {TransferStateModule} from './app';
import {TransferStateComponent} from './transfer-state.component';

@NgModule({
  bootstrap: [TransferStateComponent],
  imports: [TransferStateModule, ServerModule, ServerTransferStateModule],
})
export class TransferStateServerModule {
}
