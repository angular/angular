/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Diagnostics} from '../../../src/diagnostics';
import {FileUtils} from '../../../src/file_utils';
import {AssetTranslationHandler} from '../../../src/translate/asset_files/asset_translation_handler';
import {TranslationBundle} from '../../../src/translate/translator';

describe('AssetTranslationHandler', () => {
  describe('canTranslate()', () => {
    it('should always return true', () => {
      const handler = new AssetTranslationHandler();
      expect(handler.canTranslate('relative/path', Buffer.from('contents'))).toBe(true);
    });
  });

  describe('translate()', () => {
    beforeEach(() => {
      spyOn(FileUtils, 'writeFile');
      spyOn(FileUtils, 'ensureDir');
    });

    it('should write the translated file for each translation locale', () => {
      const diagnostics = new Diagnostics();
      const handler = new AssetTranslationHandler();
      const translations = [
        {locale: 'en', translations: {}},
        {locale: 'fr', translations: {}},
      ];
      const contents = Buffer.from('contents');
      handler.translate(
          diagnostics, '/root/path', 'relative/path', contents, mockOutputPathFn, translations);

      expect(FileUtils.writeFile).toHaveBeenCalledWith('/translations/en/relative/path', contents);
      expect(FileUtils.writeFile).toHaveBeenCalledWith('/translations/fr/relative/path', contents);
    });

    it('should write the translated file to the source locale if provided', () => {
      const diagnostics = new Diagnostics();
      const handler = new AssetTranslationHandler();
      const translations: TranslationBundle[] = [];
      const contents = Buffer.from('contents');
      const sourceLocale = 'en-US';
      handler.translate(
          diagnostics, '/root/path', 'relative/path', contents, mockOutputPathFn, translations,
          sourceLocale);

      expect(FileUtils.writeFile)
          .toHaveBeenCalledWith('/translations/en-US/relative/path', contents);
    });
  });
});

function mockOutputPathFn(locale: string, relativePath: string) {
  return `/translations/${locale}/${relativePath}`;
}
