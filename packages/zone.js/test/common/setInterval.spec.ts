/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';
import {isNode, zoneSymbol} from '../../lib/common/utils';
declare const global: any;
const wtfMock = global.wtfMock;

describe('setInterval', function() {
  it('should work with setInterval', function(done) {
    let cancelId: any;
    const testZone = Zone.current.fork((Zone as any)['wtfZoneSpec']).fork({name: 'TestZone'});
    testZone.run(() => {
      let intervalCount = 0;
      let timeoutRunning = false;
      const intervalFn = function() {
        intervalCount++;
        expect(Zone.current.name).toEqual(('TestZone'));
        if (timeoutRunning) {
          return;
        }
        timeoutRunning = true;
        global[zoneSymbol('setTimeout')](function() {
          const intervalUnitLog = [
            '> Zone:invokeTask:setInterval("<root>::ProxyZone::WTF::TestZone")',
            '< Zone:invokeTask:setInterval'
          ];
          let intervalLog: string[] = [];
          for (let i = 0; i < intervalCount; i++) {
            intervalLog = intervalLog.concat(intervalUnitLog);
          }
          expect(wtfMock.log[0]).toEqual('# Zone:fork("<root>::ProxyZone::WTF", "TestZone")');
          expect(wtfMock.log[1])
              .toEqual('> Zone:invoke:unit-test("<root>::ProxyZone::WTF::TestZone")');
          expect(wtfMock.log[2])
              .toContain(
                  '# Zone:schedule:macroTask:setInterval("<root>::ProxyZone::WTF::TestZone"');
          expect(wtfMock.log[3]).toEqual('< Zone:invoke:unit-test');
          expect(wtfMock.log.splice(4)).toEqual(intervalLog);
          clearInterval(cancelId);
          done();
        });
      };
      expect(Zone.current.name).toEqual(('TestZone'));
      cancelId = setInterval(intervalFn, 10);
      if (isNode) {
        expect(typeof cancelId.ref).toEqual(('function'));
        expect(typeof cancelId.unref).toEqual(('function'));
      }

      expect(wtfMock.log[0]).toEqual('# Zone:fork("<root>::ProxyZone::WTF", "TestZone")');
      expect(wtfMock.log[1]).toEqual('> Zone:invoke:unit-test("<root>::ProxyZone::WTF::TestZone")');
      expect(wtfMock.log[2])
          .toContain('# Zone:schedule:macroTask:setInterval("<root>::ProxyZone::WTF::TestZone"');
    }, null, undefined, 'unit-test');
  });

  it('should not cancel the task after invoke the setInterval callback', (done) => {
    const logs: HasTaskState[] = [];
    const zone = Zone.current.fork({
      name: 'interval',
      onHasTask:
          (delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, hasTask: HasTaskState) => {
            logs.push(hasTask);
            return delegate.hasTask(targetZone, hasTask);
          }
    });

    zone.run(() => {
      const timerId = setInterval(() => {}, 100);
      (global as any)[Zone.__symbol__('setTimeout')](() => {
        expect(logs.length > 0).toBeTruthy();
        expect(logs).toEqual(
            [{microTask: false, macroTask: true, eventTask: false, change: 'macroTask'}]);
        clearInterval(timerId);
        expect(logs).toEqual([
          {microTask: false, macroTask: true, eventTask: false, change: 'macroTask'},
          {microTask: false, macroTask: false, eventTask: false, change: 'macroTask'}
        ]);
        done();
      }, 300);
    });
  });
});
