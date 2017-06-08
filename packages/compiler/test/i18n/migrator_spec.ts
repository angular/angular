/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MessageBundle} from '../../src/i18n/message_bundle';
import {applyIdsMapping, getIdsMapping} from '../../src/i18n/migrator';
import {HtmlParser} from '../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../src/ml_parser/interpolation_config';

function createDefaultMapping(mapping: {[newId: string]: string[]}):
    {[oldId: string]: string | null} {
  const oldToNew: {[oldId: string]: string | null} = {};
  Object.keys(mapping).forEach((newId: string) => {
    mapping[newId].forEach(
        (oldId: string, index: number) => { oldToNew[oldId] = index === 0 ? newId : null; });
  });

  return oldToNew;
}

export function main(): void {
  describe('Migrator', () => {
    let messagesBundle: MessageBundle;

    beforeEach(() => {
      messagesBundle = new MessageBundle(new HtmlParser, [], {});
      messagesBundle.updateFromTemplate(
          `
        <p i18n>Auto-generated id</p>
        <p i18n="@@id">Custom id</p>
        <p i18n>{{expr}}</p>
        <p i18n>{{expr2}}</p>
      `,
          'file.ts', DEFAULT_INTERPOLATION_CONFIG);
    });

    describe('migrate', () => {
      it('should replace old ids with new ids', () => {
        const XLF_TRANSLATIONS = `<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="125ae079888ed38787ff3e0122e3554d1bd3fafc" datatype="html">
                <source>Auto-generated id</source>
                <target>Id auto-généré</target>
              </trans-unit>
              <trans-unit id="id" datatype="html">
                <source>Custom id</source>
                <target>Id personnalisé</target>
              </trans-unit>
            </body>
          </file>
        </xliff>`;

        const mapping = createDefaultMapping(getIdsMapping(messagesBundle, 'xlf').newToOld);
        const updatedContent = applyIdsMapping(XLF_TRANSLATIONS, mapping);
        expect(updatedContent).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="4816822815321118903" datatype="html">
                <source>Auto-generated id</source>
                <target>Id auto-généré</target>
              </trans-unit>
              <trans-unit id="id" datatype="html">
                <source>Custom id</source>
                <target>Id personnalisé</target>
              </trans-unit>
            </body>
          </file>
        </xliff>`);
      });

      it('should remove duplicates', () => {
        const XLF_TRANSLATIONS = `<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="f48007deeb82b11bdabedb6f8a801ea2a979996d" datatype="html">
                <source><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></source>
                <target><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></target>
              </trans-unit>
              <trans-unit id="f387e826bda6ded7453d64907f23109737531aa4" datatype="html">
                <source><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></source>
                <target><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></target>
              </trans-unit>
              <trans-unit id="removed" datatype="html">
                <source>Removed text</source>
                <target>Texte enlevé</target>
              </trans-unit>
            </body>
          </file>
        </xliff>`;

        const mapping = createDefaultMapping(getIdsMapping(messagesBundle, 'xlf').newToOld);
        const updatedContent = applyIdsMapping(XLF_TRANSLATIONS, mapping);
        expect(updatedContent).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="149534432019771748" datatype="html">
                <source><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></source>
                <target><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></target>
              </trans-unit>
              <trans-unit id="removed" datatype="html">
                <source>Removed text</source>
                <target>Texte enlevé</target>
              </trans-unit>
            </body>
          </file>
        </xliff>`);
      });

      it('should not change the content if not necessary', () => {
        const XLF_TRANSLATIONS = `<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
          <file source-language="en" target-language="fr" datatype="plaintext" original="ng2.template">
            <body>
              <trans-unit id="4816822815321118903" datatype="html">
                <source>Auto-generated id</source>
                <target>Id auto-généré</target>
              </trans-unit>
              <trans-unit id="id" datatype="html">
                <source>Custom id</source>
                <target>Id personnalisé</target>
              </trans-unit>
              <trans-unit id="149534432019771748" datatype="html">
                <source><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></source>
                <target><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></target>
              </trans-unit>
            </body>
          </file>
        </xliff>`;

        const mapping = createDefaultMapping(getIdsMapping(messagesBundle, 'xlf').newToOld);
        const updatedContent = applyIdsMapping(XLF_TRANSLATIONS, mapping);
        expect(updatedContent).toEqual(XLF_TRANSLATIONS);
      });

      it('should work with XLIFF2', () => {
        const XLF2_TRANSLATIONS = `<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
          <file original="ng.template" id="ngi18n">
            <unit id="4816822815321118903">
              <segment>
                <source>Auto-generated id</source>
                <target>Id auto-généré</target>
              </segment>
            </unit>
            <unit id="id">
              <segment>
                <source>Custom id</source>
                <target>Id personnalisé</target>
              </segment>
            </unit>
            <unit id="6985113681424122616">
              <segment>
                <source><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></source>
                <target><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></target>
              </segment>
            </unit>
            <unit id="7807994132998964303">
              <segment>
                <source><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></source>
                <target><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></target>
              </segment>
            </unit>
            <unit id="removed">
              <segment>
                <source>Removed text</source>
                <target>Texte enlevé</target>
              </segment>
            </unit>
          </file>
        </xliff>`;

        const mapping = createDefaultMapping(getIdsMapping(messagesBundle, 'xlf2').newToOld);
        const updatedContent = applyIdsMapping(XLF2_TRANSLATIONS, mapping);
        expect(updatedContent).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
        <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
          <file original="ng.template" id="ngi18n">
            <unit id="4816822815321118903">
              <segment>
                <source>Auto-generated id</source>
                <target>Id auto-généré</target>
              </segment>
            </unit>
            <unit id="id">
              <segment>
                <source>Custom id</source>
                <target>Id personnalisé</target>
              </segment>
            </unit>
            <unit id="149534432019771748">
              <segment>
                <source><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></source>
                <target><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></target>
              </segment>
            </unit>
            <unit id="removed">
              <segment>
                <source>Removed text</source>
                <target>Texte enlevé</target>
              </segment>
            </unit>
          </file>
        </xliff>`);
      });

      it('should work with XTB', () => {
        const XTB = `<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE translationbundle [<!ELEMENT translationbundle (translation)*>
        <!ATTLIST translationbundle lang CDATA #REQUIRED>
        
        <!ELEMENT translation (#PCDATA|ph)*>
        <!ATTLIST translation id CDATA #REQUIRED>
        
        <!ELEMENT ph EMPTY>
        <!ATTLIST ph name CDATA #REQUIRED>
        ]>
        <translationbundle>
          <translation id="4816822815321118903">Id auto-généré</translation>
          <translation id="id">Id personnalisé</translation>
          <translation id="6985113681424122616"><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></translation>
          <translation id="7807994132998964303"><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></translation>
          <translation id="removed">Texte enlevé</translation>
        </translationbundle>`;

        const mapping = createDefaultMapping(getIdsMapping(messagesBundle, 'xtb').newToOld);
        const updatedContent = applyIdsMapping(XTB, mapping);
        expect(updatedContent).toEqual(`<?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE translationbundle [<!ELEMENT translationbundle (translation)*>
        <!ATTLIST translationbundle lang CDATA #REQUIRED>
        
        <!ELEMENT translation (#PCDATA|ph)*>
        <!ATTLIST translation id CDATA #REQUIRED>
        
        <!ELEMENT ph EMPTY>
        <!ATTLIST ph name CDATA #REQUIRED>
        ]>
        <translationbundle>
          <translation id="4816822815321118903">Id auto-généré</translation>
          <translation id="id">Id personnalisé</translation>
          <translation id="149534432019771748"><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></translation>
          <translation id="removed">Texte enlevé</translation>
        </translationbundle>`);
      });

      it('should work with XMB', () => {
        const XMB = `<?xml version="1.0" encoding="UTF-8" ?>
        <!DOCTYPE messagebundle [
        <!ELEMENT messagebundle (msg)*>
        <!ATTLIST messagebundle class CDATA #IMPLIED>
        
        <!ELEMENT msg (#PCDATA|ph|source)*>
        <!ATTLIST msg id CDATA #IMPLIED>
        <!ATTLIST msg seq CDATA #IMPLIED>
        <!ATTLIST msg name CDATA #IMPLIED>
        <!ATTLIST msg desc CDATA #IMPLIED>
        <!ATTLIST msg meaning CDATA #IMPLIED>
        <!ATTLIST msg obsolete (obsolete) #IMPLIED>
        <!ATTLIST msg xml:space (default|preserve) "default">
        <!ATTLIST msg is_hidden CDATA #IMPLIED>
        
        <!ELEMENT source (#PCDATA)>
        
        <!ELEMENT ph (#PCDATA|ex)*>
        <!ATTLIST ph name CDATA #REQUIRED>
        
        <!ELEMENT ex (#PCDATA)>
        ]>
        <messagebundle>
          <msg id="4816822815321118903">Auto-generated id</msg>
          <msg id="id">Custom id</msg>
          <msg id="6985113681424122616"><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></msg>
          <msg id="7807994132998964303"><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></msg>
          <msg id="removed">Removed text</msg>
        </messagebundle>`;

        const mapping = createDefaultMapping(getIdsMapping(messagesBundle, 'xmb').newToOld);
        const updatedContent = applyIdsMapping(XMB, mapping);
        expect(updatedContent).toEqual(`<?xml version="1.0" encoding="UTF-8" ?>
        <!DOCTYPE messagebundle [
        <!ELEMENT messagebundle (msg)*>
        <!ATTLIST messagebundle class CDATA #IMPLIED>
        
        <!ELEMENT msg (#PCDATA|ph|source)*>
        <!ATTLIST msg id CDATA #IMPLIED>
        <!ATTLIST msg seq CDATA #IMPLIED>
        <!ATTLIST msg name CDATA #IMPLIED>
        <!ATTLIST msg desc CDATA #IMPLIED>
        <!ATTLIST msg meaning CDATA #IMPLIED>
        <!ATTLIST msg obsolete (obsolete) #IMPLIED>
        <!ATTLIST msg xml:space (default|preserve) "default">
        <!ATTLIST msg is_hidden CDATA #IMPLIED>
        
        <!ELEMENT source (#PCDATA)>
        
        <!ELEMENT ph (#PCDATA|ex)*>
        <!ATTLIST ph name CDATA #REQUIRED>
        
        <!ELEMENT ex (#PCDATA)>
        ]>
        <messagebundle>
          <msg id="4816822815321118903">Auto-generated id</msg>
          <msg id="id">Custom id</msg>
          <msg id="149534432019771748"><ph name="INTERPOLATION"><ex>INTERPOLATION</ex></ph></msg>
          <msg id="removed">Removed text</msg>
        </messagebundle>`);
      });
    });

    describe('getIdsMapping', () => {
      it('should work with XLIFF', () => {
        const mapping = getIdsMapping(messagesBundle, 'xlf');
        expect(mapping.newToOld).toEqual({
          '4816822815321118903': ['125ae079888ed38787ff3e0122e3554d1bd3fafc'],
          'id': ['id'],
          '149534432019771748': [
            'f48007deeb82b11bdabedb6f8a801ea2a979996d', 'f387e826bda6ded7453d64907f23109737531aa4'
          ]
        });
      });

      it('should work the same for XLIFF2/XTB/XMB', () => {
        const expected = {
          '4816822815321118903': ['4816822815321118903'],
          'id': ['id'],
          '149534432019771748': ['6985113681424122616', '7807994132998964303']
        };
        const mappingXliff2 = getIdsMapping(messagesBundle, 'xlf2');
        const mappingXtb = getIdsMapping(messagesBundle, 'xtb');
        const mappingXmb = getIdsMapping(messagesBundle, 'xmb');

        expect(mappingXliff2.newToOld).toEqual(expected);
        expect(mappingXtb.newToOld).toEqual(expected);
        expect(mappingXmb.newToOld).toEqual(expected);
      });
    });
  });
}
