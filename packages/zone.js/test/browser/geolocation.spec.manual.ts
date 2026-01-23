/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ifEnvSupports} from '../test-util';

function supportsGeolocation() {
  return 'geolocation' in navigator;
}
(<any>supportsGeolocation).message = 'Geolocation';

describe(
  'Geolocation',
  ifEnvSupports(supportsGeolocation, function () {
    const testZone = Zone.current.fork({name: 'geotest'});

    it('should work for getCurrentPosition', function (done) {
      testZone.run(function () {
        navigator.geolocation.getCurrentPosition(function (pos) {
          expect(Zone.current).toBe(testZone);
          done();
        });
      });
    }, 10000);

    it('should work for watchPosition', function (done) {
      testZone.run(function () {
        let watchId: number;
        watchId = navigator.geolocation.watchPosition(function (pos) {
          expect(Zone.current).toBe(testZone);
          navigator.geolocation.clearWatch(watchId);
          done();
        });
      });
    }, 10000);
  }),
);
