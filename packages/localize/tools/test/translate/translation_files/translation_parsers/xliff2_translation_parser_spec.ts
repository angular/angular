/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵcomputeMsgId, ɵmakeParsedTranslation} from '@angular/localize';

import {ParseAnalysis, ParsedTranslationBundle} from '../../../../src/translate/translation_files/translation_parsers/translation_parser';
import {Xliff2TranslationParser} from '../../../../src/translate/translation_files/translation_parsers/xliff2_translation_parser';

describe('Xliff2TranslationParser', () => {
  describe('analyze()', () => {
    it('should return true if the file contains an <xliff> element with version="2.0" attribute',
       () => {
         const parser = new Xliff2TranslationParser();
         expect(parser
                    .analyze(
                        '/some/file.xlf',
                        '<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0">')
                    .canParse)
             .toBeTrue();
         expect(parser
                    .analyze(
                        '/some/file.json',
                        '<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0">')
                    .canParse)
             .toBeTrue();
         expect(parser.analyze('/some/file.xliff', '<xliff version="2.0">').canParse).toBeTrue();
         expect(parser.analyze('/some/file.json', '<xliff version="2.0">').canParse).toBeTrue();
         expect(parser.analyze('/some/file.xlf', '<xliff>').canParse).toBeFalse();
         expect(parser.analyze('/some/file.xlf', '<xliff version="1.2">').canParse).toBeFalse();
         expect(parser.analyze('/some/file.xlf', '').canParse).toBeFalse();
         expect(parser.analyze('/some/file.json', '').canParse).toBeFalse();
       });
  });

  describe('analyze', () => {
    it('should return a success object if the file contains an <xliff> element with version="2.0" attribute',
       () => {
         const parser = new Xliff2TranslationParser();
         expect(parser.analyze(
                    '/some/file.xlf',
                    '<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
         expect(parser.analyze(
                    '/some/file.json',
                    '<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
         expect(parser.analyze('/some/file.xliff', '<xliff version="2.0">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
         expect(parser.analyze('/some/file.json', '<xliff version="2.0">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
       });

    it('should return a failure object if the file cannot be parsed as XLIFF 2.0', () => {
      const parser = new Xliff2TranslationParser();
      expect(parser.analyze('/some/file.xlf', '<xliff>')).toEqual(jasmine.objectContaining({
        canParse: false
      }));
      expect(parser.analyze('/some/file.xlf', '<xliff version="1.2">'))
          .toEqual(jasmine.objectContaining({canParse: false}));
      expect(parser.analyze('/some/file.xlf', '')).toEqual(jasmine.objectContaining({
        canParse: false
      }));
      expect(parser.analyze('/some/file.json', '')).toEqual(jasmine.objectContaining({
        canParse: false
      }));
    });

    it('should return a diagnostics object when the file is not a valid format', () => {
      let result: ParseAnalysis<any>;
      const parser = new Xliff2TranslationParser();

      result = parser.analyze('/some/file.xlf', '<moo>');
      expect(result.diagnostics.messages).toEqual([
        {type: 'warning', message: 'The XML file does not contain a <xliff> root node.'}
      ]);

      result = parser.analyze('/some/file.xlf', '<xliff version="1.2">');
      expect(result.diagnostics.messages).toEqual([{
        type: 'warning',
        message:
            'The <xliff> node does not have the required attribute: version="2.0". ("[WARNING ->]<xliff version="1.2">"): /some/file.xlf@0:0'
      }]);

      result = parser.analyze('/some/file.xlf', '<xliff version="2.0"></file>');
      expect(result.diagnostics.messages).toEqual([{
        type: 'error',
        message:
            'Unexpected closing tag "file". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags ("<xliff version="2.0">[ERROR ->]</file>"): /some/file.xlf@0:21'
      }]);
    });
  });

  describe(`parse()`, () => {
    const doParse: (fileName: string, XLIFF: string) => ParsedTranslationBundle =
        (fileName, XLIFF) => {
          const parser = new Xliff2TranslationParser();
          const analysis = parser.analyze(fileName, XLIFF);
          if (!analysis.canParse) {
            throw new Error('expected XLIFF to be valid');
          }
          return parser.parse(fileName, XLIFF, analysis.hint);
        };

    const expectToFail:
        (fileName: string, XLIFF: string, errorMatcher: RegExp, diagnosticMessage: string) => void =
            (fileName, XLIFF, _errorMatcher, diagnosticMessage) => {
              const result = doParse(fileName, XLIFF);
              expect(result.diagnostics.messages.length).toBeGreaterThan(0);
              expect(result.diagnostics.messages.pop()!.message).toEqual(diagnosticMessage);
            };

    it('should extract the locale from the file contents', () => {
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.locale).toEqual('fr');
    });

    it('should return undefined locale if there is no locale in the file', () => {
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
                  <file original="ng.template" id="ngi18n">
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.locale).toBeUndefined();
    });

    it('should extract basic messages', () => {
      /**
       * Source HTML:
       *
       * ```
       * <div i18n>translatable attribute</div>
       * ```
       */
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                    <unit id="1933478729560469763">
                      <notes>
                        <note category="location">file.ts:2</note>
                      </notes>
                      <segment>
                        <source>translatable attribute</source>
                        <target>etubirtta elbatalsnart</target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.translations[ɵcomputeMsgId('translatable attribute', '')])
          .toEqual(ɵmakeParsedTranslation(['etubirtta elbatalsnart']));
    });

    it('should extract translations with simple placeholders', () => {
      /**
       * Source HTML:
       *
       * ```
       * <div i18n>translatable element <b>with placeholders</b> {{ interpolation}}</div>
       * ```
       */
      const XLIFF = [
        `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">`,
        `  <file original="ng.template" id="ngi18n">`,
        `    <unit id="6949438802869886378">`,
        `      <notes>`,
        `        <note category="location">file.ts:3</note>`,
        `      </notes>`,
        `      <segment>`,
        `        <source>translatable element <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">with placeholders</pc> <ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/></source>`,
        `        <target><ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/> tnemele elbatalsnart <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">sredlohecalp htiw</pc></target>`,
        `      </segment>`,
        `    </unit>`,
        `  </file>`,
        `</xliff>`,
      ].join('\n');
      const result = doParse('/some/file.xlf', XLIFF);
      expect(
          result.translations[ɵcomputeMsgId(
              'translatable element {$START_BOLD_TEXT}with placeholders{$CLOSE_BOLD_TEXT} {$INTERPOLATION}')])
          .toEqual(ɵmakeParsedTranslation(
              ['', ' tnemele elbatalsnart ', 'sredlohecalp htiw', ''],
              ['INTERPOLATION', 'START_BOLD_TEXT', 'CLOSE_BOLD_TEXT']));
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
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                    <unit id="9051630253697141670">
                      <notes>
                        <note category="location">file.ts:3</note>
                      </notes>
                      <segment>
                        <source>translatable <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span&gt;"
                        dispEnd="&lt;/span&gt;">element <pc id="1" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;"
                         dispEnd="&lt;/b&gt;">with placeholders</pc></pc>
                          <ph id="2" equiv="INTERPOLATION" disp="{{ interpolation}}"/></source><target><pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="fmt" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;"><ph id="2" equiv="INTERPOLATION" disp="{{ interpolation}}"/> tnemele</pc> elbatalsnart <pc id="1" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">sredlohecalp htiw</pc></target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
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
      /**
       * Source HTML:
       *
       * ```
       * <div i18n>{VAR_PLURAL, plural, =0 {<p>test</p>} }</div>
       * ```
       */
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                    <unit id="2874455947211586270">
                      <notes>
                        <note category="location">file.ts:4</note>
                      </notes>
                      <segment>
                        <source>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">test</pc>} }</source>
                        <target>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">TEST</pc>} }</target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.translations[ɵcomputeMsgId(
                 '{VAR_PLURAL, plural, =0 {{START_PARAGRAPH}test{CLOSE_PARAGRAPH}}}')])
          .toEqual(ɵmakeParsedTranslation(
              ['{VAR_PLURAL, plural, =0 {{START_PARAGRAPH}TEST{CLOSE_PARAGRAPH}}}'], []));
    });

    it('should extract translations with duplicate source messages', () => {
      /**
       * Source HTML:
       *
       * ```
       * <div i18n>foo</div>
       * <div i18n="m|d@@i">foo</div>
       * <div i18=""m|d@@bar>foo</div>
       * ```
       */
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                    <unit id="9205907420411818817">
                      <notes>
                        <note category="description">d</note>
                        <note category="meaning">m</note>
                        <note category="location">file.ts:5</note>
                      </notes>
                      <segment>
                        <source>foo</source>
                        <target>oof</target>
                      </segment>
                    </unit>
                    <unit id="i">
                      <notes>
                        <note category="description">d</note>
                        <note category="meaning">m</note>
                        <note category="location">file.ts:5</note>
                      </notes>
                      <segment>
                        <source>foo</source>
                        <target>toto</target>
                      </segment>
                    </unit>
                    <unit id="bar">
                      <notes>
                        <note category="description">d</note>
                        <note category="meaning">m</note>
                        <note category="location">file.ts:5</note>
                      </notes>
                      <segment>
                        <source>foo</source>
                        <target>tata</target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.translations[ɵcomputeMsgId('foo')]).toEqual(ɵmakeParsedTranslation(['oof']));
      expect(result.translations['i']).toEqual(ɵmakeParsedTranslation(['toto']));
      expect(result.translations['bar']).toEqual(ɵmakeParsedTranslation(['tata']));
    });

    it('should extract translations with only placeholders, which are re-ordered', () => {
      /**
       * Source HTML:
       *
       * ```
       * <div i18n><br><img/><img/></div>
       * ```
       */
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                    <unit id="7118057989405618448">
                      <notes>
                        <note category="description">ph names</note>
                        <note category="location">file.ts:7</note>
                      </notes>
                      <segment>
                        <source><ph id="0" equiv="LINE_BREAK" type="fmt" disp="&lt;br/&gt;"/><ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/></source>
                        <target><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/><ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="0" equiv="LINE_BREAK" type="fmt" disp="&lt;br/&gt;"/></target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
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
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                    <unit id="2826198357052921524">
                      <notes>
                        <note category="description">empty element</note>
                        <note category="location">file.ts:8</note>
                      </notes>
                      <segment>
                        <source>hello <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;"></pc></source>
                        <target></target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.translations[ɵcomputeMsgId('hello {$START_TAG_SPAN}{$CLOSE_TAG_SPAN}')])
          .toEqual(ɵmakeParsedTranslation(['']));
    });

    it('should extract translations with deeply nested ICUs', () => {
      /**
       * Source HTML:
       *
       * ```
       * Test: { count, plural, =0 { { sex, select, other {<p>deeply nested</p>}} }
       * =other {a lot}}
       * ```
       *
       * Note that the message gets split into two translation units:
       *  * The first one contains the outer message with an `ICU` placeholder
       *  * The second one is the ICU expansion itself
       *
       * Note that special markers `VAR_PLURAL` and `VAR_SELECT` are added, which are then
       * replaced by IVY at runtime with the actual values being rendered by the ICU
       * expansion.
       */
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                    <unit id="980940425376233536">
                      <notes>
                        <note category="location">file.ts:10</note>
                      </notes>
                      <segment>
                        <source>Test: <ph id="0" equiv="ICU" disp="{ count, plural, =0 {...} =other {...}}"/></source>
                        <target>Le test: <ph id="0" equiv="ICU" disp="{ count, plural, =0 {...} =other {...}}"/></target>
                      </segment>
                    </unit>
                    <unit id="5207293143089349404">
                      <notes>
                        <note category="location">file.ts:10</note>
                      </notes>
                      <segment>
                        <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>}}} =other {a lot}}</source>
                        <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">profondément imbriqué</pc>}}} =other {beaucoup}}</target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
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
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                    <unit id="2340165783990709777">
                      <notes>
                        <note category="location">file.ts:11,12</note>
                      </notes>
                      <segment>
                        <source>multi\nlines</source>
                        <target>multi\nlignes</target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.translations[ɵcomputeMsgId('multi\nlines')])
          .toEqual(ɵmakeParsedTranslation(['multi\nlignes']));
    });

    it('should extract translations with <mrk> elements', () => {
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="ngi18n">
                    <unit id="mrk-test">
                      <segment>
                        <source>First sentence.</source>
                        <target>Translated <mrk id="m1" type="comment" ref="#n1">first sentence</mrk>.</target>
                      </segment>
                    </unit>
                    <unit id="mrk-test2">
                      <segment>
                        <source>First sentence. Second sentence.</source>
                        <target>Translated <mrk id="m1" type="comment" ref="#n1"><mrk id="m2" type="comment" ref="#n1">first</mrk> sentence</mrk>.</target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.translations['mrk-test'])
          .toEqual(ɵmakeParsedTranslation(['Translated first sentence.']));
      expect(result.translations['mrk-test2'])
          .toEqual(ɵmakeParsedTranslation(['Translated first sentence.']));
    });

    it('should merge messages from each `<file>` element', () => {
      /**
       * Source HTML:
       *
       * ```
       * <div i18n>translatable attribute</div>
       * ```
       *
       * ```
       * <div i18n>translatable element <b>with placeholders</b> {{ interpolation}}</div>
       * ```
       */
      const XLIFF = `
                <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
                  <file original="ng.template" id="file-1">
                    <unit id="1933478729560469763">
                      <notes>
                        <note category="location">file.ts:2</note>
                      </notes>
                      <segment>
                        <source>translatable attribute</source>
                        <target>etubirtta elbatalsnart</target>
                      </segment>
                    </unit>
                  </file>
                  <file original="ng.template" id="file-2">
                    <unit id="5057824347511785081">
                      <notes>
                        <note category="location">file.ts:3</note>
                      </notes>
                      <segment>
                        <source>translatable element <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">with placeholders</pc> <ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/></source>
                        <target><ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/> tnemele elbatalsnart <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">sredlohecalp htiw</pc></target>
                      </segment>
                    </unit>
                  </file>
                </xliff>
              `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.translations[ɵcomputeMsgId('translatable attribute', '')])
          .toEqual(ɵmakeParsedTranslation(['etubirtta elbatalsnart']));
      expect(
          result.translations[ɵcomputeMsgId(
              'translatable element {$START_BOLD_TEXT}with placeholders{$LOSE_BOLD_TEXT} {$INTERPOLATION}')])
          .toEqual(ɵmakeParsedTranslation(
              ['', ' tnemele elbatalsnart ', 'sredlohecalp htiw', ''],
              ['INTERPOLATION', 'START_BOLD_TEXT', 'CLOSE_BOLD_TEXT']));
    });

    describe('[structure errors]', () => {
      it('should provide a diagnostic warning when a trans-unit has no translation target but does have a source',
         () => {
           const XLIFF = [
             `<?xml version="1.0" encoding="UTF-8" ?>`,
             `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">`,
             `  <file original="ng.template" id="ngi18n">`,
             `    <unit id="missingtarget">`,
             `      <segment>`,
             `        <source/>`,
             `      </segment>`,
             `    </unit>`,
             `  </file>`,
             `</xliff>`,
           ].join('\n');

           const result = doParse('/some/file.xlf', XLIFF);
           expect(result.diagnostics.messages.length).toEqual(1);
           expect(result.diagnostics.messages[0].message).toEqual([
             `Missing <target> element ("`,
             `  <file original="ng.template" id="ngi18n">`,
             `    <unit id="missingtarget">`,
             `      [WARNING ->]<segment>`,
             `        <source/>`,
             `      </segment>`,
             `"): /some/file.xlf@4:6`,
           ].join('\n'));
         });

      it('should provide a diagnostic error when a trans-unit has no translation target nor source',
         () => {
           const XLIFF = [
             `<?xml version="1.0" encoding="UTF-8" ?>`,
             `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">`,
             `  <file original="ng.template" id="ngi18n">`,
             `    <unit id="missingtarget">`,
             `      <segment>`,
             `      </segment>`,
             `    </unit>`,
             `  </file>`,
             `</xliff>`,
           ].join('\n');

           expectToFail(
               '/some/file.xlf', XLIFF,
               /Missing required element: one of <target> or <source> is required/, [
                 `Missing required element: one of <target> or <source> is required ("`,
                 `  <file original="ng.template" id="ngi18n">`,
                 `    <unit id="missingtarget">`,
                 `      [ERROR ->]<segment>`,
                 `      </segment>`,
                 `    </unit>`,
                 `"): /some/file.xlf@4:6`,
               ].join('\n'));
         });


      it('should provide a diagnostic error when a trans-unit has no id attribute', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">`,
          `  <file original="ng.template" id="ngi18n">`,
          `    <unit>`,
          `      <segment>`,
          `        <source/>`,
          `        <target/>`,
          `      </segment>`,
          `    </unit>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');

        expectToFail('/some/file.xlf', XLIFF, /Missing required "id" attribute/, [
          `Missing required "id" attribute on <trans-unit> element. ("s:tc:xliff:document:2.0" srcLang="en" trgLang="fr">`,
          `  <file original="ng.template" id="ngi18n">`,
          `    [ERROR ->]<unit>`,
          `      <segment>`,
          `        <source/>`,
          `"): /some/file.xlf@3:4`,
        ].join('\n'));
      });

      it('should provide a diagnostic error on duplicate trans-unit id', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">`,
          `  <file original="ng.template" id="ngi18n">`,
          `    <unit id="deadbeef">`,
          `      <segment>`,
          `        <source/>`,
          `        <target/>`,
          `      </segment>`,
          `    </unit>`,
          `    <unit id="deadbeef">`,
          `      <segment>`,
          `        <source/>`,
          `        <target/>`,
          `      </segment>`,
          `    </unit>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');

        expectToFail('/some/file.xlf', XLIFF, /Duplicated translations for message "deadbeef"/, [
          `Duplicated translations for message "deadbeef" ("`,
          `      </segment>`,
          `    </unit>`,
          `    [ERROR ->]<unit id="deadbeef">`,
          `      <segment>`,
          `        <source/>`,
          '"): /some/file.xlf@9:4',
        ].join('\n'));
      });
    });

    describe('[message errors]', () => {
      it('should provide a diagnostic error on unknown message tags', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">`,
          `  <file original="ng.template" id="ngi18n">`,
          `    <unit id="deadbeef">`,
          `      <segment>`,
          `        <source/>`,
          `        <target><b>msg should contain only ph and pc tags</b></target>`,
          `      </segment>`,
          `    </unit>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');

        expectToFail('/some/file.xlf', XLIFF, /Invalid element found in message/, [
          `Error: Invalid element found in message.`,
          `At /some/file.xlf@6:16:`,
          `...`,
          `        <source/>`,
          `        <target>[ERROR ->]<b>msg should contain only ph and pc tags</b></target>`,
          `      </segment>`,
          `...`,
          ``,
        ].join('\n'));
      });

      it('should provide a diagnostic error when a placeholder misses an id attribute', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">`,
          `  <file original="ng.template" id="ngi18n">`,
          `    <unit id="deadbeef">`,
          `      <segment>`,
          `        <source/>`,
          `        <target><ph/></target>`,
          `      </segment>`,
          `    </unit>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');

        expectToFail('/some/file.xlf', XLIFF, /Missing required "equiv" attribute/, [
          `Error: Missing required "equiv" attribute:`,
          `At /some/file.xlf@6:16:`,
          `...`,
          `        <source/>`,
          `        <target>[ERROR ->]<ph/></target>`,
          `      </segment>`,
          `...`,
          ``,
        ].join('\n'));
      });
    });
  });
});
