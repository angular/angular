/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ifEnvSupports} from '../test-util';

describe(
  'queueMicrotask',
  ifEnvSupports('queueMicrotask', function () {
    it('callback in the queueMicrotask should be scheduled as microTask in the zone', (done: DoneFn) => {
      const logs: string[] = [];
      Zone.current
        .fork({
          name: 'queueMicrotask',
          onScheduleTask: (delegate: ZoneDelegate, curr: Zone, target: Zone, task: Task) => {
            logs.push(task.type);
            logs.push(task.source);
            return delegate.scheduleTask(target, task);
          },
        })
        .run(() => {
          queueMicrotask(() => {
            expect(logs).toEqual(['microTask', 'queueMicrotask']);
            expect(Zone.current.name).toEqual('queueMicrotask');
            done();
          });
        });
    });
  }),
);
