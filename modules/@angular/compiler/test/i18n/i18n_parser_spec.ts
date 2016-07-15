/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HtmlParser} from '@angular/compiler/src/html_parser';
import {serializeAst} from '@angular/compiler/src/i18n/catalog';
import {extractI18nMessages} from '@angular/compiler/src/i18n/i18n_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '@angular/compiler/src/interpolation_config';
import {ddescribe, describe, expect, it} from '@angular/core/testing/testing_internal';

export function main() {
  ddescribe('I18nParser', () => {

    describe('elements', () => {
      it('should extract from elements', () => {
        expect(extract('<div i18n="m|d">text</div>')).toEqual([
          [['text'], 'm', 'd'],
        ]);
      });

      it('should extract from nested elements', () => {
        expect(extract('<div i18n="m|d">text<span><b>nested</b></span></div>')).toEqual([
          [
            [
              'text',
              '<ph tag name="START_TAG_SPAN"><ph tag name="START_BOLD_TEXT">nested</ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_TAG_SPAN">'
            ],
            'm', 'd'
          ],
        ]);
      });

      it('should not create a message for empty elements',
         () => { expect(extract('<div i18n="m|d"></div>')).toEqual([]); });

      it('should not create a message for plain elements',
         () => { expect(extract('<div></div>')).toEqual([]); });

      it('should suppoprt void elements', () => {
        expect(extract('<div i18n="m|d"><p><br></p></div>')).toEqual([
          [
            [
              '<ph tag name="START_PARAGRAPH"><ph tag name="LINE_BREAK"/></ph name="CLOSE_PARAGRAPH">'
            ],
            'm', 'd'
          ],
        ]);
      });
    });

    describe('attributes', () => {
      it('should extract from attributes outside of translatable section', () => {
        expect(extract('<div i18n-title="m|d" title="msg"></div>')).toEqual([
          [['msg'], 'm', 'd'],
        ]);
      });

      it('should extract from attributes in translatable element', () => {
        expect(extract('<div i18n><p><b i18n-title="m|d" title="msg"></b></p></div>')).toEqual([
          [
            [
              '<ph tag name="START_PARAGRAPH"><ph tag name="START_BOLD_TEXT"></ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">'
            ],
            '', ''
          ],
          [['msg'], 'm', 'd'],
        ]);
      });

      it('should extract from attributes in translatable block', () => {
        expect(extract('<!-- i18n --><p><b i18n-title="m|d" title="msg"></b></p><!-- /i18n -->'))
            .toEqual([
              [['msg'], 'm', 'd'],
              [
                [
                  '<ph tag name="START_PARAGRAPH"><ph tag name="START_BOLD_TEXT"></ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">'
                ],
                '', ''
              ],
            ]);
      });

      it('should extract from attributes in translatable ICU', () => {
        expect(
            extract(
                '<!-- i18n -->{count, plural, =0 {<p><b i18n-title="m|d" title="msg"></b></p>}}<!-- /i18n -->'))
            .toEqual([
              [['msg'], 'm', 'd'],
              [
                [
                  '{count, plural, =0 {[<ph tag name="START_PARAGRAPH"><ph tag name="START_BOLD_TEXT"></ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">]}}'
                ],
                '', ''
              ],
            ]);
      });

      it('should extract from attributes in non translatable ICU', () => {
        expect(extract('{count, plural, =0 {<p><b i18n-title="m|d" title="msg"></b></p>}}'))
            .toEqual([
              [['msg'], 'm', 'd'],
            ]);
      });

      it('should not create a message for empty attributes',
         () => { expect(extract('<div i18n-title="m|d" title></div>')).toEqual([]); });
    });

    describe('interpolation', () => {
      it('should replace interpolation with placeholder', () => {
        expect(extract('<div i18n="m|d">before{{ exp }}after</div>')).toEqual([
          [['[before, <ph name="INTERPOLATION"> exp </ph>, after]'], 'm', 'd'],
        ]);
      });

      it('should support named interpolation', () => {
        expect(extract('<div i18n="m|d">before{{ exp //i18n(ph="teSt") }}after</div>')).toEqual([
          [['[before, <ph name="TEST"> exp //i18n(ph="teSt") </ph>, after]'], 'm', 'd'],
        ]);
      })
    });

    describe('blocks', () => {
      it('should extract from blocks', () => {
        expect(extract(`<!-- i18n: meaning1|desc1 -->message1<!-- /i18n -->
         <!-- i18n: meaning2 -->message2<!-- /i18n -->
         <!-- i18n -->message3<!-- /i18n -->`))
            .toEqual([
              [['message1'], 'meaning1', 'desc1'],
              [['message2'], 'meaning2', ''],
              [['message3'], '', ''],
            ]);
      });

      it('should extract all siblings', () => {
        expect(extract(`<!-- i18n -->text<p>html<b>nested</b></p><!-- /i18n -->`)).toEqual([
          [
            [
              'text',
              '<ph tag name="START_PARAGRAPH">html, <ph tag name="START_BOLD_TEXT">nested</ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">'
            ],
            '', ''
          ],
        ]);
      });
    });

    describe('ICU messages', () => {
      it('should extract as ICU when single child of an element', () => {
        expect(extract('<div i18n="m|d">{count, plural, =0 {zero}}</div>')).toEqual([
          [['{count, plural, =0 {[zero]}}'], 'm', 'd'],
        ]);
      });

      it('should extract as ICU + ph when not single child of an element', () => {
        expect(extract('<div i18n="m|d">b{count, plural, =0 {zero}}a</div>')).toEqual([
          [['b', '<ph icu name="ICU">{count, plural, =0 {[zero]}}</ph>', 'a'], 'm', 'd'],
          [['{count, plural, =0 {[zero]}}'], '', ''],
        ]);
      });

      it('should extract as ICU when single child of a block', () => {
        expect(extract('<!-- i18n:m|d -->{count, plural, =0 {zero}}<!-- /i18n -->')).toEqual([
          [['{count, plural, =0 {[zero]}}'], 'm', 'd'],
        ]);
      });

      it('should extract as ICU + ph when not single child of a block', () => {
        expect(extract('<!-- i18n:m|d -->b{count, plural, =0 {zero}}a<!-- /i18n -->')).toEqual([
          [['{count, plural, =0 {[zero]}}'], '', ''],
          [['b', '<ph icu name="ICU">{count, plural, =0 {[zero]}}</ph>', 'a'], 'm', 'd'],
        ]);
      });

      it('should not extract nested ICU messages', () => {
        expect(extract('<div i18n="m|d">b{count, plural, =0 {{sex, gender, =m {m}}}}a</div>'))
            .toEqual([
              [
                [
                  'b', '<ph icu name="ICU">{count, plural, =0 {[{sex, gender, =m {[m]}}]}}</ph>',
                  'a'
                ],
                'm', 'd'
              ],
              [['{count, plural, =0 {[{sex, gender, =m {[m]}}]}}'], '', ''],
            ]);
      });
    });

    describe('implicit elements', () => {
      it('should extract from implicit elements', () => {
        expect(extract('<b>bold</b><i>italic</i>', ['b'])).toEqual([
          [['bold'], '', ''],
        ]);
      });
    });

    describe('implicit attributes', () => {
      it('should extract implicit attributes', () => {
        expect(extract('<b title="bb">bold</b><i title="ii">italic</i>', [], {'b': ['title']}))
            .toEqual([
              [['bb'], '', ''],
            ]);
      });
    });

    describe('placeholders', () => {
      it('should reuse the same placeholder name for tags', () => {
        expect(extract('<div i18n="m|d"><p>one</p><p>two</p><p other>three</p></div>')).toEqual([
          [
            [
              '<ph tag name="START_PARAGRAPH">one</ph name="CLOSE_PARAGRAPH">',
              '<ph tag name="START_PARAGRAPH">two</ph name="CLOSE_PARAGRAPH">',
              '<ph tag name="START_PARAGRAPH_1">three</ph name="CLOSE_PARAGRAPH">',
            ],
            'm', 'd'
          ],
        ]);
      });

      it('should reuse the same placeholder name for interpolations', () => {
        expect(extract('<div i18n="m|d">{{ a }}{{ a }}{{ b }}</div>')).toEqual([
          [
            [
              '[<ph name="INTERPOLATION"> a </ph>, <ph name="INTERPOLATION"> a </ph>, <ph name="INTERPOLATION_1"> b </ph>]'
            ],
            'm', 'd'
          ],
        ]);
      });

      it('should reuse the same placeholder name for icu messages', () => {
        expect(
            extract(
                '<div i18n="m|d">{count, plural, =0 {0}}{count, plural, =0 {0}}{count, plural, =1 {1}}</div>'))
            .toEqual([
              [
                [
                  '<ph icu name="ICU">{count, plural, =0 {[0]}}</ph>',
                  '<ph icu name="ICU">{count, plural, =0 {[0]}}</ph>',
                  '<ph icu name="ICU_1">{count, plural, =1 {[1]}}</ph>',
                ],
                'm', 'd'
              ],
              [['{count, plural, =0 {[0]}}'], '', ''],
              [['{count, plural, =0 {[0]}}'], '', ''],
              [['{count, plural, =1 {[1]}}'], '', ''],
            ]);
      });

    });
  });
}

function extract(
    html: string, implicitTags: string[] = [],
    implicitAttrs: {[k: string]: string[]} = {}): [string[], string, string][] {
  const htmlParser = new HtmlParser();
  const parseResult = htmlParser.parse(html, 'extractor spec', true);
  if (parseResult.errors.length > 1) {
    throw Error(`unexpected parse errors: ${parseResult.errors.join('\n')}`);
  }

  const messages = extractI18nMessages(
      parseResult.rootNodes, DEFAULT_INTERPOLATION_CONFIG, implicitTags, implicitAttrs);

  // clang-format off
  // https://github.com/angular/clang-format/issues/35
  return messages.map(
    message => [serializeAst(message.nodes), message.meaning, message.description, ]) as [string[], string, string][];
  // clang-format on
}
