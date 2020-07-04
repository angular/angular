/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {runInEachFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {Logger} from '@angular/compiler-cli/src/ngtsc/logging';
import {MockLogger} from '@angular/compiler-cli/src/ngtsc/logging/testing';
import {loadTestDirectory} from '@angular/compiler-cli/test/helpers';

import {extractTranslations} from '../../../src/extract/main';

runInEachFileSystem(() => {
  let fs: FileSystem;
  let logger: Logger;
  let rootPath: AbsoluteFsPath;
  let outputPath: AbsoluteFsPath;
  let sourceFilePath: AbsoluteFsPath;
  let textFile1: AbsoluteFsPath;
  let textFile2: AbsoluteFsPath;

  beforeEach(() => {
    fs = getFileSystem();
    logger = new MockLogger();
    rootPath = absoluteFrom('/project');
    outputPath = fs.resolve(rootPath, 'extracted-message-file');
    sourceFilePath = fs.resolve(rootPath, 'test_files/test.js');
    textFile1 = fs.resolve(rootPath, 'test_files/test-1.txt');
    textFile2 = fs.resolve(rootPath, 'test_files/test-2.txt');

    fs.ensureDir(fs.dirname(sourceFilePath));
    loadTestDirectory(fs, __dirname + '/test_files', absoluteFrom('/project/test_files'));
  });

  describe('extractTranslations()', () => {
    it('should ignore non-code files', () => {
      extractTranslations({
        rootPath,
        sourceLocale: 'en',
        sourceFilePaths: [],
        format: 'json',
        outputPath,
        logger,
        useSourceMaps: false,
        useLegacyIds: false,
      });
      expect(fs.readFile(outputPath)).toEqual([
        `{`,
        `  "locale": "en",`,
        `  "translations": {}`,
        `}`,
      ].join('\n'));
    });

    it('should extract translations from source code, and write as JSON format', () => {
      extractTranslations({
        rootPath,
        sourceLocale: 'en-GB',
        sourceFilePaths: [sourceFilePath],
        format: 'json',
        outputPath,
        logger,
        useSourceMaps: false,
        useLegacyIds: false,
      });
      expect(fs.readFile(outputPath)).toEqual([
        `{`,
        `  "locale": "en-GB",`,
        `  "translations": {`,
        `    "3291030485717846467": "Hello, {$PH}!",`,
        `    "8669027859022295761": "try{$PH}me"`,
        `  }`,
        `}`,
      ].join('\n'));
    });

    it('should extract translations from source code, and write as xmb format', () => {
      extractTranslations({
        rootPath,
        sourceLocale: 'en',
        sourceFilePaths: [sourceFilePath],
        format: 'xmb',
        outputPath,
        logger,
        useSourceMaps: false,
        useLegacyIds: false,
      });
      expect(fs.readFile(outputPath)).toEqual([
        `<?xml version="1.0" encoding="UTF-8" ?>`,
        `<!DOCTYPE messagebundle [`,
        `<!ELEMENT messagebundle (msg)*>`,
        `<!ATTLIST messagebundle class CDATA #IMPLIED>`,
        ``,
        `<!ELEMENT msg (#PCDATA|ph|source)*>`,
        `<!ATTLIST msg id CDATA #IMPLIED>`,
        `<!ATTLIST msg seq CDATA #IMPLIED>`,
        `<!ATTLIST msg name CDATA #IMPLIED>`,
        `<!ATTLIST msg desc CDATA #IMPLIED>`,
        `<!ATTLIST msg meaning CDATA #IMPLIED>`,
        `<!ATTLIST msg obsolete (obsolete) #IMPLIED>`,
        `<!ATTLIST msg xml:space (default|preserve) "default">`,
        `<!ATTLIST msg is_hidden CDATA #IMPLIED>`,
        ``,
        `<!ELEMENT source (#PCDATA)>`,
        ``,
        `<!ELEMENT ph (#PCDATA|ex)*>`,
        `<!ATTLIST ph name CDATA #REQUIRED>`,
        ``,
        `<!ELEMENT ex (#PCDATA)>`,
        `]>`,
        `<messagebundle>`,
        `  <msg id="3291030485717846467"><source>test_files/test.js:1</source>Hello, <ph name="PH"/>!</msg>`,
        `  <msg id="8669027859022295761"><source>test_files/test.js:2</source>try<ph name="PH"/>me</msg>`,
        `</messagebundle>\n`,
      ].join('\n'));
    });

    it('should extract translations from source code, and write as XLIFF 1.2 format', () => {
      extractTranslations({
        rootPath,
        sourceLocale: 'en-CA',
        sourceFilePaths: [sourceFilePath],
        format: 'xliff',
        outputPath,
        logger,
        useSourceMaps: false,
        useLegacyIds: false,
      });
      expect(fs.readFile(outputPath)).toEqual([
        `<?xml version="1.0" encoding="UTF-8" ?>`,
        `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
        `  <file source-language="en-CA" datatype="plaintext">`,
        `    <body>`,
        `      <trans-unit id="3291030485717846467" datatype="html">`,
        `        <source>Hello, <x id="PH"/>!</source>`,
        `        <context-group purpose="location">`,
        `          <context context-type="sourcefile">test_files/test.js</context>`,
        `          <context context-type="linenumber">2</context>`,
        `        </context-group>`,
        `      </trans-unit>`,
        `      <trans-unit id="8669027859022295761" datatype="html">`,
        `        <source>try<x id="PH"/>me</source>`,
        `        <context-group purpose="location">`,
        `          <context context-type="sourcefile">test_files/test.js</context>`,
        `          <context context-type="linenumber">3</context>`,
        `        </context-group>`,
        `      </trans-unit>`,
        `    </body>`,
        `  </file>`,
        `</xliff>\n`,
      ].join('\n'));
    });

    it('should extract translations from source code, and write as XLIFF 2 format', () => {
      extractTranslations({
        rootPath,
        sourceLocale: 'en-AU',
        sourceFilePaths: [sourceFilePath],
        format: 'xliff2',
        outputPath,
        logger,
        useSourceMaps: false,
        useLegacyIds: false,
      });
      expect(fs.readFile(outputPath)).toEqual([
        `<?xml version="1.0" encoding="UTF-8" ?>`,
        `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-AU">`,
        `  <file>`,
        `    <unit id="3291030485717846467">`,
        `      <segment>`,
        `        <source>Hello, <ph id="1" equiv="PH"/>!</source>`,
        `      </segment>`,
        `    </unit>`,
        `    <unit id="8669027859022295761">`,
        `      <segment>`,
        `        <source>try<ph id="1" equiv="PH"/>me</source>`,
        `      </segment>`,
        `    </unit>`,
        `  </file>`,
        `</xliff>\n`,
      ].join('\n'));
    });

    for (const target of ['es2015', 'es5']) {
      it(`should render the original location of translations, when processing an ${
             target} bundle with source-maps`,
         () => {
           extractTranslations({
             rootPath,
             sourceLocale: 'en-CA',
             sourceFilePaths: [fs.resolve(rootPath, `test_files/dist_${target}/index.js`)],
             format: 'xliff',
             outputPath,
             logger,
             useSourceMaps: true,
             useLegacyIds: false,
           });
           expect(fs.readFile(outputPath)).toEqual([
             `<?xml version="1.0" encoding="UTF-8" ?>`,
             `<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">`,
             `  <file source-language="en-CA" datatype="plaintext">`,
             `    <body>`,
             `      <trans-unit id="157258427077572998" datatype="html">`,
             `        <source>Message in <x id="a-file"/>!</source>`,
             `        <context-group purpose="location">`,
             // These source file paths are due to how Bazel TypeScript compilation source-maps work
             `          <context context-type="sourcefile">../packages/localize/src/tools/test/extract/integration/test_files/src/a.ts</context>`,
             `          <context context-type="linenumber">3</context>`,
             `        </context-group>`,
             `      </trans-unit>`,
             `      <trans-unit id="7829869508202074508" datatype="html">`,
             `        <source>Message in <x id="b-file"/>!</source>`,
             `        <context-group purpose="location">`,
             `          <context context-type="sourcefile">../packages/localize/src/tools/test/extract/integration/test_files/src/b.ts</context>`,
             `          <context context-type="linenumber">3</context>`,
             `        </context-group>`,
             `      </trans-unit>`,
             `    </body>`,
             `  </file>`,
             `</xliff>\n`,
           ].join('\n'));
         });
    }
  });
});
