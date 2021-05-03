/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom as _} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {makeProgram} from '../../testing';
import {ShimAdapter} from '../src/adapter';
import {TestShimGenerator} from './util';

runInEachFileSystem(() => {
  describe('ShimAdapter', () => {
    it('should recognize a basic shim name', () => {
      const {host} = makeProgram([{
        name: _('/test.ts'),
        contents: `export class A {}`,
      }]);

      const adapter =
          new ShimAdapter(host, [], [], [new TestShimGenerator()], /* oldProgram */ null);
      const shimSf = adapter.maybeGenerate(_('/test.testshim.ts'));
      expect(shimSf).not.toBeNull();
      expect(shimSf!.fileName).toBe(_('/test.testshim.ts'));
      expect(shimSf!.text).toContain('SHIM_FOR_FILE');
    });

    it('should not recognize a normal file in the program', () => {
      const {host} = makeProgram([{
        name: _('/test.ts'),
        contents: `export class A {}`,
      }]);

      const adapter =
          new ShimAdapter(host, [], [], [new TestShimGenerator()], /* oldProgram */ null);
      const shimSf = adapter.maybeGenerate(_('/test.ts'));
      expect(shimSf).toBeNull();
    });

    it('should not recognize a shim-named file without a source file', () => {
      const {host} = makeProgram([{
        name: _('/test.ts'),
        contents: `export class A {}`,
      }]);

      const adapter =
          new ShimAdapter(host, [], [], [new TestShimGenerator()], /* oldProgram */ null);
      const shimSf = adapter.maybeGenerate(_('/other.testshim.ts'));

      // Expect undefined, not null, since that indicates a valid shim path but an invalid source
      // file.
      expect(shimSf).toBeUndefined();
    });

    it('should detect a prior shim if one is available', () => {
      // Create a shim via the ShimAdapter, then create a second ShimAdapter simulating an
      // incremental compilation, with a stub passed for the oldProgram that includes the original
      // shim file. Verify that the new ShimAdapter incorporates the original shim in generation of
      // the new one.
      const {host, program} = makeProgram([
        {
          name: _('/test.ts'),
          contents: `export class A {}`,
        },
      ]);
      const adapter =
          new ShimAdapter(host, [], [], [new TestShimGenerator()], /* oldProgram */ null);
      const originalShim = adapter.maybeGenerate(_('/test.testshim.ts'))!;
      const oldProgramStub = {
        getSourceFiles: () => [...program.getSourceFiles(), originalShim],
      } as unknown as ts.Program;

      const adapter2 = new ShimAdapter(host, [], [], [new TestShimGenerator()], oldProgramStub);
      const newShim = adapter.maybeGenerate(_('/test.testshim.ts'));
      expect(newShim).toBe(originalShim);
    });
  });
});
