/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {escapeRegExp} from '@angular/core/src/facade/lang';

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
      const messageBundle = new MessageBundle(htmlParser, [], {});
      messageBundle.updateFromTemplate(template, 'url', DEFAULT_INTERPOLATION_CONFIG);

      const asAst = serializer.load(xtb, 'url', messageBundle);
      const asText: {[id: string]: string} = {};
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
  <translation id="8841459487341224498">rab</translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({'8841459487341224498': 'rab'});
      });

      it('should load XTB files without placeholders', () => {
        const HTML = `<div i18n>bar</div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="8841459487341224498">rab</translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({'8841459487341224498': 'rab'});
      });


      it('should load XTB files with placeholders', () => {
        const HTML = `<div i18n><p>bar</p></div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="8877975308926375834"><ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/></translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({'8877975308926375834': '<p>rab</p>'});
      });

      it('should replace ICU placeholders with their translations', () => {
        const HTML = `<div i18n>-{ count, plural, =0 {<p>bar</p>}}-</div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8" ?>
<translationbundle>
  <translation id="1430521728694081603">*<ph name="ICU"/>*</translation>
  <translation id="4004755025589356097">{ count, plural, =1 {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}}</translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({
          '1430521728694081603': `*{ count, plural, =1 {<p>rab</p>}}*`,
          '4004755025589356097': `{ count, plural, =1 {<p>rab</p>}}`,
        });
      });

      it('should load complex XTB files', () => {
        const HTML = `
<div i18n>foo <b>bar</b> {{ a + b }}</div>
<div i18n>{ count, plural, =0 {<p>bar</p>}}</div>
<div i18n="m|d">foo</div>
<div i18n>{ count, plural, =0 {{ sex, select, other {<p>bar</p>}} }}</div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8" ?>
<translationbundle>
  <translation id="8281795707202401639"><ph name="INTERPOLATION"/><ph name="START_BOLD_TEXT"/>rab<ph name="CLOSE_BOLD_TEXT"/> oof</translation>
  <translation id="4004755025589356097">{ count, plural, =1 {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}}</translation>
  <translation id="130772889486467622">oof</translation>
  <translation id="4244993204427636474">{ count, plural, =1 {{ sex, gender, male {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}} }}</translation>
</translationbundle>`;

        expect(loadAsText(HTML, XTB)).toEqual({
          '8281795707202401639': `{{ a + b }}<b>rab</b> oof`,
          '4004755025589356097': `{ count, plural, =1 {<p>rab</p>}}`,
          '130772889486467622': `oof`,
          '4244993204427636474': `{ count, plural, =1 {{ sex, gender, male {<p>rab</p>}} }}`,
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
  <translation id="1186013544048295927"><ph /></translation>
</translationbundle>`;

        expect(() => { loadAsText(HTML, XTB); }).toThrowError(/<ph> misses the "name" attribute/);
      });

      it('should throw when a placeholder is not present in the source message', () => {
        const HTML = `<div i18n>bar</div>`;

        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="8841459487341224498"><ph name="UNKNOWN"/></translation>
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
  <translation id="8877975308926375834">rab<ph name="CLOSE_PARAGRAPH"/></translation>
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
       () => { expect(() => { serializer.write([]); }).toThrowError(/Unsupported/); });
  });
}