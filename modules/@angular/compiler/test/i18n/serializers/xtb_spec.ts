/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {escapeRegExp} from '@angular/core/src/facade/lang';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';

import {MessageBundle} from '../../../src/i18n/message_bundle';
import {Xtb} from '../../../src/i18n/serializers/xtb';
import {HtmlParser} from '../../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/ml_parser/interpolation_config';
import {serializeNodes} from '../../ml_parser/ast_serializer_spec';

export function main(): void {
  describe('XTB serializer', () => {
    let serializer: Xtb;
    let htmlParser: HtmlParser;

    function loadAsText(template: string, xtb: string): {[id: string]: string} {
      let messageBundle = new MessageBundle(htmlParser, [], {});
      messageBundle.updateFromTemplate(template, 'url', DEFAULT_INTERPOLATION_CONFIG);

      const asAst = serializer.load(xtb, 'url', messageBundle);
      let asText: {[id: string]: string} = {};
      Object.keys(asAst).forEach(id => { asText[id] = serializeNodes(asAst[id]).join(''); });

      return asText;
    }

    beforeEach(() => {
      htmlParser = new HtmlParser();
      serializer = new Xtb(htmlParser, DEFAULT_INTERPOLATION_CONFIG);
    });

    describe('load', () => {
      it('should load XTB files with a doctype', () => {
        const HTML = `<div i18n>bar</div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE translationbundle [<!ELEMENT translationbundle (translation)*>
<!ATTLIST translationbundle lang CDATA #REQUIRED>

<!ELEMENT translation (#PCDATA|ph)*>
<!ATTLIST translation id CDATA #REQUIRED>

<!ELEMENT ph EMPTY>
<!ATTLIST ph name CDATA #REQUIRED>
]>
<translationbundle>
  <translation id="28a86c8a00ae573b2bac698d6609316dc7b4a226">rab</translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({'28a86c8a00ae573b2bac698d6609316dc7b4a226': 'rab'});
      });

      it('should load XTB files without placeholders', () => {
        const HTML = `<div i18n>bar</div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="28a86c8a00ae573b2bac698d6609316dc7b4a226">rab</translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({'28a86c8a00ae573b2bac698d6609316dc7b4a226': 'rab'});
      });

      it('should load XTB files with placeholders', () => {
        const HTML = `<div i18n><p>bar</p></div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="7de4d8ff1e42b7b31da6204074818236a9a5317f"><ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/></translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({
          '7de4d8ff1e42b7b31da6204074818236a9a5317f': '<p>rab</p>'
        });
      });

      it('should replace ICU placeholders with their translations', () => {
        const HTML = `<div i18n>-{ count, plural, =0 {<p>bar</p>}}-</div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8" ?>
<translationbundle>
  <translation id="eb404e202fed4846e25e7d9ac1fcb719fe4da257">*<ph name="ICU"/>*</translation>
  <translation id="fc92b9b781194a02ab773129c8c5a7fc0735efd7">{ count, plural, =1 {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}}</translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({
          'eb404e202fed4846e25e7d9ac1fcb719fe4da257': `*{ count, plural, =1 {<p>rab</p>}}*`,
          'fc92b9b781194a02ab773129c8c5a7fc0735efd7': `{ count, plural, =1 {<p>rab</p>}}`,
        });
      });

      it('should load complex XTB files', () => {
        const HTML = `
<div i18n>foo <b>bar</b> {{ a + b }}</div>
<div i18n>{ count, plural, =0 {<p>bar</p>}}</div>
<div i18n="m|d">foo</div>
<div i18n>{ count, plural, =0 {{ sex, gender, other {<p>bar</p>}} }}</div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8" ?>
<translationbundle>
  <translation id="7103b4b13b616270a0044efade97d8b4f96f2ca6"><ph name="INTERPOLATION"/><ph name="START_BOLD_TEXT"/>rab<ph name="CLOSE_BOLD_TEXT"/> oof</translation>
  <translation id="fc92b9b781194a02ab773129c8c5a7fc0735efd7">{ count, plural, =1 {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}}</translation>
  <translation id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23">oof</translation>
  <translation id="e3bf2d706c3da16ce05658e07f62f0519f7c561c">{ count, plural, =1 {{ sex, gender, male {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}} }}</translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({
          '7103b4b13b616270a0044efade97d8b4f96f2ca6': `{{ a + b }}<b>rab</b> oof`,
          'fc92b9b781194a02ab773129c8c5a7fc0735efd7': `{ count, plural, =1 {<p>rab</p>}}`,
          'db3e0a6a5a96481f60aec61d98c3eecddef5ac23': `oof`,
          'e3bf2d706c3da16ce05658e07f62f0519f7c561c':
              `{ count, plural, =1 {{ sex, gender, male {<p>rab</p>}} }}`,
        });
      });

    });

    describe('errors', () => {
      it('should throw on nested <translationbundle>', () => {
        const XTB =
            '<translationbundle><translationbundle></translationbundle></translationbundle>';

        expect(() => {
          loadAsText('', XTB);
        }).toThrowError(/<translationbundle> elements can not be nested/);
      });

      it('should throw when a <translation> has no id attribute', () => {
        const XTB = `<translationbundle>
  <translation></translation>
</translationbundle>`;

        expect(() => {
          loadAsText('', XTB);
        }).toThrowError(/<translation> misses the "id" attribute/);
      });

      it('should throw when a placeholder has no name attribute', () => {
        const HTML = '<div i18n>give me a message</div>';

        const XTB = `<translationbundle>
  <translation id="8de97c6a35252d9409dcaca0b8171c952740b28c"><ph /></translation>
</translationbundle>`;

        expect(() => { loadAsText(HTML, XTB); }).toThrowError(/<ph> misses the "name" attribute/);
      });

      it('should throw when a placeholder is not present in the source message', () => {
        const HTML = `<div i18n>bar</div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="28a86c8a00ae573b2bac698d6609316dc7b4a226"><ph name="UNKNOWN"/></translation>
</translationbundle>`;

        expect(() => {
          loadAsText(HTML, XTB);
        }).toThrowError(/The placeholder "UNKNOWN" does not exists in the source message/);
      });
    });

    it('should throw when the translation results in invalid html', () => {
      const HTML = `<div i18n><p>bar</p></div>`;

      const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="7de4d8ff1e42b7b31da6204074818236a9a5317f">rab<ph name="CLOSE_PARAGRAPH"/></translation>
</translationbundle>`;

      expect(() => {
        loadAsText(HTML, XTB);
      }).toThrowError(/xtb parse errors:\nUnexpected closing tag "p"/);

    });

    it('should throw on unknown tags', () => {
      const XTB = `<what></what>`;

      expect(() => {
        loadAsText('', XTB);
      }).toThrowError(new RegExp(escapeRegExp(`Unexpected tag ("[ERROR ->]<what></what>")`)));
    });

    it('should throw when trying to save an xtb file',
       () => { expect(() => { serializer.write({}); }).toThrowError(/Unsupported/); });
  });
}