/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {digest, serializeNodes} from '../../src/i18n/digest';
import {extractMessages} from '../../src/i18n/extractor_merger';
import {Message} from '../../src/i18n/i18n_ast';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../src/ml_parser/defaults';
import {HtmlParser} from '../../src/ml_parser/html_parser';

describe('I18nParser', () => {
  describe('elements', () => {
    it('should extract from elements', () => {
      expect(_humanizeMessages('<div i18n="m|d">text</div>')).toEqual([[['text'], 'm', 'd', '']]);
    });

    it('should extract from nested elements', () => {
      expect(_humanizeMessages('<div i18n="m|d">text<span><b>nested</b></span></div>')).toEqual([
        [
          [
            'text',
            '<ph tag name="START_TAG_SPAN"><ph tag name="START_BOLD_TEXT">nested</ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_TAG_SPAN">',
          ],
          'm',
          'd',
          '',
        ],
      ]);
    });

    it('should not create a message for empty elements', () => {
      expect(_humanizeMessages('<div i18n="m|d"></div>')).toEqual([]);
    });

    it('should not create a message for plain elements', () => {
      expect(_humanizeMessages('<div></div>')).toEqual([]);
    });

    it('should support void elements', () => {
      expect(_humanizeMessages('<div i18n="m|d"><p><br></p></div>')).toEqual([
        [
          [
            '<ph tag name="START_PARAGRAPH"><ph tag name="LINE_BREAK"/></ph name="CLOSE_PARAGRAPH">',
          ],
          'm',
          'd',
          '',
        ],
      ]);
    });

    it('should trim whitespace from custom ids (but not meanings)', () => {
      expect(_humanizeMessages('<div i18n="\n   m|d@@id\n   ">text</div>')).toEqual([
        [['text'], '\n   m', 'd', 'id'],
      ]);
    });
  });

  describe('attributes', () => {
    it('should extract from attributes outside of translatable section', () => {
      expect(_humanizeMessages('<div i18n-title="m|d" title="msg"></div>')).toEqual([
        [['msg'], 'm', 'd', ''],
      ]);
    });

    it('should extract from attributes in translatable element', () => {
      expect(
        _humanizeMessages('<div i18n><p><b i18n-title="m|d" title="msg"></b></p></div>'),
      ).toEqual([
        [
          [
            '<ph tag name="START_PARAGRAPH"><ph tag name="START_BOLD_TEXT"></ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">',
          ],
          '',
          '',
          '',
        ],
        [['msg'], 'm', 'd', ''],
      ]);
    });

    it('should extract from attributes in translatable block', () => {
      expect(
        _humanizeMessages('<!-- i18n --><p><b i18n-title="m|d" title="msg"></b></p><!-- /i18n -->'),
      ).toEqual([
        [['msg'], 'm', 'd', ''],
        [
          [
            '<ph tag name="START_PARAGRAPH"><ph tag name="START_BOLD_TEXT"></ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">',
          ],
          '',
          '',
          '',
        ],
      ]);
    });

    it('should extract from attributes in translatable ICU', () => {
      expect(
        _humanizeMessages(
          '<!-- i18n -->{count, plural, =0 {<p><b i18n-title="m|d" title="msg"></b></p>}}<!-- /i18n -->',
        ),
      ).toEqual([
        [['msg'], 'm', 'd', ''],
        [
          [
            '{count, plural, =0 {[<ph tag name="START_PARAGRAPH"><ph tag name="START_BOLD_TEXT"></ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">]}}',
          ],
          '',
          '',
          '',
        ],
      ]);
    });

    it('should extract from attributes in non translatable ICU', () => {
      expect(
        _humanizeMessages('{count, plural, =0 {<p><b i18n-title="m|d" title="msg"></b></p>}}'),
      ).toEqual([[['msg'], 'm', 'd', '']]);
    });

    it('should not create a message for empty attributes', () => {
      expect(_humanizeMessages('<div i18n-title="m|d" title></div>')).toEqual([]);
    });
  });

  describe('interpolation', () => {
    it('should replace interpolation with placeholder', () => {
      expect(_humanizeMessages('<div i18n="m|d">before{{ exp }}after</div>')).toEqual([
        [['[before, <ph name="INTERPOLATION"> exp </ph>, after]'], 'm', 'd', ''],
      ]);
    });

    it('should support named interpolation', () => {
      expect(
        _humanizeMessages('<div i18n="m|d">before{{ exp //i18n(ph="teSt") }}after</div>'),
      ).toEqual([
        [['[before, <ph name="TEST"> exp //i18n(ph="teSt") </ph>, after]'], 'm', 'd', ''],
      ]);

      expect(
        _humanizeMessages("<div i18n='m|d'>before{{ exp //i18n(ph='teSt') }}after</div>"),
      ).toEqual([
        [[`[before, <ph name="TEST"> exp //i18n(ph='teSt') </ph>, after]`], 'm', 'd', ''],
      ]);
    });
  });

  describe('blocks', () => {
    it('should extract from blocks', () => {
      expect(
        _humanizeMessages(`<!-- i18n: meaning1|desc1 -->message1<!-- /i18n -->
         <!-- i18n: desc2 -->message2<!-- /i18n -->
         <!-- i18n -->message3<!-- /i18n -->`),
      ).toEqual([
        [['message1'], 'meaning1', 'desc1', ''],
        [['message2'], '', 'desc2', ''],
        [['message3'], '', '', ''],
      ]);
    });

    it('should extract all siblings', () => {
      expect(_humanizeMessages(`<!-- i18n -->text<p>html<b>nested</b></p><!-- /i18n -->`)).toEqual([
        [
          [
            'text',
            '<ph tag name="START_PARAGRAPH">html, <ph tag name="START_BOLD_TEXT">nested</ph name="CLOSE_BOLD_TEXT"></ph name="CLOSE_PARAGRAPH">',
          ],
          '',
          '',
          '',
        ],
      ]);
    });
  });

  describe('ICU messages', () => {
    it('should extract as ICU when single child of an element', () => {
      expect(_humanizeMessages('<div i18n="m|d">{count, plural, =0 {zero}}</div>')).toEqual([
        [['{count, plural, =0 {[zero]}}'], 'm', 'd', ''],
      ]);
    });

    it('should extract as ICU + ph when not single child of an element', () => {
      expect(_humanizeMessages('<div i18n="m|d">b{count, plural, =0 {zero}}a</div>')).toEqual([
        [['b', '<ph icu name="ICU">{count, plural, =0 {[zero]}}</ph>', 'a'], 'm', 'd', ''],
        [['{count, plural, =0 {[zero]}}'], '', '', ''],
      ]);
    });

    it('should extract as ICU + ph when wrapped in whitespace in an element', () => {
      expect(_humanizeMessages('<div i18n="m|d"> {count, plural, =0 {zero}} </div>')).toEqual([
        [[' ', '<ph icu name="ICU">{count, plural, =0 {[zero]}}</ph>', ' '], 'm', 'd', ''],
        [['{count, plural, =0 {[zero]}}'], '', '', ''],
      ]);
    });

    it('should extract as ICU when single child of a block', () => {
      expect(
        _humanizeMessages('<!-- i18n:m|d -->{count, plural, =0 {zero}}<!-- /i18n -->'),
      ).toEqual([[['{count, plural, =0 {[zero]}}'], 'm', 'd', '']]);
    });

    it('should extract as ICU + ph when not single child of a block', () => {
      expect(
        _humanizeMessages('<!-- i18n:m|d -->b{count, plural, =0 {zero}}a<!-- /i18n -->'),
      ).toEqual([
        [['{count, plural, =0 {[zero]}}'], '', '', ''],
        [['b', '<ph icu name="ICU">{count, plural, =0 {[zero]}}</ph>', 'a'], 'm', 'd', ''],
      ]);
    });

    it('should not extract nested ICU messages', () => {
      expect(
        _humanizeMessages('<div i18n="m|d">b{count, plural, =0 {{sex, select, male {m}}}}a</div>'),
      ).toEqual([
        [
          ['b', '<ph icu name="ICU">{count, plural, =0 {[{sex, select, male {[m]}}]}}</ph>', 'a'],
          'm',
          'd',
          '',
        ],
        [['{count, plural, =0 {[{sex, select, male {[m]}}]}}'], '', '', ''],
      ]);
    });

    it('should preserve whitespace when preserving significant whitespace', () => {
      const html = '<div i18n="m|d">{count, plural, =0 {{{   foo   }}}}</div>';
      expect(
        _humanizeMessages(
          html,
          /* implicitTags */ undefined,
          /* implicitAttrs */ undefined,
          /* preserveSignificantWhitespace */ true,
        ),
      ).toEqual([
        [['{count, plural, =0 {[[<ph name="INTERPOLATION">   foo   </ph>]]}}'], 'm', 'd', ''],
      ]);
    });

    it('should normalize whitespace when not preserving significant whitespace', () => {
      const html = '<div i18n="m|d">{count, plural, =0 {{{   foo   }}}}</div>';
      expect(
        _humanizeMessages(
          html,
          /* implicitTags */ undefined,
          /* implicitAttrs */ undefined,
          /* preserveSignificantWhitespace */ false,
        ),
      ).toEqual([
        [['{count, plural, =0 {[[, <ph name="INTERPOLATION">foo</ph>, ]]}}'], 'm', 'd', ''],
      ]);
    });
  });

  describe('implicit elements', () => {
    it('should extract from implicit elements', () => {
      expect(_humanizeMessages('<b>bold</b><i>italic</i>', ['b'])).toEqual([
        [['bold'], '', '', ''],
      ]);
    });
  });

  describe('implicit attributes', () => {
    it('should extract implicit attributes', () => {
      expect(
        _humanizeMessages('<b title="bb">bold</b><i title="ii">italic</i>', [], {'b': ['title']}),
      ).toEqual([[['bb'], '', '', '']]);
    });
  });

  describe('placeholders', () => {
    it('should reuse the same placeholder name for tags', () => {
      const html = '<div i18n="m|d"><p>one</p><p>two</p><p other>three</p></div>';
      expect(_humanizeMessages(html)).toEqual([
        [
          [
            '<ph tag name="START_PARAGRAPH">one</ph name="CLOSE_PARAGRAPH">',
            '<ph tag name="START_PARAGRAPH">two</ph name="CLOSE_PARAGRAPH">',
            '<ph tag name="START_PARAGRAPH_1">three</ph name="CLOSE_PARAGRAPH">',
          ],
          'm',
          'd',
          '',
        ],
      ]);

      expect(_humanizePlaceholders(html)).toEqual([
        'START_PARAGRAPH=<p>, CLOSE_PARAGRAPH=</p>, START_PARAGRAPH_1=<p other>',
      ]);
    });

    it('should reuse the same placeholder name for interpolations', () => {
      const html = '<div i18n="m|d">{{ a }}{{ a }}{{ b }}</div>';
      expect(_humanizeMessages(html)).toEqual([
        [
          [
            '[<ph name="INTERPOLATION"> a </ph>, <ph name="INTERPOLATION"> a </ph>, <ph name="INTERPOLATION_1"> b </ph>]',
          ],
          'm',
          'd',
          '',
        ],
      ]);

      expect(_humanizePlaceholders(html)).toEqual([
        'INTERPOLATION={{ a }}, INTERPOLATION_1={{ b }}',
      ]);
    });

    it('should reuse the same placeholder name for icu messages', () => {
      const html =
        '<div i18n="m|d">{count, plural, =0 {0}}{count, plural, =0 {0}}{count, plural, =1 {1}}</div>';

      expect(_humanizeMessages(html)).toEqual([
        [
          [
            '<ph icu name="ICU">{count, plural, =0 {[0]}}</ph>',
            '<ph icu name="ICU">{count, plural, =0 {[0]}}</ph>',
            '<ph icu name="ICU_1">{count, plural, =1 {[1]}}</ph>',
          ],
          'm',
          'd',
          '',
        ],
        [['{count, plural, =0 {[0]}}'], '', '', ''],
        [['{count, plural, =0 {[0]}}'], '', '', ''],
        [['{count, plural, =1 {[1]}}'], '', '', ''],
      ]);

      expect(_humanizePlaceholders(html)).toEqual([
        '',
        'VAR_PLURAL=count',
        'VAR_PLURAL=count',
        'VAR_PLURAL=count',
      ]);

      expect(_humanizePlaceholdersToMessage(html)).toEqual([
        'ICU=f0f76923009914f1b05f41042a5c7231b9496504, ICU_1=73693d1f78d0fc882f0bcbce4cb31a0aa1995cfe',
        '',
        '',
        '',
      ]);
    });

    it('should preserve whitespace when preserving significant whitespace', () => {
      const html = '<div i18n="m|d">hello {{   foo   }}</div>';
      expect(
        _humanizeMessages(
          html,
          /* implicitTags */ undefined,
          /* implicitAttrs */ undefined,
          /* preserveSignificantWhitespace */ true,
        ),
      ).toEqual([[['[hello , <ph name="INTERPOLATION">   foo   </ph>]'], 'm', 'd', '']]);
    });

    it('should normalize whitespace when not preserving significant whitespace', () => {
      const html = '<div i18n="m|d">hello {{   foo   }}</div>';
      expect(
        _humanizeMessages(
          html,
          /* implicitTags */ undefined,
          /* implicitAttrs */ undefined,
          /* preserveSignificantWhitespace */ false,
        ),
      ).toEqual([[['[hello , <ph name="INTERPOLATION">foo</ph>, ]'], 'm', 'd', '']]);
    });
  });
});

