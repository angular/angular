/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
describe('crypto test', () => {
  let crypto: any = null;

  try {
    crypto = require('crypto');
  } catch (err) {
  }

  it('crypto randomBytes method should be patched as tasks', (done) => {
    if (!crypto) {
      done();
      return;
    }
    const zoneASpec = {
      name: 'A',
      onScheduleTask: (delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task):
          Task => {
            return delegate.scheduleTask(targetZone, task);
          }
    };
    const zoneA = Zone.current.fork(zoneASpec);
    spyOn(zoneASpec, 'onScheduleTask').and.callThrough();
    zoneA.run(() => {
      crypto.randomBytes(256, (err: Error, buf: any) => {
        expect(err).toBeFalsy();
        expect(zoneASpec.onScheduleTask).toHaveBeenCalled();
        expect(buf.length).toBe(256);
        expect(Zone.current.name).toEqual('A');
        done();
      });
    });
  });

  it('crypto pbkdf2 method should be patched as tasks', (done) => {
    if (!crypto) {
      done();
      return;
    }
    const zoneASpec = {
      name: 'A',
      onScheduleTask: (delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task):
          Task => {
            return delegate.scheduleTask(targetZone, task);
          }
    };
    const zoneA = Zone.current.fork(zoneASpec);
    spyOn(zoneASpec, 'onScheduleTask').and.callThrough();
    zoneA.run(() => {
      crypto.pbkdf2('secret', 'salt', 100000, 512, 'sha512', (err: Error, key: any) => {
        expect(err).toBeFalsy();
        expect(zoneASpec.onScheduleTask).toHaveBeenCalled();
        expect(key.toString('hex'))
            .toEqual(
                '3745e482c6e0ade35da10139e797157f4a5da669dad7d5da88ef87e47471cc47ed941c7ad618e827304f083f8707f12b7cfdd5f489b782f10cc269e3c08d59ae04919ee902c99dba309cde75569fbe8e6d5c341d6f2576f6618c589e77911a261ee964e242797e64aeca9a134de5ced37fe2521d35d87303edb55a844c8cf11e3b42b18dbd7add0739ea9b172dc3810f911396fa3956f499415db35b79488d74926cdc0c15c3910bf2e4918f5a8efd7de3d4c314bace50c7a95150339eccd32dda2e15d961ea2c91eddd8b03110135a72b3562f189c2d15568854f9a1844cfa62fb77214f2810a2277fd21be95a794cde78e0fe5267a2c1b0894c7729fc4be378156aeb1cff8a215bb4df12312ba676fe2f270dfc3e2b54d8f9c74dfb531530042a09b226fafbcef45368a1ec75f9224a80f2280f75258ff74a2b9a864d857ede49af6a23af837a1f502a6c32e3537402280bef200d847d8fee42649e6d9a00df952ab2fbefc84ba8927f73137fdfbea81f86088edd4cf329edf3f6982429797143cbd43128777c2da269fadd55d18c7921308c7ad7a5bb85ef8d614e2e8461ea3b7fc2edcf72b85da6828a4198c46000953afb1f3a19ecac0df0d660848a0f89ed3d0e0a82115347c9918bdf16fad479c1de16a6b9798437622acff245e6cf80c9ee9d56cada8523ebb6ff348c73c836e5828761f8dda1dd5ab1633caa39b34');
        expect(Zone.current.name).toEqual('A');
        done();
      });
    });
  });
});
