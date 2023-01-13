/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
  <msg id="126808141597411718"><source>node_modules/third_party/other_comp.d.ts:1,2</source>other-3rdP-component
multi-lines</msg>
  <msg id="8136548302122759730" desc="desc" meaning="meaning"><source>src/basic.html:1</source>translate me</msg>
  <msg id="3492007542396725315"><source>src/basic.html:5</source><source>src/entry_components.ts:1</source>Welcome</msg>
</messagebundle>
`;

const EXPECTED_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="fr" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="b0a17f08a4bd742b2acf39780c257c2f519d33ed" datatype="html">
        <source>other-3rdP-component
multi-lines</source>
        <context-group purpose="location">
          <context context-type="sourcefile">node_modules/third_party/other_comp.d.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
      <trans-unit id="76e1eccb1b772fa9f294ef9c146ea6d0efa8a2d4" datatype="html">
        <source>translate me</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/basic.html</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <note priority="1" from="description">desc</note>
        <note priority="1" from="meaning">meaning</note>
      </trans-unit>
      <trans-unit id="65cc4ab3b4c438e07c89be2b677d08369fb62da2" datatype="html">
        <source>Welcome</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/basic.html</context>
          <context context-type="linenumber">5</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">src/entry_components.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>
`;

const EXPECTED_XLIFF2 = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="126808141597411718">
      <notes>
        <note category="location">node_modules/third_party/other_comp.d.ts:1,2</note>
      </notes>
      <segment>
        <source>other-3rdP-component
multi-lines</source>
      </segment>
    </unit>
    <unit id="8136548302122759730">
      <notes>
        <note category="description">desc</note>
        <note category="meaning">meaning</note>
        <note category="location">src/basic.html:1</note>
      </notes>
      <segment>
        <source>translate me</source>
      </segment>
    </unit>
    <unit id="3492007542396725315">
      <notes>
        <note category="location">src/basic.html:5</note>
        <note category="location">src/entry_components.ts:1</note>
      </notes>
      <segment>
        <source>Welcome</source>
      </segment>
    </unit>
  </file>
</xliff>
`;

describe('template i18n extraction output', () => {
  const outputDir = path.join(__dirname, '../xi18n-out');

  it('should extract i18n messages as xmb', () => {
    const xmbOutput = path.join(outputDir, 'custom_file.xmb');
    expect(fs.existsSync(xmbOutput)).toBeTruthy();
    const xmb = fs.readFileSync(xmbOutput, {encoding: 'utf-8'});
    expect(xmb).toEqual(EXPECTED_XMB);
  });

  it('should extract i18n messages as xliff', () => {
    const xlfOutput = path.join(outputDir, 'messages.xlf');
    expect(fs.existsSync(xlfOutput)).toBeTruthy();
    const xlf = fs.readFileSync(xlfOutput, {encoding: 'utf-8'});
    expect(xlf).toEqual(EXPECTED_XLIFF);
  });

  it('should extract i18n messages as xliff version 2.0', () => {
    const xlfOutput = path.join(outputDir, 'messages.xliff2.xlf');
    expect(fs.existsSync(xlfOutput)).toBeTruthy();
    const xlf = fs.readFileSync(xlfOutput, {encoding: 'utf-8'});
    expect(xlf).toEqual(EXPECTED_XLIFF2);
  });

  it('should not emit js', () => {
    const files = fs.readdirSync(outputDir);
    files.forEach(f => expect(f).not.toMatch(/\.js$/));
  });
});
