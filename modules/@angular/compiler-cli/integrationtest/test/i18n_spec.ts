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
<messagebundle>
  <msg id="5a2858f1" desc="desc" meaning="meaning">translate me</msg>
</messagebundle>`;

    const xmbOutput = path.join(outDir, 'messages.xmb');
    expect(fs.existsSync(xmbOutput)).toBeTruthy();
    const xmb = fs.readFileSync(xmbOutput, {encoding: 'utf-8'});
    expect(xmb).toEqual(EXPECTED);
  });
});
