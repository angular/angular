/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync, readdirSync, rmdirSync, statSync, unlinkSync} from 'fs';
import {resolve} from 'path';

import {translateFiles} from '../../../src/translate/main';

describe('translateFiles()', () => {
  const tmpDir = process.env.TEST_TMPDIR;
  if (tmpDir === undefined) return;

  afterEach(() => { emptyDirectory(tmpDir); });

  it('should copy non-code files to the destination folders', () => {
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceGlob: '**/*.txt',
      outputPattern: resolve(tmpDir, '{{LOCALE}}'),
      translationGlob: resolve(__dirname, 'locales/*.*')
    });

    expect(readFileSync(resolve(tmpDir, 'fr', 'test-1.txt'), 'utf8'))
        .toEqual('Contents of test-1.txt');
    expect(readFileSync(resolve(tmpDir, 'fr', 'test-2.txt'), 'utf8'))
        .toEqual('Contents of test-2.txt');
    expect(readFileSync(resolve(tmpDir, 'de', 'test-1.txt'), 'utf8'))
        .toEqual('Contents of test-1.txt');
    expect(readFileSync(resolve(tmpDir, 'de', 'test-2.txt'), 'utf8'))
        .toEqual('Contents of test-2.txt');
    expect(readFileSync(resolve(tmpDir, 'es', 'test-1.txt'), 'utf8'))
        .toEqual('Contents of test-1.txt');
    expect(readFileSync(resolve(tmpDir, 'es', 'test-2.txt'), 'utf8'))
        .toEqual('Contents of test-2.txt');
  });

  it('should translate and copy source-code files to the destination folders', () => {
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceGlob: '**/*.js',
      outputPattern: resolve(tmpDir, '{{LOCALE}}'),
      translationGlob: resolve(__dirname, 'locales/*.*')
    });

    expect(readFileSync(resolve(tmpDir, 'fr', 'test.js'), 'utf8'))
        .toEqual(`var name="World";var message="Bonjour, "+name+"!";`);
    expect(readFileSync(resolve(tmpDir, 'de', 'test.js'), 'utf8'))
        .toEqual(`var name="World";var message="Guten Tag, "+name+"!";`);
    expect(readFileSync(resolve(tmpDir, 'es', 'test.js'), 'utf8'))
        .toEqual(`var name="World";var message="Hola, "+name+"!";`);
  });

  it('should transform and/or copy files to the destination folders', () => {
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceGlob: '**/*',
      outputPattern: resolve(tmpDir, '{{LOCALE}}'),
      translationGlob: resolve(__dirname, 'locales/*.*')
    });

    expect(readFileSync(resolve(tmpDir, 'fr', 'test-1.txt'), 'utf8'))
        .toEqual('Contents of test-1.txt');
    expect(readFileSync(resolve(tmpDir, 'fr', 'test-2.txt'), 'utf8'))
        .toEqual('Contents of test-2.txt');
    expect(readFileSync(resolve(tmpDir, 'de', 'test-1.txt'), 'utf8'))
        .toEqual('Contents of test-1.txt');
    expect(readFileSync(resolve(tmpDir, 'de', 'test-2.txt'), 'utf8'))
        .toEqual('Contents of test-2.txt');
    expect(readFileSync(resolve(tmpDir, 'es', 'test-1.txt'), 'utf8'))
        .toEqual('Contents of test-1.txt');
    expect(readFileSync(resolve(tmpDir, 'es', 'test-2.txt'), 'utf8'))
        .toEqual('Contents of test-2.txt');

    expect(readFileSync(resolve(tmpDir, 'fr', 'test.js'), 'utf8'))
        .toEqual(`var name="World";var message="Bonjour, "+name+"!";`);
    expect(readFileSync(resolve(tmpDir, 'de', 'test.js'), 'utf8'))
        .toEqual(`var name="World";var message="Guten Tag, "+name+"!";`);
    expect(readFileSync(resolve(tmpDir, 'es', 'test.js'), 'utf8'))
        .toEqual(`var name="World";var message="Hola, "+name+"!";`);
  });
});

function emptyDirectory(dirPath: string) {
  readdirSync(dirPath).forEach(p => {
    const path = resolve(dirPath, p);
    const stat = statSync(path);
    if (stat.isFile()) {
      unlinkSync(path);
    } else if (stat.isDirectory()) {
      emptyDirectory(path);
      rmdirSync(path);
    }
  });
}
