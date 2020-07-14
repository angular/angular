/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {escapeRegExp} from '@angular/compiler/src/util';
import {serializeNodes} from '../../../src/i18n/digest';
import * as i18n from '../../../src/i18n/i18n_ast';
import {Xtb} from '../../../src/i18n/serializers/xtb';


{
  describe('XTB serializer', () => {
    const serializer = new Xtb();

    function loadAsMap(xtb: string): {[id: string]: string} {
      const {i18nNodesByMsgId} = serializer.load(xtb, 'url');
      const msgMap: {[id: string]: string} = {};
      Object.keys(i18nNodesByMsgId).forEach(id => {
        msgMap[id] = serializeNodes(i18nNodesByMsgId[id]).join('');
      });
      return msgMap;
    }

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
  <translation id="8841459487341224498">rab</translation>
</translationbundle>`;

        expect(loadAsMap(XTB)).toEqual({'8841459487341224498': 'rab'});
      });

      it('should load XTB files without placeholders', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="8841459487341224498">rab</translation>
</translationbundle>`;

        expect(loadAsMap(XTB)).toEqual({'8841459487341224498': 'rab'});
      });

      it('should return the target locale', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle lang='fr'>
  <translation id="8841459487341224498">rab</translation>
</translationbundle>`;

        expect(serializer.load(XTB, 'url').locale).toEqual('fr');
      });

      it('should load XTB files with placeholders', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
<translationbundle>
  <translation id="8877975308926375834"><ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/></translation>
</translationbundle>`;

        expect(loadAsMap(XTB)).toEqual({
          '8877975308926375834': '<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>'
        });
      });

      it('should replace ICU placeholders with their translations', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8" ?>
<translationbundle>
  <translation id="7717087045075616176">*<ph name="ICU"/>*</translation>
  <translation id="5115002811911870583">{VAR_PLURAL, plural, =1 {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}}</translation>
</translationbundle>`;

        expect(loadAsMap(XTB)).toEqual({
          '7717087045075616176': `*<ph name="ICU"/>*`,
          '5115002811911870583':
              `{VAR_PLURAL, plural, =1 {[<ph name="START_PARAGRAPH"/>, rab, <ph name="CLOSE_PARAGRAPH"/>]}}`,
        });
      });

      it('should load complex XTB files', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8" ?>
<translationbundle>
  <translation id="8281795707202401639"><ph name="INTERPOLATION"/><ph name="START_BOLD_TEXT"/>rab<ph name="CLOSE_BOLD_TEXT"/> oof</translation>
  <translation id="5115002811911870583">{VAR_PLURAL, plural, =1 {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}}</translation>
  <translation id="130772889486467622">oof</translation>
  <translation id="4739316421648347533">{VAR_PLURAL, plural, =1 {{VAR_GENDER, gender, male {<ph name="START_PARAGRAPH"/>rab<ph name="CLOSE_PARAGRAPH"/>}} }}</translation>
</translationbundle>`;

        expect(loadAsMap(XTB)).toEqual({
          '8281795707202401639':
              `<ph name="INTERPOLATION"/><ph name="START_BOLD_TEXT"/>rab<ph name="CLOSE_BOLD_TEXT"/> oof`,
          '5115002811911870583':
              `{VAR_PLURAL, plural, =1 {[<ph name="START_PARAGRAPH"/>, rab, <ph name="CLOSE_PARAGRAPH"/>]}}`,
          '130772889486467622': `oof`,
          '4739316421648347533':
              `{VAR_PLURAL, plural, =1 {[{VAR_GENDER, gender, male {[<ph name="START_PARAGRAPH"/>, rab, <ph name="CLOSE_PARAGRAPH"/>]}},  ]}}`,
        });
      });
    });

    describe('errors', () => {
      it('should be able to parse non-angular xtb files without error', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8" ?>
<translationbundle>
  <translation id="angular">is great</translation>
  <translation id="non angular">is <invalid>less</invalid> {count, plural, =0 {{GREAT}}}</translation>
</translationbundle>`;

        // Invalid messages should not cause the parser to throw
        let i18nNodesByMsgId: {[id: string]: i18n.Node[]} = undefined!;
        expect(() => {
          i18nNodesByMsgId = serializer.load(XTB, 'url').i18nNodesByMsgId;
        }).not.toThrow();

        expect(Object.keys(i18nNodesByMsgId).length).toEqual(2);
        expect(serializeNodes(i18nNodesByMsgId['angular']).join('')).toEqual('is great');
        // Messages that contain unsupported feature should throw on access
        expect(() => {
          const read = i18nNodesByMsgId['non angular'];
        }).toThrowError(/xtb parse errors/);
      });

      it('should throw on nested <translationbundle>', () => {
        const XTB =
            '<translationbundle><translationbundle></translationbundle></translationbundle>';

        expect(() => {
          loadAsMap(XTB);
        }).toThrowError(/<translationbundle> elements can not be nested/);
      });

      it('should throw when a <translation> has no id attribute', () => {
        const XTB = `<translationbundle>
  <translation></translation>
</translationbundle>`;

        expect(() => {
          loadAsMap(XTB);
        }).toThrowError(/<translation> misses the "id" attribute/);
      });

      it('should throw when a placeholder has no name attribute', () => {
        const XTB = `<translationbundle>
  <translation id="1186013544048295927"><ph /></translation>
</translationbundle>`;

        expect(() => {
          loadAsMap(XTB);
        }).toThrowError(/<ph> misses the "name" attribute/);
      });

      it('should throw on unknown xtb tags', () => {
        const XTB = `<what></what>`;

        expect(() => {
          loadAsMap(XTB);
        }).toThrowError(new RegExp(escapeRegExp(`Unexpected tag ("[ERROR ->]<what></what>")`)));
      });

      it('should throw on unknown message tags', () => {
        const XTB = `<translationbundle>
  <translation id="1186013544048295927"><b>msg should contain only ph tags</b></translation>
</translationbundle>`;

        expect(() => {
          loadAsMap(XTB);
        })
            .toThrowError(
                new RegExp(escapeRegExp(`[ERROR ->]<b>msg should contain only ph tags</b>`)));
      });

      it('should throw on duplicate message id', () => {
        const XTB = `<translationbundle>
  <translation id="1186013544048295927">msg1</translation>
  <translation id="1186013544048295927">msg2</translation>
</translationbundle>`;

        expect(() => {
          loadAsMap(XTB);
        }).toThrowError(/Duplicated translations for msg 1186013544048295927/);
      });

      it('should throw when trying to save an xtb file', () => {
        expect(() => {
          serializer.write([], null);
        }).toThrowError(/Unsupported/);
      });
    });
  });
}
