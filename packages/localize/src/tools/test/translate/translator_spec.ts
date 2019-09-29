/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';

import {TranslationHandler, Translator} from '../../src/translate/translator';

describe('Translator', () => {
  describe('translateFiles()', () => {

    beforeEach(() => {
      spyOn(fs, 'readFileSync')
          .and.returnValues(Buffer.from('resource file 1'), Buffer.from('resource file 2'));
    });

    it('should call fs.readFileSync to load the resource file contents', () => {
      const translator = new Translator([new MockTranslationHandler()]);
      translator.translateFiles(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);
      expect(fs.readFileSync).toHaveBeenCalledWith('/dist/file1.js');
      expect(fs.readFileSync).toHaveBeenCalledWith('/dist/images/img.gif');
    });

    it('should call `canTranslate()` and `translate()` for each file', () => {
      const handler = new MockTranslationHandler(true);
      const translator = new Translator([handler]);
      translator.translateFiles(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);

      expect(handler.log).toEqual([
        'canTranslate(file1.js, resource file 1)',
        'translate(/dist, file1.js, resource file 1)',
        'canTranslate(images/img.gif, resource file 2)',
        'translate(/dist, images/img.gif, resource file 2)',
      ]);
    });

    it('should stop at the first handler that can handle each file', () => {
      const handler1 = new MockTranslationHandler(false);
      const handler2 = new MockTranslationHandler(true);
      const handler3 = new MockTranslationHandler(true);
      const translator = new Translator([handler1, handler2, handler3]);
      translator.translateFiles(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);

      expect(handler1.log).toEqual([
        'canTranslate(file1.js, resource file 1)',
        'canTranslate(images/img.gif, resource file 2)',
      ]);
      expect(handler2.log).toEqual([
        'canTranslate(file1.js, resource file 1)',
        'translate(/dist, file1.js, resource file 1)',
        'canTranslate(images/img.gif, resource file 2)',
        'translate(/dist, images/img.gif, resource file 2)',
      ]);
    });

    it('should error if none of the handlers can handle the file', () => {
      const handler = new MockTranslationHandler(false);
      const translator = new Translator([handler]);
      expect(
          () => translator.translateFiles(
              ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []))
          .toThrowError('Unable to handle resource file: /dist/file1.js');
    });
  });
});

class MockTranslationHandler implements TranslationHandler {
  log: string[] = [];
  constructor(private _canTranslate: boolean = true) {}

  canTranslate(relativePath: string, contents: Buffer) {
    this.log.push(`canTranslate(${relativePath}, ${contents.toString('utf8')})`);
    return this._canTranslate;
  }

  translate(rootPath: string, relativePath: string, contents: Buffer) {
    this.log.push(`translate(${rootPath}, ${relativePath}, ${contents})`);
  }
}

function mockOutputPathFn(locale: string, relativePath: string) {
  return `translations/${locale}/${relativePath}`;
}
