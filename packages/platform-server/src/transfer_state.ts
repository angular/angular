/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {
  APP_ID,
  Provider,
  TransferState,
  ɵstartMeasuring as startMeasuring,
  ɵstopMeasuring as stopMeasuring,
} from '@angular/core';

import {BEFORE_APP_SERIALIZED} from './tokens';

export const TRANSFER_STATE_SERIALIZATION_PROVIDERS: Provider[] = [
  {
    provide: BEFORE_APP_SERIALIZED,
    useFactory: serializeTransferStateFactory,
    deps: [DOCUMENT, APP_ID, TransferState],
    multi: true,
  },
];

/** TODO: Move this to a utils folder and convert to use SafeValues. */
export function createScript(
  doc: Document,
  textContent: string,
  nonce: string | null,
): HTMLScriptElement {
  const script = doc.createElement('script');
  script.textContent = textContent;
  if (nonce) {
    script.setAttribute('nonce', nonce);
  }

  return script;
}

function serializeTransferStateFactory(doc: Document, appId: string, transferStore: TransferState) {
  return () => {
    const measuringLabel = 'serializeTransferStateFactory';
    startMeasuring(measuringLabel);
    // The `.toJSON` here causes the `onSerialize` callbacks to be called.
    // These callbacks can be used to provide the value for a given key.
    const content = transferStore.toJson();

    if (transferStore.isEmpty) {
      // The state is empty, nothing to transfer,
      // avoid creating an extra `<script>` tag in this case.
      return;
    }

    const script = createScript(
      doc,
      content,
      /**
       * `nonce` is not required for 'application/json'
       * See: https://html.spec.whatwg.org/multipage/scripting.html#attr-script-type
       */
      null,
    );
    script.id = appId + '-state';
    script.setAttribute('type', 'application/json');

    // It is intentional that we add the script at the very bottom. Angular CLI script tags for
    // bundles are always `type="module"`. These are deferred by default and cause the transfer
    // transfer data to be queried only after the browser has finished parsing the DOM.
    doc.body.appendChild(script);
    stopMeasuring(measuringLabel);
  };
}
