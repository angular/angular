/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵmakeTemplateObject} from '@angular/localize';
import {SimpleJsonTranslationParser} from '../../../../src/translate/translation_files/translation_parsers/simple_json_translation_parser';

describe('SimpleJsonTranslationParser', () => {
  describe('canParse()', () => {
    it('should return true if the file extension  is `.json` and contains top level `locale` and `translations` properties',
       () => {
         const parser = new SimpleJsonTranslationParser();
         expect(parser.canParse('/some/file.xlf', '')).toBe(false);
         expect(parser.canParse('/some/file.json', '{}')).toBe(false);
         expect(parser.canParse('/some/file.json', '{ "translations" : {} }')).toBe(false);
         expect(parser.canParse('/some/file.json', '{ "locale" : "fr" }')).toBe(false);
         expect(parser.canParse('/some/file.json', '{ "locale" : "fr", "translations" : {}}'))
             .toBeTruthy();
       });
  });

  describe('parse()', () => {
    it('should extract the locale from the JSON contents', () => {
      const parser = new SimpleJsonTranslationParser();
      const result = parser.parse('/some/file.json', '{"locale": "en", "translations": {}}');
      expect(result.locale).toEqual('en');
    });

    it('should extract and process the translations from the JSON contents', () => {
      const parser = new SimpleJsonTranslationParser();
      const result = parser.parse('/some/file.json', `{
        "locale": "fr",
        "translations": {
          "Hello, {$ph_1}!": "Bonjour, {$ph_1}!"
        }
      }`);
      expect(result.translations).toEqual({
        'Hello, {$ph_1}!': {
          messageParts: ɵmakeTemplateObject(['Bonjour, ', '!'], ['Bonjour, ', '!']),
          placeholderNames: ['ph_1']
        },
      });
    });
  });
});