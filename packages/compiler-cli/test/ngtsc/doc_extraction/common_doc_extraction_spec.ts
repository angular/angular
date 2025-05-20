/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../../../src/ngtsc/docs';
import {runInEachFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../../src/ngtsc/testing';

import {NgtscTestEnvironment} from '../env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  let env!: NgtscTestEnvironment;

  describe('ngtsc common docs extraction', () => {
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should not extract unexported statements', () => {
      env.write(
        'index.ts',
        `
        class UserProfile {}
        function getUser() { }
        const name = '';
      `,
      );

      const docs: DocEntry[] = env.driveDocsExtraction('index.ts');
      expect(docs.length).toBe(0);
    });
  });
});
