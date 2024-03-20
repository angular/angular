/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵcomputeMsgId, ɵmakeParsedTranslation} from '@angular/localize';

import {ParseAnalysis, ParsedTranslationBundle} from '../../../../src/translate/translation_files/translation_parsers/translation_parser';
import {Xliff1TranslationParser} from '../../../../src/translate/translation_files/translation_parsers/xliff1_translation_parser';

describe('Xliff1TranslationParser', () => {
  describe('analyze()', () => {
    it('should return true only if the file contains an <xliff> element with version="1.2" attribute',
       () => {
         const parser = new Xliff1TranslationParser();
         expect(parser
                    .analyze(
                        '/some/file.xlf',
                        '<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">')
                    .canParse)
             .toBeTrue();
         expect(parser
                    .analyze(
                        '/some/file.json',
                        '<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">')
                    .canParse)
             .toBeTrue();
         expect(parser.analyze('/some/file.xliff', '<xliff version="1.2">').canParse).toBeTrue();
         expect(parser.analyze('/some/file.json', '<xliff version="1.2">').canParse).toBeTrue();
         expect(parser.analyze('/some/file.xlf', '<xliff>').canParse).toBeFalse();
         expect(parser.analyze('/some/file.xlf', '<xliff version="2.0">').canParse).toBeFalse();
         expect(parser.analyze('/some/file.xlf', '').canParse).toBeFalse();
         expect(parser.analyze('/some/file.json', '').canParse).toBeFalse();
       });
  });

  describe('analyze()', () => {
    it('should return a success object if the file contains an <xliff> element with version="1.2" attribute',
       () => {
         const parser = new Xliff1TranslationParser();
         expect(parser.analyze('/some/file.xlf', '<xliff version="1.2">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
         expect(parser.analyze('/some/file.json', '<xliff version="1.2">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
         expect(parser.analyze('/some/file.xliff', '<xliff version="1.2">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
         expect(parser.analyze('/some/file.json', '<xliff version="1.2">'))
             .toEqual(jasmine.objectContaining({canParse: true, hint: jasmine.any(Object)}));
       });

    it('should return a failure object if the file cannot be parsed as XLIFF 1.2', () => {
      const parser = new Xliff1TranslationParser();
      expect(parser.analyze('/some/file.xlf', '<xliff>')).toEqual(jasmine.objectContaining({
        canParse: false
      }));
      expect(parser.analyze('/some/file.xlf', '<xliff version="2.0">'))
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
      const parser = new Xliff1TranslationParser();

      result = parser.analyze('/some/file.xlf', '<moo>');
      expect(result.diagnostics.messages).toEqual([
        {type: 'warning', message: 'The XML file does not contain a <xliff> root node.'}
      ]);

      result = parser.analyze('/some/file.xlf', '<xliff version="2.0">');
      expect(result.diagnostics.messages).toEqual([{
        type: 'warning',
        message:
            'The <xliff> node does not have the required attribute: version="1.2". ("[WARNING ->]<xliff version="2.0">"): /some/file.xlf@0:0'
      }]);

      result = parser.analyze('/some/file.xlf', '<xliff version="1.2"></file>');
      expect(result.diagnostics.messages).toEqual([{
        type: 'error',
        message:
            'Unexpected closing tag "file". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags ("<xliff version="1.2">[ERROR ->]</file>"): /some/file.xlf@0:21'
      }]);
    });
  });

  describe(`parse()`, () => {
    const doParse: (fileName: string, XLIFF: string) => ParsedTranslationBundle =
        (fileName, XLIFF) => {
          const parser = new Xliff1TranslationParser();
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

    it('should extract the locale from the last `<file>` element to contain a `target-language` attribute',
       () => {
         const XLIFF = `
            <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
             <file source-language="en" datatype="plaintext" original="ng2.template">
               <body></body>
             </file>
             <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
               <body></body>
             </file>
             <file source-language="en" datatype="plaintext" original="ng2.template">
               <body></body>
             </file>
             <file source-language="en" target-language="de" datatype="plaintext" original="ng2.template">
               <body></body>
             </file>
             <file source-language="en" datatype="plaintext" original="ng2.template">
               <body></body>
             </file>
           </xliff>
           `;
         const result = doParse('/some/file.xlf', XLIFF);
         expect(result.locale).toEqual('de');
       });

    it('should return an undefined locale if there is no locale in the file', () => {
      const XLIFF = `
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" datatype="plaintext" original="ng2.template">
            <body>
            </body>
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
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="1933478729560469763" datatype="html">
                <source>translatable attribute</source>
                <target>etubirtta elbatalsnart</target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">1</context>
                </context-group>
              </trans-unit>
            </body>
          </file>
        </xliff>
      `;
      const result = doParse('/some/file.xlf', XLIFF);

      expect(result.translations[ɵcomputeMsgId('translatable attribute')])
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
      const XLIFF = `
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="5057824347511785081" datatype="html">
                <source>translatable element <x id="START_BOLD_TEXT" ctype="b"/>with placeholders<x id="CLOSE_BOLD_TEXT" ctype="b"/> <x id="INTERPOLATION"/></source>
                <target><x id="INTERPOLATION"/> tnemele elbatalsnart <x id="START_BOLD_TEXT" ctype="x-b"/>sredlohecalp htiw<x id="CLOSE_BOLD_TEXT" ctype="x-b"/></target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">2</context>
                </context-group>
              </trans-unit>
            </body>
          </file>
        </xliff>
      `;
      const result = doParse('/some/file.xlf', XLIFF);

      expect(
          result.translations[ɵcomputeMsgId(
              'translatable element {$START_BOLD_TEXT}with placeholders{$LOSE_BOLD_TEXT} {$INTERPOLATION}')])
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
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="9051630253697141670" datatype="html">
                <source>translatable <x id="START_TAG_SPAN"/>element <x id="START_BOLD_TEXT"/>with placeholders<x id="CLOSE_BOLD_TEXT"/><x id="CLOSE_TAG_SPAN"/> <x id="INTERPOLATION"/></source>
                <target><x id="START_TAG_SPAN"/><x id="INTERPOLATION"/> tnemele<x id="CLOSE_TAG_SPAN"/> elbatalsnart <x id="START_BOLD_TEXT"/>sredlohecalp htiw<x id="CLOSE_BOLD_TEXT"/></target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">3</context>
                </context-group>
              </trans-unit>
            </body>
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

    it('should extract translations with placeholders containing hyphens', () => {
      /**
       * Source HTML:
       *
       * ```
       * <div i18n><app-my-component></app-my-component> Welcome</div>
       * ```
       */
      const XLIFF = `
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="2877147807876214810" datatype="html">
                <source><x id="START_TAG_APP-MY-COMPONENT" ctype="x-app-my-component" equiv-text="&lt;app-my-component&gt;"/><x id="CLOSE_TAG_APP-MY-COMPONENT" ctype="x-app-my-component" equiv-text="&lt;/app-my-component&gt;"/> Welcome</source>
                <context-group purpose="location">
                  <context context-type="sourcefile">src/app/app.component.html</context>
                  <context context-type="linenumber">1</context>
                </context-group>
                <target><x id="START_TAG_APP-MY-COMPONENT" ctype="x-app-my-component" equiv-text="&lt;app-my-component&gt;"/><x id="CLOSE_TAG_APP-MY-COMPONENT" ctype="x-app-my-component" equiv-text="&lt;/app-my-component&gt;"/> Translate</target>
              </trans-unit>
            </body>
          </file>
        </xliff>
      `;
      const result = doParse('/some/file.xlf', XLIFF);
      const id =
          ɵcomputeMsgId('{$START_TAG_APP_MY_COMPONENT}{$CLOSE_TAG_APP_MY_COMPONENT} Welcome');
      expect(result.translations[id]).toEqual(ɵmakeParsedTranslation(['', '', ' Translate'], [
        'START_TAG_APP_MY_COMPONENT', 'CLOSE_TAG_APP_MY_COMPONENT'
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
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="2874455947211586270" datatype="html">
                <source>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>test<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</source>
                <target>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>TEST<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</target>
              </trans-unit>
            </body>
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
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="9205907420411818817" datatype="html">
                <source>foo</source>
                <target>oof</target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">3</context>
                </context-group>
                <note priority="1" from="description">d</note>
                <note priority="1" from="meaning">m</note>
              </trans-unit>
              <trans-unit id="i" datatype="html">
                <source>foo</source>
                <target>toto</target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">4</context>
                </context-group>
                <note priority="1" from="description">d</note>
                <note priority="1" from="meaning">m</note>
              </trans-unit>
              <trans-unit id="bar" datatype="html">
                <source>foo</source>
                <target>tata</target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">5</context>
                </context-group>
              </trans-unit>
            </body>
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
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="7118057989405618448" datatype="html">
              <ph id="1" equiv="TAG_IMG" type="image" disp="&lt;img/&gt;"/><ph id="2" equiv="TAG_IMG_1" type="image" disp="&lt;img/&gt;"/>
                <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="TAG_IMG_1" ctype="image"/></source>
                <target><x id="TAG_IMG_1" ctype="image"/><x id="TAG_IMG" ctype="image"/><x id="LINE_BREAK" ctype="lb"/></target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">6</context>
                </context-group>
                <note priority="1" from="description">ph names</note>
              </trans-unit>
            </body>
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
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="2826198357052921524" datatype="html">
                <source>hello <x id="START_TAG_SPAN" ctype="x-span"/><x id="CLOSE_TAG_SPAN" ctype="x-span"/></source>
                <target/>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">6</context>
                </context-group>
                <note priority="1" from="description">ph names</note>
              </trans-unit>
            </body>
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
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="980940425376233536" datatype="html">
                <source>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></source>
                <target>Le test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">11</context>
                </context-group>
              </trans-unit>
              <trans-unit id="5207293143089349404" datatype="html">
                <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p"/>}}} =other {a lot}}</source>
                <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>profondément imbriqué<x id="CLOSE_PARAGRAPH" ctype="x-p"/>}}} =other {beaucoup}}</target>
              </trans-unit>
            </body>
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
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="2340165783990709777" datatype="html">
                <source>multi\nlines</source>
                <target>multi\nlignes</target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">12</context>
                </context-group>
              </trans-unit>
            </body>
          </file>
        </xliff>
      `;
      const result = doParse('/some/file.xlf', XLIFF);

      expect(result.translations[ɵcomputeMsgId('multi\nlines')])
          .toEqual(ɵmakeParsedTranslation(['multi\nlignes']));
    });

    it('should extract translations with <mrk> elements', () => {
      const XLIFF = `
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="mrk-test">
                <source>First sentence.</source>
                <seg-source>
                  <invalid-tag>Should not be parsed</invalid-tag>
                </seg-source>
                <target>Translated <mrk mtype="seg" mid="1">first sentence</mrk>.</target>
              </trans-unit>
              <trans-unit id="mrk-test2">
                <source>First sentence. Second sentence.</source>
                <seg-source>
                  <invalid-tag>Should not be parsed</invalid-tag>
                </seg-source>
                <target>Translated <mrk mtype="seg" mid="1"><mrk mtype="seg" mid="2">first</mrk> sentence</mrk>.</target>
              </trans-unit>
            </body>
          </file>
        </xliff>
      `;
      const result = doParse('/some/file.xlf', XLIFF);

      expect(result.translations['mrk-test'])
          .toEqual(ɵmakeParsedTranslation(['Translated first sentence.']));

      expect(result.translations['mrk-test2'])
          .toEqual(ɵmakeParsedTranslation(['Translated first sentence.']));
    });

    it('should ignore alt-trans targets', () => {
      const XLIFF = `
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit datatype="html" approved="no" id="registration.submit">
                <source>Continue</source>
                <target state="translated" xml:lang="de">Weiter</target>
                <context-group purpose="location">
                  <context context-type="sourcefile">src/app/auth/registration-form/registration-form.component.html</context>
                  <context context-type="linenumber">69</context>
                </context-group>
                <?sid 1110954287-0?>
                <alt-trans origin="autoFuzzy" tool="Swordfish" match-quality="71" ts="63">
                  <source xml:lang="en">Content</source>
                  <target state="translated" xml:lang="de">Content</target>
                </alt-trans>
            </trans-unit>
            </body>
          </file>
        </xliff>
     `;

      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.translations['registration.submit'])
          .toEqual(ɵmakeParsedTranslation(['Weiter']));
    });

    it('should merge messages from each `<file>` element', () => {
      /**
       * Source HTML:
       *
       * ```
       * <div i18n>translatable attribute</div>
       * ```

       * ```
       * <div i18n>translatable element <b>with placeholders</b> {{ interpolation}}</div>
       * ```
       */
      const XLIFF = `
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="file-1">
            <body>
              <trans-unit id="1933478729560469763" datatype="html">
                <source>translatable attribute</source>
                <target>etubirtta elbatalsnart</target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">1</context>
                </context-group>
              </trans-unit>
            </body>
          </file>
          <file source-language="en" target-language="fr" datatype="plaintext" original="file-2">
            <body>
              <trans-unit id="5057824347511785081" datatype="html">
                <source>translatable element <x id="START_BOLD_TEXT" ctype="b"/>with placeholders<x id="CLOSE_BOLD_TEXT" ctype="b"/> <x id="INTERPOLATION"/></source>
                <target><x id="INTERPOLATION"/> tnemele elbatalsnart <x id="START_BOLD_TEXT" ctype="x-b"/>sredlohecalp htiw<x id="CLOSE_BOLD_TEXT" ctype="x-b"/></target>
                <context-group purpose="location">
                  <context context-type="sourcefile">file.ts</context>
                  <context context-type="linenumber">2</context>
                </context-group>
              </trans-unit>
            </body>
          </file>
        </xliff>
      `;
      const result = doParse('/some/file.xlf', XLIFF);
      expect(result.translations[ɵcomputeMsgId('translatable attribute')])
          .toEqual(ɵmakeParsedTranslation(['etubirtta elbatalsnart']));
      expect(
          result.translations[ɵcomputeMsgId(
              'translatable element {$START_BOLD_TEXT}with placeholders{$LOSE_BOLD_TEXT} {$INTERPOLATION}')])
          .toEqual(ɵmakeParsedTranslation(
              ['', ' tnemele elbatalsnart ', 'sredlohecalp htiw', ''],
              ['INTERPOLATION', 'START_BOLD_TEXT', 'CLOSE_BOLD_TEXT']));
    });

    describe('[structure errors]', () => {
      it('should warn when a trans-unit has no translation target but does have a source', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
          `  <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">`,
          `    <body>`,
          `      <trans-unit id="missingtarget">`,
          `        <source/>`,
          `      </trans-unit>`,
          `    </body>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');
        const result = doParse('/some/file.xlf', XLIFF);
        expect(result.diagnostics.messages.length).toEqual(1);
        expect(result.diagnostics.messages[0].message).toEqual([
          `Missing <target> element ("e-language="en" target-language="fr" datatype="plaintext" original="ng2.template">`,
          `    <body>`,
          `      [WARNING ->]<trans-unit id="missingtarget">`,
          `        <source/>`,
          `      </trans-unit>`,
          `"): /some/file.xlf@4:6`,
        ].join('\n'));
      });

      it('should fail when a trans-unit has no translation target nor source', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
          `  <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">`,
          `    <body>`,
          `      <trans-unit id="missingtarget">`,
          `      </trans-unit>`,
          `    </body>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');

        expectToFail(
            '/some/file.xlf', XLIFF,
            /Missing required element: one of <target> or <source> is required/, [
              `Missing required element: one of <target> or <source> is required ("e-language="en" target-language="fr" datatype="plaintext" original="ng2.template">`,
              `    <body>`,
              `      [ERROR ->]<trans-unit id="missingtarget">`,
              `      </trans-unit>`,
              `    </body>`,
              `"): /some/file.xlf@4:6`,
            ].join('\n'));
      });

      it('should fail when a trans-unit has no id attribute', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
          `  <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">`,
          `    <body>`,
          `      <trans-unit datatype="html">`,
          `        <source/>`,
          `        <target/>`,
          `      </trans-unit>`,
          `    </body>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');

        expectToFail('/some/file.xlf', XLIFF, /Missing required "id" attribute/, [
          `Missing required "id" attribute on <trans-unit> element. ("e-language="en" target-language="fr" datatype="plaintext" original="ng2.template">`,
          `    <body>`,
          `      [ERROR ->]<trans-unit datatype="html">`,
          `        <source/>`,
          `        <target/>`,
          `"): /some/file.xlf@4:6`,
        ].join('\n'));
      });

      it('should fail on duplicate trans-unit id', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
          `  <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">`,
          `    <body>`,
          `      <trans-unit id="deadbeef">`,
          `        <source/>`,
          `        <target/>`,
          `      </trans-unit>`,
          `      <trans-unit id="deadbeef">`,
          `        <source/>`,
          `        <target/>`,
          `      </trans-unit>`,
          `    </body>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');

        expectToFail('/some/file.xlf', XLIFF, /Duplicated translations for message "deadbeef"/, [
          `Duplicated translations for message "deadbeef" ("`,
          `        <target/>`,
          `      </trans-unit>`,
          `      [ERROR ->]<trans-unit id="deadbeef">`,
          `        <source/>`,
          `        <target/>`,
          `"): /some/file.xlf@8:6`,
        ].join('\n'));
      });
    });

    describe('[message errors]', () => {
      it('should fail on unknown message tags', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
          `  <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">`,
          `    <body>`,
          `      <trans-unit id="deadbeef" datatype="html">`,
          `        <source/>`,
          `        <target><b>msg should contain only ph tags</b></target>`,
          `      </trans-unit>`,
          `    </body>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');

        expectToFail('/some/file.xlf', XLIFF, /Invalid element found in message/, [
          `Error: Invalid element found in message.`,
          `At /some/file.xlf@6:16:`,
          `...`,
          `        <source/>`,
          `        <target>[ERROR ->]<b>msg should contain only ph tags</b></target>`,
          `      </trans-unit>`,
          `...`,
          ``,
        ].join('\n'));
      });

      it('should fail when a placeholder misses an id attribute', () => {
        const XLIFF = [
          `<?xml version="1.0" encoding="UTF-8" ?>`,
          `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
          `  <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">`,
          `    <body>`,
          `      <trans-unit id="deadbeef" datatype="html">`,
          `        <source/>`,
          `        <target><x/></target>`,
          `      </trans-unit>`,
          `    </body>`,
          `  </file>`,
          `</xliff>`,
        ].join('\n');

        expectToFail('/some/file.xlf', XLIFF, /required "id" attribute/gi, [
          `Error: Missing required "id" attribute:`,
          `At /some/file.xlf@6:16:`,
          `...`,
          `        <source/>`,
          `        <target>[ERROR ->]<x/></target>`,
          `      </trans-unit>`,
          `...`,
          ``,
        ].join('\n'));
      });
    });
  });
});
