/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';

import {ExtractionResult, Message as HtmlMessage, extractAstMessages, mergeTranslations} from '../../src/i18n/extractor_merger';
import {getHtmlToI18nConverter} from '../../src/i18n/i18n_parser';
import {digestMessage} from '../../src/i18n/message_bundle';
import {TranslationBundle} from '../../src/i18n/translation_bundle';
import * as html from '../../src/ml_parser/ast';
import {HtmlParser} from '../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../src/ml_parser/interpolation_config';
import {serializeNodes} from '../ml_parser/ast_serializer_spec';

export function main() {
  describe('Extractor', () => {
    describe('elements', () => {
      it('should extract from elements', () => {
        expect(extract('<div i18n="m|d|e">text<span>nested</span></div>')).toEqual([
          [['text', '<span>nested</span>'], 'm', 'd|e'],
        ]);
      });

      it('should extract from elements', () => {
        expect(
            extract(
                '<div i18n="m|d"><span i18n-title="m|d" title="single child">nested</span></div>'))
            .toEqual([
              [
                ['<span i18n-title="m|d" title="single child">nested</span>'],
                'm',
                'd',
              ],
              [
                ['title="single child"'],
                'm',
                'd',
              ],
            ]);
      });

      it('should extract from elements', () => {
        expect(
            extract(
                '<div i18n="m|d">{count, plural, =0 { <p i18n-title i18n-desc title="title" desc="desc"></p>}}</div>'))
            .toEqual([
              [
                [
                  '{count, plural, =0 {<p i18n-title="" i18n-desc="" title="title" desc="desc"></p>}}'
                ],
                'm', 'd'
              ],
              [['title="title"'], '', ''],
              [['desc="desc"'], '', ''],
            ]);
      });

      it('should not create a message for empty elements',
         () => { expect(extract('<div i18n="m|d"></div>')).toEqual([]); });
    });

    describe('blocks', () => {
      it('should extract from blocks', () => {
        expect(extract(`<!-- i18n: meaning1|desc1 -->message1<!-- /i18n -->
         <!-- i18n: desc2 -->message2<!-- /i18n -->
         <!-- i18n -->message3<!-- /i18n -->`))
            .toEqual([
              [['message1'], 'meaning1', 'desc1'],
              [['message2'], '', 'desc2'],
              [['message3'], '', ''],
            ]);
      });

      it('should extract siblings', () => {
        expect(
            extract(
                `<!-- i18n -->text<p>html<b>nested</b></p>{count, plural, =0 {<span>html</span>}}{{interp}}<!-- /i18n -->`))
            .toEqual([
              [['{count, plural, =0 {<span>html</span>}}'], '', ''],
              [
                [
                  'text', '<p>html<b>nested</b></p>', '{count, plural, =0 {<span>html</span>}}',
                  '{{interp}}'
                ],
                '', ''
              ],
            ]);
      });

      it('should ignore other comments', () => {
        expect(extract(`<!-- i18n: meaning1|desc1 --><!-- other -->message1<!-- /i18n -->`))
            .toEqual([
              [['message1'], 'meaning1', 'desc1'],
            ]);
      });

      it('should not create a message for empty blocks',
         () => { expect(extract(`<!-- i18n: meaning1|desc1 --><!-- /i18n -->`)).toEqual([]); });
    });

    describe('ICU messages', () => {
      it('should extract ICU messages from translatable elements', () => {
        // single message when ICU is the only children
        expect(extract('<div i18n="m|d">{count, plural, =0 {text}}</div>')).toEqual([
          [['{count, plural, =0 {text}}'], 'm', 'd'],
        ]);

        // single message when ICU is the only (implicit) children
        expect(extract('<div>{count, plural, =0 {text}}</div>', ['div'])).toEqual([
          [['{count, plural, =0 {text}}'], '', ''],
        ]);

        // one message for the element content and one message for the ICU
        expect(extract('<div i18n="m|d">before{count, plural, =0 {text}}after</div>')).toEqual([
          [['before', '{count, plural, =0 {text}}', 'after'], 'm', 'd'],
          [['{count, plural, =0 {text}}'], '', ''],
        ]);
      });

      it('should extract ICU messages from translatable block', () => {
        // single message when ICU is the only children
        expect(extract('<!-- i18n:m|d -->{count, plural, =0 {text}}<!-- /i18n -->')).toEqual([
          [['{count, plural, =0 {text}}'], 'm', 'd'],
        ]);

        // one message for the block content and one message for the ICU
        expect(extract('<!-- i18n:m|d -->before{count, plural, =0 {text}}after<!-- /i18n -->'))
            .toEqual([
              [['{count, plural, =0 {text}}'], '', ''],
              [['before', '{count, plural, =0 {text}}', 'after'], 'm', 'd'],
            ]);
      });

      it('should not extract ICU messages outside of i18n sections',
         () => { expect(extract('{count, plural, =0 {text}}')).toEqual([]); });

      it('should not extract nested ICU messages', () => {
        expect(extract('<div i18n="m|d">{count, plural, =0 { {sex, gender, =m {m}} }}</div>'))
            .toEqual([
              [['{count, plural, =0 {{sex, gender, =m {m}} }}'], 'm', 'd'],
            ]);
      });
    });

    describe('attributes', () => {
      it('should extract from attributes outside of translatable sections', () => {
        expect(extract('<div i18n-title="m|d" title="msg"></div>')).toEqual([
          [['title="msg"'], 'm', 'd'],
        ]);
      });

      it('should extract from attributes in translatable elements', () => {
        expect(extract('<div i18n><p><b i18n-title="m|d" title="msg"></b></p></div>')).toEqual([
          [['<p><b i18n-title="m|d" title="msg"></b></p>'], '', ''],
          [['title="msg"'], 'm', 'd'],
        ]);
      });

      it('should extract from attributes in translatable blocks', () => {
        expect(extract('<!-- i18n --><p><b i18n-title="m|d" title="msg"></b></p><!-- /i18n -->'))
            .toEqual([
              [['title="msg"'], 'm', 'd'],
              [['<p><b i18n-title="m|d" title="msg"></b></p>'], '', ''],
            ]);
      });

      it('should extract from attributes in translatable ICUs', () => {
        expect(
            extract(
                '<!-- i18n -->{count, plural, =0 {<p><b i18n-title="m|d" title="msg"></b></p>}}<!-- /i18n -->'))
            .toEqual([
              [['title="msg"'], 'm', 'd'],
              [['{count, plural, =0 {<p><b i18n-title="m|d" title="msg"></b></p>}}'], '', ''],
            ]);
      });

      it('should extract from attributes in non translatable ICUs', () => {
        expect(extract('{count, plural, =0 {<p><b i18n-title="m|d" title="msg"></b></p>}}'))
            .toEqual([
              [['title="msg"'], 'm', 'd'],
            ]);
      });

      it('should not create a message for empty attributes',
         () => { expect(extract('<div i18n-title="m|d" title></div>')).toEqual([]); });
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
              [['title="bb"'], '', ''],
            ]);
      });
    });

    describe('errors', () => {
      describe('elements', () => {
        it('should report nested translatable elements', () => {
          expect(extractErrors(`<p i18n><b i18n></b></p>`)).toEqual([
            ['Could not mark an element as translatable inside a translatable section', '<b i18n>'],
          ]);
        });

        it('should report translatable elements in implicit elements', () => {
          expect(extractErrors(`<p><b i18n></b></p>`, ['p'])).toEqual([
            ['Could not mark an element as translatable inside a translatable section', '<b i18n>'],
          ]);
        });

        it('should report translatable elements in translatable blocks', () => {
          expect(extractErrors(`<!-- i18n --><b i18n></b><!-- /i18n -->`)).toEqual([
            ['Could not mark an element as translatable inside a translatable section', '<b i18n>'],
          ]);
        });
      });

      describe('blocks', () => {
        it('should report nested blocks', () => {
          expect(extractErrors(`<!-- i18n --><!-- i18n --><!-- /i18n --><!-- /i18n -->`)).toEqual([
            ['Could not start a block inside a translatable section', '<!--'],
            ['Trying to close an unopened block', '<!--'],
          ]);

        });

        it('should report unclosed blocks', () => {
          expect(extractErrors(`<!-- i18n -->`)).toEqual([
            ['Unclosed block', '<!--'],
          ]);
        });

        it('should report translatable blocks in translatable elements', () => {
          expect(extractErrors(`<p i18n><!-- i18n --><!-- /i18n --></p>`)).toEqual([
            ['Could not start a block inside a translatable section', '<!--'],
            ['Trying to close an unopened block', '<!--'],
          ]);
        });

        it('should report translatable blocks in implicit elements', () => {
          expect(extractErrors(`<p><!-- i18n --><!-- /i18n --></p>`, ['p'])).toEqual([
            ['Could not start a block inside a translatable section', '<!--'],
            ['Trying to close an unopened block', '<!--'],
          ]);
        });

        it('should report when start and end of a block are not at the same level', () => {
          expect(extractErrors(`<!-- i18n --><p><!-- /i18n --></p>`)).toEqual([
            ['I18N blocks should not cross element boundaries', '<!--'],
            ['Unclosed block', '<p>'],
          ]);

          expect(extractErrors(`<p><!-- i18n --></p><!-- /i18n -->`)).toEqual([
            ['I18N blocks should not cross element boundaries', '<!--'],
            ['Unclosed block', '<!--'],
          ]);
        });
      });

      describe('implicit elements', () => {
        it('should report nested implicit elements', () => {
          expect(extractErrors(`<p><b></b></p>`, ['p', 'b'])).toEqual([
            ['Could not mark an element as translatable inside a translatable section', '<b>'],
          ]);
        });

        it('should report implicit element in translatable element', () => {
          expect(extractErrors(`<p i18n><b></b></p>`, ['b'])).toEqual([
            ['Could not mark an element as translatable inside a translatable section', '<b>'],
          ]);
        });

        it('should report implicit element in translatable blocks', () => {
          expect(extractErrors(`<!-- i18n --><b></b><!-- /i18n -->`, ['b'])).toEqual([
            ['Could not mark an element as translatable inside a translatable section', '<b>'],
          ]);
        });
      });
    });
  });

  describe('Merger', () => {
    describe('elements', () => {
      it('should merge elements', () => {
        const HTML = `<p i18n="m|d">foo</p>`;
        expect(fakeTranslate(HTML)).toEqual('<p>-*foo*-</p>');
      });

      it('should merge nested elements', () => {
        const HTML = `<div>before<p i18n="m|d">foo</p><!-- comment --></div>`;
        expect(fakeTranslate(HTML)).toEqual('<div>before<p>-*foo*-</p></div>');
      });
    });

    describe('blocks', () => {
      it('should merge blocks', () => {
        const HTML = `before<!-- i18n --><p>foo</p><span><i>bar</i></span><!-- /i18n -->after`;
        expect(fakeTranslate(HTML)).toEqual('before-*<p>foo</p><span><i>bar</i></span>*-after');
      });

      it('should merge nested blocks', () => {
        const HTML =
            `<div>before<!-- i18n --><p>foo</p><span><i>bar</i></span><!-- /i18n -->after</div>`;
        expect(fakeTranslate(HTML))
            .toEqual('<div>before-*<p>foo</p><span><i>bar</i></span>*-after</div>');
      });
    });

    describe('attributes', () => {
      it('should merge attributes', () => {
        const HTML = `<p i18n-title="m|d" title="foo"></p>`;
        expect(fakeTranslate(HTML)).toEqual('<p title="-*"></p>');
      });

      it('should merge attributes', () => {
        const HTML = `<div>{count, plural, =0 {<p i18n-title title="foo"></p>}}</div>`;
        expect(fakeTranslate(HTML)).toEqual('<div>{count, plural, =0 {<p title="-*"></p>}}</div>');
      });
    });
  });
}

