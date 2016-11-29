/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {makeTempDir} from '@angular/tsc-wrapped/test/test_support';
import * as fs from 'fs';
import * as path from 'path';

import {main} from '../src/main';

describe('compiler-cli', () => {
  let basePath: string;
  let write: (fileName: string, content: string) => void;

  beforeEach(() => {
    basePath = makeTempDir();
    write = (fileName: string, content: string) => {
      fs.writeFileSync(path.join(basePath, fileName), content, {encoding: 'utf-8'});
    };
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": true,
        "module": "es2015"
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": true
      },
      "files": ["test.ts"]
    }`);
  });

  it('should compile without errors', (done) => {
    write('test.ts', 'export const A = 1;');

    const mockConsole = {
      error: {}
    };

    spyOn(mockConsole, 'error');

    main({p: basePath}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error).not.toHaveBeenCalled();
          expect(exitCode).toEqual(0);
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should not print the stack trace if user input file does not exist', (done) => {
    const mockConsole = {
      error: {}
    };

    spyOn(mockConsole, 'error');

    main({p: basePath}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error).toHaveBeenCalled();
          expect(mockConsole.error).not.toHaveBeenCalledWith('Compilation failed');
          expect(exitCode).toEqual(0);
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should not print the stack trace if user input file is malformed', (done) => {
    write('test.ts', 'foo bar');

    const mockConsole = {
      error: {}
    };

    spyOn(mockConsole, 'error');

    main({p: basePath}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error).toHaveBeenCalled();
          expect(mockConsole.error).not.toHaveBeenCalledWith('Compilation failed');
          expect(exitCode).toEqual(0);
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should print the stack trace on compiler internal errors', (done) => {
    write('test.ts', 'export const A = 1;');

    const mockConsole = {
      error: {}
    };

    spyOn(mockConsole, 'error');

    main({p: 'not-exist'}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error).toHaveBeenCalled();
          expect(mockConsole.error).toHaveBeenCalledWith('Compilation failed');
          expect(exitCode).toEqual(1);
          done();
        })
        .catch(e => done.fail(e));
  });
});
