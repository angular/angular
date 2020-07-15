/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import * as ng from '@angular/compiler-cli';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as ts from 'typescript';

import {expectNoDiagnostics, setup, TestSupport} from '../test_support';

type MockFiles = {
  [fileName: string]: string
};

describe('ng type checker', () => {
  let errorSpy: jasmine.Spy&((s: string) => void);
  let testSupport: TestSupport;

  function compileAndCheck(
      mockDirs: MockFiles[], overrideOptions: ng.CompilerOptions = {}): ng.Diagnostics {
    testSupport.writeFiles(...mockDirs);
    const fileNames: string[] = [];
    mockDirs.forEach((dir) => {
      Object.keys(dir).forEach((fileName) => {
        if (fileName.endsWith('.ts')) {
          fileNames.push(path.resolve(testSupport.basePath, fileName));
        }
      });
    });
    const options = testSupport.createCompilerOptions(overrideOptions);
    const {diagnostics} = ng.performCompilation({rootNames: fileNames, options});
    return diagnostics;
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    testSupport = setup();
  });

  function accept(files: MockFiles = {}, overrideOptions: ng.CompilerOptions = {}) {
    expectNoDiagnostics({}, compileAndCheck([QUICKSTART, files], overrideOptions));
  }

  function reject(
      message: string|RegExp, location: RegExp|null, files: MockFiles,
      overrideOptions: ng.CompilerOptions = {}) {
    const diagnostics = compileAndCheck([QUICKSTART, files], overrideOptions);
    if (!diagnostics || !diagnostics.length) {
      throw new Error('Expected a diagnostic error message');
    } else {
      const matches: (d: ng.Diagnostic|ts.Diagnostic) => boolean = typeof message === 'string' ?
          d => ng.isNgDiagnostic(d)&& d.messageText == message :
          d => ng.isNgDiagnostic(d) && message.test(d.messageText);
      const matchingDiagnostics = diagnostics.filter(matches) as ng.Diagnostic[];
      if (!matchingDiagnostics || !matchingDiagnostics.length) {
        throw new Error(`Expected a diagnostics matching ${message}, received\n  ${
            diagnostics.map(d => d.messageText).join('\n  ')}`);
      }

      if (location) {
        const span = matchingDiagnostics[0].span;
        if (!span) {
          throw new Error('Expected a sourceSpan');
        }
        expect(`${span.start.file.url}@${span.start.line}:${span.start.offset}`).toMatch(location);
      }
    }
  }

  it('should accept unmodified QuickStart', () => {
    accept();
  });

  it('should accept unmodified QuickStart with tests for unused variables', () => {
    accept({}, {
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
    });
  });

  describe('type narrowing', () => {
    const a = (files: MockFiles, options: ng.AngularCompilerOptions = {}) => {
      accept(files, {fullTemplateTypeCheck: true, ...options});
    };

    it('should narrow an *ngIf like directive', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: '<div *myIf="person"> {{person.name}} </div>'
        })
        export class MainComp {
          person?: Person;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[myIf]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input()
          set myIf(condition: any) {}

          static myIfTypeGuard: <T>(v: T | null | undefined | false) => v is T;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });

    it('should narrow a renamed *ngIf like directive', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: '<div *my-if="person"> {{person.name}} </div>'
        })
        export class MainComp {
          person?: Person;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[my-if]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input('my-if')
          set myIf(condition: any) {}

          static myIfTypeGuard: <T>(v: T | null | undefined | false) => v is T;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });

    it('should narrow a type in a nested *ngIf like directive', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Address {
          street: string;
        }

        export interface Person {
          name: string;
          address?: Address;
        }


        @Component({
          selector: 'comp',
          template: '<div *myIf="person"> {{person.name}} <span *myIf="person.address">{{person.address.street}}</span></div>'
        })
        export class MainComp {
          person?: Person;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[myIf]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input()
          set myIf(condition: any) {}

          static myIfTypeGuard: <T>(v: T | null | undefined | false) => v is T;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });

    it('should narrow an *ngIf like directive with UseIf', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: '<div *myIf="person"> {{person.name}} </div>'
        })
        export class MainComp {
          person?: Person;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[myIf]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input()
          set myIf(condition: any) {}

          static myIfUseIfTypeGuard: void;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });

    it('should narrow a renamed *ngIf like directive with UseIf', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: '<div *my-if="person"> {{person.name}} </div>'
        })
        export class MainComp {
          person?: Person;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[my-if]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input('my-if')
          set myIf(condition: any) {}

          static myIfUseIfTypeGuard: void;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });

    it('should narrow a type in a nested *ngIf like directive with UseIf', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Address {
          street: string;
        }

        export interface Person {
          name: string;
          address?: Address;
        }


        @Component({
          selector: 'comp',
          template: '<div *myIf="person"> {{person.name}} <span *myIf="person.address">{{person.address.street}}</span></div>'
        })
        export class MainComp {
          person?: Person;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[myIf]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input()
          set myIf(condition: any) {}

          static myIfUseIfTypeGuard: void;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });

    it('should narrow an *ngIf like directive with UseIf and &&', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Address {
          street: string;
        }

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: '<div *myIf="person && address"> {{person.name}} lives at {{address.street}} </div>'
        })
        export class MainComp {
          person?: Person;
          address?: Address;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[myIf]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input()
          set myIf(condition: any) {}

          static myIfUseIfTypeGuard: void;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });

    it('should narrow an *ngIf like directive with UseIf and !!', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: '<div *myIf="!!person"> {{person.name}} </div>'
        })
        export class MainComp {
          person?: Person;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[myIf]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input()
          set myIf(condition: any) {}

          static myIfUseIfTypeGuard: void;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });

    it('should narrow an *ngIf like directive with UseIf and != null', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: '<div *myIf="person != null"> {{person.name}} </div>'
        })
        export class MainComp {
          person: Person | null = null;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[myIf]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input()
          set myIf(condition: any) {}

          static myIfUseIfTypeGuard: void;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });

    it('should narrow an *ngIf like directive with UseIf and != undefined', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener, TemplateRef, Input} from '@angular/core';

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: '<div *myIf="person != undefined"> {{person.name}} </div>'
        })
        export class MainComp {
          person?: Person;
        }

        export class MyIfContext {
          public $implicit: any = null;
          public myIf: any = null;
        }

        @Directive({selector: '[myIf]'})
        export class MyIf {
          constructor(templateRef: TemplateRef<MyIfContext>) {}

          @Input()
          set myIf(condition: any) {}

          static myIfUseIfTypeGuard: void;
        }

        @NgModule({
          declarations: [MainComp, MyIf],
        })
        export class MainModule {}`
      });
    });
  });

  describe('casting $any', () => {
    const a = (files: MockFiles, options: ng.AngularCompilerOptions = {}) => {
      accept(
          {'src/app.component.ts': '', 'src/lib.ts': '', ...files},
          {fullTemplateTypeCheck: true, ...options});
    };

    const r =
        (message: string|RegExp, location: RegExp|null, files: MockFiles,
         options: ng.AngularCompilerOptions = {}) => {
          reject(
              message, location, {'src/app.component.ts': '', 'src/lib.ts': '', ...files},
              {fullTemplateTypeCheck: true, ...options});
        };

    it('should allow member access of an expression', () => {
      a({
        'src/app.module.ts': `
        import {NgModule, Component} from '@angular/core';

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: ' {{$any(person).address}}'
        })
        export class MainComp {
          person: Person;
        }

        @NgModule({
          declarations: [MainComp],
        })
        export class MainModule {
        }`
      });
    });

    it('should allow invalid this.member access', () => {
      a({
        'src/app.module.ts': `
        import {NgModule, Component} from '@angular/core';

        @Component({
          selector: 'comp',
          template: ' {{$any(this).missing}}'
        })
        export class MainComp { }

        @NgModule({
          declarations: [MainComp],
        })
        export class MainModule {
        }`
      });
    });

    it('should reject too few parameters to $any', () => {
      r(/Invalid call to \$any, expected 1 argument but received none/, null, {
        'src/app.module.ts': `
        import {NgModule, Component} from '@angular/core';

        @Component({
          selector: 'comp',
          template: ' {{$any().missing}}'
        })
        export class MainComp { }

        @NgModule({
          declarations: [MainComp],
        })
        export class MainModule {
        }`
      });
    });

    it('should reject too many parameters to $any', () => {
      r(/Invalid call to \$any, expected 1 argument but received 2/, null, {
        'src/app.module.ts': `
        import {NgModule, Component} from '@angular/core';

        export interface Person {
          name: string;
        }

        @Component({
          selector: 'comp',
          template: ' {{$any(person, 12).missing}}'
        })
        export class MainComp {
          person: Person;
        }

        @NgModule({
          declarations: [MainComp],
        })
        export class MainModule {
        }`
      });
    });
  });

  describe('core', () => {
    const a = (files: MockFiles, options: ng.AngularCompilerOptions = {}) => {
      accept(files, {fullTemplateTypeCheck: true, ...options});
    };

    // Regression #19905
    it('should accept an event binding', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component, Directive, HostListener} from '@angular/core';

        @Component({
          selector: 'comp',
          template: '<div someDir></div>'
        })
        export class MainComp {}

        @Directive({
          selector: '[someDir]'
        })
        export class SomeDirective {
          @HostListener('click', ['$event'])
          onClick(event: any) {}
        }

        @NgModule({
          declarations: [MainComp, SomeDirective],
        })
        export class MainModule {}`
      });
    });
  });

  describe('common', () => {
    const a = (files: MockFiles, options: ng.AngularCompilerOptions = {}) => {
      accept(files, {fullTemplateTypeCheck: true, ...options});
    };

    // Regression #19905
    it('should accept a |undefined or |null parameter for async_pipe', () => {
      a({
        'src/app.component.ts': '',
        'src/lib.ts': '',
        'src/app.module.ts': `
        import {NgModule, Component} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'comp',
          template: '<div>{{ name | async}}</div>'
        })
        export class MainComp {
          name: Promise<string>|undefined;
        }


        @NgModule({
          declarations: [MainComp],
          imports: [CommonModule]
        })
        export class MainModule {}`
      });
    });
  });

  describe('with modified quickstart (fullTemplateTypeCheck: false)', () => {
    addTests({fullTemplateTypeCheck: false});
  });

  describe('with modified quickstart (fullTemplateTypeCheck: true)', () => {
    addTests({fullTemplateTypeCheck: true});
  });

  describe('regressions', () => {
    // #19485
    it('should accept if else (TemplateRef)', () => {
      accept(
          {
            'src/app.component.html': `
              <div class="text-center" *ngIf="!person; else e">
                No person supplied.
              </div>
              <ng-template #e>
                Welcome {{person.name}}!
              <ng-template>`
          },
          {fullTemplateTypeCheck: true});
    });
  });

  function addTests(config: {fullTemplateTypeCheck: boolean}) {
    function a(template: string) {
      accept({'src/app.component.html': template}, config);
    }

    function r(template: string, message: string|RegExp, location: string) {
      reject(
          message, new RegExp(`app\.component\.html\@${location}$`),
          {'src/app.component.html': template}, config);
    }

    function rejectOnlyWithFullTemplateTypeCheck(
        template: string, message: string|RegExp, location: string) {
      if (config.fullTemplateTypeCheck) {
        r(template, message, location);
      } else {
        a(template);
      }
    }

    it('should report an invalid field access', () => {
      r('<div>{{fame}}<div>', `Property 'fame' does not exist on type 'AppComponent'.`, '0:5');
    });
    it('should reject a reference to a field of a nullable', () => {
      r('<div>{{maybePerson.name}}</div>', `Object is possibly 'undefined'.`, '0:5');
    });
    it('should accept a reference to a field of a nullable using using non-null-assert', () => {
      a('{{maybePerson!.name}}');
    });
    it('should accept a safe property access of a nullable person', () => {
      a('{{maybePerson?.name}}');
    });

    it('should accept using a library pipe', () => {
      a('{{1 | libPipe}}');
    });
    it('should accept using a library directive', () => {
      a('<div libDir #libDir="libDir">{{libDir.name}}</div>');
    });

    it('should accept a function call', () => {
      a('{{getName()}}');
    });
    it('should reject an invalid method', () => {
      r('<div>{{getFame()}}</div>',
        `Property 'getFame' does not exist on type 'AppComponent'. Did you mean 'getName'?`, '0:5');
    });
    it('should accept a field access of a method result', () => {
      a('{{getPerson().name}}');
    });
    it('should reject an invalid field reference of a method result', () => {
      r('<div>{{getPerson().fame}}</div>', `Property 'fame' does not exist on type 'Person'.`,
        '0:5');
    });
    it('should reject an access to a nullable field of a method result', () => {
      r('<div>{{getMaybePerson().name}}</div>', `Object is possibly 'undefined'.`, '0:5');
    });
    it('should accept a nullable assert of a nullable field references of a method result', () => {
      a('{{getMaybePerson()!.name}}');
    });
    it('should accept a safe property access of a nullable field reference of a method result',
       () => {
         a('{{getMaybePerson()?.name}}');
       });

    it('should report an invalid field access inside of an ng-template', () => {
      rejectOnlyWithFullTemplateTypeCheck(
          '<ng-template>{{fame}}</ng-template>',
          `Property 'fame' does not exist on type 'AppComponent'.`, '0:13');
    });
    it('should report an invalid call to a pipe', () => {
      rejectOnlyWithFullTemplateTypeCheck(
          '<div>{{"hello" | aPipe}}</div>',
          `Argument of type 'string' is not assignable to parameter of type 'number'.`, '0:5');
    });
    it('should report an invalid property on an exportAs directive', () => {
      rejectOnlyWithFullTemplateTypeCheck(
          '<div aDir #aDir="aDir">{{aDir.fname}}</div>',
          `Property 'fname' does not exist on type 'ADirective'. Did you mean 'name'?`, '0:23');
    });
  }

  describe('with lowered expressions', () => {
    it('should not report lowered expressions as errors', () => {
      expectNoDiagnostics({}, compileAndCheck([LOWERING_QUICKSTART]));
    });
  });
});

