/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';

import {ReflectorHost} from '../src/reflector_host';

import {toh} from './test_data';
import {MockTypescriptHost} from './test_utils';

describe('reflector_host_spec', () => {

  // Regression #21811
  it('should be able to find angular under windows', () => {
    const originalJoin = path.join;
    const originalPosixJoin = path.posix.join;
    let mockHost =
        new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts'], toh, 'app/node_modules', {
          ...path,
          join: (...args: string[]) => originalJoin.apply(path, args),
          posix:
              {...path.posix, join: (...args: string[]) => originalPosixJoin.apply(path, args)}
        });
    const reflectorHost = new ReflectorHost(() => undefined as any, mockHost, {basePath: '\\app'});

    if (process.platform !== 'win32') {
      // If we call this in Windows it will cause a 'Maximum call stack size exceeded error'
      // Because we are spying on the same function that we are call faking
      spyOn(path, 'join').and.callFake((...args: string[]) => { return path.win32.join(...args); });
    }

    const result = reflectorHost.moduleNameToFileName('@angular/core');
    expect(result).not.toBeNull('could not find @angular/core using path.win32');
  });
});