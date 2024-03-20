/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵmakeTemplateObject} from '@angular/localize';

import {SimpleJsonTranslationParser} from '../../../../src/translate/translation_files/translation_parsers/simple_json_translation_parser';
import {ParsedTranslationBundle} from '../../../../src/translate/translation_files/translation_parsers/translation_parser';

describe('SimpleJsonTranslationParser', () => {
  describe('analyze()', () => {
    it('should return true if the file extension  is `.json` and contains top level `locale` and `translations` properties',
       () => {
         const parser = new SimpleJsonTranslationParser();
         expect(parser.analyze('/some/file.xlf', '').canParse).toBeFalse();
         expect(parser.analyze('/some/file.json', '{}').canParse).toBeFalse();
         expect(parser.analyze('/some/file.json', '{ "translations" : {} }').canParse).toBeFalse();
         expect(parser.analyze('/some/file.json', '{ "locale" : "fr" }').canParse).toBeFalse();
         expect(
             parser.analyze('/some/file.json', '{ "locale" : "fr", "translations" : {}}').canParse)
             .toBeTrue();
       });
  });

  describe('analyze()', () => {
    it('should return a success object if the file extension  is `.json` and contains top level `locale` and `translations` properties',
       () => {
         const parser = new SimpleJsonTranslationParser();
         expect(parser.analyze('/some/file.json', '{ "locale" : "fr", "translations" : {}}'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
       });

    it('should return a failure object if the file is not a valid format', () => {
      const parser = new SimpleJsonTranslationParser();
      expect(parser.analyze('/some/file.xlf', '')).toEqual(jasmine.objectContaining({
        canParse: false
      }));
      expect(parser.analyze('/some/file.json', '{}')).toEqual(jasmine.objectContaining({
        canParse: false
      }));
      expect(parser.analyze('/some/file.json', '{ "translations" : {} }'))
          .toEqual(jasmine.objectContaining({canParse: false}));
      expect(parser.analyze('/some/file.json', '{ "locale" : "fr" }'))
          .toEqual(jasmine.objectContaining({canParse: false}));
    });
  });

  describe(`parse()`, () => {
    const doParse: (fileName: string, contents: string) => ParsedTranslationBundle =
        (fileName, contents) => {
          const parser = new SimpleJsonTranslationParser();
          const analysis = parser.analyze(fileName, contents);
          if (!analysis.canParse) {
            throw new Error('expected contents to be valid');
          }

          return parser.parse(fileName, contents, analysis.hint);
        };


    it('should extract the locale from the JSON contents', () => {
      const result = doParse('/some/file.json', '{"locale": "en", "translations": {}}');
      expect(result.locale).toEqual('en');
    });

    it('should extract and process the translations from the JSON contents', () => {
      const result = doParse('/some/file.json', `{
        "locale": "fr",
        "translations": {
          "Hello, {$ph_1}!": "Bonjour, {$ph_1}!"
        }
      }`);
      expect(result.translations).toEqual({
        'Hello, {$ph_1}!': {
          text: 'Bonjour, {$ph_1}!',
          messageParts: ɵmakeTemplateObject(['Bonjour, ', '!'], ['Bonjour, ', '!']),
          placeholderNames: ['ph_1']
        },
      });
    });
  });
});
