/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ifEnvSupports} from '../test-util';

describe('SyncTestZoneSpec', () => {
  const SyncTestZoneSpec = (Zone as any)['SyncTestZoneSpec'];
  let testZoneSpec;
  let syncTestZone: Zone;

  beforeEach(() => {
    testZoneSpec = new SyncTestZoneSpec('name');
    syncTestZone = Zone.current.fork(testZoneSpec);
  });

  it('should fail on Promise.then', () => {
    syncTestZone.run(() => {
      expect(() => {
        Promise.resolve().then(function () {});
      }).toThrow(
        new Error('Cannot call Promise.then from within a sync test (syncTestZone for name).'),
      );
    });
  });

  it('should fail on setTimeout', () => {
    syncTestZone.run(() => {
      expect(() => {
        setTimeout(() => {}, 100);
      }).toThrow(
        new Error('Cannot call setTimeout from within a sync test (syncTestZone for name).'),
      );
    });
  });

  describe(
    'event tasks',
    ifEnvSupports(
      'document',
      () => {
        it('should work with event tasks', () => {
          syncTestZone.run(() => {
            const button = document.createElement('button');
            document.body.appendChild(button);
            let x = 1;
            try {
              button.addEventListener('click', () => {
                x++;
              });

              button.click();
              expect(x).toEqual(2);

              button.click();
              expect(x).toEqual(3);
            } finally {
              document.body.removeChild(button);
            }
          });
        });
      },
      emptyRun,
    ),
  );
});

function emptyRun() {
  // Jasmine will throw if there are no tests.
  it('should pass', () => {});
}
