/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PlatformRef} from '@angular/core';
import {ClientMessageBrokerFactory, FnArg, PRIMITIVE, UiArguments} from '@angular/platform-webworker';
import {bootstrapWorkerUi} from '@angular/platform-webworker';

const ECHO_CHANNEL = 'ECHO';

export function main() {
  bootstrapWorkerUi('loader.js').then(afterBootstrap);
}

function afterBootstrap(ref: PlatformRef) {
  let brokerFactory: ClientMessageBrokerFactory = ref.injector.get(ClientMessageBrokerFactory);
  var broker = brokerFactory.createMessageBroker(ECHO_CHANNEL, false);

  document.getElementById('send_echo').addEventListener('click', (e) => {
    var val = (<HTMLInputElement>document.getElementById('echo_input')).value;
    // TODO(jteplitz602): Replace default constructors with real constructors
    // once they're in the .d.ts file (#3926)
    var args = new UiArguments('echo');
    args.method = 'echo';
    var fnArg = new FnArg(val, PRIMITIVE);
    fnArg.value = val;
    fnArg.type = PRIMITIVE;
    args.args = [fnArg];

    broker.runOnService(args, PRIMITIVE).then((echo_result: string) => {
      document.getElementById('echo_result').innerHTML =
          `<span class='response'>${echo_result}</span>`;
    });
  });
}
