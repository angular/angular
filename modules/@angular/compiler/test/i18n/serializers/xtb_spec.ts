/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Xtb} from '@angular/compiler/src/i18n/serializers/xtb';
import {escapeRegExp} from '@angular/core/src/facade/lang';
import {beforeEach, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';

import {HtmlParser} from '../../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/ml_parser/interpolation_config';
import {serializeNodes} from '../../ml_parser/ast_serializer_spec';

export function main(): void {
  describe('XTB serializer', () => {
    let serializer: Xtb;

    function loadAsText(content: string, placeholders: {[id: string]: {[name: string]: string}}):
        {[id: string]: string} {
      const asAst = serializer.load(content, 'url', placeholders);
      let asText: {[id: string]: string} = {};
      Object.keys(asAst).forEach(id => { asText[id] = serializeNodes(asAst[id]).join(''); });

      return asText;
    }

    beforeEach(() => { serializer = new Xtb(new HtmlParser(), DEFAULT_INTERPOLATION_CONFIG); });


    describe('load', () => {
      it('should load XTB files with a doctype', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE translationbundle [<!ELEMENT translationbundle (translation)*>
<!ATTLIST translationbundle lang CDATA #REQUIRED>

<!ELEMENT translation (#PCDATA|ph)*>
<!ATTLIST translation id CDATA #REQUIRED>

<!ELEMENT ph EMPTY>
<!ATTLIST ph name CDATA #REQUIRED>
]>
<translationbundle>
  <translation id="foo">bar</translation>
</translationbundle>`;

        expect(loadAsText(XTB, {})).toEqual({foo: 'bar'});
      });

      it('should load XTB files without placeholders', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="foo">bar</translation>
</translationbundle>`;

        expect(loadAsText(XTB, {})).toEqual({foo: 'bar'});
      });

      it('should load XTB files with placeholders', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="foo">bar<ph name="PLACEHOLDER"/><ph name="PLACEHOLDER"/></translation>
</translationbundle>`;

        expect(loadAsText(XTB, {foo: {PLACEHOLDER: '!'}})).toEqual({foo: 'bar!!'});
      });

      it('should load complex XTB files', () => {
        const XTB = `<? xml version="1.0" encoding="UTF-8" ?>
<translationbundle>
  <translation id="a">translatable element <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>with placeholders<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> <ph name="INTERPOLATION"/></translation>
  <translation id="b">{ count, plural, =0 {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>test<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>}}</translation>
  <translation id="c" desc="d" meaning="m">foo</translation>
  <translation id="d">{ count, plural, =0 {{ sex, gender, other {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply nested<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>}} }}</translation>
</translationbundle>`;

        const PLACEHOLDERS = {
          a: {
            START_BOLD_TEXT: '<b>',
            CLOSE_BOLD_TEXT: '</b>',
            INTERPOLATION: '{{ a + b }}',
          },
          b: {
            START_PARAGRAPH: '<p translated=true>',
            CLOSE_PARAGRAPH: '</p>',
          },
          d: {
            START_PARAGRAPH: '<p>',
            CLOSE_PARAGRAPH: '</p>',
          },
        };

        expect(loadAsText(XTB, PLACEHOLDERS)).toEqual({
          a: 'translatable element <b>with placeholders</b> {{ a + b }}',
          b: '{ count, plural, =0 {<p translated="true">test</p>}}',
          c: 'foo',
          d: '{ count, plural, =0 {{ sex, gender, other {<p>deeply nested</p>}} }}',
        });
      });
    });

    describe('errors', () => {
      it('should throw on nested <translationbundle>', () => {
        const XTB =
            '<translationbundle><translationbundle></translationbundle></translationbundle>';

        expect(() => {
          serializer.load(XTB, 'url', {});
        }).toThrowError(/<translationbundle> elements can not be nested/);
      });

      it('should throw on nested <translation>', () => {
        const XTB = `<translationbundle>
  <translation id="outer">
    <translation id="inner">
    </translation>
  </translation>
</translationbundle>`;

        expect(() => {
          serializer.load(XTB, 'url', {});
        }).toThrowError(/<translation> elements can not be nested/);
      });

      it('should throw when a <translation> has no id attribute', () => {
        const XTB = `<translationbundle>
  <translation></translation>
</translationbundle>`;

        expect(() => {
          serializer.load(XTB, 'url', {});
        }).toThrowError(/<translation> misses the "id" attribute/);
      });

      it('should throw when a placeholder has no name attribute', () => {
        const XTB = `<translationbundle>
  <translation id="fail"><ph /></translation>
</translationbundle>`;

        expect(() => {
          serializer.load(XTB, 'url', {});
        }).toThrowError(/<ph> misses the "name" attribute/);
      });

      it('should throw when a placeholder is not present in the source message', () => {
        const XTB = `<translationbundle>
  <translation id="fail"><ph name="UNKNOWN"/></translation>
</translationbundle>`;

        expect(() => {
          serializer.load(XTB, 'url', {});
        }).toThrowError(/The placeholder "UNKNOWN" does not exists in the source message/);
      });
    });

    it('should throw when the translation results in invalid html', () => {
      const XTB = `<translationbundle>
  <translation id="fail">foo<ph name="CLOSE_P"/>bar</translation>
</translationbundle>`;

      expect(() => {
        serializer.load(XTB, 'url', {fail: {CLOSE_P: '</p>'}});
      }).toThrowError(/xtb parse errors:\nUnexpected closing tag "p"/);

    });

    it('should throw on unknown tags', () => {
      const XTB = `<what></what>`;

      expect(() => {
        serializer.load(XTB, 'url', {});
      }).toThrowError(new RegExp(escapeRegExp(`Unexpected tag ("[ERROR ->]<what></what>")`)));
    });

    it('should throw when trying to save an xmb file',
       () => { expect(() => { serializer.write({}); }).toThrow(); });
  });
}
