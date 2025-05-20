/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DEFAULT_INTERPOLATION_CONFIG, HtmlParser} from '../../index';
import {MissingTranslationStrategy} from '@angular/core';

import {digest, serializeNodes as serializeI18nNodes} from '../../src/i18n/digest';
import {extractMessages, mergeTranslations} from '../../src/i18n/extractor_merger';
import * as i18n from '../../src/i18n/i18n_ast';
import {TranslationBundle} from '../../src/i18n/translation_bundle';
import * as html from '../../src/ml_parser/ast';
import {serializeNodes as serializeHtmlNodes} from '../ml_parser/util/util';

describe('Extractor', () => {
  describe('elements', () => {
    it('should extract from elements', () => {
      expect(extract('<div i18n="m|d|e">text<span>nested</span></div>')).toEqual([
        [
          ['text', '<ph tag name="START_TAG_SPAN">nested</ph name="CLOSE_TAG_SPAN">'],
          'm',
          'd|e',
          '',
        ],
      ]);
    });

    it('should extract from attributes', () => {
      expect(
        extract(
          '<div i18n="m1|d1"><span i18n-title="m2|d2" title="single child">nested</span></div>',
        ),
      ).toEqual([
        [['<ph tag name="START_TAG_SPAN">nested</ph name="CLOSE_TAG_SPAN">'], 'm1', 'd1', ''],
        [['single child'], 'm2', 'd2', ''],
      ]);
    });

    it('should extract from attributes with id', () => {
      expect(
        extract(
          '<div i18n="m1|d1@@i1"><span i18n-title="m2|d2@@i2" title="single child">nested</span></div>',
        ),
      ).toEqual([
        [['<ph tag name="START_TAG_SPAN">nested</ph name="CLOSE_TAG_SPAN">'], 'm1', 'd1', 'i1'],
        [['single child'], 'm2', 'd2', 'i2'],
      ]);
    });

    it('should trim whitespace from custom ids (but not meanings)', () => {
      expect(extract('<div i18n="\n   m1|d1@@i1\n   ">test</div>')).toEqual([
        [['test'], '\n   m1', 'd1', 'i1'],
      ]);
    });

    it('should extract from attributes without meaning and with id', () => {
      expect(
        extract(
          '<div i18n="d1@@i1"><span i18n-title="d2@@i2" title="single child">nested</span></div>',
        ),
      ).toEqual([
        [['<ph tag name="START_TAG_SPAN">nested</ph name="CLOSE_TAG_SPAN">'], '', 'd1', 'i1'],
        [['single child'], '', 'd2', 'i2'],
      ]);
    });

    it('should extract from attributes with id only', () => {
      expect(
        extract(
          '<div i18n="@@i1"><span i18n-title="@@i2" title="single child">nested</span></div>',
        ),
      ).toEqual([
        [['<ph tag name="START_TAG_SPAN">nested</ph name="CLOSE_TAG_SPAN">'], '', '', 'i1'],
        [['single child'], '', '', 'i2'],
      ]);
    });

    it('should extract from ICU messages', () => {
      expect(
        extract(
          '<div i18n="m|d">{count, plural, =0 { <p i18n-title i18n-desc title="title" desc="desc"></p>}}</div>',
        ),
      ).toEqual([
        [
          ['{count, plural, =0 {[<ph tag name="START_PARAGRAPH"></ph name="CLOSE_PARAGRAPH">]}}'],
          'm',
          'd',
          '',
        ],
        [['title'], '', '', ''],
        [['desc'], '', '', ''],
      ]);
    });

    it('should not create a message for empty elements', () => {
      expect(extract('<div i18n="m|d"></div>')).toEqual([]);
    });

    it('should not create a message for placeholder-only elements', () => {
      expect(extract('<div i18n="m|d">{{ foo }}</div>')).toEqual([]);
    });

    it('should ignore implicit elements in translatable elements', () => {
      expect(extract('<div i18n="m|d"><p></p></div>', ['p'])).toEqual([
        [['<ph tag name="START_PARAGRAPH"></ph name="CLOSE_PARAGRAPH">'], 'm', 'd', ''],
      ]);
    });
  });

  describe('blocks', () => {
    it('should extract from elements inside blocks', () => {
      expect(
        extract(
          '@switch (value) {' +
            '@case (1) {<div i18n="a|b|c">one <span>nested</span></div>}' +
            '@case (2) {<strong i18n="d|e|f">two <span>nested</span></strong>}' +
            '@default {<strong i18n="g|h|i">default <span>nested</span></strong>}' +
            '}',
        ),
      ).toEqual([
        [
          ['one ', '<ph tag name="START_TAG_SPAN">nested</ph name="CLOSE_TAG_SPAN">'],
          'a',
          'b|c',
          '',
        ],
        [
          ['two ', '<ph tag name="START_TAG_SPAN">nested</ph name="CLOSE_TAG_SPAN">'],
          'd',
          'e|f',
          '',
        ],
        [
          ['default ', '<ph tag name="START_TAG_SPAN">nested</ph name="CLOSE_TAG_SPAN">'],
          'g',
          'h|i',
          '',
        ],
      ]);
    });

    it('should extract from i18n comment blocks inside blocks', () => {
      expect(
        extract(
          '@switch (value) {' +
            '@case (1) {<!-- i18n: oneMeaning|oneDesc -->one message<!-- /i18n -->}' +
            '@case (2) {<!-- i18n: twoMeaning|twoDesc -->two message<!-- /i18n -->}' +
            '@default {<!-- i18n: defaultMeaning|defaultDesc -->default message<!-- /i18n -->}' +
            '}',
        ),
      ).toEqual([
        [['one message'], 'oneMeaning', 'oneDesc', ''],
        [['two message'], 'twoMeaning', 'twoDesc', ''],
        [['default message'], 'defaultMeaning', 'defaultDesc', ''],
      ]);
    });

    it('should extract ICUs from elements inside blocks', () => {
      expect(
        extract(
          '@switch (value) {' +
            '@case (1) {<div i18n="a|b">{count, plural, =0 {oneText}}</div>}' +
            '@case (2) {<div i18n="c|d">{count, plural, =0 {twoText}}</div>}' +
            '@default {<div i18n="e|f">{count, plural, =0 {defaultText}}</div>}' +
            '}',
        ),
      ).toEqual([
        [['{count, plural, =0 {[oneText]}}'], 'a', 'b', ''],
        [['{count, plural, =0 {[twoText]}}'], 'c', 'd', ''],
        [['{count, plural, =0 {[defaultText]}}'], 'e', 'f', ''],
      ]);
    });

    it('should not extract messages from ICUs directly inside blocks', () => {
      const expression = '{count, plural, =0 {text}}';

      expect(
        extract(
          `@switch (value) {` +
            `@case (1) {${expression}}` +
            `@case (2) {${expression}}` +
            `@default {${expression}}` +
            `}`,
        ),
      ).toEqual([]);
    });

    it('should handle blocks inside of translated elements', () => {
      expect(
        extract('<span i18n="a|b|c">@if (cond) {main content} @else {else content}</span>`'),
      ).toEqual([
        [
          [
            '<ph block name="START_BLOCK_IF">main content</ph name="CLOSE_BLOCK_IF">',
            ' ',
            '<ph block name="START_BLOCK_ELSE">else content</ph name="CLOSE_BLOCK_ELSE">',
          ],
          'a',
          'b|c',
          '',
        ],
      ]);
    });
  });

  describe('i18n comment blocks', () => {
    it('should extract from blocks', () => {
      expect(
        extract(`<!-- i18n: meaning1|desc1 -->message1<!-- /i18n -->
         <!-- i18n: desc2 -->message2<!-- /i18n -->
         <!-- i18n -->message3<!-- /i18n -->
         <!-- i18n: meaning4|desc4@@id4 -->message4<!-- /i18n -->
         <!-- i18n: @@id5 -->message5<!-- /i18n -->`),
      ).toEqual([
        [['message1'], 'meaning1', 'desc1', ''],
        [['message2'], '', 'desc2', ''],
        [['message3'], '', '', ''],
        [['message4'], 'meaning4', 'desc4', 'id4'],
        [['message5'], '', '', 'id5'],
      ]);
    });

    it('should ignore implicit elements in blocks', () => {
      expect(extract('<!-- i18n:m|d --><p></p><!-- /i18n -->', ['p'])).toEqual([
        [['<ph tag name="START_PARAGRAPH"></ph name="CLOSE_PARAGRAPH">'], 'm', 'd', ''],
      ]);
    });

    it('should extract siblings', () => {
      expect(
        extract(
          `<!-- i18n -->text<p>html<b>nested</b></p>{count, plural, =0 {<span>html</span>}}{{interp}}<!-- /i18n -->`,
        ),
      ).toEqual([
        [
          ['{count, plural, =0 {[<ph tag name="START_TAG_SPAN">html</ph name="CLOSE_TAG_SPAN">]}}'],
          '',
          '',
          '',
        ],
        [
          [
            'text',
            '<ph tag name="START_PARAGRAPH">html, <ph tag' +
              ' name="START_BOLD_TEXT">nested</ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">',
            '<ph icu name="ICU">{count, plural, =0 {[<ph tag' +
              ' name="START_TAG_SPAN">html</ph name="CLOSE_TAG_SPAN">]}}</ph>',
            '[<ph name="INTERPOLATION">interp</ph>]',
          ],
          '',
          '',
          '',
        ],
      ]);
    });

    it('should ignore other comments', () => {
      expect(
        extract(`<!-- i18n: meaning1|desc1@@id1 --><!-- other -->message1<!-- /i18n -->`),
      ).toEqual([[['message1'], 'meaning1', 'desc1', 'id1']]);
    });

    it('should not create a message for empty blocks', () => {
      expect(extract(`<!-- i18n: meaning1|desc1 --><!-- /i18n -->`)).toEqual([]);
    });
  });

  describe('ICU messages', () => {
    it('should extract ICU messages from translatable elements', () => {
      // single message when ICU is the only children
      expect(extract('<div i18n="m|d">{count, plural, =0 {text}}</div>')).toEqual([
        [['{count, plural, =0 {[text]}}'], 'm', 'd', ''],
      ]);

      // single message when ICU is the only (implicit) children
      expect(extract('<div>{count, plural, =0 {text}}</div>', ['div'])).toEqual([
        [['{count, plural, =0 {[text]}}'], '', '', ''],
      ]);

      // one message for the element content and one message for the ICU
      expect(extract('<div i18n="m|d@@i">before{count, plural, =0 {text}}after</div>')).toEqual([
        [
          ['before', '<ph icu name="ICU">{count, plural, =0 {[text]}}</ph>', 'after'],
          'm',
          'd',
          'i',
        ],
        [['{count, plural, =0 {[text]}}'], '', '', ''],
      ]);
    });

    it('should extract ICU messages from translatable block', () => {
      // single message when ICU is the only children
      expect(extract('<!-- i18n:m|d -->{count, plural, =0 {text}}<!-- /i18n -->')).toEqual([
        [['{count, plural, =0 {[text]}}'], 'm', 'd', ''],
      ]);

      // one message for the block content and one message for the ICU
      expect(
        extract('<!-- i18n:m|d -->before{count, plural, =0 {text}}after<!-- /i18n -->'),
      ).toEqual([
        [['{count, plural, =0 {[text]}}'], '', '', ''],
        [['before', '<ph icu name="ICU">{count, plural, =0 {[text]}}</ph>', 'after'], 'm', 'd', ''],
      ]);
    });

    it('should not extract ICU messages outside of i18n sections', () => {
      expect(extract('{count, plural, =0 {text}}')).toEqual([]);
    });

    it('should ignore nested ICU messages', () => {
      expect(
        extract('<div i18n="m|d">{count, plural, =0 { {sex, select, male {m}} }}</div>'),
      ).toEqual([[['{count, plural, =0 {[{sex, select, male {[m]}},  ]}}'], 'm', 'd', '']]);
    });

    it('should ignore implicit elements in non translatable ICU messages', () => {
      expect(
        extract(
          '<div i18n="m|d@@i">{count, plural, =0 { {sex, select, male {<p>ignore</p>}}' +
            ' }}</div>',
          ['p'],
        ),
      ).toEqual([
        [
          [
            '{count, plural, =0 {[{sex, select, male {[<ph tag name="START_PARAGRAPH">ignore</ph name="CLOSE_PARAGRAPH">]}},  ]}}',
          ],
          'm',
          'd',
          'i',
        ],
      ]);
    });

    it('should ignore implicit elements in non translatable ICU messages', () => {
      expect(extract('{count, plural, =0 { {sex, select, male {<p>ignore</p>}} }}', ['p'])).toEqual(
        [],
      );
    });
  });

  describe('attributes', () => {
    it('should extract from attributes outside of translatable sections', () => {
      expect(extract('<div i18n-title="m|d@@i" title="msg"></div>')).toEqual([
        [['msg'], 'm', 'd', 'i'],
      ]);
    });

    it('should extract from attributes in translatable elements', () => {
      expect(extract('<div i18n><p><b i18n-title="m|d@@i" title="msg"></b></p></div>')).toEqual([
        [
          [
            '<ph tag name="START_PARAGRAPH"><ph tag name="START_BOLD_TEXT"></ph' +
              ' name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">',
          ],
          '',
          '',
          '',
        ],
        [['msg'], 'm', 'd', 'i'],
      ]);
    });

    it('should extract from attributes in translatable blocks', () => {
      expect(
        extract('<!-- i18n --><p><b i18n-title="m|d" title="msg"></b></p><!-- /i18n -->'),
      ).toEqual([
        [['msg'], 'm', 'd', ''],
        [
          [
            '<ph tag name="START_PARAGRAPH"><ph tag name="START_BOLD_TEXT"></ph' +
              ' name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">',
          ],
          '',
          '',
          '',
        ],
      ]);
    });

    it('should extract from attributes in translatable ICUs', () => {
      expect(
        extract(`<!-- i18n -->{count, plural, =0 {<p><b i18n-title="m|d@@i"
                 title="msg"></b></p>}}<!-- /i18n -->`),
      ).toEqual([
        [['msg'], 'm', 'd', 'i'],
        [
          [
            '{count, plural, =0 {[<ph tag name="START_PARAGRAPH"><ph tag' +
              ' name="START_BOLD_TEXT"></ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">]}}',
          ],
          '',
          '',
          '',
        ],
      ]);
    });

    it('should extract from attributes in non translatable ICUs', () => {
      expect(extract('{count, plural, =0 {<p><b i18n-title="m|d" title="msg"></b></p>}}')).toEqual([
        [['msg'], 'm', 'd', ''],
      ]);
    });

    it('should not create a message for empty attributes', () => {
      expect(extract('<div i18n-title="m|d" title></div>')).toEqual([]);
    });

    it('should not create a message for placeholder-only attributes', () => {
      expect(extract('<div i18n-title="m|d" title="{{ foo }}"></div>')).toEqual([]);
    });
  });

  describe('implicit elements', () => {
    it('should extract from implicit elements', () => {
      expect(extract('<b>bold</b><i>italic</i>', ['b'])).toEqual([[['bold'], '', '', '']]);
    });

    it('should allow nested implicit elements', () => {
      let result: any[] = undefined!;

      expect(() => {
        result = extract('<div>outer<div>inner</div></div>', ['div']);
      }).not.toThrow();

      expect(result).toEqual([
        [['outer', '<ph tag name="START_TAG_DIV">inner</ph name="CLOSE_TAG_DIV">'], '', '', ''],
      ]);
    });
  });

  describe('implicit attributes', () => {
    it('should extract implicit attributes', () => {
      expect(
        extract('<b title="bb">bold</b><i title="ii">italic</i>', [], {'b': ['title']}),
      ).toEqual([[['bb'], '', '', '']]);
    });
  });

  describe('errors', () => {
    describe('elements', () => {
      it('should report nested translatable elements', () => {
        expect(extractErrors(`<p i18n><b i18n></b></p>`)).toEqual([
          [
            'Could not mark an element as translatable inside a translatable section',
            '<b i18n></b>',
          ],
        ]);
      });

      it('should report translatable elements in implicit elements', () => {
        expect(extractErrors(`<p><b i18n></b></p>`, ['p'])).toEqual([
          [
            'Could not mark an element as translatable inside a translatable section',
            '<b i18n></b>',
          ],
        ]);
      });

      it('should report translatable elements in translatable blocks', () => {
        expect(extractErrors(`<!-- i18n --><b i18n></b><!-- /i18n -->`)).toEqual([
          [
            'Could not mark an element as translatable inside a translatable section',
            '<b i18n></b>',
          ],
        ]);
      });
    });

    describe('blocks', () => {
      it('should report nested blocks', () => {
        expect(extractErrors(`<!-- i18n --><!-- i18n --><!-- /i18n --><!-- /i18n -->`)).toEqual([
          ['Could not start a block inside a translatable section', '<!-- i18n -->'],
          ['Trying to close an unopened block', '<!-- /i18n -->'],
        ]);
      });

      it('should report unclosed blocks', () => {
        expect(extractErrors(`<!-- i18n -->`)).toEqual([['Unclosed block', '<!-- i18n -->']]);
      });

      it('should report translatable blocks in translatable elements', () => {
        expect(extractErrors(`<p i18n><!-- i18n --><!-- /i18n --></p>`)).toEqual([
          ['Could not start a block inside a translatable section', '<!-- i18n -->'],
          ['Trying to close an unopened block', '<!-- /i18n -->'],
        ]);
      });

      it('should report translatable blocks in implicit elements', () => {
        expect(extractErrors(`<p><!-- i18n --><!-- /i18n --></p>`, ['p'])).toEqual([
          ['Could not start a block inside a translatable section', '<!-- i18n -->'],
          ['Trying to close an unopened block', '<!-- /i18n -->'],
        ]);
      });

      it('should report when start and end of a block are not at the same level', () => {
        expect(extractErrors(`<!-- i18n --><p><!-- /i18n --></p>`)).toEqual([
          ['I18N blocks should not cross element boundaries', '<!-- /i18n -->'],
          ['Unclosed block', '<p><!-- /i18n --></p>'],
        ]);

        expect(extractErrors(`<p><!-- i18n --></p><!-- /i18n -->`)).toEqual([
          ['I18N blocks should not cross element boundaries', '<!-- /i18n -->'],
          ['Unclosed block', '<!-- /i18n -->'],
        ]);
      });
    });
  });
});

