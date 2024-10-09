/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {zoneSymbol} from '../../lib/common/utils';
import {asyncTest, ifEnvSupports} from '../test-util';

function workerSupport() {
  const Worker = (window as any)['Worker'];
  if (!Worker) {
    return false;
  }
  const desc = Object.getOwnPropertyDescriptor(Worker.prototype, 'onmessage');
  if (!desc || !desc.configurable) {
    return false;
  }
  return true;
}

(workerSupport as any).message = 'Worker Support';

xdescribe(
  'Worker API',
  ifEnvSupports(workerSupport, function () {
    it(
      'Worker API should be patched by Zone',
      asyncTest((done: Function) => {
        const zone: Zone = Zone.current.fork({name: 'worker'});
        zone.run(() => {
          const worker = new Worker('/base/angular/packages/zone.js/test/assets/worker.js');
          worker.onmessage = function (evt: MessageEvent) {
            expect(evt.data).toEqual('worker');
            expect(Zone.current.name).toEqual('worker');
            done();
          };
        });
      }, Zone.root),
    );
  }),
);
