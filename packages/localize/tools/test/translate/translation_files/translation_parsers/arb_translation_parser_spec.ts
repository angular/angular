/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵmakeTemplateObject} from '../../../../../index';

import {ArbTranslationParser} from '../../../../src/translate/translation_files/translation_parsers/arb_translation_parser';

describe('SimpleArbTranslationParser', () => {
  describe('analyze()', () => {
    it('should return true if the file extension  is `.json` and contains `@@locale` property', () => {
      const parser = new ArbTranslationParser();
      expect(parser.analyze('/some/file.xlf', '').canParse).toBeFalse();
      expect(parser.analyze('/some/file.json', 'xxx').canParse).toBeFalse();
      expect(parser.analyze('/some/file.json', '{ "someKey": "someValue" }').canParse).toBeFalse();
      expect(
        parser.analyze('/some/file.json', '{ "@@locale": "en", "someKey": "someValue" }').canParse,
      ).toBeTrue();
    });
  });

  describe('parse()', () => {
    it('should extract the locale from the JSON contents', () => {
      const parser = new ArbTranslationParser();
      const result = parser.parse('/some/file.json', '{"@@locale": "en"}');
      expect(result.locale).toEqual('en');
    });

    it('should extract and process the translations from the JSON contents', () => {
      const parser = new ArbTranslationParser();
      const result = parser.parse(
        '/some/file.json',
        `{
        "@@locale": "fr",
        "customId": "Bonjour, {$ph_1}!",
        "@customId": {
          "type": "text",
          "description": "Some description"
        }
      }`,
      );
      expect(result.translations).toEqual({
        'customId': {
          text: 'Bonjour, {$ph_1}!',
          messageParts: ɵmakeTemplateObject(['Bonjour, ', '!'], ['Bonjour, ', '!']),
          placeholderNames: ['ph_1'],
        },
      });
    });
  });
});