describe('Merger', () => {
  describe('elements', () => {
    it('should merge elements', () => {
      const HTML = `<p i18n="m|d">foo</p>`;
      expect(fakeTranslate(HTML)).toEqual('<p>**foo**</p>');
    });

    it('should merge nested elements', () => {
      const HTML = `<div>before<p i18n="m|d">foo</p><!-- comment --></div>`;
      expect(fakeTranslate(HTML)).toEqual('<div>before<p>**foo**</p></div>');
    });

    it('should merge empty messages', () => {
      const HTML = `<div i18n>some element</div>`;
      const htmlNodes: html.Node[] = parseHtml(HTML);
      const messages: i18n.Message[] = extractMessages(
        htmlNodes,
        DEFAULT_INTERPOLATION_CONFIG,
        [],
        {},
        /* preserveSignificantWhitespace */ true,
      ).messages;

      expect(messages.length).toEqual(1);
      const i18nMsgMap: {[id: string]: i18n.Node[]} = {};
      i18nMsgMap[digest(messages[0])] = [];
      const translations = new TranslationBundle(i18nMsgMap, null, digest);

      const output = mergeTranslations(
        htmlNodes,
        translations,
        DEFAULT_INTERPOLATION_CONFIG,
        [],
        {},
      );
      expect(output.errors).toEqual([]);

      expect(serializeHtmlNodes(output.rootNodes).join('')).toEqual(`<div></div>`);
    });
  });

  describe('i18n comment blocks', () => {
    it('should console.warn if we use i18n comments', () => {
      // TODO(ocombe): expect a warning message when we have a proper log service
      extract('<!-- i18n --><p><b i18n-title="m|d" title="msg"></b></p><!-- /i18n -->');
    });

    it('should merge blocks', () => {
      const HTML = `before<!-- i18n --><p>foo</p><span><i>bar</i></span><!-- /i18n -->after`;
      expect(fakeTranslate(HTML)).toEqual(
        'before**[ph tag name="START_PARAGRAPH">foo[/ph name="CLOSE_PARAGRAPH">[ph tag' +
          ' name="START_TAG_SPAN">[ph tag name="START_ITALIC_TEXT">bar[/ph' +
          ' name="CLOSE_ITALIC_TEXT">[/ph name="CLOSE_TAG_SPAN">**after',
      );
    });

    it('should merge nested blocks', () => {
      const HTML = `<div>before<!-- i18n --><p>foo</p><span><i>bar</i></span><!-- /i18n -->after</div>`;
      expect(fakeTranslate(HTML)).toEqual(
        '<div>before**[ph tag name="START_PARAGRAPH">foo[/ph name="CLOSE_PARAGRAPH">[ph' +
          ' tag name="START_TAG_SPAN">[ph tag name="START_ITALIC_TEXT">bar[/ph' +
          ' name="CLOSE_ITALIC_TEXT">[/ph name="CLOSE_TAG_SPAN">**after</div>',
      );
    });
  });

  describe('attributes', () => {
    it('should merge attributes', () => {
      const HTML = `<p i18n-title="m|d" title="foo"></p>`;
      expect(fakeTranslate(HTML)).toEqual('<p title="**foo**"></p>');
    });

    it('should merge attributes with ids', () => {
      const HTML = `<p i18n-title="@@id" title="foo"></p>`;
      expect(fakeTranslate(HTML)).toEqual('<p title="**foo**"></p>');
    });

    it('should merge nested attributes', () => {
      const HTML = `<div>{count, plural, =0 {<p i18n-title title="foo"></p>}}</div>`;
      expect(fakeTranslate(HTML)).toEqual(
        '<div>{count, plural, =0 {<p title="**foo**"></p>}}</div>',
      );
    });

    it('should merge attributes without values', () => {
      const HTML = `<p i18n-title="m|d" title=""></p>`;
      expect(fakeTranslate(HTML)).toEqual('<p title=""></p>');
    });

    it('should merge empty attributes', () => {
      const HTML = `<div i18n-title title="some attribute">some element</div>`;
      const htmlNodes: html.Node[] = parseHtml(HTML);
      const messages: i18n.Message[] = extractMessages(
        htmlNodes,
        DEFAULT_INTERPOLATION_CONFIG,
        [],
        {},
        /* preserveSignificantWhitespace */ true,
      ).messages;

      expect(messages.length).toEqual(1);
      const i18nMsgMap: {[id: string]: i18n.Node[]} = {};
      i18nMsgMap[digest(messages[0])] = [];
      const translations = new TranslationBundle(i18nMsgMap, null, digest);

      const output = mergeTranslations(
        htmlNodes,
        translations,
        DEFAULT_INTERPOLATION_CONFIG,
        [],
        {},
      );
      expect(output.errors).toEqual([]);

      expect(serializeHtmlNodes(output.rootNodes).join('')).toEqual(
        `<div title="">some element</div>`,
      );
    });
  });

  describe('no translations', () => {
    it('should remove i18n attributes', () => {
      const HTML = `<p i18n="m|d">foo</p>`;
      expect(fakeNoTranslate(HTML)).toEqual('<p>foo</p>');
    });

    it('should remove i18n- attributes', () => {
      const HTML = `<p i18n-title="m|d" title="foo"></p>`;
      expect(fakeNoTranslate(HTML)).toEqual('<p title="foo"></p>');
    });

    it('should remove i18n comment blocks', () => {
      const HTML = `before<!-- i18n --><p>foo</p><span><i>bar</i></span><!-- /i18n -->after`;
      expect(fakeNoTranslate(HTML)).toEqual('before<p>foo</p><span><i>bar</i></span>after');
    });

    it('should remove nested i18n markup', () => {
      const HTML = `<!-- i18n --><span someAttr="ok">foo</span><div>{count, plural, =0 {<p i18n-title title="foo"></p>}}</div><!-- /i18n -->`;
      expect(fakeNoTranslate(HTML)).toEqual(
        '<span someAttr="ok">foo</span><div>{count, plural, =0 {<p title="foo"></p>}}</div>',
      );
    });
  });
});