export function _humanizeMessages(
  html: string,
  implicitTags: string[] = [],
  implicitAttrs: {[k: string]: string[]} = {},
  preserveSignificantWhitespace = true,
): [string[], string, string, string][] {
  return _extractMessages(html, implicitTags, implicitAttrs, preserveSignificantWhitespace).map(
    (message) => [serializeNodes(message.nodes), message.meaning, message.description, message.id],
  ) as [string[], string, string, string][];
}

function _humanizePlaceholders(
  html: string,
  implicitTags: string[] = [],
  implicitAttrs: {[k: string]: string[]} = {},
  preserveSignificantWhitespace = true,
): string[] {
  return _extractMessages(html, implicitTags, implicitAttrs, preserveSignificantWhitespace).map(
    (msg) =>
      Object.keys(msg.placeholders)
        .map((name) => `${name}=${msg.placeholders[name].text}`)
        .join(', '),
  );
}

function _humanizePlaceholdersToMessage(
  html: string,
  implicitTags: string[] = [],
  implicitAttrs: {[k: string]: string[]} = {},
  preserveSignificantWhitespace = true,
): string[] {
  return _extractMessages(html, implicitTags, implicitAttrs, preserveSignificantWhitespace).map(
    (msg) =>
      Object.keys(msg.placeholderToMessage)
        .map((k) => `${k}=${digest(msg.placeholderToMessage[k])}`)
        .join(', '),
  );
}

export function _extractMessages(
  html: string,
  implicitTags: string[] = [],
  implicitAttrs: {[k: string]: string[]} = {},
  preserveSignificantWhitespace = true,
): Message[] {
  const htmlParser = new HtmlParser();
  const parseResult = htmlParser.parse(html, 'extractor spec', {tokenizeExpansionForms: true});
  if (parseResult.errors.length > 1) {
    throw Error(`unexpected parse errors: ${parseResult.errors.join('\n')}`);
  }

  return extractMessages(
    parseResult.rootNodes,
    DEFAULT_INTERPOLATION_CONFIG,
    implicitTags,
    implicitAttrs,
    preserveSignificantWhitespace,
  ).messages;
}
