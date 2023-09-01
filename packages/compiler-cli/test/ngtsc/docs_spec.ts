/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '@angular/compiler-cli/src/ngtsc/testing';
import {platform} from 'os';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCore: true, fakeCommon: true});

runInEachFileSystem.native(os => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    fit('should extract classes', () => {
      env.write('test.ts', `
        class Foo {}

        class Bar {}
      `);

      const docs = env.driveDocs();
      expect(docs.get('/test.ts')?.classes.length).toBe(2);
    });
  });
});
