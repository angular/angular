/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';

import {AssetTranslationHandler} from '../../../src/translate/asset_files/asset_translation_handler';

describe('CopyResourceHandler', () => {
  describe('canTranslate()', () => {
    it('should always return true', () => {
      const handler = new AssetTranslationHandler();
      expect(handler.canTranslate('relative/path', Buffer.from('contents'))).toBe(true);
    });
  });

  describe('translate()', () => {
    beforeEach(() => {
      spyOn(fs, 'writeFileSync');
      spyOn(fs, 'mkdirSync');
    });

    it('should call `fs.writeFileSync() for each translation locale', () => {
      const handler = new AssetTranslationHandler();
      const translations = [
        {locale: 'en', translations: {}},
        {locale: 'fr', translations: {}},
      ];
      const contents = Buffer.from('contents');
      handler.translate('/root/path', 'relative/path', contents, mockOutputPathFn, translations);

      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations/en');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations/en/relative');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/translations/en/relative/path', contents);

      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations/fr');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations/fr/relative');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/translations/fr/relative/path', contents);
    });
  });
});

function mockOutputPathFn(locale: string, relativePath: string) {
  return `/translations/${locale}/${relativePath}`;
}
