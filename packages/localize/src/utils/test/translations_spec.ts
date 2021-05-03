/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {computeMsgId, makeParsedTranslation, makeTemplateObject, ParsedTranslation, parseTranslation, TargetMessage, translate} from '..';

describe('utils', () => {
  describe('makeTemplateObject', () => {
    it('should return an array containing the cooked items', () => {
      const template =
          makeTemplateObject(['cooked-a', 'cooked-b', 'cooked-c'], ['raw-a', 'raw-b', 'raw-c']);
      expect(template).toEqual(['cooked-a', 'cooked-b', 'cooked-c']);
    });

    it('should return an array that has a raw property containing the raw items', () => {
      const template =
          makeTemplateObject(['cooked-a', 'cooked-b', 'cooked-c'], ['raw-a', 'raw-b', 'raw-c']);
      expect(template.raw).toEqual(['raw-a', 'raw-b', 'raw-c']);
    });
  });

  describe('makeParsedTranslation()', () => {
    it('should compute a template object from the parts', () => {
      expect(makeParsedTranslation(['a', 'b', 'c'], ['ph1', 'ph2']).messageParts)
          .toEqual(makeTemplateObject(['a', 'b', 'c'], ['a', 'b', 'c']));
    });

    it('should include the placeholder names', () => {
      expect(makeParsedTranslation(['a', 'b', 'c'], ['ph1', 'ph2']).placeholderNames).toEqual([
        'ph1', 'ph2'
      ]);
    });

    it('should compute the message string from the parts and placeholder names', () => {
      expect(makeParsedTranslation(['a', 'b', 'c'], ['ph1', 'ph2']).text)
          .toEqual('a{$ph1}b{$ph2}c');
    });
  });

  describe('parseTranslation', () => {
    it('should extract the messageParts as a TemplateStringsArray', () => {
      const translation = parseTranslation('a{$one}b{$two}c');
      expect(translation.messageParts).toEqual(['a', 'b', 'c']);
      expect(translation.messageParts.raw).toEqual(['a', 'b', 'c']);
    });

    it('should extract the messageParts with leading expression as a TemplateStringsArray', () => {
      const translation = parseTranslation('{$one}a{$two}b');
      expect(translation.messageParts).toEqual(['', 'a', 'b']);
      expect(translation.messageParts.raw).toEqual(['', 'a', 'b']);
    });

    it('should extract the messageParts with trailing expression as a TemplateStringsArray', () => {
      const translation = parseTranslation('a{$one}b{$two}');
      expect(translation.messageParts).toEqual(['a', 'b', '']);
      expect(translation.messageParts.raw).toEqual(['a', 'b', '']);
    });

    it('should extract the messageParts with escaped characters as a TemplateStringsArray', () => {
      const translation = parseTranslation('a{$one}\nb\n{$two}c');
      expect(translation.messageParts).toEqual(['a', '\nb\n', 'c']);
      // `messageParts.raw` are not actually escaped as they are not generally used by `$localize`.
      // See the "escaped placeholders" test below...
      expect(translation.messageParts.raw).toEqual(['a', '\nb\n', 'c']);
    });

    it('should extract the messageParts with escaped placeholders as a TemplateStringsArray',
       () => {
         const translation = parseTranslation('a{$one}:marker:b{$two}c');
         expect(translation.messageParts).toEqual(['a', ':marker:b', 'c']);
         // A `messagePart` that starts with a placeholder marker does get escaped in
         // `messageParts.raw` as this is used by `$localize`.
         expect(translation.messageParts.raw).toEqual(['a', '\\:marker:b', 'c']);
       });

    it('should extract the placeholder names, in order', () => {
      const translation = parseTranslation('a{$one}b{$two}c');
      expect(translation.placeholderNames).toEqual(['one', 'two']);
    });

    it('should handle a translation with no substitutions', () => {
      const translation = parseTranslation('abc');
      expect(translation.messageParts).toEqual(['abc']);
      expect(translation.messageParts.raw).toEqual(['abc']);
      expect(translation.placeholderNames).toEqual([]);
    });

    it('should handle a translation with only substitutions', () => {
      const translation = parseTranslation('{$one}{$two}');
      expect(translation.messageParts).toEqual(['', '', '']);
      expect(translation.messageParts.raw).toEqual(['', '', '']);
      expect(translation.placeholderNames).toEqual(['one', 'two']);
    });
  });

  describe('translate', () => {
    it('should throw an error if there is no matching translation', () => {
      expect(() => doTranslate({}, parts`abc`))
          .toThrowError('No translation found for "2674653928643152084" ("abc").');
      expect(() => doTranslate({}, parts`:@@customId:abc`))
          .toThrowError('No translation found for "customId" ("abc").');
      expect(
          () => doTranslate(
              {}, parts`:␟d42e3c2d3aa340581d42f53c46eb49ecb3d3beb4␟3896949568605777881:abc`))
          .toThrowError(
              'No translation found for "2674653928643152084" ["d42e3c2d3aa340581d42f53c46eb49ecb3d3beb4", "3896949568605777881"] ("abc").');
      expect(() => doTranslate({}, parts`:meaning|:abc`))
          .toThrowError('No translation found for "1071947593002928768" ("abc" - "meaning").');
    });

    it('should throw an error if the translation contains placeholders that are not in the message',
       () => {
         expect(
             () => doTranslate(
                 {'abc{$INTERPOLATION}def': 'a{$PH}bc'}, parts`abc${1 + 2}:INTERPOLATION:def`))
             .toThrowError(
                 `There is a placeholder name mismatch with the translation provided for the message "8986527425650846693" ("abc{$INTERPOLATION}def").\n` +
                 `The translation contains a placeholder with name PH, which does not exist in the message.`);
       });

    it('(with identity translations) should render template literals as-is', () => {
      const translations = {
        'abc': 'abc',
        'abc{$PH}': 'abc{$PH}',
        'abc{$PH}def': 'abc{$PH}def',
        'abc{$PH}def{$PH_1}': 'abc{$PH}def{$PH_1}',
        'Hello, {$PH}!': 'Hello, {$PH}!',
      };
      expect(doTranslate(translations, parts`abc`)).toEqual(parts`abc`);
      expect(doTranslate(translations, parts`abc${1 + 2 + 3}`)).toEqual(parts`abc${1 + 2 + 3}`);
      expect(doTranslate(translations, parts`abc${1 + 2 + 3}def`))
          .toEqual(parts`abc${1 + 2 + 3}def`);
      expect(doTranslate(translations, parts`abc${1 + 2 + 3}def${4 + 5 + 6}`))
          .toEqual(parts`abc${1 + 2 + 3}def${4 + 5 + 6}`);
      const getName = () => 'World';
      expect(doTranslate(translations, parts`Hello, ${getName()}!`))
          .toEqual(parts`Hello, ${'World'}!`);
    });

    it('(with upper-casing translations) should render template literals with messages upper-cased',
       () => {
         const translations = {
           'abc': 'ABC',
           'abc{$PH}': 'ABC{$PH}',
           'abc{$PH}def': 'ABC{$PH}DEF',
           'abc{$PH}def{$PH_1}': 'ABC{$PH}DEF{$PH_1}',
           'Hello, {$PH}!': 'HELLO, {$PH}!',
         };
         expect(doTranslate(translations, parts`abc`)).toEqual(parts`ABC`);
         expect(doTranslate(translations, parts`abc${1 + 2 + 3}`)).toEqual(parts`ABC${1 + 2 + 3}`);
         expect(doTranslate(translations, parts`abc${1 + 2 + 3}def`))
             .toEqual(parts`ABC${1 + 2 + 3}DEF`);
         expect(doTranslate(translations, parts`abc${1 + 2 + 3}def${4 + 5 + 6}`))
             .toEqual(parts`ABC${1 + 2 + 3}DEF${4 + 5 + 6}`);
         const getName = () => 'World';
         expect(doTranslate(translations, parts`Hello, ${getName()}!`))
             .toEqual(parts`HELLO, ${'World'}!`);
       });

    it('(with translations to reverse expressions) should render template literals with expressions reversed',
       () => {
         const translations = {
           'abc{$PH}def{$PH_1} - Hello, {$PH_2}!': 'abc{$PH_2}def{$PH_1} - Hello, {$PH}!',
         };
         const getName = () => 'World';
         expect(doTranslate(
                    translations, parts`abc${1 + 2 + 3}def${4 + 5 + 6} - Hello, ${getName()}!`))
             .toEqual(parts`abc${'World'}def${4 + 5 + 6} - Hello, ${1 + 2 + 3}!`);
       });

    it('(with translations to remove expressions) should render template literals with expressions removed',
       () => {
         const translations = {
           'abc{$PH}def{$PH_1} - Hello, {$PH_2}!': 'abc{$PH} - Hello, {$PH_2}!',
         };
         const getName = () => 'World';
         expect(doTranslate(
                    translations, parts`abc${1 + 2 + 3}def${4 + 5 + 6} - Hello, ${getName()}!`))
             .toEqual(parts`abc${1 + 2 + 3} - Hello, ${'World'}!`);
       });

    function parts(messageParts: TemplateStringsArray, ...substitutions: any[]):
        [TemplateStringsArray, any[]] {
      return [messageParts, substitutions];
    }

    function parseTranslations(translations: Record<string, TargetMessage>):
        Record<string, ParsedTranslation> {
      const parsedTranslations: Record<string, ParsedTranslation> = {};
      Object.keys(translations).forEach(key => {
        parsedTranslations[computeMsgId(key, '')] = parseTranslation(translations[key]);
      });
      return parsedTranslations;
    }

    function doTranslate(
        translations: Record<string, TargetMessage>,
        message: [TemplateStringsArray, any[]]): [TemplateStringsArray, readonly any[]] {
      return translate(parseTranslations(translations), message[0], message[1]);
    }
  });
});
