/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {loadTestDirectory} from '@angular/compiler-cli/src/ngtsc/testing';
import {resolve as realResolve} from 'path';

import {Diagnostics} from '../../../src/diagnostics';
import {translateFiles} from '../../../src/translate/main';
import {getOutputPathFn} from '../../../src/translate/output_path';
import {runInNativeFileSystem} from '../../helpers';

runInNativeFileSystem(() => {
  describe('translateFiles()', () => {
    let fs: FileSystem;
    let testDir: AbsoluteFsPath;
    let testFilesDir: AbsoluteFsPath;
    let translationFilesDir: AbsoluteFsPath;

    beforeEach(() => {
      fs = getFileSystem();
      testDir = absoluteFrom('/test');

      testFilesDir = fs.resolve(testDir, 'test_files');
      loadTestDirectory(fs, realResolve(__dirname, 'test_files'), testFilesDir);
      translationFilesDir = fs.resolve(testDir, 'test_files');
      loadTestDirectory(fs, realResolve(__dirname, 'locales'), translationFilesDir);
    });

    it('should copy non-code files to the destination folders', () => {
      const diagnostics = new Diagnostics();
      const outputPathFn = getOutputPathFn(fs, fs.resolve(testDir, '{{LOCALE}}'));
      translateFiles({
        sourceRootPath: testFilesDir,
        sourceFilePaths: ['test-1.txt', 'test-2.txt'],
        outputPathFn,
        translationFilePaths: resolveAll(
            translationFilesDir,
            ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf', 'messages.it.xtb']),
        translationFileLocales: [],
        diagnostics,
        missingTranslation: 'error',
        duplicateTranslation: 'error',
      });

      expect(diagnostics.messages.length).toEqual(0);

      expect(fs.readFile(fs.resolve(testDir, 'fr', 'test-1.txt')))
          .toEqual('Contents of test-1.txt');
      expect(fs.readFile(fs.resolve(testDir, 'fr', 'test-2.txt')))
          .toEqual('Contents of test-2.txt');
      expect(fs.readFile(fs.resolve(testDir, 'de', 'test-1.txt')))
          .toEqual('Contents of test-1.txt');
      expect(fs.readFile(fs.resolve(testDir, 'de', 'test-2.txt')))
          .toEqual('Contents of test-2.txt');
      expect(fs.readFile(fs.resolve(testDir, 'es', 'test-1.txt')))
          .toEqual('Contents of test-1.txt');
      expect(fs.readFile(fs.resolve(testDir, 'es', 'test-2.txt')))
          .toEqual('Contents of test-2.txt');
      expect(fs.readFile(fs.resolve(testDir, 'it', 'test-1.txt')))
          .toEqual('Contents of test-1.txt');
      expect(fs.readFile(fs.resolve(testDir, 'it', 'test-2.txt')))
          .toEqual('Contents of test-2.txt');
    });

    it('should translate and copy source-code files to the destination folders', () => {
      const diagnostics = new Diagnostics();
      const outputPathFn = getOutputPathFn(fs, fs.resolve(testDir, '{{LOCALE}}'));
      translateFiles({
        sourceRootPath: testFilesDir,
        sourceFilePaths: ['test.js'],
        outputPathFn,
        translationFilePaths: resolveAll(
            translationFilesDir,
            ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf', 'messages.it.xtb']),
        translationFileLocales: [],
        diagnostics,
        missingTranslation: 'error',
        duplicateTranslation: 'error',
      });

      expect(diagnostics.messages.length).toEqual(0);

      expect(fs.readFile(fs.resolve(testDir, 'fr', 'test.js')))
          .toEqual(`var name="World";var message="Bonjour, "+name+"!";`);
      expect(fs.readFile(fs.resolve(testDir, 'de', 'test.js')))
          .toEqual(`var name="World";var message="Guten Tag, "+name+"!";`);
      expect(fs.readFile(fs.resolve(testDir, 'es', 'test.js')))
          .toEqual(`var name="World";var message="Hola, "+name+"!";`);
      expect(fs.readFile(fs.resolve(testDir, 'it', 'test.js')))
          .toEqual(`var name="World";var message="Ciao, "+name+"!";`);
    });

    it('should translate and copy source-code files overriding the locales', () => {
      const diagnostics = new Diagnostics();
      const outputPathFn = getOutputPathFn(fs, fs.resolve(testDir, '{{LOCALE}}'));
      translateFiles({
        sourceRootPath: testFilesDir,
        sourceFilePaths: ['test.js'],
        outputPathFn,
        translationFilePaths: resolveAll(
            translationFilesDir,
            ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf', 'messages.it.xtb']),
        translationFileLocales: ['xde', undefined, 'fr'],
        diagnostics,
        missingTranslation: 'error',
        duplicateTranslation: 'error',
      });

      expect(diagnostics.messages.length).toEqual(1);
      expect(diagnostics.messages).toContain({
        type: 'warning',
        message:
            `The provided locale "xde" does not match the target locale "de" found in the translation file "${
                fs.resolve(translationFilesDir, 'messages.de.json')}".`
      });

      expect(fs.readFile(fs.resolve(testDir, 'xde', 'test.js')))
          .toEqual(`var name="World";var message="Guten Tag, "+name+"!";`);
      expect(fs.readFile(fs.resolve(testDir, 'es', 'test.js')))
          .toEqual(`var name="World";var message="Hola, "+name+"!";`);
      expect(fs.readFile(fs.resolve(testDir, 'fr', 'test.js')))
          .toEqual(`var name="World";var message="Bonjour, "+name+"!";`);
      expect(fs.readFile(fs.resolve(testDir, 'it', 'test.js')))
          .toEqual(`var name="World";var message="Ciao, "+name+"!";`);
    });

    it('should merge translation files, if more than one provided, and translate source-code', () => {
      const diagnostics = new Diagnostics();
      const outputPathFn = getOutputPathFn(fs, fs.resolve(testDir, '{{LOCALE}}'));
      translateFiles({
        sourceRootPath: testFilesDir,
        sourceFilePaths: ['test-extra.js'],
        outputPathFn,
        translationFilePaths: resolveAllRecursive(
            translationFilesDir,
            [['messages.de.json', 'messages-extra.de.json'], 'messages.es.xlf']),
        translationFileLocales: [],
        diagnostics,
        missingTranslation: 'error',
        duplicateTranslation: 'error',
      });

      expect(diagnostics.messages.length).toEqual(1);
      // There is no "extra" translation in the `es` locale translation file.
      expect(diagnostics.messages[0]).toEqual({
        type: 'error',
        message: 'No translation found for "customExtra" ("Goodbye, {$PH}!").'
      });

      // The `de` locale translates the `customExtra` message because it is in the
      // `messages-extra.de.json` file that was merged.
      expect(fs.readFile(fs.resolve(testDir, 'de', 'test-extra.js')))
          .toEqual(
              `var name="World";var message="Guten Tag, "+name+"!";var message="Auf wiedersehen, "+name+"!";`);
      // The `es` locale does not translate `customExtra` because there is no translation for it.
      expect(fs.readFile(fs.resolve(testDir, 'es', 'test-extra.js')))
          .toEqual(
              `var name="World";var message="Hola, "+name+"!";var message="Goodbye, "+name+"!";`);
    });

    it('should transform and/or copy files to the destination folders', () => {
      const diagnostics = new Diagnostics();
      const outputPathFn = getOutputPathFn(fs, fs.resolve(testDir, '{{LOCALE}}'));
      translateFiles({
        sourceRootPath: testFilesDir,
        sourceFilePaths: ['test-1.txt', 'test-2.txt', 'test.js'],
        outputPathFn,
        translationFilePaths: resolveAll(
            translationFilesDir,
            ['messages.de.json', 'messages.es.xlf', 'messages.fr.xlf', 'messages.it.xtb']),
        translationFileLocales: [],
        diagnostics,
        missingTranslation: 'error',
        duplicateTranslation: 'error',
      });

      expect(diagnostics.messages.length).toEqual(0);

      expect(fs.readFile(fs.resolve(testDir, 'fr', 'test-1.txt')))
          .toEqual('Contents of test-1.txt');
      expect(fs.readFile(fs.resolve(testDir, 'fr', 'test-2.txt')))
          .toEqual('Contents of test-2.txt');
      expect(fs.readFile(fs.resolve(testDir, 'de', 'test-1.txt')))
          .toEqual('Contents of test-1.txt');
      expect(fs.readFile(fs.resolve(testDir, 'de', 'test-2.txt')))
          .toEqual('Contents of test-2.txt');
      expect(fs.readFile(fs.resolve(testDir, 'es', 'test-1.txt')))
          .toEqual('Contents of test-1.txt');
      expect(fs.readFile(fs.resolve(testDir, 'es', 'test-2.txt')))
          .toEqual('Contents of test-2.txt');
      expect(fs.readFile(fs.resolve(testDir, 'it', 'test-1.txt')))
          .toEqual('Contents of test-1.txt');
      expect(fs.readFile(fs.resolve(testDir, 'it', 'test-2.txt')))
          .toEqual('Contents of test-2.txt');

      expect(fs.readFile(fs.resolve(testDir, 'fr', 'test.js')))
          .toEqual(`var name="World";var message="Bonjour, "+name+"!";`);
      expect(fs.readFile(fs.resolve(testDir, 'de', 'test.js')))
          .toEqual(`var name="World";var message="Guten Tag, "+name+"!";`);
      expect(fs.readFile(fs.resolve(testDir, 'es', 'test.js')))
          .toEqual(`var name="World";var message="Hola, "+name+"!";`);
      expect(fs.readFile(fs.resolve(testDir, 'it', 'test.js')))
          .toEqual(`var name="World";var message="Ciao, "+name+"!";`);
    });

    function resolveAll(rootPath: string, paths: string[]): string[] {
      return paths.map(p => fs.resolve(rootPath, p));
    }
    function resolveAllRecursive(
        rootPath: string, paths: (string|string[])[]): (string|string[])[] {
      return paths.map(
          p => Array.isArray(p) ? p.map(p2 => fs.resolve(rootPath, p2)) : fs.resolve(rootPath, p));
    }
  });
});