function appComponentSource(): string {
  return `
    import {Component, Pipe, Directive} from '@angular/core';

    export interface Person {
      name: string;
      address: Address;
    }

    export interface Address {
      street: string;
      city: string;
      state: string;
      zip: string;
    }

    @Component({
      templateUrl: './app.component.html'
    })
    export class AppComponent {
      name = 'Angular';
      person: Person;
      people: Person[];
      maybePerson?: Person;

      getName(): string { return this.name; }
      getPerson(): Person { return this.person; }
      getMaybePerson(): Person | undefined { return this.maybePerson; }
    }

    @Pipe({
      name: 'aPipe',
    })
    export class APipe {
      transform(n: number): number { return n + 1; }
    }

    @Directive({
      selector: '[aDir]',
      exportAs: 'aDir'
    })
    export class ADirective {
      name = 'ADirective';
    }
  `;
}

const QUICKSTART = {
  'src/app.component.ts': appComponentSource(),
  'src/app.component.html': '<h1>Hello {{name}}</h1>',
  'src/lib.ts': `
    import {Pipe, Directive} from '@angular/core';

    @Pipe({ name: 'libPipe' })
    export class LibPipe {
      transform(n: number): number { return n + 1; }
    }

    @Directive({
      selector: '[libDir]',
      exportAs: 'libDir'
    })
    export class LibDirective {
      name: string;
    }
  `,
  'src/app.module.ts': `
    import { NgModule }      from '@angular/core';
    import { CommonModule }  from '@angular/common';
    import { AppComponent, APipe, ADirective }  from './app.component';
    import { LibDirective, LibPipe } from './lib';

    @NgModule({
      declarations: [ LibPipe, LibDirective ],
      exports: [ LibPipe, LibDirective ],
    })
    export class LibModule { }

    @NgModule({
      declarations: [ AppComponent, APipe, ADirective ],
      bootstrap:    [ AppComponent ],
      imports:      [ LibModule, CommonModule ]
    })
    export class AppModule { }
  `
};

const LOWERING_QUICKSTART = {
  'src/app.component.ts': appComponentSource(),
  'src/app.component.html': '<h1>Hello {{name}}</h1>',
  'src/app.module.ts': `
    import { NgModule, Component }      from '@angular/core';

    import { AppComponent, APipe, ADirective }  from './app.component';

    class Foo {}

    @Component({
      template: '',
      providers: [
        {provide: 'someToken', useFactory: () => new Foo()}
      ]
    })
    export class Bar {}

    @NgModule({
      declarations: [ AppComponent, APipe, ADirective, Bar ],
      bootstrap:    [ AppComponent ]
    })
    export class AppModule { }
  `
};

const tmpdir = process.env.TEST_TMPDIR || os.tmpdir();

function makeTempDir(): string {
  const id = (Math.random() * 1000000).toFixed(0);
  const dir = path.join(tmpdir, `tmp.${id}`);
  fs.mkdirSync(dir);
  return dir;
}
