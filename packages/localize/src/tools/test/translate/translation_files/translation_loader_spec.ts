/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵParsedTranslation, ɵparseTranslation} from '@angular/localize';

import {DiagnosticHandlingStrategy, Diagnostics} from '../../../src/diagnostics';
import {FileUtils} from '../../../src/file_utils';
import {TranslationLoader} from '../../../src/translate/translation_files/translation_loader';
import {TranslationParser} from '../../../src/translate/translation_files/translation_parsers/translation_parser';

describe('TranslationLoader', () => {
  describe('loadBundles()', () => {
    const alwaysCanParse = () => true;
    const neverCanParse = () => false;

    beforeEach(() => {
      spyOn(FileUtils, 'readFile').and.returnValues('english messages', 'french messages');
    });

    it('should call `canParse()` and `parse()` for each file', () => {
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(alwaysCanParse, 'fr');
      const loader = new TranslationLoader([parser], 'error', diagnostics);
      loader.loadBundles([['/src/locale/messages.en.xlf'], ['/src/locale/messages.fr.xlf']], []);
      expect(parser.log).toEqual([
        'canParse(/src/locale/messages.en.xlf, english messages)',
        'parse(/src/locale/messages.en.xlf, english messages)',
        'canParse(/src/locale/messages.fr.xlf, french messages)',
        'parse(/src/locale/messages.fr.xlf, french messages)',
      ]);
    });

    it('should stop at the first parser that can parse each file', () => {
      const diagnostics = new Diagnostics();
      const parser1 = new MockTranslationParser(neverCanParse);
      const parser2 = new MockTranslationParser(alwaysCanParse, 'fr');
      const parser3 = new MockTranslationParser(alwaysCanParse, 'en');
      const loader = new TranslationLoader([parser1, parser2, parser3], 'error', diagnostics);
      loader.loadBundles([['/src/locale/messages.en.xlf'], ['/src/locale/messages.fr.xlf']], []);
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
      const parser = new MockTranslationParser(alwaysCanParse, 'pl', translations);
      const loader = new TranslationLoader([parser], 'error', diagnostics);
      const result = loader.loadBundles(
          [['/src/locale/messages.en.xlf'], ['/src/locale/messages.fr.xlf']], []);
      expect(result).toEqual([
        {locale: 'pl', translations, diagnostics: new Diagnostics()},
        {locale: 'pl', translations, diagnostics: new Diagnostics()},
      ]);
    });

    it('should return the provided locale if there is no parsed locale', () => {
      const translations = {};
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(alwaysCanParse, undefined, translations);
      const loader = new TranslationLoader([parser], 'error', diagnostics);
      const result = loader.loadBundles(
          [['/src/locale/messages.en.xlf'], ['/src/locale/messages.fr.xlf']], ['en', 'fr']);
      expect(result).toEqual([
        {locale: 'en', translations, diagnostics: new Diagnostics()},
        {locale: 'fr', translations, diagnostics: new Diagnostics()},
      ]);
    });

    it('should merge multiple translation files, if given, for a each locale', () => {
      const diagnostics = new Diagnostics();
      const parser1 = new MockTranslationParser(
          f => f.includes('messages.fr'), 'fr', {'a': ɵparseTranslation('A')});
      const parser2 = new MockTranslationParser(
          f => f.includes('extra.fr'), 'fr', {'b': ɵparseTranslation('B')});
      const loader = new TranslationLoader([parser1, parser2], 'error', diagnostics);
      const result =
          loader.loadBundles([['/src/locale/messages.fr.xlf', '/src/locale/extra.fr.xlf']], []);
      expect(result).toEqual([
        {
          locale: 'fr',
          translations: {'a': ɵparseTranslation('A'), 'b': ɵparseTranslation('B')},
          diagnostics: new Diagnostics(),
        },
      ]);
    });

    const allDiagnosticModes: DiagnosticHandlingStrategy[] = ['ignore', 'warning', 'error'];
    allDiagnosticModes.forEach(
        mode => it(
            `should ${mode} on duplicate messages when merging multiple translation files`, () => {
              const diagnostics = new Diagnostics();
              const parser1 = new MockTranslationParser(
                  f => f.includes('messages.fr'), 'fr', {'a': ɵparseTranslation('A')});
              const parser2 = new MockTranslationParser(
                  f => f.includes('extra.fr'), 'fr', {'a': ɵparseTranslation('B')});
              const loader = new TranslationLoader([parser1, parser2], mode, diagnostics);
              const result = loader.loadBundles(
                  [['/src/locale/messages.fr.xlf', '/src/locale/extra.fr.xlf']], []);
              expect(result).toEqual([
                {
                  locale: 'fr',
                  translations: {'a': ɵparseTranslation('A')},
                  diagnostics: jasmine.any(Diagnostics),
                },
              ]);

              if (mode === 'error' || mode === 'warning') {
                expect(diagnostics.messages).toEqual([{
                  type: mode,
                  message:
                      `Duplicate translations for message "a" when merging "/src/locale/extra.fr.xlf".`
                }]);
              }
            }));

    it('should warn if the provided locales do not match the parsed locales', () => {
      const translations = {};
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(alwaysCanParse, 'pl', translations);
      const loader = new TranslationLoader([parser], 'error', diagnostics);
      loader.loadBundles(
          [['/src/locale/messages.en.xlf'], ['/src/locale/messages.fr.xlf']], [undefined, 'FR']);
      expect(diagnostics.messages.length).toEqual(1);
      expect(diagnostics.messages)
          .toContain(
              {
                type: 'warning',
                message:
                    `The provided locale "FR" does not match the target locale "pl" found in the translation file "/src/locale/messages.fr.xlf".`,
              },
          );
    });

    it('should warn on differing target locales when merging multiple translation files', () => {
      const diagnostics = new Diagnostics();
      const parser1 = new MockTranslationParser(
          f => f.includes('messages-1.fr'), 'fr', {'a': ɵparseTranslation('A')});
      const parser2 = new MockTranslationParser(
          f => f.includes('messages-2.fr'), 'fr', {'b': ɵparseTranslation('B')});
      const parser3 = new MockTranslationParser(
          f => f.includes('messages.de'), 'de', {'c': ɵparseTranslation('C')});
      const loader = new TranslationLoader([parser1, parser2, parser3], 'error', diagnostics);
      const result = loader.loadBundles(
          [[
            '/src/locale/messages-1.fr.xlf', '/src/locale/messages-2.fr.xlf',
            '/src/locale/messages.de.xlf'
          ]],
          []);
      expect(result).toEqual([
        {
          locale: 'fr',
          translations: {
            'a': ɵparseTranslation('A'),
            'b': ɵparseTranslation('B'),
            'c': ɵparseTranslation('C')
          },
          diagnostics: jasmine.any(Diagnostics),
        },
      ]);

      expect(diagnostics.messages).toEqual([{
        type: 'warning',
        message:
            `When merging multiple translation files, the target locale "de" found in "/src/locale/messages.de.xlf" ` +
            `does not match the target locale "fr" found in earlier files ["/src/locale/messages-1.fr.xlf", "/src/locale/messages-2.fr.xlf"].`
      }]);
    });

    it('should throw an error if there is no provided nor parsed target locale', () => {
      const translations = {};
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(alwaysCanParse, undefined, translations);
      const loader = new TranslationLoader([parser], 'error', diagnostics);
      expect(() => loader.loadBundles([['/src/locale/messages.en.xlf']], []))
          .toThrowError(
              'The translation file "/src/locale/messages.en.xlf" does not contain a target locale and no explicit locale was provided for this file.');
    });

    it('should error if none of the parsers can parse the file', () => {
      const diagnostics = new Diagnostics();
      const parser = new MockTranslationParser(neverCanParse);
      const loader = new TranslationLoader([parser], 'error', diagnostics);
      expect(
          () => loader.loadBundles(
              [['/src/locale/messages.en.xlf'], ['/src/locale/messages.fr.xlf']], []))
          .toThrowError(
              'There is no "TranslationParser" that can parse this translation file: /src/locale/messages.en.xlf.');
    });
  });
});

class MockTranslationParser implements TranslationParser {
  log: string[] = [];
  constructor(
      private _canParse: (filePath: string) => boolean, private _locale?: string,
      private _translations: Record<string, ɵParsedTranslation> = {}) {}

  canParse(filePath: string, fileContents: string) {
    this.log.push(`canParse(${filePath}, ${fileContents})`);
    return this._canParse(filePath);
  }

  parse(filePath: string, fileContents: string) {
    this.log.push(`parse(${filePath}, ${fileContents})`);
    return {locale: this._locale, translations: this._translations, diagnostics: new Diagnostics()};
  }
}