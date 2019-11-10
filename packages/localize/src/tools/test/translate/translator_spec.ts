/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Diagnostics as Diagnostics} from '../../src/diagnostics';
import {FileUtils} from '../../src/file_utils';
import {OutputPathFn} from '../../src/translate/output_path';
import {TranslationBundle, TranslationHandler, Translator} from '../../src/translate/translator';

describe('Translator', () => {
  describe('translateFiles()', () => {

    beforeEach(() => {
      spyOn(FileUtils, 'readFileBuffer')
          .and.returnValues(Buffer.from('resource file 1'), Buffer.from('resource file 2'));
    });

    it('should call FileUtils.readFileBuffer to load the resource file contents', () => {
      const translator = new Translator([new MockTranslationHandler()], new Diagnostics());
      translator.translateFiles(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);
      expect(FileUtils.readFileBuffer).toHaveBeenCalledWith('/dist/file1.js');
      expect(FileUtils.readFileBuffer).toHaveBeenCalledWith('/dist/images/img.gif');
    });

    it('should call `canTranslate()` and `translate()` for each file', () => {
      const diagnostics = new Diagnostics();
      const handler = new MockTranslationHandler(true);
      const translator = new Translator([handler], diagnostics);
      translator.translateFiles(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);

      expect(handler.log).toEqual([
        'canTranslate(file1.js, resource file 1)',
        'translate(/dist, file1.js, resource file 1, ...)',
        'canTranslate(images/img.gif, resource file 2)',
        'translate(/dist, images/img.gif, resource file 2, ...)',
      ]);
    });

    it('should pass the sourceLocale through to `translate()` if provided', () => {
      const diagnostics = new Diagnostics();
      const handler = new MockTranslationHandler(true);
      const translator = new Translator([handler], diagnostics);
      translator.translateFiles(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, [], 'en-US');

      expect(handler.log).toEqual([
        'canTranslate(file1.js, resource file 1)',
        'translate(/dist, file1.js, resource file 1, ..., en-US)',
        'canTranslate(images/img.gif, resource file 2)',
        'translate(/dist, images/img.gif, resource file 2, ..., en-US)',
      ]);
    });

    it('should stop at the first handler that can handle each file', () => {
      const diagnostics = new Diagnostics();
      const handler1 = new MockTranslationHandler(false);
      const handler2 = new MockTranslationHandler(true);
      const handler3 = new MockTranslationHandler(true);
      const translator = new Translator([handler1, handler2, handler3], diagnostics);
      translator.translateFiles(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);

      expect(handler1.log).toEqual([
        'canTranslate(file1.js, resource file 1)',
        'canTranslate(images/img.gif, resource file 2)',
      ]);
      expect(handler2.log).toEqual([
        'canTranslate(file1.js, resource file 1)',
        'translate(/dist, file1.js, resource file 1, ...)',
        'canTranslate(images/img.gif, resource file 2)',
        'translate(/dist, images/img.gif, resource file 2, ...)',
      ]);
    });

    it('should error if none of the handlers can handle the file', () => {
      const diagnostics = new Diagnostics();
      const handler = new MockTranslationHandler(false);
      const translator = new Translator([handler], diagnostics);

      translator.translateFiles(
          ['/dist/file1.js', '/dist/images/img.gif'], '/dist', mockOutputPathFn, []);

      expect(diagnostics.messages).toEqual([
        {type: 'error', message: 'Unable to handle resource file: /dist/file1.js'},
        {type: 'error', message: 'Unable to handle resource file: /dist/images/img.gif'},
      ]);
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

  translate(
      _diagnostics: Diagnostics, rootPath: string, relativePath: string, contents: Buffer,
      _outputPathFn: OutputPathFn, _translations: TranslationBundle[], sourceLocale?: string) {
    this.log.push(
        `translate(${rootPath}, ${relativePath}, ${contents}, ...` +
        (sourceLocale !== undefined ? `, ${sourceLocale})` : ')'));
  }
}

function mockOutputPathFn(locale: string, relativePath: string) {
  return `translations/${locale}/${relativePath}`;
}
