/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {mainXi18n} from '../src/extract_i18n';

import {makeTempDir} from './test_support';

function getNgRootDir() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  return moduleFilename.substr(0, distIndex);
}

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
  <msg id="8136548302122759730" desc="desc" meaning="meaning"><source>src/module.ts:1</source>translate me</msg>
  <msg id="3492007542396725315"><source>src/module.ts:2</source>Welcome</msg>
</messagebundle>
`;

const EXPECTED_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="fr" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="76e1eccb1b772fa9f294ef9c146ea6d0efa8a2d4" datatype="html">
        <source>translate me</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/module.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <note priority="1" from="description">desc</note>
        <note priority="1" from="meaning">meaning</note>
      </trans-unit>
      <trans-unit id="65cc4ab3b4c438e07c89be2b677d08369fb62da2" datatype="html">
        <source>Welcome</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/module.ts</context>
          <context context-type="linenumber">2</context>
        </context-group>
      </trans-unit>
    </body>
  </file>
</xliff>
`;

const EXPECTED_XLIFF2 = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng.template" id="ngi18n">
    <unit id="8136548302122759730">
      <notes>
        <note category="description">desc</note>
        <note category="meaning">meaning</note>
        <note category="location">src/module.ts:1</note>
      </notes>
      <segment>
        <source>translate me</source>
      </segment>
    </unit>
    <unit id="3492007542396725315">
      <notes>
        <note category="location">src/module.ts:2</note>
      </notes>
      <segment>
        <source>Welcome</source>
      </segment>
    </unit>
  </file>
</xliff>
`;

describe('extract_i18n command line', () => {
  let basePath: string;
  let outDir: string;
  let write: (fileName: string, content: string) => void;
  let errorSpy: jasmine.Spy&((s: string) => void);

  function writeConfig(tsconfig: string = '{"extends": "./tsconfig-base.json"}') {
    write('tsconfig.json', tsconfig);
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    basePath = makeTempDir();
    write = (fileName: string, content: string) => {
      const dir = path.dirname(fileName);
      if (dir != '.') {
        const newDir = path.join(basePath, dir);
        if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
      }
      fs.writeFileSync(path.join(basePath, fileName), content, {encoding: 'utf-8'});
    };
    write('tsconfig-base.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "noImplicitAny": true,
        "types": [],
        "outDir": "built",
        "rootDir": ".",
        "baseUrl": ".",
        "declaration": true,
        "target": "es5",
        "module": "es2015",
        "moduleResolution": "node",
        "lib": ["es6", "dom"],
        "typeRoots": ["node_modules/@types"]
      }
    }`);
    outDir = path.resolve(basePath, 'built');
    const ngRootDir = getNgRootDir();
    const nodeModulesPath = path.resolve(basePath, 'node_modules');
    fs.mkdirSync(nodeModulesPath);
    fs.symlinkSync(
        path.resolve(ngRootDir, 'dist', 'all', '@angular'),
        path.resolve(nodeModulesPath, '@angular'));
    fs.symlinkSync(
        path.resolve(ngRootDir, 'node_modules', 'rxjs'), path.resolve(nodeModulesPath, 'rxjs'));
  });

  function writeSources() {
    write('src/basic.html', [
      `<div title="translate me" i18n-title="meaning|desc"></div>`,
      `<p id="welcomeMessage"><!--i18n-->Welcome<!--/i18n--></p>`,
    ].join('\n'));
    write('src/module.ts', `
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'basic',
      templateUrl: './basic.html',
    })
    export class BasicCmp {}

    @NgModule({
      declarations: [BasicCmp]
    })
    export class I18nModule {}
    `);
  }

  it('should extract xmb', () => {
    writeConfig();
    writeSources();

    const exitCode =
        mainXi18n(['-p', basePath, '--i18nFormat=xmb', '--outFile=custom_file.xmb'], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const xmbOutput = path.join(outDir, 'custom_file.xmb');
    expect(fs.existsSync(xmbOutput)).toBeTruthy();
    const xmb = fs.readFileSync(xmbOutput, {encoding: 'utf-8'});
    expect(xmb).toEqual(EXPECTED_XMB);
  });

  it('should extract xlf', () => {
    writeConfig();
    writeSources();

    const exitCode = mainXi18n(['-p', basePath, '--i18nFormat=xlf', '--locale=fr'], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const xlfOutput = path.join(outDir, 'messages.xlf');
    expect(fs.existsSync(xlfOutput)).toBeTruthy();
    const xlf = fs.readFileSync(xlfOutput, {encoding: 'utf-8'});
    expect(xlf).toEqual(EXPECTED_XLIFF);
  });

  it('should extract xlf2', () => {
    writeConfig();
    writeSources();

    const exitCode =
        mainXi18n(['-p', basePath, '--i18nFormat=xlf2', '--outFile=messages.xliff2.xlf'], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const xlfOutput = path.join(outDir, 'messages.xliff2.xlf');
    expect(fs.existsSync(xlfOutput)).toBeTruthy();
    const xlf = fs.readFileSync(xlfOutput, {encoding: 'utf-8'});
    expect(xlf).toEqual(EXPECTED_XLIFF2);
  });

  it('should not emit js', () => {
    writeConfig();
    writeSources();

    const exitCode =
        mainXi18n(['-p', basePath, '--i18nFormat=xlf2', '--outFile=messages.xliff2.xlf'], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const moduleOutput = path.join(outDir, 'src', 'module.js');
    expect(fs.existsSync(moduleOutput)).toBeFalsy();
  });
});
