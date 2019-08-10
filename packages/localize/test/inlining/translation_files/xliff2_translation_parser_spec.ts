/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {makeParsedTranslation} from '../../../src/inlining/translation_files/utils';
import {Xliff2TranslationParser} from '../../../src/inlining/translation_files/xliff2/xliff2_translation_parser';
import {computeMsgId} from '../../../src/utils/messages';

fdescribe('Xliff2TranslationParser', () => {
  describe('canParse()', () => {
    it('should return true if the file extension is `.xlf` and it contains the XLIFF namespace', () => {
      const parser = new Xliff2TranslationParser();
      expect(
          parser.canParse(
              '/some/file.xlf',
              '<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">'))
          .toBe(true);
      expect(
          parser.canParse(
              '/some/file.json',
              '<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">'))
          .toBe(false);
      expect(parser.canParse('/some/file.xlf', '')).toBe(false);
      expect(parser.canParse('/some/file.json', '')).toBe(false);
    });
  });

  fdescribe('parse()', () => {
    it('should extract the locale from the file contents', () => {
      const XLIFF = `
      <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
        </file>
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);
      expect(result.locale).toEqual('fr');
    });

    it('should extract basic messages', () => {
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
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);
      expect(result.translations[computeMsgId('translatable attribute', '')])
          .toEqual(makeParsedTranslation(['etubirtta elbatalsnart']));
    });

    it('should extract translations with simple placeholders', () => {
      const XLIFF = `
      <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="7056919470098446707">
            <notes>
              <note category="location">file.ts:3</note>
            </notes>
            <segment>
              <source>translatable element <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">with placeholders</pc> <ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/></source>
              <target><ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}"/> tnemele elbatalsnart <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;">sredlohecalp htiw</pc></target>
            </segment>
          </unit>
        </file>
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(
          result.translations[computeMsgId(
              'translatable element {$START_BOLD_TEXT}with placeholders{$CLOSE_BOLD_TEXT} {$INTERPOLATION}',
              '')])
          .toEqual(makeParsedTranslation(
              ['', ' tnemele elbatalsnart ', 'sredlohecalp htiw', ''],
              ['INTERPOLATION', 'START_BOLD_TEXT', 'CLOSE_BOLD_TEXT']));
    });

    fit('should extract translations with simple ICU expressions', () => {
      const XLIFF = `
      <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="2981514368455622387">
            <notes>
              <note category="location">file.ts:4</note>
            </notes>
            <segment>
              <source>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">test</pc>} }</source>
              <target>{VAR_PLURAL, plural, =0 {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">TEST</pc>} }</target>
            </segment>
          </unit>
        </file>
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(
          result.translations[computeMsgId(
              '{VAR_PLURAL, plural, =0 {[<ph tag name="START_PARAGRAPH">test</ph name="CLOSE_PARAGRAPH">]}}',
              '')])
          .toEqual(makeParsedTranslation(
              ['{VAR_PLURAL, plural, =0 {{START_PARAGRAPH}TEST{CLOSE_PARAGRAPH}}}'], []));
    });

    it('should extract translations with duplicate source messages', () => {
      const XLIFF = `
      <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="2981514668452624387">
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
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations[computeMsgId('foo', 'm')]).toEqual(makeParsedTranslation(['oof']));
      expect(result.translations['i']).toEqual(makeParsedTranslation(['toto']));
      expect(result.translations['bar']).toEqual(makeParsedTranslation(['tata']));
    });

    it('should extract translations with only placeholders, which are re-ordered', () => {
      const XLIFF = `
      <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="8779402634269838862">
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
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations[computeMsgId('{$LINE_BREAK}{$TAG_IMG}{$TAG_IMG_1}', '')])
          .toEqual(makeParsedTranslation(['', '', '', ''], ['TAG_IMG_1', 'TAG_IMG', 'LINE_BREAK']));
    });

    it('should extract translations with empty target', () => {
      const XLIFF = `
      <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="6536355551500405293">
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
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations[computeMsgId('hello {$START_TAG_SPAN}{$CLOSE_TAG_SPAN}', '')])
          .toEqual(makeParsedTranslation(['']));
    });

    it('should extract translations with deeply nested ICUs', () => {
      const XLIFF = `
      <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="baz">
            <notes>
              <note category="location">file.ts:9</note>
            </notes>
            <segment>
              <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>}}}}</source>
              <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">profondément imbriqué</pc>}}}}</target>
            </segment>
          </unit>
          <unit id="6997386649824869937">
            <notes>
              <note category="location">file.ts:10</note>
            </notes>
            <segment>
              <source>Test: <ph id="0" equiv="ICU" disp="{ count, plural, =0 {...} =other {...}}"/></source>
              <target>Test: <ph id="0" equiv="ICU" disp="{ count, plural, =0 {...} =other {...}}"/></target>
            </segment>
          </unit>
          <unit id="5229984852258993423">
            <notes>
              <note category="location">file.ts:10</note>
            </notes>
            <segment>
              <source>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">deeply nested</pc>}}} =other {a lot}}</source>
              <target>{VAR_PLURAL, plural, =0 {{VAR_SELECT, select, other {<pc id="0" equivStart="START_PARAGRAPH" equivEnd="CLOSE_PARAGRAPH" type="other" dispStart="&lt;p&gt;" dispEnd="&lt;/p&gt;">profondément imbriqué</pc>}}} =other {beaucoup}}</target>
            </segment>
          </unit>
        </file>
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations[computeMsgId('{VAR_PLURAL, plural, =0 {ICU}}', '')])
          .toEqual(makeParsedTranslation(['{VAR_PLURAL, plural, =0 {ICU}}']));

      expect(
          result.translations[computeMsgId(
              '{VAR_SELECT, select, other {{START_PARAGRAPH}deeply nested{CLOSE_PARAGRAPH}}}', '')])
          .toEqual(makeParsedTranslation([
            '{VAR_SELECT, select, other {{START_PARAGRAPH}profondément imbriqué{CLOSE_PARAGRAPH}}}'
          ]));

      expect(result.translations[computeMsgId('Test: {$ICU}', '')])
          .toEqual(makeParsedTranslation(['Test: ', ''], ['ICU']));

      expect(result.translations[computeMsgId('{VAR_PLURAL, plural, =0 {ICU} =other {a lot}}', '')])
          .toEqual(makeParsedTranslation(['{VAR_PLURAL, plural, =0 {ICU} =other {beaucoup}}']));

    });

    it('should extract translations containing multiple lines', () => {
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
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations[computeMsgId('multi\nlines', '')])
          .toEqual(makeParsedTranslation(['multi\nlignes']));
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
      </xliff>`;
      const parser = new Xliff2TranslationParser();
      const result = parser.parse('/some/file.xlf', XLIFF);

      expect(result.translations['mrk-test'])
          .toEqual(makeParsedTranslation(['Translated first sentence.']));

      expect(result.translations['mrk-test2'])
          .toEqual(makeParsedTranslation(['Translated first sentence.']));
    });

    describe('[structure errors]', () => {
      it('should throw when a trans-unit has no translation', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="missingtarget">
            <segment>
              <source/>
            </segment>
          </unit>
        </file>
        </xliff>`;

        expect(() => {
          const parser = new Xliff2TranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/Missing required <target> element/);
      });


      it('should throw when a trans-unit has no id attribute', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit>
            <segment>
              <source/>
              <target/>
            </segment>
          </unit>
        </file>
        </xliff>`;

        expect(() => {
          const parser = new Xliff2TranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/Missing required "id" attribute/);
      });

      it('should throw on duplicate trans-unit id', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="deadbeef">
            <segment>
              <source/>
              <target/>
            </segment>
          </unit>
          <unit id="deadbeef">
            <segment>
              <source/>
              <target/>
            </segment>
          </unit>
        </file>
        </xliff>`;

        expect(() => {
          const parser = new Xliff2TranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/Duplicated translations for message "deadbeef"/);
      });
    });

    describe('[message errors]', () => {
      it('should throw on unknown message tags', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="deadbeef">
            <segment>
              <source/>
              <target><b>msg should contain only ph and pc tags</b></target>
            </segment>
          </unit>
        </file>
        </xliff>`;

        expect(() => {
          const parser = new Xliff2TranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/Invalid element found in message/);
      });

      it('should throw when a placeholder misses an id attribute', () => {
        const XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
        <file original="ng.template" id="ngi18n">
          <unit id="deadbeef">
            <segment>
              <source/>
              <target><ph/></target>
            </segment>
          </unit>
        </file>
        </xliff>`;

        expect(() => {
          const parser = new Xliff2TranslationParser();
          parser.parse('/some/file.xlf', XLIFF);
        }).toThrowError(/Missing required "equiv" attribute/);
      });
    });
  });
});
