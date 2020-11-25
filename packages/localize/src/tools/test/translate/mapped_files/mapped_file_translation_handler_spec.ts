/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, FileSystem, getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {Diagnostics} from '../../../src/diagnostics';
import {FileMapping, MappedFileTranslationHandler, PathMapper, PathMatcher} from '../../../src/translate/mapped_files/mapped_file_translation_handler';
import {TranslationBundle} from '../../../src/translate/translator';

runInEachFileSystem(() => {
  let fs: FileSystem;
  let _Abs: typeof absoluteFrom;

  describe('MappedFileTranslationHandler', () => {
    beforeEach(() => {
      fs = getFileSystem();
      _Abs = absoluteFrom;
    });

    describe('canTranslate()', () => {
      const trueMapping: FileMapping = {
        matcher: {
          matchesPath() {
            return true;
          }
        },
        mapper: {} as any,
      };

      const falseMapping: FileMapping = {
        matcher: {
          matchesPath() {
            return false;
          }
        },
        mapper: {} as any,
      };

      it('should return false there are no mappings', () => {
        const handler =
            new MappedFileTranslationHandler(fs, {mappings: [], missingTranslation: 'error'});
        expect(handler.canTranslate('relative/path', Buffer.from('contents'))).toBe(false);
      });

      it('should return true at least one configured `PathMatcher` returns true', () => {
        const handler = new MappedFileTranslationHandler(fs, {
          mappings: [falseMapping, falseMapping, trueMapping, falseMapping],
          missingTranslation: 'error'
        });
        expect(handler.canTranslate('relative/path', Buffer.from('contents'))).toBe(true);
      });

      it('should return false if all configured `PathMatcher`s return false', () => {
        const handler = new MappedFileTranslationHandler(
            fs,
            {mappings: [falseMapping, falseMapping, falseMapping], missingTranslation: 'error'});
        expect(handler.canTranslate('relative/path', Buffer.from('contents'))).toBe(false);
      });

      it('should pass the source path and contents to each path matcher', () => {
        spyOn(falseMapping.matcher, 'matchesPath');
        const handler = new MappedFileTranslationHandler(
            fs,
            {mappings: [falseMapping, falseMapping, falseMapping], missingTranslation: 'error'});
        handler.canTranslate('relative/path', Buffer.from('contents'));
        expect(falseMapping.matcher.matchesPath).toHaveBeenCalledTimes(3);
        expect(falseMapping.matcher.matchesPath).toHaveBeenCalledWith('relative/path');
      });
    });

    describe('translate()', () => {
      it('should call `mapPath()` on the first mapping that matches the path', () => {
        const diagnostics = new Diagnostics();
        const mapping1 = new MockMapping('aaa', 'AAA');
        const mapping2 = new MockMapping('bbb', 'BBB');
        const mapping3 = new MockMapping('ccc', 'CCC');
        const handler = new MappedFileTranslationHandler(
            fs, {mappings: [mapping1, mapping2, mapping3], missingTranslation: 'error'});
        const translations = [
          {locale: 'en', translations: {}},
          {locale: 'fr', translations: {}},
        ];
        const contents = Buffer.from('contents');
        handler.translate(
            diagnostics, '/root/path', 'bbb', contents, mockOutputPathFn, translations);

        expect(mapping1.matcher.matchesPath).toHaveBeenCalledWith('bbb');
        expect(mapping2.matcher.matchesPath).toHaveBeenCalledWith('bbb');
        expect(mapping3.matcher.matchesPath).not.toHaveBeenCalled();

        expect(mapping1.mapper.mapPath).not.toHaveBeenCalled();
        expect(mapping2.mapper.mapPath).toHaveBeenCalledWith('bbb');
        expect(mapping3.mapper.mapPath).not.toHaveBeenCalled();
      });

      describe('processing mapped paths', () => {
        let handler: MappedFileTranslationHandler;
        const contents = Buffer.from('contents');
        const frContents = Buffer.from('french mapped file');

        beforeEach(() => {
          const diagnostics = new Diagnostics();
          const mappings = [new MockMapping('aaa', '/mapped/{{LOCALE}}/aaa')];
          handler = new MappedFileTranslationHandler(fs, {mappings, missingTranslation: 'error'});
          const translations = [
            {locale: 'en', translations: {}},
            {locale: 'fr', translations: {}},
          ];

          // The `en` mapped file does not exist but the `fr` mapped file does.
          fs.ensureDir(_Abs('/mapped/fr'));
          fs.writeFile(_Abs('/mapped/fr/aaa'), frContents);

          spyOn(fs, 'exists').and.callThrough();

          handler.translate(
              diagnostics, '/root/path', 'aaa', contents, mockOutputPathFn, translations);
        });

        it('should check whether the mapped path (replacing `{{LOCALE}}`) exists for each translation',
           () => {
             expect(fs.exists).toHaveBeenCalledWith(_Abs('/mapped/en/aaa'));
             expect(fs.exists).toHaveBeenCalledWith(_Abs('/mapped/fr/aaa'));
           });

        it('should write the mapped file if it exists', () => {
          expect(fs.readFileBuffer(_Abs('/translations/fr/aaa'))).toEqual(frContents);
        });

        it('should write the source contents if the mapped file does not exist', () => {
          expect(fs.readFileBuffer(_Abs('/translations/en/aaa'))).toEqual(contents);
        });
      });

      it('should write the translated file to the "source locale", if provided', () => {
        const diagnostics = new Diagnostics();
        const mappings = [new MockMapping('relative/path', 'relative/path')];
        const handler =
            new MappedFileTranslationHandler(fs, {mappings, missingTranslation: 'error'});
        const translations: TranslationBundle[] = [];
        const contents = Buffer.from('contents');
        const sourceLocale = 'en-US';

        handler.translate(
            diagnostics, '/root/path', 'relative/path', contents, mockOutputPathFn, translations,
            sourceLocale);

        expect(fs.readFileBuffer(_Abs('/translations/en-US/relative/path'))).toEqual(contents);
      });
    });
  });

  function mockOutputPathFn(locale: string, relativePath: string) {
    return _Abs(`/translations/${locale}/${relativePath}`);
  }

  class MockMapping {
    matcher: PathMatcher;
    mapper: PathMapper;
    constructor(pathToMatch: string, mappedPath: string) {
      this.matcher = {
        matchesPath(source: string) {
          return source === pathToMatch;
        }
      };
      spyOn(this.matcher, 'matchesPath').and.callThrough();
      this.mapper = {
        mapPath(source: string) {
          return mappedPath;
        }
      };
      spyOn(this.mapper, 'mapPath').and.callThrough();
    }
  }
});
