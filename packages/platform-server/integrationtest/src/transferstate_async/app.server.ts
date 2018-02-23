/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {ServerModule, ServerTransferStateModule} from '@angular/platform-server';

import {TransferStateAsyncModule} from './app';
import {TransferStateAsyncComponent} from './transfer-state.component';

@NgModule({
  bootstrap: [TransferStateAsyncComponent],
  imports: [TransferStateAsyncModule, ServerModule, ServerTransferStateModule],
})
export class TransferStateAsyncServerModule {
}