function parseHtml(html: string): html.Node[] {
  const htmlParser = new HtmlParser();
  const parseResult = htmlParser.parse(html, 'extractor spec', {tokenizeExpansionForms: true});
  if (parseResult.errors.length > 1) {
    throw new Error(`unexpected parse errors: ${parseResult.errors.join('\n')}`);
  }
  return parseResult.rootNodes;
}

function fakeTranslate(
  content: string,
  implicitTags: string[] = [],
  implicitAttrs: {[k: string]: string[]} = {},
): string {
  const htmlNodes: html.Node[] = parseHtml(content);
  const messages: i18n.Message[] = extractMessages(
    htmlNodes,
    DEFAULT_INTERPOLATION_CONFIG,
    implicitTags,
    implicitAttrs,
    /* preserveSignificantWhitespace */ true,
  ).messages;

  const i18nMsgMap: {[id: string]: i18n.Node[]} = {};

  messages.forEach((message) => {
    const id = digest(message);
    const text = serializeI18nNodes(message.nodes).join('').replace(/</g, '[');
    i18nMsgMap[id] = [new i18n.Text(`**${text}**`, null!)];
  });

  const translationBundle = new TranslationBundle(i18nMsgMap, null, digest);
  const output = mergeTranslations(
    htmlNodes,
    translationBundle,
    DEFAULT_INTERPOLATION_CONFIG,
    implicitTags,
    implicitAttrs,
  );
  expect(output.errors).toEqual([]);

  return serializeHtmlNodes(output.rootNodes).join('');
}

