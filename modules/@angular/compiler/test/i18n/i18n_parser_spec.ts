/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HtmlParser} from "@angular/compiler/src/html_parser";
import * as i18nAst from "@angular/compiler/src/i18n/i18n_ast";
import {ddescribe, describe, expect, it} from "@angular/core/testing/testing_internal";
import {extractI18nMessages} from "@angular/compiler/src/i18n/i18n_parser";
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
          [['text', '<ph tag name="span"><ph tag name="b">nested</ph></ph>'], 'm', 'd'],
        ]);
      });

      it('should not create a message for empty elements',
        () => { expect(extract('<div i18n="m|d"></div>')).toEqual([]); });

      it('should not create a message for plain elements',
        () => { expect(extract('<div></div>')).toEqual([]); });
    });

    describe('attributes', () => {
      it('should extract from attributes outside of translatable section', () => {
        expect(extract('<div i18n-title="m|d" title="msg"></div>')).toEqual([
          [['msg'], 'm', 'd'],
        ]);
      });

      it('should extract from attributes in translatable element', () => {
        expect(extract('<div i18n><p><b i18n-title="m|d" title="msg"></b></p></div>')).toEqual([
          [['<ph tag name="p"><ph tag name="b"></ph></ph>'], '', ''],
          [['msg'], 'm', 'd'],
        ]);
      });

      it('should extract from attributes in translatable block', () => {
        expect(
          extract('<!-- i18n --><p><b i18n-title="m|d" title="msg"></b></p><!-- /i18n -->'))
          .toEqual([
            [['msg'], 'm', 'd'],
            [['<ph tag name="p"><ph tag name="b"></ph></ph>'], '', ''],
          ]);
      });

      it('should extract from attributes in translatable ICU', () => {
        expect(
          extract(
            '<!-- i18n -->{count, plural, =0 {<p><b i18n-title="m|d" title="msg"></b></p>}}<!-- /i18n -->'))
          .toEqual([
            [['msg'], 'm', 'd'],
            [['{count, plural, =0 {[<ph tag name="p"><ph tag name="b"></ph></ph>]}}'], '', ''],
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
          [['[before, <ph name="interpolation"> exp </ph>, after]'], 'm', 'd'],
        ]);
      });

      it('should support named interpolation', () => {
        expect(extract('<div i18n="m|d">before{{ exp //i18n(ph="teSt") }}after</div>')).toEqual([
          [['[before, <ph name="teSt"> exp //i18n(ph="teSt") </ph>, after]'], 'm', 'd'],
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
        expect(
          extract(`<!-- i18n -->text<p>html<b>nested</b></p><!-- /i18n -->`))
          .toEqual([
            [[ 'text', '<ph tag name="p">html, <ph tag name="b">nested</ph></ph>'], '', '' ],
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
          [[ 'b', '<ph icu name="icu">{count, plural, =0 {[zero]}}</ph>', 'a'], 'm', 'd'],
          [[ '{count, plural, =0 {[zero]}}' ], '', ''],
        ]);
      });

      it('should extract as ICU when single child of a block', () => {
        expect(extract('<!-- i18n:m|d -->{count, plural, =0 {zero}}<!-- /i18n -->')).toEqual([
          [['{count, plural, =0 {[zero]}}'], 'm', 'd'],
        ]);
      });

      it('should extract as ICU + ph when not single child of a block', () => {
        expect(extract('<!-- i18n:m|d -->b{count, plural, =0 {zero}}a<!-- /i18n -->')).toEqual([
          [[ '{count, plural, =0 {[zero]}}' ], '', ''],
          [[ 'b', '<ph icu name="icu">{count, plural, =0 {[zero]}}</ph>', 'a'], 'm', 'd'],
        ]);
      });

      it('should not extract nested ICU messages', () => {
        expect(extract('<div i18n="m|d">b{count, plural, =0 {{sex, gender, =m {m}}}}a</div>')).toEqual([
          [[ 'b', '<ph icu name="icu">{count, plural, =0 {[{sex, gender, =m {[m]}}]}}</ph>', 'a'], 'm', 'd'],
          [[ '{count, plural, =0 {[{sex, gender, =m {[m]}}]}}' ], '', ''],
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
  });
}

class _SerializerVisitor implements i18nAst.Visitor {
  visitText(text:i18nAst.Text, context:any):any {
    return text.value;
  }

  visitContainer(container:i18nAst.Container, context:any):any {
    return `[${container.children.map(child => child.visit(this)).join(', ')}]`
  }

  visitIcu(icu:i18nAst.Icu, context:any):any {
    let strCases = Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    return `{${icu.expression}, ${icu.type}, ${strCases.join(', ')}}`
  }

  visitTagPlaceholder(ph:i18nAst.TagPlaceholder, context:any):any {
    return `<ph tag name="${ph.name}">${ph.children.map(child => child.visit(this)).join(', ')}</ph>`;
  }

  visitPlaceholder(ph:i18nAst.Placeholder, context:any):any {
    return `<ph name="${ph.name}">${ph.value}</ph>`;
  }

  visitIcuPlaceholder(ph:i18nAst.IcuPlaceholder, context?:any):any {
    return `<ph icu name="${ph.name}">${ph.value.visit(this)}</ph>`
  }
}

const serializerVisitor = new _SerializerVisitor();

export function serializeAst(ast: i18nAst.I18nNode[]): string[] {
  return ast.map(a => a.visit(serializerVisitor, null));
}

function extract(
  html: string, implicitTags: string[] = [],
  implicitAttrs: {[k: string]: string[]} = {}): [string[], string, string][] {
  const htmlParser = new HtmlParser();
  const parseResult = htmlParser.parse(html, 'extractor spec', true);
  if (parseResult.errors.length > 1) {
    throw Error(`unexpected parse errors: ${parseResult.errors.join('\n')}`);
  }

  const messages = extractI18nMessages(parseResult.rootNodes, implicitTags, implicitAttrs);

  // clang-format off
  // https://github.com/angular/clang-format/issues/35
  return messages.map(
    message => [serializeAst(message.nodes), message.meaning, message.description, ]) as [string[], string, string][];
  // clang-format on
}


