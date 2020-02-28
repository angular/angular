/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedTranslation} from '@angular/localize';

import {Diagnostics} from '../../../src/diagnostics';
import {FileUtils} from '../../../src/file_utils';
import {TranslationLoader} from '../../../src/translate/translation_files/translation_loader';
import {TranslationParser} from '../../../src/translate/translation_files/translation_parsers/translation_parser';

describe('TranslationLoader', () => {
  describe('loadBundles()', () => {
    beforeEach(() => {
      spyOn(FileUtils, 'readFile').and.returnValues('english messages', 'french messages');
    });

    it('should `canParse()` and `parse()` for each file', () => {
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(true, 'fr');
      const loader = new TranslationLoader([parser], diagnostics);
      loader.loadBundles(['/src/locale/messages.en.xlf', '/src/locale/messages.fr.xlf'], []);
      expect(parser.log).toEqual([
        'canParse(/src/locale/messages.en.xlf, english messages)',
        'parse(/src/locale/messages.en.xlf, english messages)',
        'canParse(/src/locale/messages.fr.xlf, french messages)',
        'parse(/src/locale/messages.fr.xlf, french messages)',
      ]);
    });

    it('should stop at the first parser that can parse each file', () => {
      const diagnostics = new Diagnostics();
      const parser1 = new MockTranslationParser(false);
      const parser2 = new MockTranslationParser(true, 'fr');
      const parser3 = new MockTranslationParser(true, 'en');
      const loader = new TranslationLoader([parser1, parser2, parser3], diagnostics);
      loader.loadBundles(['/src/locale/messages.en.xlf', '/src/locale/messages.fr.xlf'], []);
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
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(true, 'pl', translations);
      const loader = new TranslationLoader([parser], diagnostics);
      const result =
          loader.loadBundles(['/src/locale/messages.en.xlf', '/src/locale/messages.fr.xlf'], []);
      expect(result).toEqual([
        {locale: 'pl', translations, diagnostics: new Diagnostics()},
        {locale: 'pl', translations, diagnostics: new Diagnostics()},
      ]);
    });

    it('should return the provided locale if there is no parsed locale', () => {
      const translations = {};
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(true, undefined, translations);
      const loader = new TranslationLoader([parser], diagnostics);
      const result = loader.loadBundles(
          ['/src/locale/messages.en.xlf', '/src/locale/messages.fr.xlf'], ['en', 'fr']);
      expect(result).toEqual([
        {locale: 'en', translations, diagnostics: new Diagnostics()},
        {locale: 'fr', translations, diagnostics: new Diagnostics()},
      ]);
    });

    it('should warn if the provided locales do not match the parsed locales', () => {
      const translations = {};
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(true, 'pl', translations);
      const loader = new TranslationLoader([parser], diagnostics);
      loader.loadBundles(
          ['/src/locale/messages.en.xlf', '/src/locale/messages.fr.xlf'], [undefined, 'FR']);
      expect(diagnostics.messages.length).toEqual(1);
      expect(diagnostics.messages).toContain({
        type: 'warning',
        message:
            `The provided locale "FR" does not match the target locale "pl" found in the translation file "/src/locale/messages.fr.xlf".`,
      }, );
    });

    it('should throw an error if there is no provided nor parsed target locale', () => {
      const translations = {};
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(true, undefined, translations);
      const loader = new TranslationLoader([parser], diagnostics);
      expect(() => loader.loadBundles(['/src/locale/messages.en.xlf'], []))
          .toThrowError(
              'The translation file "/src/locale/messages.en.xlf" does not contain a target locale and no explicit locale was provided for this file.');
    });

    it('should error if none of the parsers can parse the file', () => {
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(false);
      const loader = new TranslationLoader([parser], diagnostics);
      expect(
          () => loader.loadBundles(
              ['/src/locale/messages.en.xlf', '/src/locale/messages.fr.xlf'], []))
          .toThrowError(
              'There is no "TranslationParser" that can parse this translation file: /src/locale/messages.en.xlf.');
    });
  });
});

class MockTranslationParser implements TranslationParser {
  log: string[] = [];
  constructor(
      private _canParse: boolean = true, private _locale?: string,
      private _translations: Record<string, ɵParsedTranslation> = {}) {}

  canParse(filePath: string, fileContents: string) {
    this.log.push(`canParse(${filePath}, ${fileContents})`);
    return this._canParse;
  }

  parse(filePath: string, fileContents: string) {
    this.log.push(`parse(${filePath}, ${fileContents})`);
    return {locale: this._locale, translations: this._translations, diagnostics: new Diagnostics()};
  }
}