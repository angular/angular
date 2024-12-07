/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {patchTimer} from '../../lib/common/timers';
import {isNode, zoneSymbol} from '../../lib/common/utils';

declare const global: any;
const wtfMock = global.wtfMock;

describe('setTimeout', function () {
  it('should intercept setTimeout', function (done) {
    let cancelId: any;
    const testZone = Zone.current.fork((Zone as any)['wtfZoneSpec']).fork({name: 'TestZone'});
    testZone.run(
      () => {
        const timeoutFn = function () {
          expect(Zone.current.name).toEqual('TestZone');
          global[zoneSymbol('setTimeout')](function () {
            expect(wtfMock.log[0]).toEqual('# Zone:fork("<root>::ProxyZone::WTF", "TestZone")');
            expect(wtfMock.log[1]).toEqual(
              '> Zone:invoke:unit-test("<root>::ProxyZone::WTF::TestZone")',
            );
            expect(wtfMock.log[2]).toContain(
              '# Zone:schedule:macroTask:setTimeout("<root>::ProxyZone::WTF::TestZone"',
            );
            expect(wtfMock.log[3]).toEqual('< Zone:invoke:unit-test');
            expect(wtfMock.log[4]).toEqual(
              '> Zone:invokeTask:setTimeout("<root>::ProxyZone::WTF::TestZone")',
            );
            expect(wtfMock.log[5]).toEqual('< Zone:invokeTask:setTimeout');
            done();
          });
        };
        expect(Zone.current.name).toEqual('TestZone');
        cancelId = setTimeout(timeoutFn, 3);
        if (isNode) {
          expect(typeof cancelId.ref).toEqual('function');
          expect(typeof cancelId.unref).toEqual('function');
        }
        expect(wtfMock.log[0]).toEqual('# Zone:fork("<root>::ProxyZone::WTF", "TestZone")');
        expect(wtfMock.log[1]).toEqual(
          '> Zone:invoke:unit-test("<root>::ProxyZone::WTF::TestZone")',
        );
        expect(wtfMock.log[2]).toContain(
          '# Zone:schedule:macroTask:setTimeout("<root>::ProxyZone::WTF::TestZone"',
        );
      },
      null,
      undefined,
      'unit-test',
    );
  });

  it('should allow canceling of fns registered with setTimeout', function (done) {
    const testZone = Zone.current.fork((Zone as any)['wtfZoneSpec']).fork({name: 'TestZone'});
    testZone.run(() => {
      const spy = jasmine.createSpy('spy');
      const cancelId = setTimeout(spy, 0);
      clearTimeout(cancelId);
      setTimeout(function () {
        expect(spy).not.toHaveBeenCalled();
        done();
      }, 1);
    });
  });

  it('should call native clearTimeout with the correct context', function () {
    // since clearTimeout has been patched already, we can not test `clearTimeout` directly
    // we will fake another API patch to test
    let context: any = null;
    const fakeGlobal = {
      setTimeout: function () {
        return 1;
      },
      clearTimeout: function (id: number) {
        context = this;
      },
    };
    patchTimer(fakeGlobal, 'set', 'clear', 'Timeout');
    const cancelId = fakeGlobal.setTimeout();
    const m = fakeGlobal.clearTimeout;
    m.call({}, cancelId);
    expect(context).toBe(fakeGlobal);
  });

  it('should allow cancelation of fns registered with setTimeout after invocation', function (done) {
    const testZone = Zone.current.fork((Zone as any)['wtfZoneSpec']).fork({name: 'TestZone'});
    testZone.run(() => {
      const spy = jasmine.createSpy('spy');
      const cancelId = setTimeout(spy, 0);
      setTimeout(function () {
        expect(spy).toHaveBeenCalled();
        setTimeout(function () {
          clearTimeout(cancelId);
          done();
        });
      }, 1);
    });
  });

  it('should allow cancelation of fns while the task is being executed', function (done) {
    const spy = jasmine.createSpy('spy');
    const cancelId = setTimeout(() => {
      clearTimeout(cancelId);
      done();
    }, 0);
  });

  it('should allow cancelation of fns registered with setTimeout during invocation', function (done) {
    const testZone = Zone.current.fork((Zone as any)['wtfZoneSpec']).fork({name: 'TestZone'});
    testZone.run(() => {
      const cancelId = setTimeout(function () {
        clearTimeout(cancelId);
        done();
      }, 0);
    });
  });

  it('should return the original timeout Id', function () {
    // Node returns complex object from setTimeout, ignore this test.
    if (isNode) return;
    const cancelId = setTimeout(() => {}, 0);
    expect(typeof cancelId).toEqual('number');
  });

  it('should allow cancelation by numeric timeout Id', function (done) {
    // Node returns complex object from setTimeout, ignore this test.
    if (isNode) {
      done();
      return;
    }

    const testZone = Zone.current.fork((Zone as any)['wtfZoneSpec']).fork({name: 'TestZone'});
    testZone.run(() => {
      const spy = jasmine.createSpy('spy');
      const cancelId = setTimeout(spy, 0);
      clearTimeout(cancelId);
      setTimeout(function () {
        expect(spy).not.toHaveBeenCalled();
        done();
      }, 1);
    });
  });

  it('should pass invalid values through', function () {
    clearTimeout(null as any);
    clearTimeout(<any>{});
  });
});
