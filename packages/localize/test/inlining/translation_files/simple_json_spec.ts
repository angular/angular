/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SimpleJsonTranslationParser} from '../../../src/inlining/translation_files/simple_json_translation_parser';
import {makeTemplateObject} from '../../../src/utils/translations';

describe('SimpleJsonTranslationParser', () => {
  describe('canParse()', () => {
    it('should return true if the file extension  is `.json`', () => {
      const parser = new SimpleJsonTranslationParser();
      expect(parser.canParse('/some/file.xlf', '')).toBe(false);
      expect(parser.canParse('/some/file.json', '')).toBe(true);
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
          messageParts: makeTemplateObject(['Bonjour, ', '!'], ['Bonjour, ', '!']),
          placeholderNames: ['ph_1']
        },
      });
    });
  });
});