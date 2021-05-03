/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, PathSegment, relativeFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {Diagnostics} from '../../../src/diagnostics';
import {AssetTranslationHandler} from '../../../src/translate/asset_files/asset_translation_handler';
import {TranslationBundle} from '../../../src/translate/translator';

runInEachFileSystem(() => {
  describe('AssetTranslationHandler', () => {
    let fs: FileSystem;
    let rootPath: AbsoluteFsPath;
    let filePath: PathSegment;
    let enTranslationPath: AbsoluteFsPath;
    let enUSTranslationPath: AbsoluteFsPath;
    let frTranslationPath: AbsoluteFsPath;

    beforeEach(() => {
      fs = getFileSystem();
      rootPath = absoluteFrom('/src/path');
      filePath = relativeFrom('relative/path');
      enTranslationPath = absoluteFrom('/translations/en/relative/path');
      enUSTranslationPath = absoluteFrom('/translations/en-US/relative/path');
      frTranslationPath = absoluteFrom('/translations/fr/relative/path');
    });

    describe('canTranslate()', () => {
      it('should always return true', () => {
        const handler = new AssetTranslationHandler(fs);
        expect(handler.canTranslate(filePath, Buffer.from('contents'))).toBe(true);
      });
    });

    describe('translate()', () => {
      it('should write the translated file for each translation locale', () => {
        const diagnostics = new Diagnostics();
        const handler = new AssetTranslationHandler(fs);
        const translations = [
          {locale: 'en', translations: {}},
          {locale: 'fr', translations: {}},
        ];
        const contents = Buffer.from('contents');
        handler.translate(
            diagnostics, rootPath, filePath, contents, mockOutputPathFn, translations);

        expect(fs.readFileBuffer(enTranslationPath)).toEqual(contents);
        expect(fs.readFileBuffer(frTranslationPath)).toEqual(contents);
      });

      it('should write the translated file to the source locale if provided', () => {
        const diagnostics = new Diagnostics();
        const handler = new AssetTranslationHandler(fs);
        const translations: TranslationBundle[] = [];
        const contents = Buffer.from('contents');
        const sourceLocale = 'en-US';
        handler.translate(
            diagnostics, rootPath, filePath, contents, mockOutputPathFn, translations,
            sourceLocale);

        expect(fs.readFileBuffer(enUSTranslationPath)).toEqual(contents);
      });
    });
  });

  function mockOutputPathFn(locale: string, relativePath: string) {
    return `/translations/${locale}/${relativePath}`;
  }
});