function parseHtml(html: string): html.Node[] {
  const htmlParser = new HtmlParser();
  const parseResult = htmlParser.parse(html, 'extractor spec', true);
  if (parseResult.errors.length > 1) {
    throw Error(`unexpected parse errors: ${parseResult.errors.join('\n')}`);
  }
  return parseResult.rootNodes;
}

function fakeTranslate(
    content: string, implicitTags: string[] = [],
    implicitAttrs: {[k: string]: string[]} = {}): string {
  const htmlNodes: html.Node[] = parseHtml(content);
  const htmlMsgs: HtmlMessage[] =
      extractAstMessages(htmlNodes, implicitTags, implicitAttrs).messages;

  const i18nMsgMap: {[id: string]: html.Node[]} = {};
  const converter = getHtmlToI18nConverter(DEFAULT_INTERPOLATION_CONFIG);

  htmlMsgs.forEach(msg => {
    const i18nMsg = converter(msg);

    i18nMsgMap[digestMessage(i18nMsg.nodes, i18nMsg.meaning)] = [
      new html.Text('-*', null),
      ...msg.nodes,
      new html.Text('*-', null),
    ];
  });

  const translations = new TranslationBundle(i18nMsgMap);

  const translateNodes = mergeTranslations(
      htmlNodes, translations, DEFAULT_INTERPOLATION_CONFIG, implicitTags, implicitAttrs);

  return serializeNodes(translateNodes).join('');
}

function extract(
    html: string, implicitTags: string[] = [],
    implicitAttrs: {[k: string]: string[]} = {}): [string[], string, string][] {
  const messages = extractAstMessages(parseHtml(html), implicitTags, implicitAttrs).messages;

  // clang-format off
  // https://github.com/angular/clang-format/issues/35
  return messages.map(
    message => [serializeNodes(message.nodes), message.meaning, message.description, ]) as [string[], string, string][];
  // clang-format on
}

function extractErrors(
    html: string, implicitTags: string[] = [], implicitAttrs: {[k: string]: string[]} = {}): any[] {
  const errors = extractAstMessages(parseHtml(html), implicitTags, implicitAttrs).errors;

  return errors.map((e): [string, string] => [e.msg, e.span.toString()]);
}
