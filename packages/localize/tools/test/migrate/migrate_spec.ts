/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {migrateFile} from '../../src/migrate/migrate';

describe('migrateFile', () => {
  it('should migrate all of the legacy message IDs', () => {
    const source = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="fr-FR" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="123hello-legacy" datatype="html">
              <source>Hello</source>
              <target>Bonjour</target>
            </trans-unit>

            <trans-unit id="456goodbye-legacy" datatype="html">
              <source>Goodbye</source>
              <target>Au revoir</target>
            </trans-unit>
          </body>
        </file>
      </xliff>
    `;

    const result = migrateFile(source, {
      '123hello-legacy': 'hello-migrated',
      '456goodbye-legacy': 'goodbye-migrated',
    });

    expect(result).toContain('<trans-unit id="hello-migrated" datatype="html">');
    expect(result).toContain('<trans-unit id="goodbye-migrated" datatype="html">');
  });

  it('should migrate messages whose ID contains special regex characters', () => {
    const source = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="fr-FR" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="123hello(.*legacy" datatype="html">
              <source>Hello</source>
              <target>Bonjour</target>
            </trans-unit>
          </body>
        </file>
      </xliff>
    `;

    const result = migrateFile(source, {'123hello(.*legacy': 'hello-migrated'});
    expect(result).toContain('<trans-unit id="hello-migrated" datatype="html">');
  });

  it('should not migrate messages that are not in the mapping', () => {
    const source = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="fr-FR" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="123hello-legacy" datatype="html">
              <source>Hello</source>
              <target>Bonjour</target>
            </trans-unit>

            <trans-unit id="456goodbye" datatype="html">
              <source>Goodbye</source>
              <target>Au revoir</target>
            </trans-unit>
          </body>
        </file>
      </xliff>
    `;

    const result = migrateFile(source, {'123hello-legacy': 'hello-migrated'});
    expect(result).toContain('<trans-unit id="hello-migrated" datatype="html">');
    expect(result).toContain('<trans-unit id="456goodbye" datatype="html">');
  });

  it('should not modify the file if none of the mappings match', () => {
    const source = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="fr-FR" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="123hello-legacy" datatype="html">
              <source>Hello</source>
              <target>Bonjour</target>
            </trans-unit>

            <trans-unit id="456goodbye-legacy" datatype="html">
              <source>Goodbye</source>
              <target>Au revoir</target>
            </trans-unit>
          </body>
        </file>
      </xliff>
    `;

    const result = migrateFile(source, {
      'does-not-match': 'migrated-does-not-match',
      'also-does-not-match': 'migrated-also-does-not-match',
    });

    expect(result).toBe(source);
  });

  // Note: it shouldn't be possible for the ID to be repeated multiple times, but
  // this assertion is here to make sure that it behaves as expected if it does.
  it('should migrate if an ID appears in more than one place', () => {
    const source = `
      <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
        <file source-language="fr-FR" datatype="plaintext" original="ng2.template">
          <body>
            <trans-unit id="123hello-legacy" datatype="html">
              <source>Hello</source>
              <target>Bonjour</target>
            </trans-unit>

            <made-up-tag datatype="html" belongs-to="123hello-legacy">
              <source id="123hello-legacy">Hello</source>
              <target target-id="123hello-legacy">Bonjour</target>
            </mage-up-tag>
          </body>
        </file>
      </xliff>
    `;

    const result = migrateFile(source, {'123hello-legacy': 'hello-migrated'});
    expect(result).toContain('<trans-unit id="hello-migrated" datatype="html">');
    expect(result).toContain('<made-up-tag datatype="html" belongs-to="hello-migrated">');
    expect(result).toContain('<source id="hello-migrated">');
    expect(result).toContain('<target target-id="hello-migrated">Bonjour</target>');
  });
});
