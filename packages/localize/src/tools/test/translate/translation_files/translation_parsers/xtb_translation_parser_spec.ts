/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵcomputeMsgId, ɵmakeParsedTranslation} from '@angular/localize';
import {ParseAnalysis, ParsedTranslationBundle} from '../../../../src/translate/translation_files/translation_parsers/translation_parser';
import {XtbTranslationParser} from '../../../../src/translate/translation_files/translation_parsers/xtb_translation_parser';

describe('XtbTranslationParser', () => {
  describe('canParse()', () => {
    it('should return true if the file extension is `.xtb` or `.xmb` and it contains the `<translationbundle>` tag',
       () => {
         const parser = new XtbTranslationParser();
         expect(parser.canParse('/some/file.xtb', '<translationbundle>')).toBeTruthy();
         expect(parser.canParse('/some/file.xmb', '<translationbundle>')).toBeTruthy();
         expect(parser.canParse('/some/file.xtb', '<translationbundle lang="en">')).toBeTruthy();
         expect(parser.canParse('/some/file.xmb', '<translationbundle lang="en">')).toBeTruthy();
         expect(parser.canParse('/some/file.json', '<translationbundle>')).toBe(false);
         expect(parser.canParse('/some/file.xmb', '')).toBe(false);
         expect(parser.canParse('/some/file.xtb', '')).toBe(false);
       });
  });

  describe('analyze()', () => {
    it('should return a success object if the file extension is `.xtb` or `.xmb` and it contains the `<translationbundle>` tag',
       () => {
         const parser = new XtbTranslationParser();
         expect(parser.analyze('/some/file.xtb', '<translationbundle>'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
         expect(parser.analyze('/some/file.xmb', '<translationbundle>'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
         expect(parser.analyze('/some/file.xtb', '<translationbundle lang="en">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
         expect(parser.analyze('/some/file.xmb', '<translationbundle lang="en">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
       });

    it('should return a failure object if the file is not valid XTB', () => {
      const parser = new XtbTranslationParser();
      expect(parser.analyze('/some/file.json', '<translationbundle>'))
          .toEqual(jasmine.objectContaining({canParse: false}));
      expect(parser.analyze('/some/file.xmb', '')).toEqual(jasmine.objectContaining({
        canParse: false
      }));
      expect(parser.analyze('/some/file.xtb', '')).toEqual(jasmine.objectContaining({
        canParse: false
      }));
    });

    it('should return a diagnostics object when the file is not a valid format', () => {
      let results: ParseAnalysis<any>;
      const parser = new XtbTranslationParser();

      results = parser.analyze('/some/file.xtb', '<moo>');
      expect(results.diagnostics.messages).toEqual([
        {type: 'warning', message: 'The XML file does not contain a <translationbundle> root node.'}
      ]);

      results = parser.analyze('/some/file.xtb', '<translationbundle></translation>');
      expect(results.diagnostics.messages).toEqual([{
        type: 'error',
        message:
            'Unexpected closing tag "translation". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags ("<translationbundle>[ERROR ->]</translation>"): /some/file.xtb@0:19'
      }]);
    });
  });

  for (const withHint of [true, false]) {
    describe(`parse() [${withHint ? 'with' : 'without'} hint]`, () => {
      const doParse: (fileName: string, XTB: string) => ParsedTranslationBundle =
          withHint ? (fileName, XTB) => {
            const parser = new XtbTranslationParser();
            const hint = parser.canParse(fileName, XTB);
            if (!hint) {
              throw new Error('expected XTB to be valid');
            }
            return parser.parse(fileName, XTB, hint);
          } : (fileName, XTB) => {
            const parser = new XtbTranslationParser();
            return parser.parse(fileName, XTB);
          };

      const expectToFail:
          (fileName: string, XLIFF: string, errorMatcher: RegExp, diagnosticMessage: string) =>
              void = withHint ? (fileName, XLIFF, _errorMatcher, diagnosticMessage) => {
                const result = doParse(fileName, XLIFF);
                expect(result.diagnostics.messages.length).toEqual(1);
                expect(result.diagnostics.messages[0].message).toEqual(diagnosticMessage);
              } : (fileName, XLIFF, errorMatcher, _diagnosticMessage) => {
                expect(() => doParse(fileName, XLIFF)).toThrowError(errorMatcher);
              };

      it('should extract the locale from the file contents', () => {
        const XTB = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<translationbundle lang='fr'>`,
          `  <translation id="8841459487341224498">rab</translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XTB);
        expect(result.locale).toEqual('fr');
      });

      it('should extract basic messages', () => {
        const XTB = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<!DOCTYPE translationbundle [`,
          `  <!ELEMENT translationbundle (translation)*>`,
          `  <!ATTLIST translationbundle lang CDATA #REQUIRED>`,
          ``,
          `  <!ELEMENT translation (#PCDATA|ph)*>`,
          `  <!ATTLIST translation id CDATA #REQUIRED>`,
          ``,
          `  <!ELEMENT ph EMPTY>`,
          `  <!ATTLIST ph name CDATA #REQUIRED>`,
          `]>`,
          `<translationbundle>`,
          `  <translation id="8841459487341224498">rab</translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XTB);

        expect(result.translations['8841459487341224498']).toEqual(ɵmakeParsedTranslation(['rab']));
      });

      it('should extract translations with simple placeholders', () => {
        const XTB = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<translationbundle>`,
          `  <translation id="8877975308926375834"><ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/></translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XTB);

        expect(result.translations['8877975308926375834'])
            .toEqual(
                ɵmakeParsedTranslation(['', 'rab', ''], ['START_PARAGRAPH', 'CLOSE_PARAGRAPH']));
      });

      it('should extract nested placeholder containers (i.e. nested HTML elements)', () => {
        /**
         * Source HTML:
         *
         * ```
         * <div i18n>
         *   translatable <span>element <b>with placeholders</b></span> {{ interpolation}}
         * </div>
         * ```
         */
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<translationbundle>`,
          `  <translation id="9051630253697141670">` +
              `<ph name="START_TAG_SPAN"/><ph name="INTERPOLATION"/> tnemele<ph name="CLOSE_TAG_SPAN"/> elbatalsnart <ph name="START_BOLD_TEXT"/>sredlohecalp htiw<ph name="CLOSE_BOLD_TEXT"/>` +
              `</translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XLIFF);
        expect(result.translations[ɵcomputeMsgId(
                   'translatable {$START_TAG_SPAN}element {$START_BOLD_TEXT}with placeholders' +
                   '{$CLOSE_BOLD_TEXT}{$CLOSE_TAG_SPAN} {$INTERPOLATION}')])
            .toEqual(ɵmakeParsedTranslation(
                ['', '', ' tnemele', ' elbatalsnart ', 'sredlohecalp htiw', ''], [
                  'START_TAG_SPAN',
                  'INTERPOLATION',
                  'CLOSE_TAG_SPAN',
                  'START_BOLD_TEXT',
                  'CLOSE_BOLD_TEXT',
                ]));
      });

      it('should extract translations with simple ICU expressions', () => {
        const XTB = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<translationbundle>`,
          `  <translation id="7717087045075616176">*<ph name="ICU"/>*</translation>`,
          `  <translation id="5115002811911870583">{VAR_PLURAL, plural, =1 {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}}</translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XTB);

        expect(result.translations['7717087045075616176'])
            .toEqual(ɵmakeParsedTranslation(['*', '*'], ['ICU']));
        expect(result.translations['5115002811911870583'])
            .toEqual(ɵmakeParsedTranslation(
                ['{VAR_PLURAL, plural, =1 {{START_PARAGRAPH}rab{CLOSE_PARAGRAPH}}}'], []));
      });

      it('should extract translations with duplicate source messages', () => {
        const XTB = [
          `<translationbundle>`,
          `  <translation id="9205907420411818817">oof</translation>`,
          `  <translation id="i">toto</translation>`,
          `  <translation id="bar">tata</translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XTB);

        expect(result.translations[ɵcomputeMsgId('foo')]).toEqual(ɵmakeParsedTranslation(['oof']));
        expect(result.translations['i']).toEqual(ɵmakeParsedTranslation(['toto']));
        expect(result.translations['bar']).toEqual(ɵmakeParsedTranslation(['tata']));
      });

      it('should extract translations with only placeholders, which are re-ordered', () => {
        const XTB = [
          `<translationbundle>`,
          `  <translation id="7118057989405618448"><ph name="TAG_IMG_1"/><ph name="TAG_IMG"/><ph name="LINE_BREAK"/></translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XTB);

        expect(result.translations[ɵcomputeMsgId('{$LINE_BREAK}{$TAG_IMG}{$TAG_IMG_1}')])
            .toEqual(
                ɵmakeParsedTranslation(['', '', '', ''], ['TAG_IMG_1', 'TAG_IMG', 'LINE_BREAK']));
      });

      it('should extract translations with empty target', () => {
        /**
         * Source HTML:
         *
         * ```
         * <div i18n>hello <span></span></div>
         * ```
         */
        const XTB = [
          `<translationbundle>`,
          `  <translation id="2826198357052921524"></translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XTB);

        expect(result.translations[ɵcomputeMsgId('hello {$START_TAG_SPAN}{$CLOSE_TAG_SPAN}')])
            .toEqual(ɵmakeParsedTranslation(['']));
      });

      it('should extract translations with deeply nested ICUs', () => {
        /**
         * Source HTML:
         *
         * ```
         * Test: { count, plural, =0 { { sex, select, other {<p>deeply nested</p>}} } =other {a
         lot}}
         * ```
         *
         * Note that the message gets split into two translation units:
         *  * The first one contains the outer message with an `ICU` placeholder
         *  * The second one is the ICU expansion itself
         *
         * Note that special markers `VAR_PLURAL` and `VAR_SELECT` are added, which are then
         replaced by IVY at runtime with the actual values being rendered by the ICU expansion.
         */
        const XTB = [
          `<translationbundle>`,
          `  <translation id="980940425376233536">Le test: <ph name="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></translation>`,
          `  <translation id="5207293143089349404">{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<ph name="START_PARAGRAPH"/>profondément imbriqué<ph name="CLOSE_PARAGRAPH"/>}}} =other {beaucoup}}</translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XTB);

        expect(result.translations[ɵcomputeMsgId('Test: {$ICU}')])
            .toEqual(ɵmakeParsedTranslation(['Le test: ', ''], ['ICU']));

        expect(
            result.translations[ɵcomputeMsgId(
                '{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {{START_PARAGRAPH}deeply nested{CLOSE_PARAGRAPH}}}} =other {beaucoup}}')])
            .toEqual(ɵmakeParsedTranslation([
              '{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {{START_PARAGRAPH}profondément imbriqué{CLOSE_PARAGRAPH}}}} =other {beaucoup}}'
            ]));
      });

      it('should extract translations containing multiple lines', () => {
        /**
         * Source HTML:
         *
         * ```
         * <div i18n>multi
         * lines</div>
         * ```
         */
        const XTB = [
          `<translationbundle>`,
          `  <translation id="2340165783990709777">multi\nlignes</translation>`,
          `</translationbundle>`,
        ].join('\n');
        const result = doParse('/some/file.xtb', XTB);

        expect(result.translations[ɵcomputeMsgId('multi\nlines')])
            .toEqual(ɵmakeParsedTranslation(['multi\nlignes']));
      });

      it('should warn on unrecognised ICU messages', () => {
        // See https://github.com/angular/angular/issues/14046

        const XTB = [
          `<translationbundle>`,
          `  <translation id="valid">This is a valid message</translation>`,
          `  <translation id="invalid">{REGION_COUNT_1, plural, =0 {unused plural form} =1 {1 region} other {{REGION_COUNT_2} regions}}</translation>`,
          `</translationbundle>`,
        ].join('\n');

        // Parsing the file should not fail
        const result = doParse('/some/file.xtb', XTB);

        // We should be able to read the valid message
        expect(result.translations['valid'])
            .toEqual(ɵmakeParsedTranslation(['This is a valid message']));

        // Trying to access the invalid message should fail
        expect(result.translations['invalid']).toBeUndefined();
        expect(result.diagnostics.messages).toContain({
          type: 'warning',
          message: [
            `Could not parse message with id "invalid" - perhaps it has an unrecognised ICU format?`,
            `Unexpected character "EOF" (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.) ("id">{REGION_COUNT_1, plural, =0 {unused plural form} =1 {1 region} other {{REGION_COUNT_2} regions}}[ERROR ->]</translation>`,
            `</translationbundle>"): /some/file.xtb@2:124`,
            `Invalid ICU message. Missing '}'. ("n>`,
            `  <translation id="invalid">{REGION_COUNT_1, plural, =0 {unused plural form} =1 {1 region} other [ERROR ->]{{REGION_COUNT_2} regions}}</translation>`,
            `</translationbundle>"): /some/file.xtb@2:97`,
          ].join('\n')
        });
      });

      describe('[structure errors]', () => {
        it('should throw when there are nested translationbundle tags', () => {
          const XTB =
              '<translationbundle><translationbundle></translationbundle></translationbundle>';

          expectToFail(
              '/some/file.xtb', XTB, /Failed to parse "\/some\/file.xtb" as XMB\/XTB format/,
              `Unexpected <translationbundle> tag. ("<translationbundle>[ERROR ->]<translationbundle></translationbundle></translationbundle>"): /some/file.xtb@0:19`);
        });

        it('should throw when a translation has no id attribute', () => {
          const XTB = [
            `<translationbundle>`,
            `  <translation></translation>`,
            `</translationbundle>`,
          ].join('\n');

          expectToFail('/some/file.xtb', XTB, /Missing required "id" attribute/, [
            `Missing required "id" attribute on <translation> element. ("<translationbundle>`,
            `  [ERROR ->]<translation></translation>`,
            `</translationbundle>"): /some/file.xtb@1:2`,
          ].join('\n'));
        });

        it('should throw on duplicate translation id', () => {
          const XTB = [
            `<translationbundle>`,
            `  <translation id="deadbeef"></translation>`,
            `  <translation id="deadbeef"></translation>`,
            `</translationbundle>`,
          ].join('\n');

          expectToFail('/some/file.xtb', XTB, /Duplicated translations for message "deadbeef"/, [
            `Duplicated translations for message "deadbeef" ("<translationbundle>`,
            `  <translation id="deadbeef"></translation>`,
            `  [ERROR ->]<translation id="deadbeef"></translation>`,
            `</translationbundle>"): /some/file.xtb@2:2`,
          ].join('\n'));
        });
      });

      describe('[message errors]', () => {
        it('should throw on unknown message tags', () => {
          const XTB = [
            `<translationbundle>`,
            `  <translation id="deadbeef">`,
            `    <source/>`,
            `  </translation>`,
            `</translationbundle>`,
          ].join('\n');

          expectToFail('/some/file.xtb', XTB, /Invalid element found in message/, [
            `Error: Invalid element found in message.`,
            `At /some/file.xtb@2:4:`,
            `...`,
            `  <translation id="deadbeef">`,
            `    [ERROR ->]<source/>`,
            `  </translation>`,
            `...`,
            ``,
          ].join('\n'));
        });

        it('should throw when a placeholder misses a name attribute', () => {
          const XTB = [
            `<translationbundle>`,
            `  <translation id="deadbeef"><ph/></translation>`,
            `</translationbundle>`,
          ].join('\n');

          expectToFail('/some/file.xtb', XTB, /required "name" attribute/gi, [
            `Error: Missing required "name" attribute:`,
            `At /some/file.xtb@1:29:`,
            `...<translationbundle>`,
            `  <translation id="deadbeef">[ERROR ->]<ph/></translation>`,
            `</translationbundle>...`,
            ``,
          ].join('\n'));
        });
      });
    });
  }
});
