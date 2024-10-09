/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
describe('cordova test', () => {
  it('cordova.exec() should be patched as macroTask', (done) => {
    const cordova = (window as any).cordova;
    if (!cordova) {
      done();
      return;
    }

    const zone = Zone.current.fork({name: 'cordova'});

    zone.run(() => {
      cordova.exec(
        () => {
          expect(Zone.current.name).toEqual('cordova');
        },
        () => {
          fail('should not fail');
        },
        'service',
        'successAction',
        ['arg0', 'arg1'],
      );

      cordova.exec(
        () => {
          fail('should not success');
        },
        () => {
          expect(Zone.current.name).toEqual('cordova');
          done();
        },
        'service',
        'failAction',
        ['arg0', 'arg1'],
      );
    });
  });
});
