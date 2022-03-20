/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {assertFileNames, assertTextSpans, createModuleAndProjectWithDeclarations, humanizeDocumentSpanLike, LanguageServiceTestEnv, OpenBuffer, Project} from '../testing';

describe('definitions', () => {
  it('gets definition for template reference in overridden template', () => {
    initMockFileSystem('Native');
    const files = {
      'app.html': '',
      'app.ts': `
         import {Component} from '@angular/core';
 
         @Component({templateUrl: '/app.html'})
         export class AppCmp {}
       `,
    };
    const env = LanguageServiceTestEnv.setup();

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.contents = '<input #myInput /> {{myInput.value}}';
    project.expectNoSourceDiagnostics();

    template.moveCursorToText('{{myIn¦put.value}}');
    const {definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(definitions![0].name).toEqual('myInput');
    assertFileNames(Array.from(definitions!), ['app.html']);
  });

  it('returns the pipe definitions when checkTypeOfPipes is false', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
         import {Component, NgModule} from '@angular/core';
         import {CommonModule} from '@angular/common';
 
         @Component({templateUrl: 'app.html'})
         export class AppCmp {}
       `,
      'app.html': '{{"1/1/2020" | date}}'
    };
    // checkTypeOfPipes is set to false when strict templates is false
    const env = LanguageServiceTestEnv.setup();
    const project =
        createModuleAndProjectWithDeclarations(env, 'test', files, {strictTemplates: false});
    const template = project.openFile('app.html');
    project.expectNoSourceDiagnostics();
    template.moveCursorToText('da¦te');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.slice(textSpan.start, textSpan.start + textSpan.length))
        .toEqual('date');
    expect(definitions.length).toEqual(3);
    assertTextSpans(definitions, ['transform']);
    assertFileNames(definitions, ['index.d.ts']);
  });

  it('gets definitions for all inputs when attribute matches more than one', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
         import {Component, NgModule} from '@angular/core';
         import {CommonModule} from '@angular/common';
 
         @Component({templateUrl: 'app.html'})
         export class AppCmp {}
       `,
      'app.html': '<div dir inputA="abc"></div>',
      'dir.ts': `
       import {Directive, Input} from '@angular/core';
 
       @Directive({selector: '[dir]'})
       export class MyDir {
         @Input() inputA!: any;
       }`,
      'dir2.ts': `
       import {Directive, Input} from '@angular/core';
 
       @Directive({selector: '[dir]'})
       export class MyDir2 {
         @Input() inputA!: any;
       }`

    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.moveCursorToText('inpu¦tA="abc"');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.slice(textSpan.start, textSpan.start + textSpan.length))
        .toEqual('inputA');

    expect(definitions!.length).toEqual(2);
    const [def, def2] = definitions!;
    expect(def.textSpan).toContain('inputA');
    expect(def2.textSpan).toContain('inputA');
    // TODO(atscott): investigate why the text span includes more than just 'inputA'
    // assertTextSpans([def, def2], ['inputA']);
    assertFileNames([def, def2], ['dir2.ts', 'dir.ts']);
  });

  it('gets definitions for all outputs when attribute matches more than one', () => {
    initMockFileSystem('Native');
    const files = {
      'app.html': '<div dir (someEvent)="doSomething()"></div>',
      'dir.ts': `
       import {Directive, Output, EventEmitter} from '@angular/core';
 
       @Directive({selector: '[dir]'})
       export class MyDir {
         @Output() someEvent = new EventEmitter<void>();
       }`,
      'dir2.ts': `
       import {Directive, Output, EventEmitter} from '@angular/core';
 
       @Directive({selector: '[dir]'})
       export class MyDir2 {
         @Output() someEvent = new EventEmitter<void>();
       }`,
      'app.ts': `
         import {Component, NgModule} from '@angular/core';
         import {CommonModule} from '@angular/common';
 
         @Component({templateUrl: 'app.html'})
         export class AppCmp {
           doSomething() {}
         }
       `
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.moveCursorToText('(someEv¦ent)');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.slice(textSpan.start, textSpan.start + textSpan.length))
        .toEqual('someEvent');

    expect(definitions.length).toEqual(2);
    const [def, def2] = definitions;
    expect(def.textSpan).toContain('someEvent');
    expect(def2.textSpan).toContain('someEvent');
    // TODO(atscott): investigate why the text span includes more than just 'someEvent'
    // assertTextSpans([def, def2], ['someEvent']);
    assertFileNames([def, def2], ['dir2.ts', 'dir.ts']);
  });

  it('should go to the pre-compiled style sheet', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
       import {Component} from '@angular/core';
 
       @Component({
         template: '',
         styleUrls: ['./style.css'],
       })
       export class AppCmp {}
       `,
      'style.scss': '',
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText(`['./styl¦e.css']`);
    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, appFile);
    expect(appFile.contents.slice(textSpan.start, textSpan.start + textSpan.length))
        .toEqual('./style.css');

    expect(definitions.length).toEqual(1);
    assertFileNames(definitions, ['style.scss']);
  });

  it('gets definition for property of variable declared in template', () => {
    initMockFileSystem('Native');
    const files = {
      'app.html': `
         <ng-container *ngIf="{prop: myVal} as myVar">
           {{myVar.prop.name}}
         </ng-container>
       `,
      'app.ts': `
         import {Component} from '@angular/core';
 
         @Component({templateUrl: '/app.html'})
         export class AppCmp {
           myVal = {name: 'Andrew'};
         }
       `,
    };
    const env = LanguageServiceTestEnv.setup();

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    project.expectNoSourceDiagnostics();

    template.moveCursorToText('{{myVar.pro¦p.name}}');
    const {definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(definitions![0].name).toEqual('"prop"');
    assertFileNames(Array.from(definitions!), ['app.html']);
  });

  function getDefinitionsAndAssertBoundSpan(env: LanguageServiceTestEnv, file: OpenBuffer) {
    env.expectNoSourceDiagnostics();
    const definitionAndBoundSpan = file.getDefinitionAndBoundSpan();
    const {textSpan, definitions} = definitionAndBoundSpan!;
    expect(definitions).toBeTruthy();
    return {textSpan, definitions: definitions!.map(d => humanizeDocumentSpanLike(d, env))};
  }
});

describe('definitions', () => {
  let env: LanguageServiceTestEnv;

  describe('when an input has a dollar sign', () => {
    const files = {
      'app.ts': `
	 import {Component, NgModule, Input} from '@angular/core';

	 @Component({selector: 'dollar-cmp', template: ''})
	 export class DollarCmp {
	   @Input() obs$!: string;
	 }
 
	 @Component({template: '<dollar-cmp [obs$]="greeting"></dollar-cmp>'})
	 export class AppCmp {
	   greeting = 'hello';
	 }
 
	 @NgModule({declarations: [AppCmp, DollarCmp]})
	 export class AppModule {}
       `,
    };

    beforeEach(() => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
    });

    it('can get definitions for input', () => {
      const project = env.addProject('test', files, {strictTemplates: false});
      const definitions = getDefinitionsAndAssertBoundSpan(project, 'app.ts', '[o¦bs$]="greeting"');
      expect(definitions!.length).toEqual(1);

      assertTextSpans(definitions, ['obs$']);
      assertFileNames(definitions, ['app.ts']);
    });

    it('can get definitions for component', () => {
      const project = env.addProject('test', files, {strictTemplates: false});
      const definitions = getDefinitionsAndAssertBoundSpan(project, 'app.ts', '<dollar-cm¦p');
      expect(definitions!.length).toEqual(1);

      assertTextSpans(definitions, ['DollarCmp']);
      assertFileNames(definitions, ['app.ts']);
    });
  });

  describe('when a selector and input of a directive have a dollar sign', () => {
    it('can get definitions', () => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
      const files = {
        'app.ts': `
	 import {Component, Directive, NgModule, Input} from '@angular/core';

	 @Directive({selector: '[dollar\\\\$]', template: ''})
	 export class DollarDir {
	   @Input() dollar$!: string;
	 }
 
	 @Component({template: '<div [dollar$]="greeting"></div>'})
	 export class AppCmp {
	   greeting = 'hello';
	 }
 
	 @NgModule({declarations: [AppCmp, DollarDir]})
	 export class AppModule {}
       `,
      };
      const project = env.addProject('test', files, {strictTemplates: false});
      const definitions =
          getDefinitionsAndAssertBoundSpan(project, 'app.ts', '[dollar¦$]="greeting"');
      expect(definitions!.length).toEqual(2);

      assertTextSpans(definitions, ['dollar$', 'DollarDir']);
      assertFileNames(definitions, ['app.ts']);
    });
  });

  function getDefinitionsAndAssertBoundSpan(project: Project, file: string, targetText: string) {
    const template = project.openFile(file);
    env.expectNoSourceDiagnostics();
    project.expectNoTemplateDiagnostics('app.ts', 'AppCmp');

    template.moveCursorToText(targetText);
    const defAndBoundSpan = template.getDefinitionAndBoundSpan();
    expect(defAndBoundSpan).toBeTruthy();
    expect(defAndBoundSpan!.definitions).toBeTruthy();
    return defAndBoundSpan!.definitions!.map(d => humanizeDocumentSpanLike(d, env));
  }
});
