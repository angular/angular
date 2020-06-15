/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../helpers/src/mock_file_loading';

import {NgtscTestEnvironment} from './env';


const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('NgTscPlugin', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    it('should not leave triple-slash references to typecheck files in output .d.ts', () => {
      env.write('main.ts', `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class FooService {}
      `);
      const diags = env.drivePluginDiagnostics();
      expect(diags).toEqual([]);

      const dtsContents = env.getContents('main.d.ts');
      expect(dtsContents).not.toContain('<reference');
      expect(dtsContents).not.toContain('ngtypecheck');
    });
  });
});
