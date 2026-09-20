/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

function cleanNewLines(contents: string) {
  return contents.replace(/\s*\n\s*/g, ' ');
}

runInEachFileSystem(() => {
  describe('selectorless', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({
        _enableSelectorless: true,
        strictTemplates: true,
      });
    });

    it('should report a selectorless component reference that is not imported', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: '<Dep/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "Dep". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should report a selectorless directive reference that is not imported', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: '<div @Dep></div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "Dep". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should report a selectorless reference that is imported through a single type-only import', () => {
      env.write(
        'dep.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {type Dep} from './dep';

          @Component({template: '<Dep/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "Dep". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should report a selectorless reference that is imported through an entirely type-only import', () => {
      env.write(
        'dep.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import type {Dep} from './dep';

          @Component({template: '<Dep/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "Dep". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should report a selectorless pipe reference that is not imported', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: '<div>{{123 | Foo}}</div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`No pipe found with name 'Foo'.`);
    });

    it('should check that selectorless component reference is a component class', () => {
      env.write(
        'dep.ts',
        `
          import {Directive} from '@angular/core';

          @Directive()
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<Dep/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Incorrect reference type. Type must be a standalone @Component.',
      );
    });

    it('should check that selectorless directive reference is a directive class', () => {
      env.write(
        'dep.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<div @Dep></div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Incorrect reference type. Type must be a standalone @Directive.',
      );
    });

    it('should check that selectorless component references are standalone', () => {
      env.write(
        'dep.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: '', standalone: false})
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<Dep/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Incorrect reference type. Type must be a standalone @Component.',
      );
    });

    it('should check that selectorless directive references are standalone', () => {
      env.write(
        'dep.ts',
        `
          import {Directive} from '@angular/core';

          @Directive({standalone: false})
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<div @Dep></div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Incorrect reference type. Type must be a standalone @Directive.',
      );
    });

    it('should check that the component using selectorless syntax is standalone', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Dep {}

          @Component({template: '<Dep/>', standalone: false})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot use selectorless with a component that is not standalone',
      );
    });

    it('should not allow an `imports` array in a selectorless component', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Dep {}

          @Component({template: '<Dep/>', imports: [Dep]})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot use the "imports" field in a selectorless component',
      );
    });

    it('should not allow a `deferredImports` object in a selectorless component', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Dep {}

          @Component({
            template: '<Dep/>',
            // @ts-ignore
            deferredImports: { block1: [Dep] }
          })
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot use the "deferredImports" field in a selectorless component',
      );
    });

    it('should check the input bindings of selectorless components', () => {
      env.write(
        'dep.ts',
        `
          import {Component, Input} from '@angular/core';

          @Component({template: ''})
          export class Dep {
            @Input() someInput: number;
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<Dep [someInput]="true"/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'boolean' is not assignable to type 'number'.`);
    });

    it('should check the input bindings of selectorless directives', () => {
      env.write(
        'dep.ts',
        `
          import {Directive, Input} from '@angular/core';

          @Directive()
          export class Dep {
            @Input() someInput: number;
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<div @Dep([someInput]="true")></div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'boolean' is not assignable to type 'number'.`);
    });

    it('should check the input bindings of selectorless directives imported from an external library', () => {
      env.write(
        'node_modules/external/index.d.ts',
        `
          import * as i0 from "@angular/core";

          export declare class Dep {
              someInput: boolean;
              static ɵfac: i0.ɵɵFactoryDeclaration<Dep, never>;
              static ɵdir: i0.ɵɵDirectiveDeclaration<Dep, null, never, { "someInput": { "alias": "someInput"; "required": false; }; }, {}, never, never, true, never>;
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from 'external';

          @Component({template: '<div @Dep([someInput]="123")></div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'boolean'.`);
    });

    it('should check the output bindings of selectorless components', () => {
      env.write(
        'dep.ts',
        `
          import {Component, Output, EventEmitter} from '@angular/core';

          @Component({template: ''})
          export class Dep {
            @Output() someEvent = new EventEmitter<boolean>();
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<Dep (someEvent)="handleEvent($event)"/>'})
          export class Comp {
            handleEvent(value: number) {}
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should check the output bindings of selectorless directives', () => {
      env.write(
        'dep.ts',
        `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive()
          export class Dep {
            @Output() someEvent = new EventEmitter<boolean>();
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<div @Dep((someEvent)="handleEvent($event)")></div>'})
          export class Comp {
            handleEvent(value: number) {}
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should treat unclaimed inputs as DOM property bindings on component nodes', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Dep {}

          @Component({template: '<Dep [id]="123"/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should report unclaimed inputs on directive nodes as errors', () => {
      env.write(
        'test.ts',
        `
          import {Component, Directive} from '@angular/core';

          @Directive()
          export class Dep {}

          @Component({template: '<div @Dep([id]="123")></div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Directive Dep does not have an input named "id". Bindings to directives must target existing inputs or outputs.',
      );
    });

    it('should treat unclaimed outputs as DOM events on component nodes', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Dep {}

          @Component({template: '<Dep (click)="handleClick($event)"/>'})
          export class Comp {
            handleClick(value: number) {}
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'PointerEvent' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should report unclaimed outputs on directive nodes as errors', () => {
      env.write(
        'test.ts',
        `
          import {Component, Directive} from '@angular/core';

          @Directive()
          export class Dep {}

          @Component({template: '<div @Dep((click)="$event.stopPropagation()")></div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Directive Dep does not have an output named "click". Bindings to directives must target existing inputs or outputs.',
      );
    });

    it('should check input bindings coming from host directives on component nodes', () => {
      env.write(
        'dep.ts',
        `
          import {Component, Input, Directive} from '@angular/core';

          @Directive()
          export class HostDir {
            @Input() someInput: number;
          }

          @Component({
            template: '',
            hostDirectives: [{directive: HostDir, inputs: ['someInput: alias']}]
          })
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<Dep [alias]="true"/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'boolean' is not assignable to type 'number'.`);
    });

    it('should check input bindings coming from host directives on directive nodes', () => {
      env.write(
        'dep.ts',
        `
          import {Input, Directive} from '@angular/core';

          @Directive()
          export class HostDir {
            @Input() someInput: number;
          }

          @Directive({
            hostDirectives: [{directive: HostDir, inputs: ['someInput: alias']}]
          })
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<div @Dep([alias]="true")></div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'boolean' is not assignable to type 'number'.`);
    });

    it('should check output bindings coming from host directives on component nodes', () => {
      env.write(
        'dep.ts',
        `
          import {Component, Output, EventEmitter, Directive} from '@angular/core';

          @Directive()
          export class HostDir {
            @Output() someEvent = new EventEmitter<boolean>();
          }

          @Component({
            template: '',
            hostDirectives: [{directive: HostDir, outputs: ['someEvent: alias']}]
          })
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<Dep (alias)="handleEvent($event)"/>'})
          export class Comp {
            handleEvent(value: number) {}
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should check output bindings coming from host directives on directive nodes', () => {
      env.write(
        'dep.ts',
        `
          import {Output, EventEmitter, Directive} from '@angular/core';

          @Directive()
          export class HostDir {
            @Output() someEvent = new EventEmitter<boolean>();
          }

          @Directive({
            hostDirectives: [{directive: HostDir, outputs: ['someEvent: alias']}]
          })
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({template: '<div @Dep((alias)="handleEvent($event)")></div>'})
          export class Comp {
            handleEvent(value: number) {}
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should check required inputs of selectorless components', () => {
      env.write(
        'test.ts',
        `
          import {Component, Input} from '@angular/core';

          @Component({template: ''})
          export class Dep {
            @Input({required: true}) someInput: number;
          }

          @Component({template: '<Dep/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Required input 'someInput' from component Dep must be specified.`,
      );
    });

    it('should check required inputs of selectorless directives', () => {
      env.write(
        'test.ts',
        `
          import {Component, Directive, Input} from '@angular/core';

          @Directive()
          export class Dep {
            @Input({required: true}) someInput: number;
          }

          @Component({template: '<div @Dep></div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Required input 'someInput' from directive Dep must be specified.`,
      );
    });

    it('should import capitalized pipes implicitly', () => {
      // TODO(crisbeto): remove `null!` from the pipes when public API is updated.
      env.write(
        'pipe.ts',
        `
          import {Pipe} from '@angular/core';

          @Pipe(null!)
          export class FooPipe {
            transform(value: number) {
              return value + 1;
            }
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {FooPipe} from './pipe';

          @Component({template: '<div>{{ "hello" | FooPipe }}</div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should import capitalized pipes from external modules implicitly', () => {
      env.write(
        'node_modules/external/index.d.ts',
        `
          import * as i0 from "@angular/core";

          export declare class FooPipe {
            transform(value: number): number;
            static ɵfac: i0.ɵɵFactoryDeclaration<FooPipe, never>;
            static ɵpipe: i0.ɵɵPipeDeclaration<FooPipe, null, true>;
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {FooPipe} from 'external';

          @Component({template: '<div>{{ "hello" | FooPipe }}</div>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should be able to alias imports of selectorless dependencies', () => {
      // TODO(crisbeto): remove `null!` from the pipes when public API is updated.
      env.write(
        'dep.ts',
        `
          import {Directive, Component, Pipe} from '@angular/core';

          @Component({template: ''})
          export class DepComp {}

          @Directive()
          export class DepDir {}

          @Pipe(null!)
          export class DepPipe {
            transform(value: number) {
              return value;
            }
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {
            DepComp as AliasedDepComp,
            DepDir as AliasedDepDir,
            DepPipe as AliasedDepPipe,
          } from './dep';

          @Component({template: '<AliasedDepComp @AliasedDepDir>{{123 | AliasedDepPipe}}</AliasedDepComp>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.map((d) => d.messageText)).toEqual([]);
    });

    it('should resolve selectorless components through namespace imports', () => {
      env.write(
        'card.ts',
        `
          import {Component, Input} from '@angular/core';

          @Component({template: ''})
          export class Header {
            @Input() value!: string;
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({template: '<Card.Header [value]="123"/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'string'.`);
    });

    it('should report a missing namespace member', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({template: '<Card.Missing/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "Card.Missing". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should emit selectorless components referenced through namespace imports', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({template: '<Card.Header/>'})
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('dependencies: [i1.Header]');
    });

    it('should defer selectorless components referenced through namespace imports', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({template: '@defer {<Card.Header/>}'})
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).not.toContain('import * as Card');
      expect(cleanNewLines(jsContents)).toContain(
        'const Comp_Defer_1_DepsFn = () => [/* @ts-ignore */ import("./card").then(m => m.Header)];',
      );
      expect(jsContents).toContain('ɵɵdefer(1, 0, Comp_Defer_1_DepsFn);');
    });

    it('should support multiple components from the same namespace import', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Root {}

          @Component({template: ''})
          export class Header {}

          @Component({template: ''})
          export class Body {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({
            template: '<Card.Root><Card.Header/><Card.Body/></Card.Root>',
          })
          export class Comp {}
        `,
      );

      expect(env.driveDiagnostics()).toEqual([]);

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('i1.Root');
      expect(jsContents).toContain('i1.Header');
      expect(jsContents).toContain('i1.Body');
    });

    it('should support an aliased namespace import', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './card';

          @Component({template: '<UI.Header/>'})
          export class Comp {}
        `,
      );

      expect(env.driveDiagnostics()).toEqual([]);
    });

    it('should type-check namespace components from an external library', () => {
      env.write(
        'node_modules/external/index.d.ts',
        `
          import * as i0 from '@angular/core';

          export declare class Header {
            value: boolean;
            static ɵfac: i0.ɵɵFactoryDeclaration<Header, never>;
            static ɵcmp: i0.ɵɵComponentDeclaration<Header, null, never, { "value": { "alias": "value"; "required": false; }; }, {}, never, never, true, never>;
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from 'external';

          @Component({template: '<Card.Header [value]="123"/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'boolean'.`);
    });

    it('should type-check outputs on namespace components', () => {
      env.write(
        'card.ts',
        `
          import {Component, EventEmitter, Output} from '@angular/core';

          @Component({template: ''})
          export class Header {
            @Output() changed = new EventEmitter<boolean>();
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({template: '<Card.Header (changed)="handle($event)"/>'})
          export class Comp {
            handle(value: number) {}
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should ignore unrelated exports in a namespace module', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          export const CARD_VERSION = 1;

          @Component({template: ''})
          export class Header {}

          export function createCard() {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({template: '<Card.Header/>'})
          export class Comp {}
        `,
      );

      expect(env.driveDiagnostics()).toEqual([]);
    });

    it('should preserve an aliased re-export name when deferring a namespace component', () => {
      env.write(
        'header.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write('card.ts', `export {Header as Title} from './header';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({template: '@defer {<Card.Title/>}'})
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = cleanNewLines(env.getContents('test.js'));
      expect(jsContents).toContain('import("./card").then(m => m.Title)');
    });

    it('should resolve components re-exported from a namespace module', () => {
      env.write(
        'header.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write('card.ts', `export {Header} from './header';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({template: '<Card.Header/>'})
          export class Comp {}
        `,
      );

      expect(env.driveDiagnostics()).toEqual([]);
    });

    it('should resolve components through namespace re-exports', () => {
      env.write(
        'card.ts',
        `
          import {Component, Input} from '@angular/core';

          @Component({template: ''})
          export class Header {
            @Input() value!: string;
          }
        `,
      );

      env.write('ui.ts', `export * as Card from './card';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './ui';

          @Component({template: '<UI.Card.Header [value]="123"/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'string'.`);
    });

    it('should resolve components through multiple nested namespace re-exports', () => {
      env.write(
        'text.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Text {}
        `,
      );

      env.write('inputs.ts', `export * as Fields from './text';`);
      env.write('forms.ts', `export * as Inputs from './inputs';`);
      env.write('ui.ts', `export * as Forms from './forms';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './ui';

          @Component({template: '<UI.Forms.Inputs.Fields.Text/>'})
          export class Comp {}
        `,
      );

      expect(env.driveDiagnostics()).toEqual([]);
    });

    it('should resolve aliased namespace re-exports', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write('ui.ts', `export * as Controls from './card';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './ui';

          @Component({template: '<UI.Controls.Header/>'})
          export class Comp {}
        `,
      );

      expect(env.driveDiagnostics()).toEqual([]);
    });

    it('should report a missing intermediate namespace member', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write('ui.ts', `export * as Card from './card';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './ui';

          @Component({template: '<UI.Missing.Header/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "UI.Missing.Header". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should not resolve through a type-only namespace re-export', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write('ui.ts', `export type * as Card from './card';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './ui';

          @Component({template: '<UI.Card.Header/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "UI.Card.Header". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should not resolve a type-only terminal re-export', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write('ui.ts', `export type {Header} from './card';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './ui';

          @Component({template: '<UI.Header/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "UI.Header". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should not traverse through a class as an intermediate namespace member', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Card {}
        `,
      );

      env.write('ui.ts', `export {Card} from './card';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './ui';

          @Component({template: '<UI.Card.Header/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "UI.Card.Header". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should type-check nested namespace components from an external library', () => {
      env.write(
        'node_modules/external/card.d.ts',
        `
          import * as i0 from '@angular/core';

          export declare class Header {
            value: boolean;
            static ɵfac: i0.ɵɵFactoryDeclaration<Header, never>;
            static ɵcmp: i0.ɵɵComponentDeclaration<Header, null, never, { "value": { "alias": "value"; "required": false; }; }, {}, never, never, true, never>;
          }
        `,
      );

      env.write('node_modules/external/index.d.ts', `export * as Card from './card';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from 'external';

          @Component({template: '<UI.Card.Header [value]="123"/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'boolean'.`);
    });

    it('should preserve the namespace path when deferring a nested namespace component', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write('ui.ts', `export * as Card from './card';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './ui';

          @Component({template: '@defer {<UI.Card.Header/>}'})
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = cleanNewLines(env.getContents('test.js'));
      expect(jsContents).toContain('import("./ui").then(m => m.Card.Header)');
    });

    it('should support mixed eager and deferred nested namespace members', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Body {}

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write('ui.ts', `export * as Card from './card';`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as UI from './ui';

          @Component({template: '<UI.Card.Body/> @defer {<UI.Card.Header/>}'})
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = cleanNewLines(env.getContents('test.js'));
      expect(jsContents).toContain('Body');
      expect(jsContents).toContain('import("./ui").then(m => m.Card.Header)');
    });

    it('should not resolve type-only namespace imports', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import type * as Card from './card';

          @Component({template: '<Card.Header/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "Card.Header". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should not resolve non-Angular exports as selectorless components', () => {
      env.write('card.ts', `export class Header {}`);

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({template: '<Card.Header/>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        'Cannot find name "Card.Header". Selectorless references are only supported to classes or non-type import statements.',
      );
    });

    it('should keep eager namespace members eager while deferring another member', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Body {}

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({
            template: '<Card.Body/> @defer {<Card.Header/>}',
          })
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('i1.Body');
      expect(cleanNewLines(jsContents)).toContain(
        'const Comp_Defer_1_DepsFn = () => [/* @ts-ignore */ import("./card").then(m => m.Header)];',
      );
    });

    it('should not defer a namespace member that is also used eagerly', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({
            template: '<Card.Header/> @defer {<Card.Header/>}',
          })
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('i1.Header');
      expect(jsContents).not.toContain('import("./card").then(m => m.Header)');
    });

    it('should defer multiple namespace members from the same module', () => {
      env.write(
        'card.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Header {}

          @Component({template: ''})
          export class Body {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import * as Card from './card';

          @Component({
            template: '@defer {<Card.Header/><Card.Body/>}',
          })
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = cleanNewLines(env.getContents('test.js'));
      expect(jsContents).toContain('import("./card").then(m => m.Header)');
      expect(jsContents).toContain('import("./card").then(m => m.Body)');
    });

    it('should be able to use default imports as selectorless dependencies', () => {
      env.write(
        'dir.ts',
        `
          import {Directive} from '@angular/core';

          @Directive()
          export default class DepDir {}
        `,
      );

      env.write(
        'comp.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export default class DepComp {}
        `,
      );

      // TODO(crisbeto): remove `null!` from the pipes when public API is updated.
      env.write(
        'pipe.ts',
        `
          import {Pipe} from '@angular/core';

          @Pipe(null!)
          export default class DepPipe {
            transform(value: number) {
              return value;
            }
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import DepDir from './dir';
          import DepComp from './comp';
          import DepPipe from './pipe';

          @Component({template: '<DepComp @DepDir>{{123 | DepPipe}}</DepComp>'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.map((d) => d.messageText)).toEqual([]);
    });

    it('should resolve local reference to selectorless component', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Dep {
            getFoo(): string | null {
              return null;
            }
          }

          @Component({template: '<Dep #ref/> {{ref.getFoo().toUpperCase()}}'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Object is possibly 'null'.`);
    });

    it('should resolve local reference to selectorless directive', () => {
      env.write(
        'test.ts',
        `
          import {Component, Directive} from '@angular/core';

          @Directive()
          export class Dep {
            getFoo(): string | null {
              return null;
            }
          }

          @Component({template: '<div @Dep(#ref)></div> {{ref.getFoo().toUpperCase()}}'})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Object is possibly 'null'.`);
    });

    it('should emit references to selectorless symbols', () => {
      // TODO(crisbeto): remove `null!` from the pipes when public API is updated.
      env.write(
        'dep.ts',
        `
          import {Directive, Component, Pipe} from '@angular/core';

          @Component({template: ''})
          export class DepComp {}

          @Directive()
          export class DepDir {}

          @Pipe(null!)
          export class DepPipe {
            transform(value: number) {
              return value;
            }
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {DepComp, DepDir, DepPipe} from './dep';

          @Component({template: '<DepComp @DepDir>{{123 | DepPipe}}</DepComp>'})
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('import * as i1 from "./dep";');
      expect(jsContents).toContain('dependencies: [i1.DepComp, i1.DepDir, i1.DepPipe]');
    });

    it('should emit references to selectorless dependencies defined in the same function', () => {
      env.write(
        'test.ts',
        `
          import {Component, Directive} from '@angular/core';

          // Imagine that this is Jasmine...
          function it(name: string, callback: () => void) {
            callback();
          }

          it('should work', () => {
            @Directive()
            class Dep {}

            @Component({template: '<div @Dep></div>'})
            class Comp {}
          });
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('dependencies: [Dep]');
    });

    it('should pick the dependency closest to the class', () => {
      env.write(
        'dep.ts',
        `
        import {Directive, Input} from '@angular/core';

        @Directive()
        export class Dep {
          @Input() value: string;
        }
      `,
      );

      env.write(
        'test.ts',
        `
          import {Component, Directive, Input} from '@angular/core';
          import {Dep} from './dep';

          export function foo() {
            @Directive()
            class Dep {
              @Input() value: number;
            }

            @Component({template: '<div @Dep(value="hello")></div>'})
            class Comp {}

            return Comp;
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'string' is not assignable to type 'number'.`);
    });

    it('should defer selectorless symbols', () => {
      env.write(
        'dep-comp.ts',
        `
          import { Component } from '@angular/core';

          @Component({template: ''})
          export class DepComp {}
        `,
      );

      env.write(
        'dep-dir.ts',
        `
          import { Directive } from '@angular/core';

          @Directive()
          export class DepDir {}
        `,
      );

      // TODO(crisbeto): remove `null!` from the pipes when public API is updated.
      env.write(
        'dep-pipe.ts',
        `
          import { Pipe } from '@angular/core';

          @Pipe(null!)
          export class DepPipe {
            transform(value: number) {
              return value;
            }
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import { Component } from '@angular/core';
          import { DepComp } from './dep-comp';
          import { DepDir } from './dep-dir';
          import { DepPipe } from './dep-pipe';

          @Component({template: '@defer {<DepComp @DepDir>{{123 | DepPipe}}</DepComp>}'})
          export class Comp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).not.toContain('import { DepComp');
      expect(jsContents).not.toContain('import { DepDir');
      expect(jsContents).not.toContain('import { DepPipe');
      expect(cleanNewLines(jsContents)).toContain(
        'const Comp_Defer_1_DepsFn = () => [/* @ts-ignore */ import("./dep-comp").then(m => m.DepComp), ' +
          '/* @ts-ignore */ import("./dep-dir").then(m => m.DepDir), ' +
          '/* @ts-ignore */ import("./dep-pipe").then(m => m.DepPipe)];',
      );
      expect(jsContents).toContain('ɵɵdefer(1, 0, Comp_Defer_1_DepsFn);');
    });

    it('should generate metadata for a pipe without a name', () => {
      // TODO(crisbeto): remove `null!` from the pipes when public API is updated.
      env.write(
        'pipe.ts',
        `
          import {Pipe} from '@angular/core';

          @Pipe(null!)
          export class FooPipe {
            transform(value: any) {
              return value;
            }
          }
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('pipe.js');
      const dtsContents = env.getContents('pipe.d.ts');

      expect(jsContents).toContain('ɵɵdefinePipe({ name: "FooPipe", type: FooPipe, pure: true });');
      expect(dtsContents).toContain('ɵɵPipeDeclaration<FooPipe, null, true>;');
    });

    it('should not expose pipe under its class name if selectorless is disabled', () => {
      env.tsconfig({
        _enableSelectorless: false,
        strictTemplates: true,
      });

      // TODO(crisbeto): remove `null!` from the pipes when public API is updated.
      env.write(
        'pipe.ts',
        `
          import {Pipe} from '@angular/core';

          @Pipe(null!)
          export class FooPipe {
            transform(value: number) {
              return value;
            }
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import { Component } from '@angular/core';
          import { FooPipe } from './pipe';

          @Component({template: '{{"hello" | FooPipe}}', imports: [FooPipe]})
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`No pipe found with name 'FooPipe'.`);
    });
  });
});
