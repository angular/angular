/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {makeParsedTranslation} from '../../../src/inlining/translation_files/utils';
import {XliffTranslationParser} from '../../../src/inlining/translation_files/xliff_translation_parser';

describe('XliffTranslationParser', () => {
  describe('canParse()', () => {
    it('should return true if the file extension is `.xlf` and it contains the XLIFF namespace',
       () => {
         const parser = new XliffTranslationParser();
         expect(parser.canParse(
                    '/some/file.xlf',
                    '<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">'))
             .toBe(true);
         expect(parser.canParse(
                    '/some/file.json',
                    '<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">'))
             .toBe(false);
         expect(parser.canParse('/some/file.xlf', '')).toBe(false);
         expect(parser.canParse('/some/file.json', '')).toBe(false);
       });
  });

  describe('parse()', () => {
    it('should extract the locale from the file contents', () => {
      const XLIFF = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
          <body>
          </body>
        </file>
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);
      expect(result.locale).toEqual('fr');
    });

    it('should extract basic messages', () => {
      const XLIFF = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="983775b9a51ce14b036be72d4cfd65d68d64e231" datatype="html">
              <source>translatable attribute</source>
              <target>etubirtta elbatalsnart</target>
              <context-group purpose="location">
                <context context-type="sourcefile">file.ts</context>
                <context context-type="linenumber">1</context>
              </context-group>
            </trans-unit>
          </body>
        </file>
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations['translatable attribute'])
          .toEqual(makeParsedTranslation(['etubirtta elbatalsnart']));
    });

    it('should extract translations with simple placeholders', () => {
      const XLIFF = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="ec1d033f2436133c14ab038286c4f5df4697484a" datatype="html">
              <source>translatable element <x id="START_BOLD_TEXT" ctype="b"/>with placeholders<x id="CLOSE_BOLD_TEXT" ctype="b"/> <x id="INTERPOLATION"/></source>
              <target><x id="INTERPOLATION"/> footnemele elbatalsnart <x id="START_BOLD_TEXT" ctype="x-b"/>sredlohecalp htiw<x id="CLOSE_BOLD_TEXT" ctype="x-b"/></target>
              <context-group purpose="location">
                <context context-type="sourcefile">file.ts</context>
                <context context-type="linenumber">2</context>
              </context-group>
            </trans-unit>
          </body>
        </file>
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(
          result.translations
              ['translatable element {$START_BOLD_TEXT}with placeholders{$CLOSE_BOLD_TEXT} {$INTERPOLATION}'])
          .toEqual(makeParsedTranslation(
              ['', ' footnemele elbatalsnart ', 'sredlohecalp htiw', ''],
              ['INTERPOLATION', 'START_BOLD_TEXT', 'CLOSE_BOLD_TEXT']));
    });

    it('should extract translations with simple ICU expressions', () => {
      const XLIFF = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="e2ccf3d131b15f54aa1fcf1314b1ca77c14bfcc2" datatype="html">
              <source>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>test<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</source>
              <target>{VAR_PLURAL, plural, =0 {<x id="START_PARAGRAPH" ctype="x-p"/>TEST<x id="CLOSE_PARAGRAPH" ctype="x-p"/>} }</target>
            </trans-unit>
          </body>
        </file>
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(
          result.translations['{VAR_PLURAL, plural, =0 {{START_PARAGRAPH}test{CLOSE_PARAGRAPH}}}'])
          .toEqual(makeParsedTranslation(
              ['{VAR_PLURAL, plural, =0 {{START_PARAGRAPH}TEST{CLOSE_PARAGRAPH}}}'], []));
    });

    it('should extract translations with duplicate source messages', () => {
      const XLIFF = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23" datatype="html">
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
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      // TODO: change $localize to handle custom message ids
      // expect(result.translations['foo']).toEqual(makeParsedTranslation(['oof']));
      // expect(result.translations['foo']).toEqual(makeParsedTranslation(['toto']));
      expect(result.translations['foo']).toEqual(makeParsedTranslation(['tata']));
    });

    it('should extract translations with only placeholders, which are re-ordered', () => {
      const XLIFF = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="d7fa2d59aaedcaa5309f13028c59af8c85b8c49d" datatype="html">
              <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
              <target><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/><x id="TAG_IMG" ctype="image"/><x id="LINE_BREAK" ctype="lb"/></target>
              <context-group purpose="location">
                <context context-type="sourcefile">file.ts</context>
                <context context-type="linenumber">6</context>
              </context-group>
              <note priority="1" from="description">ph names</note>
            </trans-unit>
          </body>
        </file>
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations['{$LINE_BREAK}{$TAG_IMG}{$START_TAG_DIV}{$CLOSE_TAG_DIV}'])
          .toEqual(makeParsedTranslation(
              ['', '', '', '', ''], ['START_TAG_DIV', 'CLOSE_TAG_DIV', 'TAG_IMG', 'LINE_BREAK']));
    });

    it('should extract translations with empty target', () => {
      const XLIFF = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="empty target" datatype="html">
              <source><x id="LINE_BREAK" ctype="lb"/><x id="TAG_IMG" ctype="image"/><x id="START_TAG_DIV" ctype="x-div"/><x id="CLOSE_TAG_DIV" ctype="x-div"/></source>
              <target/>
              <context-group purpose="location">
                <context context-type="sourcefile">file.ts</context>
                <context context-type="linenumber">6</context>
              </context-group>
              <note priority="1" from="description">ph names</note>
            </trans-unit>
          </body>
        </file>
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations['{$LINE_BREAK}{$TAG_IMG}{$START_TAG_DIV}{$CLOSE_TAG_DIV}'])
          .toEqual(makeParsedTranslation(['']));
    });

    it('should extract translations with deeply nested ICUs', () => {
      const XLIFF = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="baz" datatype="html">
              <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p"/>}}}}</source>
              <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>profondément imbriqué<x id="CLOSE_PARAGRAPH" ctype="x-p"/>}}}}</target>
            </trans-unit>
            <trans-unit id="52ffa620dcd76247a56d5331f34e73f340a43cdb" datatype="html">
              <source>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></source>
              <target>Test: <x id="ICU" equiv-text="{ count, plural, =0 {...} =other {...}}"/></target>
              <context-group purpose="location">
                <context context-type="sourcefile">file.ts</context>
                <context context-type="linenumber">11</context>
              </context-group>
            </trans-unit>
            <trans-unit id="1503afd0ccc20ff01d5e2266a9157b7b342ba494" datatype="html">
              <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>deeply nested<x id="CLOSE_PARAGRAPH" ctype="x-p"/>}}} =other {a lot}}</source>
              <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<x id="START_PARAGRAPH" ctype="x-p"/>profondément imbriqué<x id="CLOSE_PARAGRAPH" ctype="x-p"/>}}} =other {beaucoup}}</target>
            </trans-unit>
          </body>
        </file>
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations['{VAR_PLURAL, plural, =0 {ICU}}'])
          .toEqual(makeParsedTranslation(['{VAR_PLURAL, plural, =0 {ICU}}']));

      expect(result.translations
                 ['{VAR_SELECT, select, other {{START_PARAGRAPH}deeply nested{CLOSE_PARAGRAPH}}}'])
          .toEqual(makeParsedTranslation([
            '{VAR_SELECT, select, other {{START_PARAGRAPH}profondément imbriqué{CLOSE_PARAGRAPH}}}'
          ]));

      expect(result.translations['Test: {$ICU}'])
          .toEqual(makeParsedTranslation(['Test: ', ''], ['ICU']));

      expect(result.translations['{VAR_PLURAL, plural, =0 {ICU} =other {a lot}}'])
          .toEqual(makeParsedTranslation(['{VAR_PLURAL, plural, =0 {ICU} =other {beaucoup}}']));

    });

    it('should extract translations containing multiple lines', () => {
      const XLIFF = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="fcfa109b0e152d4c217dbc02530be0bcb8123ad1" datatype="html">
              <source>multi\nlines</source>
              <target>multi\nlignes</target>
              <context-group purpose="location">
                <context context-type="sourcefile">file.ts</context>
                <context context-type="linenumber">12</context>
              </context-group>
            </trans-unit>
          </body>
        </file>
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations['multi\nlines']).toEqual(makeParsedTranslation(['multi\nlignes']));
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
      </xliff>`;
      const parser = new XliffTranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations['First sentence.'])
          .toEqual(makeParsedTranslation(['Translated first sentence.']));

      expect(result.translations['First sentence. Second sentence.'])
          .toEqual(makeParsedTranslation(['Translated first sentence.']));
    });

    describe('[structure errors]', () => {
      it('should throw when a trans-unit has no translation', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
<file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
<body>
  <trans-unit id="missingtarget">
    <source/>
  </trans-unit>
</body>
</file>
</xliff>`;

        expect(() => {
          const parser = new XliffTranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/Missing required <target> element/);
      });


      it('should throw when a trans-unit has no id attribute', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
<file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
<body>
  <trans-unit datatype="html">
    <source/>
    <target/>
  </trans-unit>
</body>
</file>
</xliff>`;

        expect(() => {
          const parser = new XliffTranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/Missing required "id" attribute/);
      });

      it('should throw on duplicate trans-unit id', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
<file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
<body>
  <trans-unit id="deadbeef">
    <source/>
    <target/>
  </trans-unit>
  <trans-unit id="deadbeef">
    <source/>
    <target/>
  </trans-unit>
</body>
</file>
</xliff>`;

        expect(() => {
          const parser = new XliffTranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/Duplicated translations for message "deadbeef"/);
      });
    });

    describe('[message errors]', () => {
      it('should throw on unknown message tags', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
<file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
<body>
  <trans-unit id="deadbeef" datatype="html">
    <source/>
    <target><b>msg should contain only ph tags</b></target>
  </trans-unit>
</body>
</file>
</xliff>`;

        expect(() => {
          const parser = new XliffTranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/Invalid element found in message/);
      });

      it('should throw when a placeholder misses an id attribute', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
<file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
<body>
  <trans-unit id="deadbeef" datatype="html">
    <source/>
    <target><x/></target>
  </trans-unit>
</body>
</file>
</xliff>`;

        expect(() => {
          const parser = new XliffTranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/required "id" attribute/gi);
      });
    });
  });
});
