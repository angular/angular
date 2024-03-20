/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {promisify} from 'util';

describe('node timer', () => {
  it('util.promisify should work with setTimeout', (done: DoneFn) => {
    const setTimeoutPromise = promisify(setTimeout);
    setTimeoutPromise(50, 'value')
        .then(
            value => {
              expect(value).toEqual('value');
              done();
            },
            error => {
              fail(`should not be here with error: ${error}.`);
            });
  });

  it('util.promisify should work with setImmediate', (done: DoneFn) => {
    const setImmediatePromise = promisify(setImmediate);
    setImmediatePromise('value').then(
        value => {
          expect(value).toEqual('value');
          done();
        },
        error => {
          fail(`should not be here with error: ${error}.`);
        });
  });
});
