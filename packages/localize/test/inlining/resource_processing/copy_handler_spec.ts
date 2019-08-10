/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';

import {CopyResourceHandler} from '../../../src/inlining/resource_processing/copy_resource_handler';

describe('CopyResourceHandler', () => {
  describe('canHandle()', () => {
    it('should always return true', () => {
      const handler = new CopyResourceHandler();
      expect(handler.canHandle('relative/path', Buffer.from('contents'))).toBe(true);
    });
  });

  describe('handle()', () => {
    beforeEach(() => {
      spyOn(fs, 'writeFileSync');
      spyOn(fs, 'mkdirSync');
    });

    it('should call `fs.writeFileSync() for each translation locale', () => {
      const handler = new CopyResourceHandler();
      const translations = [
        {locale: 'en', translations: {}},
        {locale: 'fr', translations: {}},
      ];
      const contents = Buffer.from('contents');
      handler.handle('/root/path', 'relative/path', contents, mockOutputPathFn, translations);

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
