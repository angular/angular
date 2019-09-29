/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';

import {SourceFileTranslationHandler} from '../../../src/translate/source_files/source_file_translation_handler';

describe('SourceFileTranslationHandler', () => {
  describe('canTranslate()', () => {
    it('should return true if the path ends in ".js"', () => {
      const handler = new SourceFileTranslationHandler();
      expect(handler.canTranslate('relative/path', Buffer.from('contents'))).toBe(false);
      expect(handler.canTranslate('relative/path.js', Buffer.from('contents'))).toBe(true);
    });
  });

  describe('translate()', () => {
    beforeEach(() => {
      spyOn(fs, 'writeFileSync');
      spyOn(fs, 'mkdirSync');
    });

    it('should copy files for each translation locale if they contain no reference to `$localize`',
       () => {
         const handler = new SourceFileTranslationHandler();
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

    it('should transform each $localize template tag', () => {
      const handler = new SourceFileTranslationHandler();
      const translations = [
        {locale: 'en', translations: {}},
        {locale: 'fr', translations: {}},
      ];
      const contents = Buffer.from(
          '$localize`a${1}b${2}c`;\n' +
          '$localize(__makeTemplateObject(["a", "b", "c"], ["a", "b", "c"]), 1, 2);');
      const output = '"a"+1+"b"+2+"c";"a"+1+"b"+2+"c";';
      handler.translate('/root/path', 'relative/path.js', contents, mockOutputPathFn, translations);

      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations/en');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations/en/relative');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/translations/en/relative/path.js', output);

      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations/fr');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/translations/fr/relative');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/translations/fr/relative/path.js', output);
    });

    it('should error if the file is not valid JS', () => {
      const handler = new SourceFileTranslationHandler();
      const translations = [{locale: 'en', translations: {}}];
      const contents = Buffer.from('this is not a valid $localize file.');
      expect(
          () => handler.translate(
              '/root/path', 'relative/path.js', contents, mockOutputPathFn, translations))
          .toThrowError();
    });
  });
});

function mockOutputPathFn(locale: string, relativePath: string) {
  return `/translations/${locale}/${relativePath}`;
}
