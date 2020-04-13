/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {resolve} from 'path';

import {Diagnostics} from '../../../src/diagnostics';
import {FileUtils} from '../../../src/file_utils';
import {translateFiles} from '../../../src/translate/main';
import {getOutputPathFn} from '../../../src/translate/output_path';

describe('translateFiles()', () => {
  const tmpDir = process.env.TEST_TMPDIR;
  if (tmpDir === undefined) return;

  const testDir = resolve(tmpDir, 'translatedFiles_tests');

  beforeEach(() => FileUtils.ensureDir(testDir));
  afterEach(() => {
    FileUtils.remove(testDir);
  });

  it('should copy non-code files to the destination folders', () => {
    const diagnostics = new Diagnostics();
    const outputPathFn = getOutputPathFn(resolve(testDir, '{{LOCALE}}'));
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceFilePaths: resolveAll(__dirname + '/test_files', ['test-1.txt', 'test-2.txt']),
      outputPathFn,
      translationFilePaths: resolveAll(
          __dirname + '/locales',
          ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf', 'messages.it.xtb']),
      translationFileLocales: [],
      diagnostics,
      missingTranslation: 'error'
    });

    expect(diagnostics.messages.length).toEqual(0);

    expect(FileUtils.readFile(resolve(testDir, 'fr', 'test-1.txt')))
        .toEqual('Contents of test-1.txt');
    expect(FileUtils.readFile(resolve(testDir, 'fr', 'test-2.txt')))
        .toEqual('Contents of test-2.txt');
    expect(FileUtils.readFile(resolve(testDir, 'de', 'test-1.txt')))
        .toEqual('Contents of test-1.txt');
    expect(FileUtils.readFile(resolve(testDir, 'de', 'test-2.txt')))
        .toEqual('Contents of test-2.txt');
    expect(FileUtils.readFile(resolve(testDir, 'es', 'test-1.txt')))
        .toEqual('Contents of test-1.txt');
    expect(FileUtils.readFile(resolve(testDir, 'es', 'test-2.txt')))
        .toEqual('Contents of test-2.txt');
    expect(FileUtils.readFile(resolve(testDir, 'it', 'test-1.txt')))
        .toEqual('Contents of test-1.txt');
    expect(FileUtils.readFile(resolve(testDir, 'it', 'test-2.txt')))
        .toEqual('Contents of test-2.txt');
  });

  it('should translate and copy source-code files to the destination folders', () => {
    const diagnostics = new Diagnostics();
    const outputPathFn = getOutputPathFn(resolve(testDir, '{{LOCALE}}'));
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceFilePaths: resolveAll(__dirname + '/test_files', ['test.js']),
      outputPathFn,
      translationFilePaths: resolveAll(
          __dirname + '/locales',
          ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf', 'messages.it.xtb']),
      translationFileLocales: [],
      diagnostics,
      missingTranslation: 'error',
    });

    expect(diagnostics.messages.length).toEqual(0);

    expect(FileUtils.readFile(resolve(testDir, 'fr', 'test.js')))
        .toEqual(`var name="World";var message="Bonjour, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'de', 'test.js')))
        .toEqual(`var name="World";var message="Guten Tag, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'es', 'test.js')))
        .toEqual(`var name="World";var message="Hola, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'it', 'test.js')))
        .toEqual(`var name="World";var message="Ciao, "+name+"!";`);
  });

  it('should translate and copy source-code files overriding the locales', () => {
    const diagnostics = new Diagnostics();
    const outputPathFn = getOutputPathFn(resolve(testDir, '{{LOCALE}}'));
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceFilePaths: resolveAll(__dirname + '/test_files', ['test.js']),
      outputPathFn,
      translationFilePaths: resolveAll(
          __dirname + '/locales',
          ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf', 'messages.it.xtb']),
      translationFileLocales: ['xde', undefined, 'fr'],
      diagnostics,
      missingTranslation: 'error',
    });

    expect(diagnostics.messages.length).toEqual(1);
    expect(diagnostics.messages).toContain({
      type: 'warning',
      message:
          `The provided locale "xde" does not match the target locale "de" found in the translation file "${
              resolve(__dirname, 'locales', 'messages.de.json')}".`
    });

    expect(FileUtils.readFile(resolve(testDir, 'xde', 'test.js')))
        .toEqual(`var name="World";var message="Guten Tag, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'es', 'test.js')))
        .toEqual(`var name="World";var message="Hola, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'fr', 'test.js')))
        .toEqual(`var name="World";var message="Bonjour, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'it', 'test.js')))
        .toEqual(`var name="World";var message="Ciao, "+name+"!";`);
  });

  it('should transform and/or copy files to the destination folders', () => {
    const diagnostics = new Diagnostics();
    const outputPathFn = getOutputPathFn(resolve(testDir, '{{LOCALE}}'));
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceFilePaths:
          resolveAll(__dirname + '/test_files', ['test-1.txt', 'test-2.txt', 'test.js']),
      outputPathFn,
      translationFilePaths: resolveAll(
          __dirname + '/locales',
          ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf', 'messages.it.xtb']),
      translationFileLocales: [],
      diagnostics,
      missingTranslation: 'error',
    });

    expect(diagnostics.messages.length).toEqual(0);

    expect(FileUtils.readFile(resolve(testDir, 'fr', 'test-1.txt')))
        .toEqual('Contents of test-1.txt');
    expect(FileUtils.readFile(resolve(testDir, 'fr', 'test-2.txt')))
        .toEqual('Contents of test-2.txt');
    expect(FileUtils.readFile(resolve(testDir, 'de', 'test-1.txt')))
        .toEqual('Contents of test-1.txt');
    expect(FileUtils.readFile(resolve(testDir, 'de', 'test-2.txt')))
        .toEqual('Contents of test-2.txt');
    expect(FileUtils.readFile(resolve(testDir, 'es', 'test-1.txt')))
        .toEqual('Contents of test-1.txt');
    expect(FileUtils.readFile(resolve(testDir, 'es', 'test-2.txt')))
        .toEqual('Contents of test-2.txt');
    expect(FileUtils.readFile(resolve(testDir, 'it', 'test-1.txt')))
        .toEqual('Contents of test-1.txt');
    expect(FileUtils.readFile(resolve(testDir, 'it', 'test-2.txt')))
        .toEqual('Contents of test-2.txt');

    expect(FileUtils.readFile(resolve(testDir, 'fr', 'test.js')))
        .toEqual(`var name="World";var message="Bonjour, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'de', 'test.js')))
        .toEqual(`var name="World";var message="Guten Tag, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'es', 'test.js')))
        .toEqual(`var name="World";var message="Hola, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'it', 'test.js')))
        .toEqual(`var name="World";var message="Ciao, "+name+"!";`);
  });
});

function resolveAll(rootPath: string, paths: string[]): string[] {
  return paths.map(p => resolve(rootPath, p));
}
