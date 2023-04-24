/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {MockLogger} from '@angular/compiler-cli/src/ngtsc/logging/testing';
import {loadTestDirectory} from '@angular/compiler-cli/src/ngtsc/testing';
import path from 'path';
import url from 'url';

import {migrateFiles} from '../../../src/migrate/index';
import {runInNativeFileSystem} from '../../helpers';

const currentDir = path.dirname(url.fileURLToPath(import.meta.url));

runInNativeFileSystem(() => {
  let fs: FileSystem;
  let logger: MockLogger;
  let rootPath: AbsoluteFsPath;
  let mappingFilePath: AbsoluteFsPath;

  beforeEach(() => {
    fs = getFileSystem();
    logger = new MockLogger();
    rootPath = absoluteFrom('/project');
    mappingFilePath = fs.resolve(rootPath, 'test_files/mapping.json');

    loadTestDirectory(fs, path.join(currentDir, 'test_files'), absoluteFrom('/project/test_files'));
  });

  describe('migrateFiles()', () => {
    it('should log a warning if the migration file is empty', () => {
      const emptyMappingPath = fs.resolve(rootPath, 'test_files/empty-mapping.json');
      migrateFiles({
        rootPath,
        translationFilePaths: ['test_files/messages.json'],
        logger,
        mappingFilePath: emptyMappingPath,
      });

      expect(logger.logs.warn).toEqual([
        [`Mapping file at ${emptyMappingPath} is empty. Either there are no messages ` +
         `that need to be migrated, or the extraction step failed to find them.`]
      ]);
    });

    it('should migrate a json message file', () => {
      const filePath = 'test_files/messages.json';
      migrateFiles({
        rootPath,
        translationFilePaths: [filePath],
        logger,
        mappingFilePath,
      });

      expect(readAndNormalize(fs.resolve(rootPath, filePath))).toEqual([
        `{`,
        `  "locale": "en-GB",`,
        `  "translations": {`,
        `    "9876543": "Hello",`,
        `    "custom-id": "Custom id message",`,
        `    "987654321098765": "Goodbye"`,
        `  }`,
        `}`,
      ].join('\n'));
    });

    it('should migrate an arb message file', () => {
      const filePath = 'test_files/messages.arb';
      migrateFiles({
        rootPath,
        translationFilePaths: [filePath],
        logger,
        mappingFilePath,
      });
      expect(readAndNormalize(fs.resolve(rootPath, filePath))).toEqual([
        `{`,
        `  "@@locale": "en-GB",`,
        `  "9876543": "Hello",`,
        `  "@9876543": {`,
        `    "x-locations": [`,
        `      {`,
        `        "file": "test.js",`,
        `        "start": { "line": "1", "column": "0" },`,
        `        "end": { "line": "1", "column": "0" }`,
        `      }`,
        `    ]`,
        `  },`,
        `  "custom-id": "Custom id message",`,
        `  "@custom-id": {`,
        `    "x-locations": [`,
        `      {`,
        `        "file": "test.js",`,
        `        "start": { "line": "2", "column": "0" },`,
        `        "end": { "line": "2", "column": "0" }`,
        `      }`,
        `    ]`,
        `  },`,
        `  "987654321098765": "Goodbye",`,
        `  "@987654321098765": {`,
        `    "x-locations": [`,
        `      {`,
        `        "file": "test.js",`,
        `        "start": { "line": "3", "column": "0" },`,
        `        "end": { "line": "3", "column": "0" }`,
        `      }`,
        `    ]`,
        `  }`,
        `}`,
      ].join('\n'));
    });

    it('should migrate an xmb message file', () => {
      const filePath = 'test_files/messages.xmb';
      migrateFiles({
        rootPath,
        translationFilePaths: [filePath],
        logger,
        mappingFilePath,
      });
      expect(readAndNormalize(fs.resolve(rootPath, filePath))).toEqual([
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
        `  <msg id="9876543"><source>test.js:1</source>Hello</msg>`,
        `  <msg id="custom-id"><source>test.js:2</source>Custom id message</msg>`,
        `  <msg id="987654321098765"><source>test.js:3</source>Goodbye</msg>`,
        `</messagebundle>`,
      ].join('\n'));
    });

    it('should migrate an xlf message file', () => {
      const filePath = 'test_files/messages.xlf';
      migrateFiles({
        rootPath,
        translationFilePaths: [filePath],
        logger,
        mappingFilePath,
      });
      expect(readAndNormalize(fs.resolve(rootPath, filePath))).toEqual([
        `<?xml version="1.0" encoding="UTF-8" ?>`,
        `<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en-GB">`,
        `  <file id="ngi18n" original="ng.template" xml:space="preserve">`,
        `    <unit id="9876543">`,
        `      <notes>`,
        `        <note category="location">test.js:1</note>`,
        `      </notes>`,
        `      <segment>`,
        `        <source>Hello</source>`,
        `      </segment>`,
        `    </unit>`,
        `    <unit id="custom-id">`,
        `      <notes>`,
        `        <note category="location">test.js:2</note>`,
        `      </notes>`,
        `      <segment>`,
        `        <source>Custom id message</source>`,
        `      </segment>`,
        `    </unit>`,
        `    <unit id="987654321098765">`,
        `      <notes>`,
        `        <note category="location">test.js:3</note>`,
        `      </notes>`,
        `      <segment>`,
        `        <source>Goodbye</source>`,
        `      </segment>`,
        `    </unit>`,
        `  </file>`,
        `</xliff>`,
      ].join('\n'));
    });

    /** Reads a path from the file system and normalizes the line endings. */
    function readAndNormalize(path: AbsoluteFsPath): string {
      return fs.readFile(path).replace(/\r?\n/g, '\n');
    }
  });
});
