/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {absoluteFrom as _, getFileSystem, getSourceFileOrError} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {expectCompleteReuse, loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc type checking', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({fullTemplateTypeCheck: true});
      env.write('node_modules/@angular/common/index.d.ts', `
import * as i0 from '@angular/core';

export declare class NgForOfContext<T, U extends i0.NgIterable<T> = i0.NgIterable<T>> {
  $implicit: T;
  count: number;
  readonly even: boolean;
  readonly first: boolean;
  index: number;
  readonly last: boolean;
  ngForOf: U;
  readonly odd: boolean;
  constructor($implicit: T, ngForOf: U, index: number, count: number);
}

export declare class IndexPipe {
  transform<T>(value: T[], index: number): T;

  static ɵpipe: i0.ɵPipeDeclaration<IndexPipe, 'index'>;
}

export declare class SlicePipe {
  transform<T>(value: ReadonlyArray<T>, start: number, end?: number): Array<T>;
  transform(value: string, start: number, end?: number): string;
  transform(value: null, start: number, end?: number): null;
  transform(value: undefined, start: number, end?: number): undefined;
  transform(value: any, start: number, end?: number): any;

  static ɵpipe: i0.ɵPipeDeclaration<SlicePipe, 'slice'>;
}

export declare class NgForOf<T, U extends i0.NgIterable<T> = i0.NgIterable<T>> implements DoCheck {
  ngForOf: (U & i0.NgIterable<T>) | undefined | null;
  ngForTemplate: TemplateRef<NgForOfContext<T, U>>;
  ngForTrackBy: TrackByFunction<T>;
  constructor(_viewContainer: ViewContainerRef, _template: TemplateRef<NgForOfContext<T, U>>, _differs: IterableDiffers);
  ngDoCheck(): void;
  static ngTemplateContextGuard<T, U extends i0.NgIterable<T>>(dir: NgForOf<T, U>, ctx: any): ctx is NgForOfContext<T, U>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<NgForOf<any>, '[ngFor][ngForOf]', never, {'ngForOf': 'ngForOf'}, {}, never>;
}

export declare class NgIf<T = unknown> {
  ngIf: T;
  ngIfElse: TemplateRef<NgIfContext<T>> | null;
  ngIfThen: TemplateRef<NgIfContext<T>> | null;
  constructor(_viewContainer: ViewContainerRef, templateRef: TemplateRef<NgIfContext<T>>);
  static ngTemplateGuard_ngIf: 'binding';
  static ngTemplateContextGuard<T>(dir: NgIf<T>, ctx: any): ctx is NgIfContext<Exclude<T, false | 0 | "" | null | undefined>>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<NgIf<any>, '[ngIf]', never, {'ngIf': 'ngIf'}, {}, never>;
}

export declare class NgIfContext<T = unknown> {
  $implicit: T;
  ngIf: T;
}

export declare class CommonModule {
  static ɵmod: i0.ɵɵNgModuleDeclaration<CommonModule, [typeof NgIf, typeof NgForOf, typeof IndexPipe, typeof SlicePipe], never, [typeof NgIf, typeof NgForOf, typeof IndexPipe, typeof SlicePipe]>;
}
`);
      env.write('node_modules/@angular/animations/index.d.ts', `
export declare class AnimationEvent {
  element: any;
}
`);
    });

    it('should check a simple component', () => {
      env.write('test.ts', `
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: 'I am a simple template with no type info',
    })
    class TestCmp {}

    @NgModule({
      declarations: [TestCmp],
    })
    class Module {}
    `);

      env.driveMain();
    });

    it('should have accurate diagnostics in a template using crlf line endings', () => {
      env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          templateUrl: './test.html',
        })
        class TestCmp {}
      `);
      env.write('test.html', '<span>\r\n{{does_not_exist}}\r\n</span>');

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
    });

    it('should check regular attributes that are directive inputs', () => {
      env.tsconfig(
          {fullTemplateTypeCheck: true, strictInputTypes: true, strictAttributeTypes: true});
      env.write('test.ts', `
        import {Component, Directive, NgModule, Input} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div dir foo="2"></div>',
        })
        class TestCmp {}

        @Directive({selector: '[dir]'})
        class TestDir {
          @Input() foo: number;
        }

        @NgModule({
          declarations: [TestCmp, TestDir],
        })
        class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toEqual(`Type 'string' is not assignable to type 'number'.`);
      // The reported error code should be in the TS error space, not a -99 "NG" code.
      expect(diags[0].code).toBeGreaterThan(0);
    });

    it('should produce diagnostics when mapping to multiple fields and bound types are incorrect',
       () => {
         env.tsconfig(
             {fullTemplateTypeCheck: true, strictInputTypes: true, strictAttributeTypes: true});
         env.write('test.ts', `
        import {Component, Directive, NgModule, Input} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div dir foo="2"></div>',
        })
        class TestCmp {}

        @Directive({selector: '[dir]'})
        class TestDir {
          @Input('foo') foo1: number;
          @Input('foo') foo2: number;
        }

        @NgModule({
          declarations: [TestCmp, TestDir],
        })
        class Module {}
      `);

         const diags = env.driveDiagnostics();
         expect(diags.length).toBe(2);
         expect(diags[0].messageText).toEqual(`Type 'string' is not assignable to type 'number'.`);
         expect(diags[1].messageText).toEqual(`Type 'string' is not assignable to type 'number'.`);
       });

    it('should support inputs and outputs with names that are not JavaScript identifiers', () => {
      env.tsconfig(
          {fullTemplateTypeCheck: true, strictInputTypes: true, strictOutputEventTypes: true});
      env.write('test.ts', `
        import {Component, Directive, NgModule, EventEmitter} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div dir [some-input.xs]="2" (some-output)="handleEvent($event)"></div>',
        })
        class TestCmp {
          handleEvent(event: number): void {}
        }

        @Directive({
          selector: '[dir]',
          inputs: ['some-input.xs'],
          outputs: ['some-output'],
        })
        class TestDir {
          'some-input.xs': string;
          'some-output': EventEmitter<string>;
        }

        @NgModule({
          declarations: [TestCmp, TestDir],
        })
        class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toEqual(`Type 'number' is not assignable to type 'string'.`);
      expect(diags[1].messageText)
          .toEqual(`Argument of type 'string' is not assignable to parameter of type 'number'.`);
    });

    it('should support one input property mapping to multiple fields', () => {
      env.write('test.ts', `
        import {Component, Directive, Input, NgModule} from '@angular/core';

        @Directive({
          selector: '[dir]',
        })
        export class Dir {

          @Input('propertyName') fieldA!: string;
          @Input('propertyName') fieldB!: string;
        }

        @Component({
          selector: 'test-cmp',
          template: '<div dir propertyName="test"></div>',
        })
        export class Cmp {}

        @NgModule({declarations: [Dir, Cmp]})
        export class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should check event bindings', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictOutputEventTypes: true});
      env.write('test.ts', `
        import {Component, Directive, EventEmitter, NgModule, Output} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div dir (update)="update($event); updated = true" (focus)="update($event); focused = true"></div>',
        })
        class TestCmp {
          update(data: string) {}
        }

        @Directive({selector: '[dir]'})
        class TestDir {
          @Output() update = new EventEmitter<number>();
        }

        @NgModule({
          declarations: [TestCmp, TestDir],
        })
        class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(3);
      expect(diags[0].messageText)
          .toEqual(`Argument of type 'number' is not assignable to parameter of type 'string'.`);
      expect(diags[1].messageText)
          .toEqual(`Property 'updated' does not exist on type 'TestCmp'. Did you mean 'update'?`);
      // Disabled because `checkTypeOfDomEvents` is disabled by default
      // expect(diags[2].messageText)
      //     .toEqual(
      //         `Argument of type 'FocusEvent' is not assignable to parameter of type 'string'.`);
      expect(diags[2].messageText).toEqual(`Property 'focused' does not exist on type 'TestCmp'.`);
    });

    // https://github.com/angular/angular/issues/35073
    it('ngIf should narrow on output types', () => {
      env.tsconfig({strictTemplates: true});
      env.write('test.ts', `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngIf="person" (click)="handleEvent(person.name)"></div>',
        })
        class TestCmp {
          person?: { name: string; };
          handleEvent(name: string) {}
        }

        @NgModule({
          imports: [CommonModule],
          declarations: [TestCmp],
        })
        class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('ngIf should narrow on output types across multiple guards', () => {
      env.tsconfig({strictTemplates: true});
      env.write('test.ts', `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngIf="person"><div *ngIf="person.name" (click)="handleEvent(person.name)"></div></div>',
        })
        class TestCmp {
          person?: { name?: string; };
          handleEvent(name: string) {}
        }

        @NgModule({
          imports: [CommonModule],
          declarations: [TestCmp],
        })
        class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should support a directive being used in its own input expression', () => {
      env.tsconfig({strictTemplates: true});
      env.write('test.ts', `
        import {Component, Directive, NgModule, Input} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<target-cmp #ref [foo]="ref.bar"></target-cmp>',
        })
        export class TestCmp {}

        @Component({template: '', selector: 'target-cmp'})
        export class TargetCmp {
          readonly bar = 'test';
          @Input() foo: string;
        }

        @NgModule({
          declarations: [TestCmp, TargetCmp],
        })
        export class Module {}
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    describe('strictInputTypes', () => {
      beforeEach(() => {
        env.write('test.ts', `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div dir [foo]="!!invalid"></div>',
          })
          class TestCmp {}

          @Directive({selector: '[dir]'})
          class TestDir {
            @Input() foo: string;
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `);
      });

      it('should check expressions and their type when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(`Type 'boolean' is not assignable to type 'string'.`);
        expect(diags[1].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });

      it('should check expressions and their type when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(`Type 'boolean' is not assignable to type 'string'.`);
        expect(diags[1].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });

      it('should check expressions but not their type when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });
    });

    describe('strictNullInputTypes', () => {
      beforeEach(() => {
        env.write('test.ts', `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div dir [foo]="!!invalid && nullable"></div>',
          })
          class TestCmp {
            nullable: boolean | null | undefined;
          }

          @Directive({selector: '[dir]'})
          class TestDir {
            @Input() foo: boolean;
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `);
      });

      it('should check expressions and their nullability when enabled', () => {
        env.tsconfig(
            {fullTemplateTypeCheck: true, strictInputTypes: true, strictNullInputTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText)
            .toEqual(`Type 'boolean | null | undefined' is not assignable to type 'boolean'.`);
        expect(diags[1].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });

      it('should check expressions and their nullability when overall strictness is enabled',
         () => {
           env.tsconfig({strictTemplates: true});

           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(2);
           expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText)
               .toEqual(`Type 'boolean | null | undefined' is not assignable to type 'boolean'.`);
           expect(diags[1].messageText)
               .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
         });

      it('should check expressions but not their nullability when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });
    });

    describe('strictSafeNavigationTypes', () => {
      beforeEach(() => {
        env.write('test.ts', `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div dir [foo]="!!invalid && user?.isMember"></div>',
          })
          class TestCmp {
            user?: {isMember: boolean};
          }

          @Directive({selector: '[dir]'})
          class TestDir {
            @Input() foo: boolean;
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `);
      });

      it('should infer result type for safe navigation expressions when enabled', () => {
        env.tsconfig({
          fullTemplateTypeCheck: true,
          strictInputTypes: true,
          strictNullInputTypes: true,
          strictSafeNavigationTypes: true
        });

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText)
            .toEqual(`Type 'boolean | undefined' is not assignable to type 'boolean'.`);
        expect(diags[1].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });

      it('should infer result type for safe navigation expressions when overall strictness is enabled',
         () => {
           env.tsconfig({strictTemplates: true});

           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(2);
           expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText)
               .toEqual(`Type 'boolean | undefined' is not assignable to type 'boolean'.`);
           expect(diags[1].messageText)
               .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
         });

      it('should not infer result type for safe navigation expressions when not enabled', () => {
        env.tsconfig({
          fullTemplateTypeCheck: true,
          strictInputTypes: true,
        });

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });
    });

    describe('strictOutputEventTypes', () => {
      beforeEach(() => {
        env.write('test.ts', `
          import {Component, Directive, EventEmitter, NgModule, Output} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div dir (update)="invalid && update($event);"></div>',
          })
          class TestCmp {
            update(data: string) {}
          }

          @Directive({selector: '[dir]'})
          class TestDir {
            @Output() update = new EventEmitter<number>();
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `);
      });

      it('should expressions and infer type of $event when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictOutputEventTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
        expect(diags[1].messageText)
            .toEqual(`Argument of type 'number' is not assignable to parameter of type 'string'.`);
      });

      it('should expressions and infer type of $event when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
        expect(diags[1].messageText)
            .toEqual(`Argument of type 'number' is not assignable to parameter of type 'string'.`);
      });

      it('should check expressions but not infer type of $event when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });
    });

    describe('strictOutputEventTypes and animation event bindings', () => {
      beforeEach(() => {
        env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div (@animation.done)="invalid; update($event);"></div>',
          })
          class TestCmp {
            update(data: string) {}
          }

          @NgModule({
            declarations: [TestCmp],
          })
          class Module {}
        `);
      });

      it('should check expressions and let $event be of type AnimationEvent when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictOutputEventTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
        expect(diags[1].messageText)
            .toEqual(
                `Argument of type 'AnimationEvent' is not assignable to parameter of type 'string'.`);
      });

      it('should check expressions and let $event be of type AnimationEvent when overall strictness is enabled',
         () => {
           env.tsconfig({strictTemplates: true});

           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(2);
           expect(diags[0].messageText)
               .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
           expect(diags[1].messageText)
               .toEqual(
                   `Argument of type 'AnimationEvent' is not assignable to parameter of type 'string'.`);
         });

      it('should check expressions and let $event be of type any when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });
    });

    describe('strictDomLocalRefTypes', () => {
      beforeEach(() => {
        env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<input #ref>{{ref.does_not_exist}}',
          })
          class TestCmp {}

          @NgModule({
            declarations: [TestCmp],
          })
          class Module {}
        `);
      });

      it('should infer the type of DOM references when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictDomLocalRefTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toEqual(`Property 'does_not_exist' does not exist on type 'HTMLInputElement'.`);
      });

      it('should infer the type of DOM references when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toEqual(`Property 'does_not_exist' does not exist on type 'HTMLInputElement'.`);
      });

      it('should let the type of DOM references be any when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
    });

    describe('strictAttributeTypes', () => {
      beforeEach(() => {
        env.write('test.ts', `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<textarea dir disabled cols="3"></textarea>',
          })
          class TestCmp {}

          @Directive({selector: '[dir]'})
          class TestDir {
            @Input() disabled: boolean;
            @Input() cols: number;
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `);
      });

      it('should produce an error for text attributes when enabled', () => {
        env.tsconfig(
            {fullTemplateTypeCheck: true, strictInputTypes: true, strictAttributeTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(`Type 'string' is not assignable to type 'boolean'.`);
        expect(diags[1].messageText).toEqual(`Type 'string' is not assignable to type 'number'.`);
      });

      it('should produce an error for text attributes when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(`Type 'string' is not assignable to type 'boolean'.`);
        expect(diags[1].messageText).toEqual(`Type 'string' is not assignable to type 'number'.`);
      });

      it('should not produce an error for text attributes when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
    });

    describe('strictDomEventTypes', () => {
      beforeEach(() => {
        env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div (focus)="invalid; update($event)"></div>',
          })
          class TestCmp {
            update(data: string) {}
          }

          @NgModule({
            declarations: [TestCmp],
          })
          class Module {}
        `);
      });

      it('should check expressions and infer type of $event when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictDomEventTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
        expect(diags[1].messageText)
            .toEqual(
                `Argument of type 'FocusEvent' is not assignable to parameter of type 'string'.`);
      });

      it('should check expressions and infer type of $event when overall strictness is enabled',
         () => {
           env.tsconfig({strictTemplates: true});

           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(2);
           expect(diags[0].messageText)
               .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
           expect(diags[1].messageText)
               .toEqual(
                   `Argument of type 'FocusEvent' is not assignable to parameter of type 'string'.`);
         });

      it('should check expressions but not infer type of $event when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toEqual(`Property 'invalid' does not exist on type 'TestCmp'.`);
      });
    });

    it('should check basic usage of NgIf', () => {
      env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngIf="user">{{user.name}}</div>',
    })
    class TestCmp {
      user: {name: string}|null;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

      env.driveMain();
    });

    it('should check usage of NgIf with explicit non-null guard', () => {
      env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngIf="user !== null">{{user.name}}</div>',
    })
    class TestCmp {
      user: {name: string}|null;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

      env.driveMain();
    });

    it('should check usage of NgIf when using "let" to capture $implicit context variable', () => {
      env.tsconfig({strictTemplates: true});
      env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngIf="user; let u">{{u.name}}</div>',
    })
    class TestCmp {
      user: {name: string}|null|false;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

      env.driveMain();
    });

    it('should check usage of NgIf when using "as" to capture `ngIf` context variable', () => {
      env.tsconfig({strictTemplates: true});
      env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngIf="user as u">{{u.name}}</div>',
    })
    class TestCmp {
      user: {name: string}|null|false;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

      env.driveMain();
    });

    it('should check basic usage of NgFor', () => {
      env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.name}}</div>',
    })
    class TestCmp {
      users: {name: string}[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

      env.driveMain();
    });

    it('should report an error inside the NgFor template', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.does_not_exist}}</div>',
    })
    export class TestCmp {
      users: {name: string}[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    export class Module {}
    `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText)
          .toEqual(`Property 'does_not_exist' does not exist on type '{ name: string; }'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
    });

    it('should accept an NgFor iteration over an any-typed value', () => {
      env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.name}}</div>',
    })
    export class TestCmp {
      users: any;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    export class Module {}
    `);

      env.driveMain();
    });

    it('should accept NgFor iteration over a QueryList', () => {
      env.tsconfig({strictTemplates: true});
      env.write('test.ts', `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule, QueryList} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngFor="let user of users">{{user.name}}</div>',
        })
        class TestCmp {
          users!: QueryList<{name: string}>;
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
    `);

      env.driveMain();
    });

    it('should infer the context of NgFor', () => {
      env.tsconfig({strictTemplates: true});
      env.write('test.ts', `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngFor="let user of users as all">{{all.length}}</div>',
        })
        class TestCmp {
          users: {name: string}[];
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should allow the implicit value of an NgFor to be invoked', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write('test.ts', `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngFor="let fn of functions">{{fn()}}</div>',
        })
        class TestCmp {
          functions = [() => 1, () => 2];
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
    `);

      env.driveMain();
    });

    it('should infer the context of NgIf', () => {
      env.tsconfig({strictTemplates: true});
      env.write('test.ts', `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'test',
          template: '<div *ngIf="getUser(); let user">{{user.nonExistingProp}}</div>',
        })
        class TestCmp {
          getUser(): {name: string} {
            return {name: 'frodo'};
          }
        }
        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText)
          .toBe(`Property 'nonExistingProp' does not exist on type '{ name: string; }'.`);
    });

    it('should report an error with an unknown local ref target', () => {
      env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div #ref="unknownTarget"></div>',
        })
        class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
        })
        class Module {}
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`No directive found with exportAs 'unknownTarget'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('unknownTarget');
    });

    it('should treat an unknown local ref target as type any', () => {
      env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div #ref="unknownTarget">{{ use(ref) }}</div>',
        })
        class TestCmp {
          use(ref: string): string { return ref; }
        }

        @NgModule({
          declarations: [TestCmp],
        })
        class Module {}
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`No directive found with exportAs 'unknownTarget'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('unknownTarget');
    });

    it('should report an error with an unknown pipe', () => {
      env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '{{expr | unknown}}',
        })
        class TestCmp {
          expr = 3;
        }

        @NgModule({
          declarations: [TestCmp],
        })
        class Module {}
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`No pipe found with name 'unknown'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('unknown');
    });

    it('should report an error with an unknown pipe even if `fullTemplateTypeCheck` is disabled',
       () => {
         env.tsconfig({fullTemplateTypeCheck: false});
         env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: '{{expr | unknown}}',
          })
          class TestCmp {
            expr = 3;
          }

          @NgModule({
            declarations: [TestCmp],
          })
          class Module {}
        `);
         const diags = env.driveDiagnostics();
         expect(diags.length).toBe(1);
         expect(diags[0].messageText).toBe(`No pipe found with name 'unknown'.`);
         expect(getSourceCodeForDiagnostic(diags[0])).toBe('unknown');
       });

    it('should report an error with pipe bindings', () => {
      env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: \`
        checking the input type to the pipe:
        {{user | index: 1}}

        checking the return type of the pipe:
        {{(users | index: 1).does_not_exist}}

        checking the argument type:
        {{users | index: 'test'}}

        checking the argument count:
        {{users | index: 1:2}}
      \`
    })
    class TestCmp {
      user: {name: string};
      users: {name: string}[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(4);

      const allErrors = [
        `'does_not_exist' does not exist on type '{ name: string; }'`,
        `Expected 2 arguments, but got 3.`,
        `Argument of type 'string' is not assignable to parameter of type 'number'`,
        `Argument of type '{ name: string; }' is not assignable to parameter of type 'unknown[]'`,
      ];

      for (const error of allErrors) {
        if (!diags.some(
                diag =>
                    ts.flattenDiagnosticMessageText(diag.messageText, '').indexOf(error) > -1)) {
          fail(`Expected a diagnostic message with text: ${error}`);
        }
      }
    });

    it('should constrain types using type parameter bounds', () => {
      env.tsconfig(
          {fullTemplateTypeCheck: true, strictInputTypes: true, strictContextGenerics: true});
      env.write('test.ts', `
    import {CommonModule} from '@angular/common';
    import {Component, Input, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.does_not_exist}}</div>',
    })
    class TestCmp<T extends {name: string}> {
      @Input() users: T[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toEqual(`Property 'does_not_exist' does not exist on type 'T'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
    });

    describe('microsyntax variables', () => {
      beforeEach(() => {
        // Use the same template for both tests
        env.write('test.ts', `
          import {CommonModule} from '@angular/common';
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: \`<div *ngFor="let foo of foos as foos">
              {{foo.name}} of {{foos.nonExistingProp}}
            </div>
            \`,
          })
          export class TestCmp {
            foos: {name: string}[];
          }

          @NgModule({
            declarations: [TestCmp],
            imports: [CommonModule],
          })
          export class Module {}
        `);
      });

      it('should be treated as \'any\' without strictTemplates', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictTemplates: false});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should be correctly inferred under strictTemplates', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toBe(`Property 'nonExistingProp' does not exist on type '{ name: string; }[]'.`);
      });
    });

    it('should properly type-check inherited directives', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write('test.ts', `
    import {Component, Directive, Input, NgModule} from '@angular/core';

    @Directive()
    class AbstractDir {
      @Input() fromAbstract!: number;
    }

    @Directive({
      selector: '[base]',
    })
    class BaseDir extends AbstractDir {
      @Input() fromBase!: string;
    }

    @Directive({
      selector: '[child]',
    })
    class ChildDir extends BaseDir {
      @Input() fromChild!: boolean;
    }

    @Component({
      selector: 'test',
      template: '<div child [fromAbstract]="true" [fromBase]="3" [fromChild]="4"></div>',
    })
    class TestCmp {}

    @NgModule({
      declarations: [TestCmp, ChildDir],
    })
    class Module {}
    `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(3);
      expect(diags[0].messageText).toBe(`Type 'boolean' is not assignable to type 'number'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toEqual('fromAbstract');
      expect(diags[1].messageText).toBe(`Type 'number' is not assignable to type 'string'.`);
      expect(getSourceCodeForDiagnostic(diags[1])).toEqual('fromBase');
      expect(diags[2].messageText).toBe(`Type 'number' is not assignable to type 'boolean'.`);
      expect(getSourceCodeForDiagnostic(diags[2])).toEqual('fromChild');
    });

    it('should properly type-check inherited directives from external libraries', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});

      env.write('node_modules/external/index.d.ts', `
        import * as i0 from '@angular/core';

        export declare class AbstractDir {
          fromAbstract: number;

          static ɵdir: i0.ɵɵDirectiveDeclaration<AbstractDir, never, never, {'fromAbstract': 'fromAbstract'}, never, never>;
        }

        export declare class BaseDir extends AbstractDir {
          fromBase: string;

          static ɵdir: i0.ɵɵDirectiveDeclaration<BaseDir, '[base]', never, {'fromBase': 'fromBase'}, never, never>;
        }

        export declare class ExternalModule {
          static ɵmod: i0.ɵɵNgModuleDeclaration<ExternalModule, [typeof BaseDir], never, [typeof BaseDir]>;
        }
      `);

      env.write('test.ts', `
        import {Component, Directive, Input, NgModule} from '@angular/core';
        import {BaseDir, ExternalModule} from 'external';

        @Directive({
          selector: '[child]',
        })
        class ChildDir extends BaseDir {
          @Input() fromChild!: boolean;
        }

        @Component({
          selector: 'test',
          template: '<div child [fromAbstract]="true" [fromBase]="3" [fromChild]="4"></div>',
        })
        class TestCmp {}

        @NgModule({
          declarations: [TestCmp, ChildDir],
          imports: [ExternalModule],
        })
        class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(3);
      expect(diags[0].messageText).toBe(`Type 'boolean' is not assignable to type 'number'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toEqual('fromAbstract');
      expect(diags[1].messageText).toBe(`Type 'number' is not assignable to type 'string'.`);
      expect(getSourceCodeForDiagnostic(diags[1])).toEqual('fromBase');
      expect(diags[2].messageText).toBe(`Type 'number' is not assignable to type 'boolean'.`);
      expect(getSourceCodeForDiagnostic(diags[2])).toEqual('fromChild');
    });

    it('should detect an illegal write to a template variable', () => {
      env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'test',
          template: \`
            <div *ngIf="x as y">
              <button (click)="y = !y">Toggle</button>
            </div>
          \`,
        })
        export class TestCmp {
          x!: boolean;
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        export class Module {}
      `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toEqual(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toEqual('y = !y');
    });

    it('should detect a duplicate variable declaration', () => {
      env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'test',
          template: \`
            <div *ngFor="let i of items; let i = index">
              {{i}}
            </div>
          \`,
        })
        export class TestCmp {
          items!: string[];
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        export class Module {}
      `);

      const diags = env.driveDiagnostics();
      expect(diags.length).toEqual(1);
      expect(diags[0].code).toEqual(ngErrorCode(ErrorCode.DUPLICATE_VARIABLE_DECLARATION));
      expect(getSourceCodeForDiagnostic(diags[0])).toContain('let i = index');
    });

    it('should still type-check when fileToModuleName aliasing is enabled, but alias exports are not in the .d.ts file',
       () => {
         // The template type-checking file imports directives/pipes in order to type-check their
         // usage. When `UnifiedModulesHost` aliasing is enabled, these imports would ordinarily use
         // aliased values. However, such aliases are not guaranteed to exist in the .d.ts files,
         // and so feeding such imports back into TypeScript does not work.
         //
         // Instead, direct imports should be used within template type-checking code. This test
         // verifies that template type-checking is able to cope with such a scenario where
         // aliasing is enabled and alias re-exports don't exist in .d.ts files.
         env.tsconfig({
           // Setting this private flag turns on aliasing.
           '_useHostForImportGeneration': true,
           // Because the tsconfig is overridden, template type-checking needs to be turned back on
           // explicitly as well.
           'fullTemplateTypeCheck': true,
         });

         // 'alpha' declares the directive which will ultimately be imported.
         env.write('alpha.d.ts', `
          import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

          export declare class ExternalDir {
            input: string;
            static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, { 'input': "input" }, never, never>;
          }

          export declare class AlphaModule {
            static ɵmod: ɵɵNgModuleDeclaration<AlphaModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
          }
         `);

         // 'beta' re-exports AlphaModule from alpha.
         env.write('beta.d.ts', `
          import {ɵɵNgModuleDeclaration} from '@angular/core';
          import {AlphaModule} from './alpha';

          export declare class BetaModule {
            static ɵmod: ɵɵNgModuleDeclaration<BetaModule, never, never, [typeof AlphaModule]>;
          }
         `);

         // The application imports BetaModule from beta, gaining visibility of ExternalDir from
         // alpha.
         env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';
          import {BetaModule} from './beta';

          @Component({
            selector: 'cmp',
            template: '<div test input="value"></div>',
          })
          export class Cmp {}

          @NgModule({
            declarations: [Cmp],
            imports: [BetaModule],
          })
          export class Module {}
         `);

         const diags = env.driveDiagnostics();
         expect(diags.length).toBe(0);
       });

    describe('input coercion', () => {
      beforeEach(() => {
        env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
        env.write('node_modules/@angular/material/index.d.ts', `
        import * as i0 from '@angular/core';

        export declare class MatInput {
          value: string;
          static ɵdir: i0.ɵɵDirectiveDeclaration<MatInput, '[matInput]', never, {'value': 'value'}, {}, never>;
          static ngAcceptInputType_value: string|number;
        }

        export declare class MatInputModule {
          static ɵmod: i0.ɵɵNgModuleDeclaration<MatInputModule, [typeof MatInput], never, [typeof MatInput]>;
        }
        `);
      });

      it('should coerce an input using a coercion function if provided', () => {
        env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';
          import {MatInputModule} from '@angular/material';

          @Component({
            selector: 'blah',
            template: '<input matInput [value]="someNumber">',
          })
          export class FooCmp {
            someNumber = 3;
          }

          @NgModule({
            declarations: [FooCmp],
            imports: [MatInputModule],
          })
          export class FooModule {}
        `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should apply coercion members of base classes', () => {
        env.write('test.ts', `
          import {Component, Directive, Input, NgModule} from '@angular/core';

          @Directive()
          export class BaseDir {
            @Input()
            value: string;

            static ngAcceptInputType_value: string|number;
          }

          @Directive({
            selector: '[dir]',
          })
          export class MyDir extends BaseDir {}

          @Component({
            selector: 'blah',
            template: '<input dir [value]="someNumber">',
          })
          export class FooCmp {
            someNumber = 3;
          }

          @NgModule({
            declarations: [MyDir, FooCmp],
          })
          export class FooModule {}
        `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should give an error if the binding expression type is not accepted by the coercion function',
         () => {
           env.write('test.ts', `
            import {Component, NgModule, Input, Directive} from '@angular/core';
            import {MatInputModule} from '@angular/material';

            @Component({
              selector: 'blah',
              template: '<input matInput [value]="invalidType">',
            })
            export class FooCmp {
              invalidType = true;
            }

            @NgModule({
              declarations: [FooCmp],
              imports: [MatInputModule],
            })
            export class FooModule {}
        `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(1);
           expect(diags[0].messageText)
               .toBe(`Type 'boolean' is not assignable to type 'string | number'.`);
         });

      it('should give an error for undefined bindings into regular inputs when coercion members are present',
         () => {
           env.tsconfig({strictTemplates: true});
           env.write('test.ts', `
            import {Component, Directive, NgModule, Input} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<input dir [regular]="undefined" [coerced]="1">',
            })
            export class FooCmp {
              invalidType = true;
            }

            @Directive({selector: '[dir]'})
            export class CoercionDir {
              @Input() regular: string;
              @Input() coerced: boolean;

              static ngAcceptInputType_coerced: boolean|number;
            }

            @NgModule({
              declarations: [FooCmp, CoercionDir],
            })
            export class FooModule {}
        `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(1);
           expect(diags[0].messageText)
               .toBe(`Type 'undefined' is not assignable to type 'string'.`);
         });
    });

    describe('restricted inputs', () => {
      const directiveDeclaration = `
            @Directive({selector: '[dir]'})
            export class TestDir {
              @Input()
              protected protectedField!: string;
              @Input()
              private privateField!: string;
              @Input()
              readonly readonlyField!: string;
            }
      `;

      const correctTypeInputsToRestrictedFields = `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [readonlyField]="value" [protectedField]="value" [privateField]="value"></div>',
            })
            export class FooCmp {
              value = "value";
            }

            ${directiveDeclaration}

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
        `;

      const correctInputsToRestrictedFieldsFromBaseClass = `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div child-dir [readonlyField]="value" [protectedField]="value" [privateField]="value"></div>',
            })
            export class FooCmp {
              value = "value";
            }

            ${directiveDeclaration}

            @Directive({selector: '[child-dir]'})
            export class ChildDir extends TestDir {
            }

            @NgModule({
              declarations: [FooCmp, ChildDir],
            })
            export class FooModule {}
        `;
      describe('with strictInputAccessModifiers', () => {
        beforeEach(() => {
          env.tsconfig({
            fullTemplateTypeCheck: true,
            strictInputTypes: true,
            strictInputAccessModifiers: true
          });
        });

        it('should produce diagnostics for inputs which assign to readonly, private, and protected fields',
           () => {
             env.write('test.ts', correctTypeInputsToRestrictedFields);
             expectIllegalAssignmentErrors(env.driveDiagnostics());
           });

        it('should produce diagnostics for inputs which assign to readonly, private, and protected fields inherited from a base class',
           () => {
             env.write('test.ts', correctInputsToRestrictedFieldsFromBaseClass);
             expectIllegalAssignmentErrors(env.driveDiagnostics());
           });

        function expectIllegalAssignmentErrors(diags: ReadonlyArray<ts.Diagnostic>) {
          expect(diags.length).toBe(3);
          const actualMessages = diags.map(d => d.messageText).sort();
          const expectedMessages = [
            `Property 'protectedField' is protected and only accessible within class 'TestDir' and its subclasses.`,
            `Property 'privateField' is private and only accessible within class 'TestDir'.`,
            `Cannot assign to 'readonlyField' because it is a read-only property.`,
          ].sort();
          expect(actualMessages).toEqual(expectedMessages);
        }

        it('should report invalid type assignment when field name is not a valid JS identifier',
           () => {
             env.write('test.ts', `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [private-input.xs]="value"></div>',
            })
            export class FooCmp {
              value = 5;
            }

            @Directive({selector: '[dir]'})
            export class TestDir {
              @Input()
              private 'private-input.xs'!: string;
            }

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
          `);
             const diags = env.driveDiagnostics();
             expect(diags.length).toBe(1);
             expect(diags[0].messageText)
                 .toEqual(`Type 'number' is not assignable to type 'string'.`);
           });
      });

      describe('with strict inputs', () => {
        beforeEach(() => {
          env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
        });

        it('should not produce diagnostics for correct inputs which assign to readonly, private, or protected fields',
           () => {
             env.write('test.ts', correctTypeInputsToRestrictedFields);
             const diags = env.driveDiagnostics();
             expect(diags.length).toBe(0);
           });

        it('should not produce diagnostics for correct inputs which assign to readonly, private, or protected fields inherited from a base class',
           () => {
             env.write('test.ts', correctInputsToRestrictedFieldsFromBaseClass);
             const diags = env.driveDiagnostics();
             expect(diags.length).toBe(0);
           });

        it('should produce diagnostics when assigning incorrect type to readonly, private, or protected fields',
           () => {
             env.write('test.ts', `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [readonlyField]="value" [protectedField]="value" [privateField]="value"></div>',
            })
            export class FooCmp {
              value = 1;
            }

            ${directiveDeclaration}

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
        `);
             const diags = env.driveDiagnostics();
             expect(diags.length).toBe(3);
             expect(diags[0].messageText)
                 .toEqual(`Type 'number' is not assignable to type 'string'.`);
             expect(diags[1].messageText)
                 .toEqual(`Type 'number' is not assignable to type 'string'.`);
             expect(diags[2].messageText)
                 .toEqual(`Type 'number' is not assignable to type 'string'.`);
           });
      });
    });

    it('should not produce diagnostics for undeclared inputs', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write('test.ts', `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [undeclared]="value"></div>',
            })
            export class FooCmp {
              value = "value";
            }

            @Directive({
              selector: '[dir]',
              inputs: ['undeclared'],
            })
            export class TestDir {
            }

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
        `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should produce diagnostics for invalid expressions when assigned into an undeclared input',
       () => {
         env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
         env.write('test.ts', `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [undeclared]="value"></div>',
            })
            export class FooCmp {
            }

            @Directive({
              selector: '[dir]',
              inputs: ['undeclared'],
            })
            export class TestDir {
            }

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
        `);
         const diags = env.driveDiagnostics();
         expect(diags.length).toBe(1);
         expect(diags[0].messageText).toBe(`Property 'value' does not exist on type 'FooCmp'.`);
       });

    it('should not produce diagnostics for undeclared inputs inherited from a base class', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write('test.ts', `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [undeclaredBase]="value"></div>',
            })
            export class FooCmp {
              value = "value";
            }

            @Directive({
              inputs: ['undeclaredBase'],
            })
            export class BaseDir {
            }

            @Directive({selector: '[dir]'})
            export class TestDir extends BaseDir {
            }

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
        `);
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    describe('legacy schema checking with the DOM schema', () => {
      beforeEach(() => {
        env.tsconfig({fullTemplateTypeCheck: false});
      });

      it('should check for unknown elements', () => {
        env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<foo>test</foo>',
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`'foo' is not a known element:
1. If 'foo' is an Angular component, then verify that it is part of this module.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`);
      });

      it('should have a descriptive error for unknown elements that contain a dash', () => {
        env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<my-foo>test</my-foo>',
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`'my-foo' is not a known element:
1. If 'my-foo' is an Angular component, then verify that it is part of this module.
2. If 'my-foo' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.`);
      });

      it('should check for unknown properties', () => {
        env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<div [foo]="1">test</div>',
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toBe(`Can't bind to 'foo' since it isn't a known property of 'div'.`);
      });

      it('should have a descriptive error for unknown properties with an "ng-" prefix', () => {
        env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<div [foo]="1">test</div>',
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toBe(`Can't bind to 'foo' since it isn't a known property of 'div'.`);
      });

      it('should convert property names when binding special properties', () => {
        env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<label [for]="test">',
        })
        export class FooCmp {
          test: string = 'test';
        }
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `);
        const diags = env.driveDiagnostics();
        // Should not be an error to bind [for] of <label>, even though the actual property in the
        // DOM schema.
        expect(diags.length).toBe(0);
      });

      it('should produce diagnostics for custom-elements-style elements when not using the CUSTOM_ELEMENTS_SCHEMA',
         () => {
           env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';
          @Component({
            selector: 'blah',
            template: '<custom-element [foo]="1">test</custom-element>',
          })
          export class FooCmp {}
          @NgModule({
            declarations: [FooCmp],
          })
          export class FooModule {}
      `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(2);
           expect(diags[0].messageText).toBe(`'custom-element' is not a known element:
1. If 'custom-element' is an Angular component, then verify that it is part of this module.
2. If 'custom-element' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.`);
           expect(diags[1].messageText)
               .toBe(`Can't bind to 'foo' since it isn't a known property of 'custom-element'.
1. If 'custom-element' is an Angular component and it has 'foo' input, then verify that it is part of this module.
2. If 'custom-element' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.
3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`);
         });

      it('should not produce diagnostics for custom-elements-style elements when using the CUSTOM_ELEMENTS_SCHEMA',
         () => {
           env.write('test.ts', `
            import {Component, NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<custom-element [foo]="1">test</custom-element>',
            })
            export class FooCmp {}

            @NgModule({
              declarations: [FooCmp],
              schemas: [CUSTOM_ELEMENTS_SCHEMA],
            })
            export class FooModule {}
          `);
           const diags = env.driveDiagnostics();
           expect(diags).toEqual([]);
         });

      it('should not produce diagnostics when using the NO_ERRORS_SCHEMA', () => {
        env.write('test.ts', `
        import {Component, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';

        @Component({
          selector: 'blah',
          template: '<foo [bar]="1"></foo>',
        })
        export class FooCmp {}

        @NgModule({
          declarations: [FooCmp],
          schemas: [NO_ERRORS_SCHEMA],
        })
        export class FooModule {}
      `);
        const diags = env.driveDiagnostics();
        expect(diags).toEqual([]);
      });

      it('should allow HTML elements inside SVG foreignObject', () => {
        env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: \`
            <svg>
              <svg:foreignObject>
                <xhtml:div>Hello</xhtml:div>
              </svg:foreignObject>
            </svg>
          \`,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should allow HTML elements without explicit namespace inside SVG foreignObject', () => {
        env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        @Component({
          template: \`
            <svg>
              <foreignObject>
                <div>Hello</div>
              </foreignObject>
            </svg>
          \`,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should check for unknown elements inside an SVG foreignObject', () => {
        env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: \`
            <svg>
              <svg:foreignObject>
                <xhtml:foo>Hello</xhtml:foo>
              </svg:foreignObject>
            </svg>
          \`,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`'foo' is not a known element:
1. If 'foo' is an Angular component, then verify that it is part of this module.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`);
      });

      it('should check for unknown elements without explicit namespace inside an SVG foreignObject',
         () => {
           env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: \`
            <svg>
              <foreignObject>
                <foo>Hello</foo>
              </foreignObject>
            </svg>
          \`,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(1);
           expect(diags[0].messageText).toBe(`'foo' is not a known element:
1. If 'foo' is an Angular component, then verify that it is part of this module.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`);
         });
    });

    // Test both sync and async compilations, see https://github.com/angular/angular/issues/32538
    ['sync', 'async'].forEach(mode => {
      describe(`error locations [${mode}]`, () => {
        let driveDiagnostics: () => Promise<ReadonlyArray<ts.Diagnostic>>;
        beforeEach(() => {
          if (mode === 'async') {
            env.enablePreloading();
            driveDiagnostics = () => env.driveDiagnosticsAsync();
          } else {
            driveDiagnostics = () => Promise.resolve(env.driveDiagnostics());
          }
        });

        it('should be correct for direct templates', async () => {
          env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: \`<p>
              {{user.does_not_exist}}
            </p>\`,
          })
          export class TestCmp {
            user: {name: string}[];
          }`);

          const diags = await driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].file!.fileName).toBe(_('/test.ts'));
          expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
        });

        it('should be correct for indirect templates', async () => {
          env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';

          const TEMPLATE = \`<p>
            {{user.does_not_exist}}
          </p>\`;

          @Component({
            selector: 'test',
            template: TEMPLATE,
          })
          export class TestCmp {
            user: {name: string}[];
          }`);

          const diags = await driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].file!.fileName).toBe(_('/test.ts') + ' (TestCmp template)');
          expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
          expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0])).toBe('TEMPLATE');
        });

        it('should be correct for external templates', async () => {
          env.write('template.html', `<p>
          {{user.does_not_exist}}
        </p>`);
          env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';


          @Component({
            selector: 'test',
            templateUrl: './template.html',
          })
          export class TestCmp {
            user: {name: string}[];
          }`);

          const diags = await driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].file!.fileName).toBe(_('/template.html'));
          expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
          expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0]))
              .toBe(`'./template.html'`);
        });
      });
    });

    describe('option compatibility verification', () => {
      beforeEach(() => env.write('index.ts', `export const a = 1;`));

      it('should error if "fullTemplateTypeCheck" is false when "strictTemplates" is true', () => {
        env.tsconfig({fullTemplateTypeCheck: false, strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
            .toContain(
                'Angular compiler option "strictTemplates" is enabled, however "fullTemplateTypeCheck" is disabled.');
      });
      it('should not error if "fullTemplateTypeCheck" is false when "strictTemplates" is false',
         () => {
           env.tsconfig({fullTemplateTypeCheck: false, strictTemplates: false});

           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(0);
         });
      it('should not error if "fullTemplateTypeCheck" is not set when "strictTemplates" is true',
         () => {
           env.tsconfig({strictTemplates: true});

           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(0);
         });
      it('should not error if "fullTemplateTypeCheck" is true set when "strictTemplates" is true',
         () => {
           env.tsconfig({strictTemplates: true});

           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(0);
         });
    });

    describe('stability', () => {
      beforeEach(() => {
        env.write('test.ts', `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '{{expr}}'
          })
          export class TestCmp {
            expr = 'string';
          }
        `);
      });

      // This section tests various scenarios which have more complex ts.Program setups and thus
      // exercise edge cases of the template type-checker.
      it('should accept a program with a flat index', () => {
        // This test asserts that flat indices don't have any negative interactions with the
        // generation of template type-checking code in the program.
        env.tsconfig({fullTemplateTypeCheck: true, flatModuleOutFile: 'flat.js'});

        expect(env.driveDiagnostics()).toEqual([]);
      });

      it('should not leave referencedFiles in a tagged state', () => {
        env.enableMultipleCompilations();

        env.driveMain();
        const sf = getSourceFileOrError(env.getTsProgram(), _('/test.ts'));
        expect(sf.referencedFiles.map(ref => ref.fileName)).toEqual([]);
      });

      it('should allow for complete program reuse during incremental compilations', () => {
        env.enableMultipleCompilations();

        env.write('other.ts', `export const VERSION = 1;`);

        env.driveMain();
        const firstProgram = env.getReuseTsProgram();

        env.write('other.ts', `export const VERSION = 2;`);
        env.driveMain();

        expectCompleteReuse(env.getTsProgram());
        expectCompleteReuse(env.getReuseTsProgram());
      });
    });
  });
});

function getSourceCodeForDiagnostic(diag: ts.Diagnostic): string {
  const text = diag.file!.text;
  return text.substr(diag.start!, diag.length!);
}
