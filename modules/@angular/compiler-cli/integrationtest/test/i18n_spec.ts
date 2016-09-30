/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import './init';

import * as fs from 'fs';
import * as path from 'path';

const EXPECTED_XMB = `<?xml version="1.0" encoding="UTF-8" ?>
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
  <msg id="76e1eccb1b772fa9f294ef9c146ea6d0efa8a2d4" desc="desc" meaning="meaning">translate me</msg>
  <msg id="65cc4ab3b4c438e07c89be2b677d08369fb62da2">Welcome</msg>
</messagebundle>
`;

const EXPECTED_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="76e1eccb1b772fa9f294ef9c146ea6d0efa8a2d4" datatype="html">
        <source>translate me</source>
        <target/>
        <note priority="1" from="description">desc</note>
        <note priority="1" from="meaning">meaning</note>
      </trans-unit>
      <trans-unit id="65cc4ab3b4c438e07c89be2b677d08369fb62da2" datatype="html">
        <source>Welcome</source>
        <target/>
      </trans-unit>
    </body>
  </file>
</xliff>
`;

describe('template i18n extraction output', () => {
  const outDir = '';

  it('should extract i18n messages as xmb', () => {
    const xmbOutput = path.join(outDir, 'messages.xmb');
    expect(fs.existsSync(xmbOutput)).toBeTruthy();
    const xmb = fs.readFileSync(xmbOutput, {encoding: 'utf-8'});
    expect(xmb).toEqual(EXPECTED_XMB);
  });

  it('should extract i18n messages as xliff', () => {
    const xlfOutput = path.join(outDir, 'messages.xlf');
    expect(fs.existsSync(xlfOutput)).toBeTruthy();
    const xlf = fs.readFileSync(xlfOutput, {encoding: 'utf-8'});
    expect(xlf).toEqual(EXPECTED_XLIFF);
  });

});
