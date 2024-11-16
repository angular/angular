/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import ts from 'typescript';

import {
  assertFileNames,
  assertTextSpans,
  createModuleAndProjectWithDeclarations,
  humanizeDocumentSpanLike,
  LanguageServiceTestEnv,
  OpenBuffer,
  Project,
} from '../testing';

describe('definitions', () => {
  it('gets definition for template reference in overridden template', () => {
    initMockFileSystem('Native');
    const files = {
      'app.html': '',
      'app.ts': `
         import {Component} from '@angular/core';

         @Component({
          templateUrl: '/app.html',
          standalone: false,
         })
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

         @Component({
          templateUrl: 'app.html',
          standalone: false,
         })
         export class AppCmp {}
       `,
      'app.html': '{{"1/1/2020" | date}}',
    };
    // checkTypeOfPipes is set to false when strict templates is false
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files, {
      strictTemplates: false,
    });
    const template = project.openFile('app.html');
    project.expectNoSourceDiagnostics();
    template.moveCursorToText('da¦te');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.slice(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      'date',
    );
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

         @Component({
          templateUrl: 'app.html',
          standalone: false,
         })
         export class AppCmp {}
       `,
      'app.html': '<div dir inputA="abc"></div>',
      'dir.ts': `
       import {Directive, Input} from '@angular/core';

       @Directive({
        selector: '[dir]',
        standalone: false,
       })
       export class MyDir {
         @Input() inputA!: any;
       }`,
      'dir2.ts': `
       import {Directive, Input} from '@angular/core';

       @Directive({
        selector: '[dir]',
        standalone: false,
       })
       export class MyDir2 {
         @Input() inputA!: any;
       }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.moveCursorToText('inpu¦tA="abc"');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.slice(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      'inputA',
    );

    expect(definitions!.length).toEqual(2);
    const [def, def2] = definitions!;
    expect(def.textSpan).toContain('inputA');
    expect(def2.textSpan).toContain('inputA');
    // TODO(atscott): investigate why the text span includes more than just 'inputA'
    // assertTextSpans([def, def2], ['inputA']);
    assertFileNames([def, def2], ['dir2.ts', 'dir.ts']);
  });

  it('gets definitions for all signal-inputs when attribute matches more than one', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
         import {Component, NgModule} from '@angular/core';
         import {CommonModule} from '@angular/common';

         @Component({
          templateUrl: 'app.html',
          standalone: false,
         })
         export class AppCmp {}
       `,
      'app.html': '<div dir inputA="abc"></div>',
      'dir.ts': `
       import {Directive, input} from '@angular/core';

       @Directive({
        selector: '[dir]',
        standalone: false,
       })
       export class MyDir {
         inputA = input();
       }`,
      'dir2.ts': `
       import {Directive, input} from '@angular/core';

       @Directive({
        selector: '[dir]',
        standalone: false,
       })
       export class MyDir2 {
         inputA = input();
       }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.moveCursorToText('inpu¦tA="abc"');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.slice(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      'inputA',
    );

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

       @Directive({
        selector: '[dir]',
        standalone: false,
       })
       export class MyDir {
         @Output() someEvent = new EventEmitter<void>();
       }`,
      'dir2.ts': `
       import {Directive, Output, EventEmitter} from '@angular/core';

       @Directive({
        selector: '[dir]',
        standalone: false,
       })
       export class MyDir2 {
         @Output() someEvent = new EventEmitter<void>();
       }`,
      'dir3.ts': `
       import {Directive, output, EventEmitter} from '@angular/core';

       @Directive({
        selector: '[dir]',
        standalone: false,
       })
       export class MyDir3 {
         someEvent = output();
       }`,
      'dir4.ts': `
         import {Directive, EventEmitter} from '@angular/core';
         import {outputFromObservable} from '@angular/core/rxjs-interop';

         @Directive({
          selector: '[dir]',
          standalone: false,
         })
         export class MyDir4 {
           someEvent = outputFromObservable(new EventEmitter<void>);
         }
       `,
      'app.ts': `
         import {Component, NgModule} from '@angular/core';
         import {CommonModule} from '@angular/common';

         @Component({
          templateUrl: 'app.html',
          standalone: false,
         })
         export class AppCmp {
           doSomething() {}
         }
       `,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.moveCursorToText('(someEv¦ent)');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.slice(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      'someEvent',
    );

    expect(definitions.length).toEqual(4);
    const [def4, def3, def2, def] = definitions;
    expect(def.textSpan).toContain('someEvent');
    expect(def2.textSpan).toContain('someEvent');
    expect(def3.textSpan).toContain('someEvent');
    expect(def3.contextSpan!).toBe('someEvent = output();');
    expect(def4.textSpan).toContain('someEvent');
    expect(def4.contextSpan!).toBe(`someEvent = outputFromObservable(new EventEmitter<void>);`);
    // TODO(atscott): investigate why the text span includes more than just 'someEvent'
    // assertTextSpans([def, def2], ['someEvent']);
    assertFileNames([def4, def3, def2, def], ['dir4.ts', 'dir3.ts', 'dir2.ts', 'dir.ts']);
  });

  it('gets definitions for all model inputs when attribute matches more than one in a static attribute', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
          import {Component, NgModule} from '@angular/core';
          import {CommonModule} from '@angular/common';

          @Component({
            templateUrl: 'app.html',
            standalone: false,
          })
          export class AppCmp {}
        `,
      'app.html': '<div dir inputA="abc"></div>',
      'dir.ts': `
        import {Directive, model} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        export class MyDir {
          inputA = model('');
        }`,
      'dir2.ts': `
        import {Directive, model} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        export class MyDir2 {
          inputA = model('');
        }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.moveCursorToText('inpu¦tA="abc"');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.slice(textSpan.start, textSpan.start + textSpan.length)).toBe(
      'inputA',
    );

    expect(definitions.length).toBe(2);
    const [def, def2] = definitions;
    expect(def.textSpan).toContain('inputA');
    expect(def2.textSpan).toContain('inputA');
    // TODO(atscott): investigate why the text span includes more than just 'inputA'
    // assertTextSpans([def, def2], ['inputA']);
    assertFileNames([def, def2], ['dir2.ts', 'dir.ts']);
  });

  it('gets definitions for all model inputs when attribute matches more than one in a two-way binding', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
            import {Component, NgModule} from '@angular/core';
            import {CommonModule} from '@angular/common';

            @Component({
              templateUrl: 'app.html',
              standalone: false,
            })
            export class AppCmp {
              value = 'abc';
            }
          `,
      'app.html': '<div dir [(inputA)]="value"></div>',
      'dir.ts': `
            import {Directive, model} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          export class MyDir {
            inputA = model('');
          }`,
      'dir2.ts': `
          import {Directive, model} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          export class MyDir2 {
            inputA = model('');
          }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.moveCursorToText('[(inpu¦tA)]="value"');

    const {textSpan, definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(template.contents.slice(textSpan.start, textSpan.start + textSpan.length)).toBe(
      'inputA',
    );

    expect(definitions.length).toBe(4);
    const [def, def2, def3, def4] = definitions;

    // We have four definitons to the `inputA` member, because each `model()`
    // instance implicitly creates both an input and an output.
    expect(def.textSpan).toContain('inputA');
    expect(def2.textSpan).toContain('inputA');
    expect(def3.textSpan).toContain('inputA');
    expect(def4.textSpan).toContain('inputA');
    assertFileNames([def, def2, def3, def4], ['dir2.ts', 'dir.ts', 'dir2.ts', 'dir.ts']);
  });

  it('should go to the pre-compiled style sheet', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
       import {Component} from '@angular/core';

       @Component({
         template: '',
         styleUrls: ['./style.css'],
         standalone: false,
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
    expect(appFile.contents.slice(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      './style.css',
    );

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

         @Component({
          templateUrl: '/app.html',
          standalone: false,
         })
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

  it('gets definition for a let declaration', () => {
    initMockFileSystem('Native');
    const files = {
      'app.html': '',
      'app.ts': `
         import {Component} from '@angular/core';

         @Component({
          templateUrl: '/app.html',
          standalone: false,
         })
         export class AppCmp {}
       `,
    };
    const env = LanguageServiceTestEnv.setup();

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const template = project.openFile('app.html');
    template.contents = '@let foo = {value: 123}; {{foo.value}}';
    project.expectNoSourceDiagnostics();

    template.moveCursorToText('{{fo¦o.value}}');
    const {definitions} = getDefinitionsAndAssertBoundSpan(env, template);
    expect(definitions[0].name).toEqual('foo');
    expect(definitions[0].kind).toBe(ts.ScriptElementKind.variableElement);
    expect(definitions[0].textSpan).toBe('@let foo = {value: 123}');
    assertFileNames(Array.from(definitions), ['app.html']);
  });

  function getDefinitionsAndAssertBoundSpan(env: LanguageServiceTestEnv, file: OpenBuffer) {
    env.expectNoSourceDiagnostics();
    const definitionAndBoundSpan = file.getDefinitionAndBoundSpan();
    const {textSpan, definitions} = definitionAndBoundSpan!;
    expect(definitions).toBeTruthy();
    return {textSpan, definitions: definitions!.map((d) => humanizeDocumentSpanLike(d, env))};
  }
});

describe('definitions', () => {
  let env: LanguageServiceTestEnv;

  describe('when an input has a dollar sign', () => {
    const files = {
      'app.ts': `
	 import {Component, NgModule, Input} from '@angular/core';

	 @Component({
    selector: 'dollar-cmp', template: '',
    standalone: false,
   })
	 export class DollarCmp {
	   @Input() obs$!: string;
	 }

	 @Component({
    template: '<dollar-cmp [obs$]="greeting"></dollar-cmp>',
    standalone: false,
   })
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

	 @Directive({
    selector: '[dollar\\\\$]',
    standalone: false,
   })
	 export class DollarDir {
	   @Input() dollar$!: string;
	 }

	 @Component({
    template: '<div [dollar$]="greeting"></div>',
    standalone: false,
   })
	 export class AppCmp {
	   greeting = 'hello';
	 }

	 @NgModule({declarations: [AppCmp, DollarDir]})
	 export class AppModule {}
       `,
      };
      const project = env.addProject('test', files, {strictTemplates: false});
      const definitions = getDefinitionsAndAssertBoundSpan(
        project,
        'app.ts',
        '[dollar¦$]="greeting"',
      );
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
    return defAndBoundSpan!.definitions!.map((d) => humanizeDocumentSpanLike(d, env));
  }
});
