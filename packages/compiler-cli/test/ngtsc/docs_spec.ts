/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DocEntry} from '@angular/compiler-cli/src/ngtsc/docs';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '@angular/compiler-cli/src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCore: true, fakeCommon: true});

runInEachFileSystem(os => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should extract classes', () => {
      env.write('test.ts', `
        class UserProfile {}

        class CustomSlider {}
      `);

      const docs: DocEntry[] = env.driveDocsExtraction();
      expect(docs.length).toBe(2);
      expect(docs[0].name).toBe('UserProfile');
      expect(docs[1].name).toBe('CustomSlider');
    });
  });
});
