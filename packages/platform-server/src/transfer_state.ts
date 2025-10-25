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
  inject,
  InjectionToken,
  Injector,
  Provider,
  TransferState,
  ɵstartMeasuring as startMeasuring,
  ɵstopMeasuring as stopMeasuring,
} from '@angular/core';

import {BEFORE_APP_SERIALIZED} from './tokens';

/** Tracks whether the server-side application transfer state has already been serialized. */
const TRANSFER_STATE_STATUS = new InjectionToken<{serialized: boolean}>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'TRANSFER_STATE_STATUS' : '',
  {
    providedIn: 'root',
    factory: () => ({serialized: false}),
  },
);

export const TRANSFER_STATE_SERIALIZATION_PROVIDERS: Provider[] = [
  {
    provide: BEFORE_APP_SERIALIZED,
    useFactory: serializeTransferStateFactory,
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

function warnIfStateTransferHappened(injector: Injector): void {
  const transferStateStatus = injector.get(TRANSFER_STATE_STATUS);

  if (transferStateStatus.serialized) {
    console.warn(
      `Angular detected an incompatible configuration, which causes duplicate serialization of the server-side application state.\n\n` +
        `This can happen if the server providers have been provided more than once using different mechanisms. For example:\n\n` +
        `  imports: [ServerModule], // Registers server providers\n` +
        `  providers: [provideServerRendering()] // Also registers server providers\n\n` +
        `To fix this, ensure that the \`provideServerRendering()\` function is the only provider used and remove the other(s).`,
    );
  }

  transferStateStatus.serialized = true;
}

function serializeTransferStateFactory() {
  const doc = inject(DOCUMENT);
  const appId = inject(APP_ID);
  const transferStore = inject(TransferState);
  const injector = inject(Injector);

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

    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      warnIfStateTransferHappened(injector);
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
    // bundles are always `type="module"`. These are deferred by default and cause the
    // transfer data to be queried only after the browser has finished parsing the DOM.
    doc.body.appendChild(script);
    stopMeasuring(measuringLabel);
  };
}
