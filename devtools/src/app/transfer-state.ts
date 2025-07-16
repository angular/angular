/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient} from '@angular/common/http';
import {APP_ID, DOCUMENT, inject, makeStateKey, TransferState} from '@angular/core';
import {firstValueFrom} from 'rxjs';

/**
 * This function serializes the transfer state into the DOM.
 */
export async function serializeTransferState(): Promise<void> {
  const doc = inject(DOCUMENT);
  const appId = inject(APP_ID);
  const transferState = inject(TransferState);
  const httpClient = inject(HttpClient);

  // Object
  const Objkey = makeStateKey<any>('obj');
  transferState.set(Objkey, {
    appName: 'DevTools',
    appVersion: '0.0.1',
    appDescription: 'Angular DevTools',
  });

  // Array
  const arraykey = makeStateKey<any>('arr');
  transferState.set(arraykey, [1, 2, 3, 4, 5]);

  // Serialized of the TransferState into the DOM.
  const content = transferState.toJson();
  const script = doc.createElement('script');
  script.textContent = content;

  script.id = appId + '-state';
  script.setAttribute('type', 'application/json');

  doc.body.appendChild(script);
}
