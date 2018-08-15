/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {APP_ID, NgModule} from '@angular/core';
import {TransferState, ɵescapeHtml as escapeHtml} from '@angular/platform-browser';

import {BEFORE_APP_SERIALIZED} from './tokens';

export function serializeTransferStateFactory(
    doc: Document, appId: string, transferStore: TransferState) {
  return () => {
    const script = doc.createElement('script');
    script.id = appId + '-state';
    script.setAttribute('type', 'application/json');
    script.textContent = escapeHtml(transferStore.toJson());
    doc.body.appendChild(script);
  };
}

/**
 * NgModule to install on the server side while using the `TransferState` to transfer state from
 * server to client.
 *
 * @publicApi
 */
@NgModule({
  providers: [
    TransferState, {
      provide: BEFORE_APP_SERIALIZED,
      useFactory: serializeTransferStateFactory,
      deps: [DOCUMENT, APP_ID, TransferState],
      multi: true,
    }
  ]
})
export class ServerTransferStateModule {
}
