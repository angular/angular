/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

import {mainXi18n} from '../src/extract_i18n';
import {setup} from './test_support';

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
  <msg id="8136548302122759730" desc="desc" meaning="meaning"><source>src/basic.html:1</source><source>src/comp2.ts:1</source><source>src/basic.html:1</source>translate me</msg>
  <msg id="9038505069473852515"><source>src/basic.html:3,4</source><source>src/comp2.ts:3,4</source><source>src/comp2.ts:2,3</source><source>src/basic.html:3,4</source>
    Welcome</msg>
  <msg id="5611534349548281834" desc="with ICU"><source>src/icu.html:1,3</source><source>src/icu.html:5</source>{VAR_PLURAL, plural, =1 {book} other {books} }</msg>
  <msg id="5811701742971715242" desc="with ICU and other things"><source>src/icu.html:4,6</source>
     foo <ph name="ICU"><ex>{ count, plural, =1 {...} other {...}}</ex>{ count, plural, =1 {...} other {...}}</ph>
    </msg>
  <msg id="7254052530614200029" desc="with placeholders"><source>src/placeholders.html:1,3</source>Name: <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex>&lt;b&gt;</ph><ph name="NAME"><ex>{{
      name // i18n(ph=&quot;name&quot;)
    }}</ex>{{
      name // i18n(ph=&quot;name&quot;)
    }}</ph><ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex>&lt;/b&gt;</ph></msg>
