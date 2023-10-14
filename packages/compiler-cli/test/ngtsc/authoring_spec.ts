/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('input()', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: false});
    });

    it('should handle a basic, primitive valued input', () => {
      env.write('test.ts', `
        import {Directive, input} from '@angular/core';

        @Directive()
        export class TestDir {
          data = input('test');
        }
      `);
      env.driveMain();
      const js = env.getContents('test.js');
      expect(js).toContain('inputs: { data: "data" }');
    });
  });
});
