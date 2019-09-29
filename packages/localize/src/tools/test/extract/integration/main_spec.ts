/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {readFileSync, readdirSync, rmdirSync, statSync, unlinkSync} from 'fs';
import {resolve} from 'path';
import {extractTranslations} from '../../../src/extract/main';

describe('extractTranslations()', () => {
  const tmpDir = process.env.TEST_TMPDIR;
  if (tmpDir === undefined) return;

  const outputPath = resolve(tmpDir, 'extracted-message-file');

  afterEach(() => { emptyDirectory(tmpDir); });

  it('should ignore non-code files', () => {
    extractTranslations({
      sourceGlob: resolve(__dirname, 'test_files/**/*.txt'),
      format: 'json', outputPath,
    });
    expect(readFileSync(outputPath, 'utf8')).toEqual(`{
  "locale": "en",
  "translations": {}
}`);
  });

  it('should extract translations from source code, and write as JSON format', () => {
    extractTranslations({
      sourceGlob: resolve(__dirname, 'test_files/**/*.js'),
      format: 'json', outputPath,
    });
    expect(readFileSync(outputPath, 'utf8')).toEqual(`{
  "locale": "en",
  "translations": {
    "3291030485717846467": "Hello, {$PH}!",
    "8669027859022295761": "try{$PH}me"
  }
}`);
  });

  it('should extract translations from source code, and write as xmb format', () => {
    extractTranslations({
      sourceGlob: resolve(__dirname, 'test_files/**/*.js'),
      format: 'xmb', outputPath,
    });
    expect(readFileSync(outputPath, 'utf8')).toEqual(`<messagebundle>
  <msg id="3291030485717846467">Hello, <ph name="PH"/>!</msg>
  <msg id="8669027859022295761">try<ph name="PH"/>me</msg>
</messagebundle>
`);
  });

  it('should extract translations from source code, and write as XLIFF 1.2 format', () => {
    extractTranslations({
      sourceGlob: resolve(__dirname, 'test_files/**/*.js'),
      format: 'xliff1', outputPath,
    });
    expect(readFileSync(outputPath, 'utf8'))
        .toEqual(`<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="en" datatype="plaintext">
    <body>
      <trans-unit id="3291030485717846467" datatype="html">
        <source>Hello, <x id="PH"/>!</source>
      </trans-unit>
      <trans-unit id="8669027859022295761" datatype="html">
        <source>try<x id="PH"/>me</source>
      </trans-unit>
    </body>
  </file>
</xliff>
`);
  });

  it('should extract translations from source code, and write as XLIFF 2 format', () => {
    extractTranslations({
      sourceGlob: resolve(__dirname, 'test_files/**/*.js'),
      format: 'xliff2', outputPath,
    });
    expect(readFileSync(outputPath, 'utf8'))
        .toEqual(`<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file>
    <unit id="3291030485717846467">
      <segment>
        <source>Hello, <ph id="1" equiv="PH"/>!</source>
      </segment>
    </unit>
    <unit id="8669027859022295761">
      <segment>
        <source>try<ph id="1" equiv="PH"/>me</source>
      </segment>
    </unit>
  </file>
</xliff>
`);
  });
});

function emptyDirectory(dirPath: string) {
  readdirSync(dirPath).forEach(p => {
    const path = resolve(dirPath, p);
    const stat = statSync(path);
    if (stat.isFile()) {
      unlinkSync(path);
    } else if (stat.isDirectory()) {
      emptyDirectory(path);
      rmdirSync(path);
    }
  });
}