</messagebundle>
`;

const EXPECTED_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
  <file source-language="fr" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="76e1eccb1b772fa9f294ef9c146ea6d0efa8a2d4" datatype="html">
        <source>translate me</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/basic.html</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">src/comp2.ts</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">src/basic.html</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <note priority="1" from="description">desc</note>
        <note priority="1" from="meaning">meaning</note>
      </trans-unit>
      <trans-unit id="085a5ecc40cc87451d216725b2befd50866de18a" datatype="html">
        <source>
    Welcome</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/basic.html</context>
          <context context-type="linenumber">3</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">src/comp2.ts</context>
          <context context-type="linenumber">3</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">src/comp2.ts</context>
          <context context-type="linenumber">2</context>
        </context-group>
        <context-group purpose="location">
          <context context-type="sourcefile">src/basic.html</context>
          <context context-type="linenumber">3</context>
        </context-group>
      </trans-unit>
      <trans-unit id="83937c05b1216e7f4c02a85454260e28fd72d1e3" datatype="html">
        <source>{VAR_PLURAL, plural, =1 {book} other {books} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/icu.html</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <note priority="1" from="description">with ICU</note>
      </trans-unit>
      <trans-unit id="540c5f481129419ef21017f396b6c2d0869ca4d2" datatype="html">
        <source>
     foo <x id="ICU" equiv-text="{ count, plural, =1 {...} other {...}}"/>
    </source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/icu.html</context>
          <context context-type="linenumber">4</context>
        </context-group>
        <note priority="1" from="description">with ICU and other things</note>
      </trans-unit>
      <trans-unit id="ca7678090fddd04441d63b1218177af65f23342d" datatype="html">
        <source>{VAR_PLURAL, plural, =1 {book} other {books} }</source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/icu.html</context>
          <context context-type="linenumber">5</context>
        </context-group>
      </trans-unit>
      <trans-unit id="9311399c1ca7c75f771d77acb129e50581c6ec1f" datatype="html">
        <source>Name: <x id="START_BOLD_TEXT" ctype="x-b" equiv-text="&lt;b&gt;"/><x id="NAME" equiv-text="{{
      name // i18n(ph=&quot;name&quot;)
    }}"/><x id="CLOSE_BOLD_TEXT" ctype="x-b" equiv-text="&lt;/b&gt;"/></source>
        <context-group purpose="location">
          <context context-type="sourcefile">src/placeholders.html</context>
          <context context-type="linenumber">1</context>
        </context-group>
        <note priority="1" from="description">with placeholders</note>
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
        <note category="location">src/basic.html:1</note>
        <note category="location">src/comp2.ts:1</note>
        <note category="location">src/basic.html:1</note>
      </notes>
      <segment>
        <source>translate me</source>
      </segment>
    </unit>
    <unit id="9038505069473852515">
      <notes>
        <note category="location">src/basic.html:3,4</note>
        <note category="location">src/comp2.ts:3,4</note>
        <note category="location">src/comp2.ts:2,3</note>
        <note category="location">src/basic.html:3,4</note>
      </notes>
      <segment>
        <source>
    Welcome</source>
      </segment>
    </unit>
    <unit id="5611534349548281834">
      <notes>
        <note category="description">with ICU</note>
        <note category="location">src/icu.html:1,3</note>
        <note category="location">src/icu.html:5</note>
      </notes>
      <segment>
        <source>{VAR_PLURAL, plural, =1 {book} other {books} }</source>
      </segment>
    </unit>
    <unit id="5811701742971715242">
      <notes>
        <note category="description">with ICU and other things</note>
        <note category="location">src/icu.html:4,6</note>
      </notes>
      <segment>
        <source>
     foo <ph id="0" equiv="ICU" disp="{ count, plural, =1 {...} other {...}}"/>
    </source>
      </segment>
    </unit>
    <unit id="7254052530614200029">
      <notes>
        <note category="description">with placeholders</note>
        <note category="location">src/placeholders.html:1,3</note>
      </notes>
      <segment>
        <source>Name: <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;"><ph id="1" equiv="NAME" disp="{{
      name // i18n(ph=&quot;name&quot;)
    }}"/></pc></source>
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

  function writeConfig(tsconfig = '{"extends": "./tsconfig-base.json"}') {
    write('tsconfig.json', tsconfig);
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    const support = setup();
    write = (fileName: string, content: string) => {
      support.write(fileName, content);
    };
    basePath = support.basePath;
    outDir = path.join(basePath, 'built');
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
      },
      "angularCompilerOptions": {
        "enableIvy": false
      }
    }`);
  });

  function writeSources() {
    const welcomeMessage = `
    <!--i18n-->
    Welcome<!--/i18n-->
    `;
    write('src/basic.html', `<div title="translate me" i18n-title="meaning|desc"></div>
         <p id="welcomeMessage">${welcomeMessage}</p>`);

    write('src/comp1.ts', `
    import {Component} from '@angular/core';

    @Component({
      selector: 'basic',
      templateUrl: './basic.html',
    })
    export class BasicCmp1 {}`);

    write('src/comp2.ts', `
    import {Component} from '@angular/core';

    @Component({
      selector: 'basic2',
      template: \`<div title="translate me" i18n-title="meaning|desc"></div>
      <p id="welcomeMessage">${welcomeMessage}</p>\`,
    })
    export class BasicCmp2 {}
    @Component({
      selector: 'basic4',
      template: \`<p id="welcomeMessage">${welcomeMessage}</p>\`,
    })
    export class BasicCmp4 {}`);

    write('src/comp3.ts', `
    import {Component} from '@angular/core';

    @Component({
      selector: 'basic3',
      templateUrl: './basic.html',
    })
    export class BasicCmp3 {}`);

    write('src/placeholders.html', `<div i18n="with placeholders">Name: <b>{{
      name // i18n(ph="name")
    }}</b></div>`);

    write('src/placeholder_cmp.ts', `
    import {Component} from '@angular/core';

    @Component({
      selector: 'placeholders',
      templateUrl: './placeholders.html',
    })
    export class PlaceholderCmp { name = 'whatever'; }`);

    write('src/icu.html', `<div i18n="with ICU">{
      count, plural, =1 {book} other {books}
    }</div>
    <div i18n="with ICU and other things">
     foo { count, plural, =1 {book} other {books} }
    </div>`);

    write('src/icu_cmp.ts', `
    import {Component} from '@angular/core';

    @Component({
      selector: 'icu',
      templateUrl: './icu.html',
    })
    export class IcuCmp { count = 3; }`);

    write('src/module.ts', `
    import {NgModule} from '@angular/core';
    import {CommonModule} from '@angular/common';
    import {BasicCmp1} from './comp1';
    import {BasicCmp2, BasicCmp4} from './comp2';
    import {BasicCmp3} from './comp3';
    import {PlaceholderCmp} from './placeholder_cmp';
    import {IcuCmp} from './icu_cmp';

    @NgModule({
      declarations: [
        BasicCmp1,
        BasicCmp2,
        BasicCmp3,
        BasicCmp4,
        PlaceholderCmp,
        IcuCmp,
      ],
      imports: [CommonModule],
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
