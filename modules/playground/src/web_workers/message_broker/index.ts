/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformRef} from '@angular/core';
import {ClientMessageBrokerFactory, FnArg, SerializerTypes, UiArguments, bootstrapWorkerUi} from '@angular/platform-webworker';

const ECHO_CHANNEL = 'ECHO';

export function main() {
  bootstrapWorkerUi('loader.js').then(afterBootstrap);
}

function afterBootstrap(ref: PlatformRef) {
  const brokerFactory: ClientMessageBrokerFactory = ref.injector.get(ClientMessageBrokerFactory);
  const broker = brokerFactory.createMessageBroker(ECHO_CHANNEL, false);

  document.getElementById('send_echo').addEventListener('click', (e) => {
    const val = (<HTMLInputElement>document.getElementById('echo_input')).value;
    // TODO(jteplitz602): Replace default constructors with real constructors
    // once they're in the .d.ts file (#3926)
    const fnArg = new FnArg(val);
    const args = new UiArguments('echo', [fnArg]);

    broker.runOnService(args, SerializerTypes.PRIMITIVE).then((echo_result: string) => {
      document.getElementById('echo_result').innerHTML =
          `<span class='response'>${echo_result}</span>`;
    });
  });
}
