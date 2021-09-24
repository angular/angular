
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {FileSystem, getFileSystem, PathSegment, relativeFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {ɵParsedMessage} from '@angular/localize/private';
import {transformSync} from '@babel/core';

import {makeEs5ExtractPlugin} from '../../../src/extract/source_files/es5_extract_plugin';
import {runInNativeFileSystem} from '../../helpers';

runInNativeFileSystem(() => {
  let fs: FileSystem;
  let testPath: PathSegment;

  beforeEach(() => {
    fs = getFileSystem();
    testPath = relativeFrom('app/dist/test.js');
  });

  describe('makeEs5ExtractPlugin()', () => {
    it('should error with code-frame information if the first argument to `$localize` is not an array',
       () => {
         const input = '$localize(null, [])';
         expect(() => transformCode(input))
             .toThrowError(
                 `Cannot create property 'message' on string '${testPath}: ` +
                 'Unexpected messageParts for `$localize` (expected an array of strings).\n' +
                 '> 1 | $localize(null, [])\n' +
                 '    |           ^^^^\'');
       });

    function transformCode(input: string): ɵParsedMessage[] {
      const messages: ɵParsedMessage[] = [];
      const cwd = fs.resolve('/');
      const filename = fs.resolve(cwd, testPath);
      transformSync(input, {
        plugins: [makeEs5ExtractPlugin(getFileSystem(), messages)],
        filename,
        cwd,
      })!.code!;
      return messages;
    }
  });
});
