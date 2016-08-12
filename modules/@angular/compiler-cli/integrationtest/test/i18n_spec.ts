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

describe('template i18n extraction output', () => {
  const outDir = '';

  it('should extract i18n messages', () => {
    const EXPECTED = `<? xml version="1.0" encoding="UTF-8" ?>
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
</messagebundle>`;

    const xmbOutput = path.join(outDir, 'messages.xmb');
    expect(fs.existsSync(xmbOutput)).toBeTruthy();
    const xmb = fs.readFileSync(xmbOutput, {encoding: 'utf-8'});
    expect(xmb).toEqual(EXPECTED);
  });
});
