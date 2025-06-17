/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  absoluteFrom,
  AbsoluteFsPath,
  FileSystem,
  getFileSystem,
  PathSegment,
  relativeFrom,
  runInEachFileSystem,
} from '@angular/compiler-cli';

import {Diagnostics} from '../../src/diagnostics';
import {OutputPathFn} from '../../src/translate/output_path';
import {TranslationBundle, TranslationHandler, Translator} from '../../src/translate/translator';

runInEachFileSystem(() => {
  describe('Translator', () => {
    let fs: FileSystem;
    let distDirectory: AbsoluteFsPath;
    let imgDirectory: AbsoluteFsPath;
    let file1Path: PathSegment;
    let imgPath: PathSegment;

    beforeEach(() => {
      fs = getFileSystem();
      distDirectory = absoluteFrom('/dist');
      imgDirectory = absoluteFrom('/dist/images');
      file1Path = relativeFrom('file1.js');
      imgPath = relativeFrom('images/img.gif');

      fs.ensureDir(imgDirectory);
      fs.writeFile(fs.resolve(distDirectory, file1Path), 'resource file 1');
      fs.writeFile(fs.resolve(distDirectory, imgPath), Buffer.from('resource file 2'));
    });

    describe('translateFiles()', () => {
      it('should call FileSystem.readFileBuffer load the resource file contents', () => {
        const translator = new Translator(fs, [new MockTranslationHandler()], new Diagnostics());
        spyOn(fs, 'readFileBuffer').and.callThrough();
        translator.translateFiles([file1Path, imgPath], distDirectory, mockOutputPathFn, []);
        expect(fs.readFileBuffer).toHaveBeenCalledWith(fs.resolve(distDirectory, file1Path));
        expect(fs.readFileBuffer).toHaveBeenCalledWith(fs.resolve(distDirectory, imgPath));
      });

      it('should call `canTranslate()` and `translate()` for each file', () => {
        const diagnostics = new Diagnostics();
        const handler = new MockTranslationHandler(true);
        const translator = new Translator(fs, [handler], diagnostics);
        translator.translateFiles([file1Path, imgPath], distDirectory, mockOutputPathFn, []);

        expect(handler.log).toEqual([
          'canTranslate(file1.js, resource file 1)',
          `translate(${distDirectory}, file1.js, resource file 1, ...)`,
          'canTranslate(images/img.gif, resource file 2)',
          `translate(${distDirectory}, images/img.gif, resource file 2, ...)`,
        ]);
      });

      it('should pass the sourceLocale through to `translate()` if provided', () => {
        const diagnostics = new Diagnostics();
        const handler = new MockTranslationHandler(true);
        const translator = new Translator(fs, [handler], diagnostics);
        translator.translateFiles(
          [file1Path, imgPath],
          distDirectory,
          mockOutputPathFn,
          [],
          'en-US',
        );

        expect(handler.log).toEqual([
          'canTranslate(file1.js, resource file 1)',
          `translate(${distDirectory}, file1.js, resource file 1, ..., en-US)`,
          'canTranslate(images/img.gif, resource file 2)',
          `translate(${distDirectory}, images/img.gif, resource file 2, ..., en-US)`,
        ]);
      });

      it('should stop at the first handler that can handle each file', () => {
        const diagnostics = new Diagnostics();
        const handler1 = new MockTranslationHandler(false);
        const handler2 = new MockTranslationHandler(true);
        const handler3 = new MockTranslationHandler(true);
        const translator = new Translator(fs, [handler1, handler2, handler3], diagnostics);
        translator.translateFiles([file1Path, imgPath], distDirectory, mockOutputPathFn, []);

        expect(handler1.log).toEqual([
          'canTranslate(file1.js, resource file 1)',
          'canTranslate(images/img.gif, resource file 2)',
        ]);
        expect(handler2.log).toEqual([
          'canTranslate(file1.js, resource file 1)',
          `translate(${distDirectory}, file1.js, resource file 1, ...)`,
          'canTranslate(images/img.gif, resource file 2)',
          `translate(${distDirectory}, images/img.gif, resource file 2, ...)`,
        ]);
      });

      it('should error if none of the handlers can handle the file', () => {
        const diagnostics = new Diagnostics();
        const handler = new MockTranslationHandler(false);
        const translator = new Translator(fs, [handler], diagnostics);

        translator.translateFiles([file1Path, imgPath], distDirectory, mockOutputPathFn, []);

        expect(diagnostics.messages).toEqual([
          {type: 'error', message: `Unable to handle resource file: ${file1Path}`},
          {type: 'error', message: `Unable to handle resource file: ${imgPath}`},
        ]);
      });
    });
  });

  class MockTranslationHandler implements TranslationHandler {
    log: string[] = [];
    constructor(private _canTranslate: boolean = true) {}

    canTranslate(relativePath: string, contents: Uint8Array) {
      this.log.push(`canTranslate(${relativePath}, ${contents})`);
      return this._canTranslate;
    }

    translate(
      _diagnostics: Diagnostics,
      rootPath: string,
      relativePath: string,
      contents: Uint8Array,
      _outputPathFn: OutputPathFn,
      _translations: TranslationBundle[],
      sourceLocale?: string,
    ) {
      this.log.push(
        `translate(${rootPath}, ${relativePath}, ${contents}, ...` +
          (sourceLocale !== undefined ? `, ${sourceLocale})` : ')'),
      );
    }
  }

  function mockOutputPathFn(locale: string, relativePath: string) {
    return `translations/${locale}/${relativePath}`;
  }
});
