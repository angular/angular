/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 waitForAsync TSLint rule', () => {
  const rulesDirectory = dirname(require.resolve('../../migrations/google3/waitForAsyncRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    // We need to declare the Angular symbols we're testing for, otherwise type checking won't work.
    writeFile('testing.d.ts', `
      export declare function async(fn: Function): any;
    `);

    writeFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        module: 'es2015',
        baseUrl: './',
        paths: {
          '@angular/core/testing': ['testing.d.ts'],
        }
      },
    }));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix: boolean) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'wait-for-async': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) {
    return readFileSync(join(tmpDir, fileName), 'utf8');
  }

  it('should flag async imports and usages', () => {
    writeFile('/index.ts', `
      import { async, inject } from '@angular/core/testing';

      it('should work', async(() => {
        expect(inject('foo')).toBe('foo');
      }));

      it('should also work', async(() => {
        expect(inject('bar')).toBe('bar');
      }));
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures.map(failure => failure.getFailure());
    expect(failures.length).toBe(3);
    expect(failures[0]).toMatch(/Imports of the deprecated async function are not allowed/);
    expect(failures[1]).toMatch(/References to the deprecated async function are not allowed/);
    expect(failures[2]).toMatch(/References to the deprecated async function are not allowed/);
  });

  it('should change async imports to waitForAsync', () => {
    writeFile('/index.ts', `
      import { async, inject } from '@angular/core/testing';

      it('should work', async(() => {
        expect(inject('foo')).toBe('foo');
      }));
    `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`import { inject, waitForAsync } from '@angular/core/testing';`);
  });

  it('should change aliased async imports to waitForAsync', () => {
    writeFile('/index.ts', `
      import { async as renamedAsync, inject } from '@angular/core/testing';

      it('should work', renamedAsync(() => {
        expect(inject('foo')).toBe('foo');
      }));
    `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`import { inject, waitForAsync as renamedAsync } from '@angular/core/testing';`);
  });

  it('should not change async imports if they are not from @angular/core/testing', () => {
    writeFile('/index.ts', `
      import { inject } from '@angular/core/testing';
      import { async } from './my-test-library';

      it('should work', async(() => {
        expect(inject('foo')).toBe('foo');
      }));
    `);

    runTSLint(true);
    const content = getFile('/index.ts');
    expect(content).toContain(`import { inject } from '@angular/core/testing';`);
    expect(content).toContain(`import { async } from './my-test-library';`);
  });

  it('should not change imports if waitForAsync was already imported', () => {
    writeFile('/index.ts', `
      import { async, inject, waitForAsync } from '@angular/core/testing';

      it('should work', async(() => {
        expect(inject('foo')).toBe('foo');
      }));

      it('should also work', waitForAsync(() => {
        expect(inject('bar')).toBe('bar');
      }));
    `);

    runTSLint(true);
    expect(getFile('/index.ts'))
        .toContain(`import { async, inject, waitForAsync } from '@angular/core/testing';`);
  });

  it('should change calls from `async` to `waitForAsync`', () => {
    writeFile('/index.ts', `
      import { async, inject } from '@angular/core/testing';

      it('should work', async(() => {
        expect(inject('foo')).toBe('foo');
      }));

      it('should also work', async(() => {
        expect(inject('bar')).toBe('bar');
      }));
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(`import { inject, waitForAsync } from '@angular/core/testing';`);
    expect(content).toContain(`it('should work', waitForAsync(() => {`);
    expect(content).toContain(`it('should also work', waitForAsync(() => {`);
  });

  it('should not change aliased calls', () => {
    writeFile('/index.ts', `
      import { async as renamedAsync, inject } from '@angular/core/testing';

      it('should work', renamedAsync(() => {
        expect(inject('foo')).toBe('foo');
      }));
    `);

    runTSLint(true);

    const content = getFile('/index.ts');
    expect(content).toContain(
        `import { inject, waitForAsync as renamedAsync } from '@angular/core/testing';`);
    expect(content).toContain(`it('should work', renamedAsync(() => {`);
  });
});
