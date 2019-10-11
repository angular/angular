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
import {getSourceMap} from './source_map_utils';

describe('translateFiles()', () => {
  const tmpDir = process.env.TEST_TMPDIR;
  if (tmpDir === undefined) return;

  const testDir = resolve(tmpDir, 'translatedFiles_tests');

  beforeEach(() => FileUtils.ensureDir(testDir));
  afterEach(() => { FileUtils.remove(testDir); });

  it('should copy non-code files to the destination folders', () => {
    const diagnostics = new Diagnostics();
    const outputPathFn = getOutputPathFn(resolve(testDir, '{{LOCALE}}'));
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceFilePaths: resolveAll(__dirname + '/test_files', ['test-1.txt', 'test-2.txt']),
      outputPathFn,
      translationFilePaths: resolveAll(
          __dirname + '/locales', ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf']),
      diagnostics,
      missingTranslation: 'error',
      sourceMap: 'inherit',
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
  });

  it('should translate and copy source-code files to the destination folders', () => {
    const diagnostics = new Diagnostics();
    const outputPathFn = getOutputPathFn(resolve(testDir, '{{LOCALE}}'));
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceFilePaths: resolveAll(__dirname + '/test_files', ['test.js']), outputPathFn,
      translationFilePaths: resolveAll(
          __dirname + '/locales', ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf']),
      diagnostics,
      missingTranslation: 'error',
      sourceMap: 'inherit',
    });

    expect(diagnostics.messages.length).toEqual(0);

    expect(FileUtils.readFile(resolve(testDir, 'fr', 'test.js')))
        .toContain(`message="Bonjour, "+name+"!";`);

    expect(FileUtils.readFile(resolve(testDir, 'de', 'test.js')))
        .toContain(`message="Guten Tag, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'es', 'test.js')))
        .toContain(`message="Hola, "+name+"!";`);
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
          __dirname + '/locales', ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf']),
      diagnostics,
      missingTranslation: 'error',
      sourceMap: 'inherit',
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

    expect(FileUtils.readFile(resolve(testDir, 'fr', 'test.js')))
        .toContain(`message="Bonjour, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'de', 'test.js')))
        .toContain(`message="Guten Tag, "+name+"!";`);
    expect(FileUtils.readFile(resolve(testDir, 'es', 'test.js')))
        .toContain(`message="Hola, "+name+"!";`);
  });

  it('should merge source-map files into the destination folder', () => {
    const diagnostics = new Diagnostics();
    const outputPathFn = getOutputPathFn(resolve(testDir, '{{LOCALE}}'));
    translateFiles({
      sourceRootPath: resolve(__dirname, 'test_files'),
      sourceFilePaths: resolveAll(__dirname + '/test_files', ['test.js', 'test.ts', 'test2.ts']),
      outputPathFn,
      translationFilePaths: resolveAll(
          __dirname + '/locales', ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf']),
      diagnostics,
      missingTranslation: 'error',
      sourceMap: 'inherit',
    });

    const map = getSourceMap(resolve(testDir, 'de', 'test.js'));
    const mappedSegments = map.getMappedSegments();

    expect(mappedSegments).toContain(['message', 'message']);
    expect(mappedSegments).toContain([': string = $localize `Hello, ${', '="Guten Tag, "+']);
    expect(mappedSegments).toContain(['name', 'name']);
  });
});

function resolveAll(rootPath: string, paths: string[]): string[] {
  return paths.map(p => resolve(rootPath, p));
}