function fakeNoTranslate(
  content: string,
  implicitTags: string[] = [],
  implicitAttrs: {[k: string]: string[]} = {},
): string {
  const htmlNodes: html.Node[] = parseHtml(content);
  const translationBundle = new TranslationBundle(
    {},
    null,
    digest,
    undefined,
    MissingTranslationStrategy.Ignore,
    console,
  );
  const output = mergeTranslations(
    htmlNodes,
    translationBundle,
    DEFAULT_INTERPOLATION_CONFIG,
    implicitTags,
    implicitAttrs,
  );
  expect(output.errors).toEqual([]);

  return serializeHtmlNodes(output.rootNodes).join('');
}

function extract(
  html: string,
  implicitTags: string[] = [],
  implicitAttrs: {[k: string]: string[]} = {},
): [string[], string, string, string][] {
  const result = extractMessages(
    parseHtml(html),
    DEFAULT_INTERPOLATION_CONFIG,
    implicitTags,
    implicitAttrs,
    /* preserveSignificantWhitespace */ true,
  );

  if (result.errors.length > 0) {
    throw new Error(`unexpected errors: ${result.errors.join('\n')}`);
  }

  return result.messages.map((message) => [
    serializeI18nNodes(message.nodes),
    message.meaning,
    message.description,
    message.id,
  ]) as [string[], string, string, string][];
}

function extractErrors(
  html: string,
  implicitTags: string[] = [],
  implicitAttrs: {[k: string]: string[]} = {},
): any[] {
  const errors = extractMessages(
    parseHtml(html),
    DEFAULT_INTERPOLATION_CONFIG,
    implicitTags,
    implicitAttrs,
    /* preserveSignificantWhitespace */ true,
  ).errors;

  return errors.map((e): [string, string] => [e.msg, e.span.toString()]);
}
