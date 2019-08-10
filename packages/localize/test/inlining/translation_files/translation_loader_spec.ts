/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as fs from 'fs';
import * as glob from 'glob';

import {TranslationLoader} from '../../../src/inlining/translation_files/translation_loader';
import {TranslationParser} from '../../../src/inlining/translation_files/translation_parser';
import {ParsedTranslation} from '../../../src/utils/translations';

describe('TranslationLoader', () => {
  describe('loadBundles()', () => {
    let globSpy: jasmine.Spy;

    beforeEach(() => {
      globSpy = spyOn(glob, 'sync').and.returnValue([
        '/src/locale/messages.en.xlf', '/src/locale/messages.fr.xlf'
      ]);
      spyOn(fs, 'readFileSync').and.returnValues('english messages', 'french messages');
    });

    it('should call glob.sync to compute the translation file paths', () => {
      const loader = new TranslationLoader([new MockTranslationParser()]);
      loader.loadBundles('/src/locale/**/*.xlf');
      expect(globSpy).toHaveBeenCalledWith('/src/locale/**/*.xlf', {absolute: true, nodir: true});
    });


    it('should `canParse()` and `parse()` for each file', () => {
      const parser = new MockTranslationParser(true);
      const loader = new TranslationLoader([parser]);
      loader.loadBundles('/src/locale/**/*.xlf');
      expect(parser.log).toEqual([
        'canParse(/src/locale/messages.en.xlf, english messages)',
        'parse(/src/locale/messages.en.xlf, english messages)',
        'canParse(/src/locale/messages.fr.xlf, french messages)',
        'parse(/src/locale/messages.fr.xlf, french messages)',
      ]);
    });

    it('should stop at the first parser that can parse each file', () => {
      const parser1 = new MockTranslationParser(false);
      const parser2 = new MockTranslationParser(true);
      const parser3 = new MockTranslationParser(true);
      const loader = new TranslationLoader([parser1, parser2, parser3]);
      loader.loadBundles('/src/locale/**/*.xlf');
      expect(parser1.log).toEqual([
        'canParse(/src/locale/messages.en.xlf, english messages)',
        'canParse(/src/locale/messages.fr.xlf, french messages)',
      ]);
      expect(parser2.log).toEqual([
        'canParse(/src/locale/messages.en.xlf, english messages)',
        'parse(/src/locale/messages.en.xlf, english messages)',
        'canParse(/src/locale/messages.fr.xlf, french messages)',
        'parse(/src/locale/messages.fr.xlf, french messages)',
      ]);
    });

    it('should return locale and translations parsed from each file', () => {
      const translations = {};
      const parser = new MockTranslationParser(true, 'pl', translations);
      const loader = new TranslationLoader([parser]);
      const result = loader.loadBundles('/src/locale/**/*.xlf');
      expect(result).toEqual([
        {locale: 'pl', translations},
        {locale: 'pl', translations},
      ]);
    });

    it('should error if none of the parsers can parse the file', () => {
      const parser = new MockTranslationParser(false);
      const loader = new TranslationLoader([parser]);
      expect(() => loader.loadBundles('/src/locale/**/*.xlf'))
          .toThrowError('Unable to parse translation file: /src/locale/messages.en.xlf');
    });
  });
});

class MockTranslationParser implements TranslationParser {
  log: string[] = [];
  constructor(
      private _canParse: boolean = true, private _locale: string = 'fr',
      private _translations: Record<string, ParsedTranslation> = {}) {}

  canParse(filePath: string, fileContents: string) {
    this.log.push(`canParse(${filePath}, ${fileContents})`);
    return this._canParse;
  }

  parse(filePath: string, fileContents: string) {
    this.log.push(`parse(${filePath}, ${fileContents})`);
    return {locale: this._locale, translations: this._translations};
  }
}