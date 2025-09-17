/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {DiagnosticCategoryLabel} from '../../src/ngtsc/core/api';
import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {absoluteFrom as _, getSourceFileOrError} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {
  expectCompleteReuse,
  getSourceCodeForDiagnostic,
  loadStandardTestFiles,
} from '../../src/ngtsc/testing';
import {factory as invalidBananaInBoxFactory} from '../../src/ngtsc/typecheck/extended/checks/invalid_banana_in_box';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  describe('ngtsc type checking', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({fullTemplateTypeCheck: true});
      env.write(
        'node_modules/@angular/animations/index.d.ts',
        `
        export declare class AnimationEvent {
          element: any;
        }
      `,
      );
    });

    it('should check a simple component', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'I am a simple template with no type info',
          standalone: false,
        })
        class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
        })
        class Module {}
      `,
      );

      env.driveMain();
    });

    it('should have accurate diagnostics in a template using crlf line endings', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          templateUrl: './test.html',
          standalone: false,
        })
        class TestCmp {}
      `,
      );
      env.write('test.html', '<span>\r\n{{does_not_exist}}\r\n</span>');

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
    });

    it('should not fail with a runtime error when generating TCB', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {Component, input} from '@angular/core';

        @Component({
          selector: 'sub-cmp',
          standalone: true,
          template: '',
        })
        class Sub { // intentionally not exported
          someInput = input.required<string>();
        }

        @Component({
          template: \`<sub-cmp [someInput]="''" />\`,
          standalone: true,
          imports: [Sub],
        })
        export class MyComponent {}
      `,
      );

      const diagnostics = env.driveDiagnostics();
      expect(diagnostics).toEqual([
        jasmine.objectContaining({
          messageText: jasmine.objectContaining({messageText: 'Unable to import symbol Sub.'}),
        }),
      ]);
    });

    it('should check regular attributes that are directive inputs', () => {
      env.tsconfig({
        fullTemplateTypeCheck: true,
        strictInputTypes: true,
        strictAttributeTypes: true,
      });
      env.write(
        'test.ts',
        `
        import {Component, Directive, NgModule, Input} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div dir foo="2"></div>',
          standalone: false,
        })
        class TestCmp {}

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class TestDir {
          @Input() foo: number;
        }

        @NgModule({
          declarations: [TestCmp, TestDir],
        })
        class Module {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toEqual(`Type 'string' is not assignable to type 'number'.`);
      // The reported error code should be in the TS error space, not a -99 "NG" code.
      expect(diags[0].code).toBeGreaterThan(0);
    });

    it('should produce diagnostics when mapping to multiple fields and bound types are incorrect', () => {
      env.tsconfig({
        fullTemplateTypeCheck: true,
        strictInputTypes: true,
        strictAttributeTypes: true,
      });
      env.write(
        'test.ts',
        `
        import {Component, Directive, NgModule, Input} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div dir foo="2"></div>',
          standalone: false,
        })
        class TestCmp {}

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class TestDir {
          @Input('foo') foo1: number;
          @Input('foo') foo2: number;
        }

        @NgModule({
          declarations: [TestCmp, TestDir],
        })
        class Module {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toEqual(`Type 'string' is not assignable to type 'number'.`);
      expect(diags[1].messageText).toEqual(`Type 'string' is not assignable to type 'number'.`);
    });

    it('should support inputs and outputs with names that are not JavaScript identifiers', () => {
      env.tsconfig({
        fullTemplateTypeCheck: true,
        strictInputTypes: true,
        strictOutputEventTypes: true,
      });
      env.write(
        'test.ts',
        `
        import {Component, Directive, NgModule, EventEmitter} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div dir [some-input.xs]="2" (some-output)="handleEvent($event)"></div>',
          standalone: false,
        })
        class TestCmp {
          handleEvent(event: number): void {}
        }

        @Directive({
          selector: '[dir]',
          inputs: ['some-input.xs'],
          outputs: ['some-output'],
          standalone: false,
        })
        class TestDir {
          'some-input.xs': string;
          'some-output': EventEmitter<string>;
        }

        @NgModule({
          declarations: [TestCmp, TestDir],
        })
        class Module {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toEqual(`Type 'number' is not assignable to type 'string'.`);
      expect(diags[1].messageText).toEqual(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should support one input property mapping to multiple fields', () => {
      env.write(
        'test.ts',
        `
        import {Component, Directive, Input, NgModule} from '@angular/core';

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        export class Dir {

          @Input('propertyName') fieldA!: string;
          @Input('propertyName') fieldB!: string;
        }

        @Component({
          selector: 'test-cmp',
          template: '<div dir propertyName="test"></div>',
          standalone: false,
        })
        export class Cmp {}

        @NgModule({declarations: [Dir, Cmp]})
        export class Module {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should check event bindings', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictOutputEventTypes: true});
      env.write(
        'test.ts',
        `
        import {Component, Directive, EventEmitter, NgModule, Output} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div dir (update)="update($event); updated = true" (focus)="update($event); focused = true"></div>',
          standalone: false,
        })
        class TestCmp {
          update(data: string) {}
        }

        @Directive({
          selector: '[dir]',
          standalone: false,
        })
        class TestDir {
          @Output() update = new EventEmitter<number>();
        }

        @NgModule({
          declarations: [TestCmp, TestDir],
        })
        class Module {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(3);
      expect(diags[0].messageText).toEqual(
        `Argument of type 'number' is not assignable to parameter of type 'string'.`,
      );
      expect(diags[1].messageText).toEqual(
        `Property 'updated' does not exist on type 'TestCmp'. Did you mean 'update'?`,
      );
      // Disabled because `checkTypeOfDomEvents` is disabled by default
      // expect(diags[2].messageText)
      //     .toEqual(
      //         `Argument of type 'FocusEvent' is not assignable to parameter of type 'string'.`);
      expect(diags[2].messageText).toEqual(`Property 'focused' does not exist on type 'TestCmp'.`);
    });

    // https://github.com/angular/angular/issues/35073
    it('ngIf should narrow on output types', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngIf="person" (click)="handleEvent(person.name)"></div>',
          standalone: false,
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
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('ngIf should narrow on output types across multiple guards', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngIf="person"><div *ngIf="person.name" (click)="handleEvent(person.name)"></div></div>',
          standalone: false,
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
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should support a directive being used in its own input expression', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {Component, Directive, NgModule, Input} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<target-cmp #ref [foo]="ref.bar"></target-cmp>',
          standalone: false,
        })
        export class TestCmp {}

        @Component({
          template: '',
          selector: 'target-cmp',
          standalone: false,
        })
        export class TargetCmp {
          readonly bar = 'test';
          @Input() foo: string;
        }

        @NgModule({
          declarations: [TestCmp, TargetCmp],
        })
        export class Module {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    // https://devblogs.microsoft.com/typescript/announcing-typescript-4-3-beta/#separate-write-types-on-properties
    it('should support separate write types on inputs', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {Component, NgModule, Input} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<target-cmp disabled></target-cmp>',
          standalone: false,
        })
        export class TestCmp {}

        @Component({
          template: '',
          selector: 'target-cmp',
          standalone: false,
        })
        export class TargetCmp {
          @Input()
          get disabled(): boolean { return this._disabled; }
          set disabled(value: string|boolean) { this._disabled = value === '' || !!value; }
          private _disabled = false;
        }

        @NgModule({
          declarations: [TestCmp, TargetCmp],
        })
        export class Module {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should check split two way binding', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {Component, Input, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<child-cmp [(value)]="counterValue"></child-cmp>',
          standalone: false,
        })

        export class TestCmp {
          counterValue = 0;
        }

        @Component({
          selector: 'child-cmp',
          template: '',
          standalone: false,
        })

        export class ChildCmp {
          @Input() value = 0;
        }

        @NgModule({
          declarations: [TestCmp, ChildCmp],
        })
        export class Module {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.SPLIT_TWO_WAY_BINDING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('value');
      expect(diags[0].relatedInformation!.length).toBe(2);
      expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0])).toBe('ChildCmp');
      expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![1])).toBe('child-cmp');
    });

    it('when input and output go to different directives', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {Component, Input, NgModule, Output, Directive} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<child-cmp [(value)]="counterValue"></child-cmp>',
          standalone: false,
        })
        export class TestCmp {
          counterValue = 0;
        }

        @Directive({
          selector: 'child-cmp',
          standalone: false,
        })
        export class ChildCmpDir {
          @Output() valueChange: any;
        }

        @Component({
          selector: 'child-cmp',
          template: '',
          standalone: false,
        })
        export class ChildCmp {
          @Input() value = 0;
        }

        @NgModule({
          declarations: [TestCmp, ChildCmp, ChildCmpDir],
        })
        export class Module {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.SPLIT_TWO_WAY_BINDING));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('value');
      expect(diags[0].relatedInformation!.length).toBe(2);
      expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0])).toBe('ChildCmp');
      expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![1])).toBe('ChildCmpDir');
    });

    it('should type check a two-way binding to a generic property', () => {
      env.tsconfig({strictTemplates: true, _checkTwoWayBoundEvents: true});
      env.write(
        'test.ts',
        `
        import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

        @Directive({selector: '[dir]', standalone: true})
        export class Dir<T extends {id: string}> {
          @Input() val!: T;
          @Output() valChange = new EventEmitter<T>();
        }

        @Component({
          template: '<input dir [(val)]="invalidType">',
          standalone: true,
          imports: [Dir],
        })
        export class FooCmp {
          invalidType = {id: 1};
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toEqual(
        jasmine.objectContaining({
          messageText: `Type '{ id: number; }' is not assignable to type '{ id: string; }'.`,
        }),
      );
      expect(diags[1].messageText).toEqual(
        jasmine.objectContaining({
          messageText: `Type '{ id: string; }' is not assignable to type '{ id: number; }'.`,
        }),
      );
    });

    it('should use the setter type when assigning using a two-way binding to an input with different getter and setter types', () => {
      env.tsconfig({strictTemplates: true, _checkTwoWayBoundEvents: true});
      env.write(
        'test.ts',
        `
            import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

            @Directive({selector: '[dir]', standalone: true})
            export class Dir {
              @Input()
              set val(value: string | null | undefined) {
                this._val = value as string;
              }
              get val(): string {
                return this._val;
              }
              private _val: string;

              @Output() valChange = new EventEmitter<string>();
            }

            @Component({
              template: '<input dir [(val)]="nullableType">',
              standalone: true,
              imports: [Dir],
            })
            export class FooCmp {
              nullableType: string | null = null;
            }
          `,
      );

      const diags = env.driveDiagnostics();
      expect(diags).toEqual([]);
    });

    it('should type check a two-way binding to a function value', () => {
      env.tsconfig({strictTemplates: true, _checkTwoWayBoundEvents: true});
      env.write(
        'test.ts',
        `
        import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

        type TestFn = (val: number | null | undefined) => string;

        @Directive({selector: '[dir]', standalone: true})
        export class Dir {
          @Input() val!: TestFn;
          @Output() valChange = new EventEmitter<TestFn>();
        }

        @Component({
          template: '<input dir [(val)]="invalidType">',
          standalone: true,
          imports: [Dir],
        })
        export class FooCmp {
          invalidType = (val: string) => 0;
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(2);
      expect(diags[0].messageText).toEqual(
        jasmine.objectContaining({
          messageText: `Type '(val: string) => number' is not assignable to type 'TestFn'.`,
        }),
      );
      expect(diags[1].messageText).toEqual(
        jasmine.objectContaining({
          messageText: `Type 'TestFn' is not assignable to type '(val: string) => number'.`,
        }),
      );
    });

    it('should be able to cast to any in a two-way binding', () => {
      env.tsconfig({strictTemplates: true, _checkTwoWayBoundEvents: true});
      env.write(
        'test.ts',
        `
        import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

        @Directive({selector: '[dir]', standalone: true})
        export class Dir {
          @Input() val!: number;
          @Output() valChange = new EventEmitter<number>();
        }

        @Component({
          template: '<input dir [(val)]="$any(invalidType)">',
          standalone: true,
          imports: [Dir],
        })
        export class FooCmp {
          invalidType = 'hello';
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should type check a two-way binding to input/output pair where the input has a wider type than the output', () => {
      env.tsconfig({strictTemplates: true, _checkTwoWayBoundEvents: true});
      env.write(
        'test.ts',
        `
          import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

          @Directive({selector: '[dir]'})
          export class Dir {
            @Input() value: string | number;
            @Output() valueChange = new EventEmitter<number>();
          }

          @Component({
            template: '<div dir [(value)]="value"></div>',
            imports: [Dir],
          })
          export class App {
            value = 'hello';
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'string'.`);
    });

    it('should check the fallback content of ng-content', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          standalone: true,
          template: \`
            <ng-content>
              <button (click)="acceptsNumber('hello')"></button>
            </ng-content>
          \`,
        })
        class TestCmp {
          acceptsNumber(value: number) {}
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(
        `Argument of type 'string' is not assignable to parameter of type 'number'.`,
      );
    });

    it('should not allow references to the default content of ng-content', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          standalone: true,
          template: \`
            <ng-content>
              <input #input/>
            </ng-content>

            {{input.value}}
          \`,
        })
        class TestCmp {
        }
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(`Property 'input' does not exist on type 'TestCmp'.`);
    });

    it('should error on non valid typeof expressions', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          standalone: true,
          template: \` {{typeof {} === 'foobar'}} \`,
        })
        class TestCmp {
        }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(`This comparison appears to be unintentional`);
    });

    it('should error on misused logical not in typeof expressions', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          standalone: true,
          // should be !(typeof {} === 'object')
          template: \` {{!typeof {} === 'object'}} \`,
        })
        class TestCmp {
        }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(`This comparison appears to be unintentional`);
    });

    it('should error on invalid "in" binary expressions', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';

        @Component({
          template: \` {{'foo' in 'foobar'}} \`,
        })
        class TestCmp {
        }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain(`Type 'string' is not assignable to type 'object'`);
    });

    describe('strictInputTypes', () => {
      beforeEach(() => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div dir [foo]="!!invalid"></div>',
            standalone: false,
          })
          class TestCmp {}

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          class TestDir {
            @Input() foo: string;
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `,
        );
      });

      it('should check expressions and their type when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(`Type 'boolean' is not assignable to type 'string'.`);
        expect(diags[1].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });

      it('should check expressions and their type when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(`Type 'boolean' is not assignable to type 'string'.`);
        expect(diags[1].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });

      it('should check expressions but not their type when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });
    });

    describe('strictNullInputTypes', () => {
      beforeEach(() => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div dir [foo]="!!invalid && nullable"></div>',
            standalone: false,
          })
          class TestCmp {
            nullable: boolean | null | undefined;
          }

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          class TestDir {
            @Input() foo: boolean;
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `,
        );
      });

      it('should check expressions and their nullability when enabled', () => {
        env.tsconfig({
          fullTemplateTypeCheck: true,
          strictInputTypes: true,
          strictNullInputTypes: true,
        });

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText).toEqual(
          `Type 'boolean | null | undefined' is not assignable to type 'boolean'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });

      it('should check expressions and their nullability when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText).toEqual(
          `Type 'boolean | null | undefined' is not assignable to type 'boolean'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });

      it('should check expressions but not their nullability when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });
    });

    describe('strictSafeNavigationTypes', () => {
      beforeEach(() => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div dir [foo]="!!invalid && user?.isMember"></div>',
            standalone: false,
          })
          class TestCmp {
            user?: {isMember: boolean};
          }

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          class TestDir {
            @Input() foo: boolean;
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `,
        );
      });

      it('should infer result type for safe navigation expressions when enabled', () => {
        env.tsconfig({
          fullTemplateTypeCheck: true,
          strictInputTypes: true,
          strictNullInputTypes: true,
          strictSafeNavigationTypes: true,
        });

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText).toEqual(
          `Type 'boolean | undefined' is not assignable to type 'boolean'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });

      it('should infer result type for safe navigation expressions when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText).toEqual(
          `Type 'boolean | undefined' is not assignable to type 'boolean'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });

      it('should not infer result type for safe navigation expressions when not enabled', () => {
        env.tsconfig({
          fullTemplateTypeCheck: true,
          strictInputTypes: true,
        });

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });
    });

    describe('strictOutputEventTypes', () => {
      beforeEach(() => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, EventEmitter, NgModule, Output} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div dir (update)="invalid && update($event);"></div>',
            standalone: false,
          })
          class TestCmp {
            update(data: string) {}
          }

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          class TestDir {
            @Output() update = new EventEmitter<number>();
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `,
        );
      });

      it('should expressions and infer type of $event when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictOutputEventTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should expressions and infer type of $event when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should check expressions but not infer type of $event when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });
    });

    describe('strictOutputEventTypes and animation event bindings', () => {
      beforeEach(() => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div (@animation.done)="invalid; update($event);"></div>',
            standalone: false,
          })
          class TestCmp {
            update(data: string) {}
          }

          @NgModule({
            declarations: [TestCmp],
          })
          class Module {}
        `,
        );
      });

      it('should check expressions and let $event be of type AnimationEvent when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictOutputEventTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Argument of type 'AnimationEvent' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should check expressions and let $event be of type AnimationEvent when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Argument of type 'AnimationEvent' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should check expressions and let $event be of type any when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });
    });

    describe('strictDomLocalRefTypes', () => {
      beforeEach(() => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<input #ref>{{ref.does_not_exist}}',
            standalone: false,
          })
          class TestCmp {}

          @NgModule({
            declarations: [TestCmp],
          })
          class Module {}
        `,
        );
      });

      it('should infer the type of DOM references when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictDomLocalRefTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toEqual(
          `Property 'does_not_exist' does not exist on type 'HTMLInputElement'.`,
        );
      });

      it('should infer the type of DOM references when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toEqual(
          `Property 'does_not_exist' does not exist on type 'HTMLInputElement'.`,
        );
      });

      it('should let the type of DOM references be any when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
    });

    describe('strictAttributeTypes', () => {
      beforeEach(() => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<textarea dir disabled cols="3"></textarea>',
            standalone: false,
          })
          class TestCmp {}

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          class TestDir {
            @Input() disabled: boolean;
            @Input() cols: number;
          }

          @NgModule({
            declarations: [TestCmp, TestDir],
          })
          class Module {}
        `,
        );
      });

      it('should produce an error for text attributes when enabled', () => {
        env.tsconfig({
          fullTemplateTypeCheck: true,
          strictInputTypes: true,
          strictAttributeTypes: true,
        });

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
        env.write(
          'test.ts',
          `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: '<div (focus)="invalid; update($event)"></div>',
            standalone: false,
          })
          class TestCmp {
            update(data: string) {}
          }

          @NgModule({
            declarations: [TestCmp],
          })
          class Module {}
        `,
        );
      });

      it('should check expressions and infer type of $event when enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictDomEventTypes: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Argument of type 'FocusEvent' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should check expressions and infer type of $event when overall strictness is enabled', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
        expect(diags[1].messageText).toEqual(
          `Argument of type 'FocusEvent' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should check expressions but not infer type of $event when not enabled', () => {
        env.tsconfig({fullTemplateTypeCheck: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toEqual(
          `Property 'invalid' does not exist on type 'TestCmp'.`,
        );
      });
    });

    it('should check basic usage of NgIf', () => {
      env.write(
        'test.ts',
        `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngIf="user">{{user.name}}</div>',
      standalone: false,
    })
    class TestCmp {
      user: {name: string}|null;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `,
      );

      env.driveMain();
    });

    it('should check usage of NgIf with explicit non-null guard', () => {
      env.write(
        'test.ts',
        `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngIf="user !== null">{{user.name}}</div>',
      standalone: false,
    })
    class TestCmp {
      user: {name: string}|null;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `,
      );

      env.driveMain();
    });

    it('should check usage of NgIf when using "let" to capture $implicit context variable', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngIf="user; let u">{{u.name}}</div>',
      standalone: false,
    })
    class TestCmp {
      user: {name: string}|null|false;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `,
      );

      env.driveMain();
    });

    it('should check usage of NgIf when using "as" to capture `ngIf` context variable', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngIf="user as u">{{u.name}}</div>',
      standalone: false,
    })
    class TestCmp {
      user: {name: string}|null|false;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `,
      );

      env.driveMain();
    });

    it('should check basic usage of NgFor', () => {
      env.write(
        'test.ts',
        `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.name}}</div>',
      standalone: false,
    })
    class TestCmp {
      users: {name: string}[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `,
      );

      env.driveMain();
    });

    it('should report an error inside the NgFor template', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write(
        'test.ts',
        `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.does_not_exist}}</div>',
      standalone: false,
    })
    export class TestCmp {
      users: {name: string}[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    export class Module {}
    `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toEqual(
        `Property 'does_not_exist' does not exist on type '{ name: string; }'.`,
      );
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
    });

    it('should accept an NgFor iteration over an any-typed value', () => {
      env.write(
        'test.ts',
        `
    import {CommonModule} from '@angular/common';
    import {Component, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.name}}</div>',
      standalone: false,
    })
    export class TestCmp {
      users: any;
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    export class Module {}
    `,
      );

      env.driveMain();
    });

    it('should accept NgFor iteration over a QueryList', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule, QueryList} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngFor="let user of users">{{user.name}}</div>',
          standalone: false,
        })
        class TestCmp {
          users!: QueryList<{name: string}>;
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
    `,
      );

      env.driveMain();
    });

    // https://github.com/angular/angular/issues/40125
    it('should accept NgFor iteration when trackBy is used with a wider type', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        interface Base {
          id: string;
        }

        interface Derived extends Base {
          name: string;
        }

        @Component({
          selector: 'test',
          template: '<div *ngFor="let derived of derivedList; trackBy: trackByBase">{{derived.name}}</div>',
          standalone: false,
        })
        class TestCmp {
          derivedList!: Derived[];

          trackByBase(index: number, item: Base): string {
            return item.id;
          }
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
    `,
      );

      env.driveMain();
    });

    // https://github.com/angular/angular/issues/42609
    it('should accept NgFor iteration when trackBy is used with an `any` array', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        interface ItemType {
          id: string;
        }

        @Component({
          selector: 'test',
          template: '<div *ngFor="let item of anyList; trackBy: trackByBase">{{item.name}}</div>',
          standalone: false,
        })
        class TestCmp {
          anyList!: any[];

          trackByBase(index: number, item: ItemType): string {
            return item.id;
          }
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
    `,
      );

      env.driveMain();
    });

    it('should reject NgFor iteration when trackBy is incompatible with item type', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        interface ItemType {
          id: string;
        }

        interface UnrelatedType {
          name: string;
        }

        @Component({
          selector: 'test',
          template: '<div *ngFor="let item of unrelatedList; trackBy: trackByBase">{{item.name}}</div>',
          standalone: false,
        })
        class TestCmp {
          unrelatedList!: UnrelatedType[];

          trackByBase(index: number, item: ItemType): string {
            return item.id;
          }
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
    `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText).toContain(
        `is not assignable to type 'TrackByFunction<UnrelatedType>'.`,
      );
    });

    it('should infer the context of NgFor', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngFor="let user of users as all">{{all.length}}</div>',
          standalone: false,
        })
        class TestCmp {
          users: {name: string}[];
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should allow the implicit value of an NgFor to be invoked', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write(
        'test.ts',
        `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div *ngFor="let fn of functions">{{fn()}}</div>',
          standalone: false,
        })
        class TestCmp {
          functions = [() => 1, () => 2];
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        class Module {}
    `,
      );

      env.driveMain();
    });

    it('should infer the context of NgIf', () => {
      env.tsconfig({strictTemplates: true});
      env.write(
        'test.ts',
        `
        import {CommonModule} from '@angular/common';
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'test',
          template: '<div *ngIf="getUser(); let user">{{user.nonExistingProp}}</div>',
          standalone: false,
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
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(
        `Property 'nonExistingProp' does not exist on type '{ name: string; }'.`,
      );
    });

    it('should report an error with an unknown local ref target', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div #ref="unknownTarget"></div>',
          standalone: false,
        })
        class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
        })
        class Module {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`No directive found with exportAs 'unknownTarget'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('unknownTarget');
    });

    it('should treat an unknown local ref target as type any', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div #ref="unknownTarget">{{ use(ref) }}</div>',
          standalone: false,
        })
        class TestCmp {
          use(ref: string): string { return ref; }
        }

        @NgModule({
          declarations: [TestCmp],
        })
        class Module {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`No directive found with exportAs 'unknownTarget'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('unknownTarget');
    });

    it('should report an error with an unknown pipe', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test',
          template: '{{expr | unknown}}',
          standalone: false,
        })
        class TestCmp {
          expr = 3;
        }

        @NgModule({
          declarations: [TestCmp],
        })
        class Module {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`No pipe found with name 'unknown'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('unknown');
    });

    it('should report an error with an unknown pipe even if `fullTemplateTypeCheck` is disabled', () => {
      env.tsconfig({fullTemplateTypeCheck: false});
      env.write(
        'test.ts',
        `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: '{{expr | unknown}}',
            standalone: false,
          })
          class TestCmp {
            expr = 3;
          }

          @NgModule({
            declarations: [TestCmp],
          })
          class Module {}
        `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`No pipe found with name 'unknown'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('unknown');
    });

    it('should report an error with pipe bindings', () => {
      env.write(
        'test.ts',
        `
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
      \`,
      standalone: false,
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
    `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(4);

      const allErrors = [
        `'does_not_exist' does not exist on type '{ name: string; }'`,
        `Expected 2 arguments, but got 3.`,
        `Argument of type 'string' is not assignable to parameter of type 'number'`,
        `Argument of type '{ name: string; }' is not assignable to parameter of type 'unknown[]'`,
      ];

      for (const error of allErrors) {
        if (
          !diags.some(
            (diag) => ts.flattenDiagnosticMessageText(diag.messageText, '').indexOf(error) > -1,
          )
        ) {
          fail(`Expected a diagnostic message with text: ${error}`);
        }
      }
    });

    it('should constrain types using type parameter bounds', () => {
      env.tsconfig({
        fullTemplateTypeCheck: true,
        strictInputTypes: true,
        strictContextGenerics: true,
      });
      env.write(
        'test.ts',
        `
    import {CommonModule} from '@angular/common';
    import {Component, Input, NgModule} from '@angular/core';

    @Component({
      selector: 'test',
      template: '<div *ngFor="let user of users">{{user.does_not_exist}}</div>',
      standalone: false,
    })
    class TestCmp<T extends {name: string}> {
      @Input() users: T[];
    }

    @NgModule({
      declarations: [TestCmp],
      imports: [CommonModule],
    })
    class Module {}
    `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toEqual(`Property 'does_not_exist' does not exist on type 'T'.`);
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
    });

    describe('microsyntax variables', () => {
      beforeEach(() => {
        // Use the same template for both tests
        env.write(
          'test.ts',
          `
          import {CommonModule} from '@angular/common';
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: \`<div *ngFor="let foo of foos as foos">
              {{foo.name}} of {{foos.nonExistingProp}}
            </div>
            \`,
            standalone: false,
          })
          export class TestCmp {
            foos: {name: string}[];
          }

          @NgModule({
            declarations: [TestCmp],
            imports: [CommonModule],
          })
          export class Module {}
        `,
        );
      });

      it("should be treated as 'any' without strictTemplates", () => {
        env.tsconfig({fullTemplateTypeCheck: true, strictTemplates: false});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should be correctly inferred under strictTemplates', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Property 'nonExistingProp' does not exist on type '{ name: string; }[]'.`,
        );
      });
    });

    it('should properly type-check inherited directives', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write(
        'test.ts',
        `
    import {Component, Directive, Input, NgModule} from '@angular/core';

    @Directive()
    class AbstractDir {
      @Input() fromAbstract!: number;
    }

    @Directive({
      selector: '[base]',
      standalone: false,
    })
    class BaseDir extends AbstractDir {
      @Input() fromBase!: string;
    }

    @Directive({
      selector: '[child]',
      standalone: false,
    })
    class ChildDir extends BaseDir {
      @Input() fromChild!: boolean;
    }

    @Component({
      selector: 'test',
      template: '<div child [fromAbstract]="true" [fromBase]="3" [fromChild]="4"></div>',
      standalone: false,
    })
    class TestCmp {}

    @NgModule({
      declarations: [TestCmp, ChildDir],
    })
    class Module {}
    `,
      );

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

      env.write(
        'node_modules/external/index.d.ts',
        `
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
      `,
      );

      env.write(
        'test.ts',
        `
        import {Component, Directive, Input, NgModule} from '@angular/core';
        import {BaseDir, ExternalModule} from 'external';

        @Directive({
          selector: '[child]',
          standalone: false,
        })
        class ChildDir extends BaseDir {
          @Input() fromChild!: boolean;
        }

        @Component({
          selector: 'test',
          template: '<div child [fromAbstract]="true" [fromBase]="3" [fromChild]="4"></div>',
          standalone: false,
        })
        class TestCmp {}

        @NgModule({
          declarations: [TestCmp, ChildDir],
          imports: [ExternalModule],
        })
        class Module {}
      `,
      );

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
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'test',
          template: \`
            <div *ngIf="x as y">
              <button (click)="y = !y">Toggle</button>
            </div>
          \`,
          standalone: false,
        })
        export class TestCmp {
          x!: boolean;
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        export class Module {}
      `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toEqual(1);
      expect(getSourceCodeForDiagnostic(diags[0])).toEqual('y = !y');
    });

    it('should detect a duplicate variable declaration', () => {
      env.write(
        'test.ts',
        `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({
          selector: 'test',
          template: \`
            <div *ngFor="let i of items; let i = index">
              {{i}}
            </div>
          \`,
          standalone: false,
        })
        export class TestCmp {
          items!: string[];
        }

        @NgModule({
          declarations: [TestCmp],
          imports: [CommonModule],
        })
        export class Module {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toEqual(1);
      expect(diags[0].code).toEqual(ngErrorCode(ErrorCode.DUPLICATE_VARIABLE_DECLARATION));
      expect(getSourceCodeForDiagnostic(diags[0])).toContain('let i = index');
    });

    it('should still type-check when fileToModuleName aliasing is enabled, but alias exports are not in the .d.ts file', () => {
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
      env.write(
        'alpha.d.ts',
        `
          import {ɵɵDirectiveDeclaration, ɵɵNgModuleDeclaration} from '@angular/core';

          export declare class ExternalDir {
            input: string;
            static ɵdir: ɵɵDirectiveDeclaration<ExternalDir, '[test]', never, { 'input': "input" }, never, never>;
          }

          export declare class AlphaModule {
            static ɵmod: ɵɵNgModuleDeclaration<AlphaModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
          }
         `,
      );

      // 'beta' re-exports AlphaModule from alpha.
      env.write(
        'beta.d.ts',
        `
          import {ɵɵNgModuleDeclaration} from '@angular/core';
          import {AlphaModule} from './alpha';

          export declare class BetaModule {
            static ɵmod: ɵɵNgModuleDeclaration<BetaModule, never, never, [typeof AlphaModule]>;
          }
         `,
      );

      // The application imports BetaModule from beta, gaining visibility of ExternalDir from
      // alpha.
      env.write(
        'test.ts',
        `
          import {Component, NgModule} from '@angular/core';
          import {BetaModule} from './beta';

          @Component({
            selector: 'cmp',
            template: '<div test input="value"></div>',
            standalone: false,
          })
          export class Cmp {}

          @NgModule({
            declarations: [Cmp],
            imports: [BetaModule],
          })
          export class Module {}
         `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    describe('input coercion', () => {
      beforeEach(() => {
        env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
        env.write(
          'node_modules/@angular/material/index.d.ts',
          `
        import * as i0 from '@angular/core';

        export declare class MatInput {
          value: string;
          static ɵdir: i0.ɵɵDirectiveDeclaration<MatInput, '[matInput]', never, {'value': 'value'}, {}, never>;
          static ngAcceptInputType_value: string|number;
        }

        export declare class MatInputModule {
          static ɵmod: i0.ɵɵNgModuleDeclaration<MatInputModule, [typeof MatInput], never, [typeof MatInput]>;
        }
        `,
        );
      });

      function getDiagnosticLines(diag: ts.Diagnostic): string[] {
        const separator = '~~~~~';
        return ts.flattenDiagnosticMessageText(diag.messageText, separator).split(separator);
      }

      it('should coerce an input using a transform function if provided', () => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule} from '@angular/core';
          import {MatInputModule} from '@angular/material';

          @Component({
            selector: 'blah',
            template: '<input matInput [value]="someNumber">',
            standalone: false,
          })
          export class FooCmp {
            someNumber = 3;
          }

          @NgModule({
            declarations: [FooCmp],
            imports: [MatInputModule],
          })
          export class FooModule {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should apply coercion members of base classes', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input, NgModule} from '@angular/core';

          @Directive()
          export class BaseDir {
            @Input()
            value: string;

            static ngAcceptInputType_value: string|number;
          }

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          export class MyDir extends BaseDir {}

          @Component({
            selector: 'blah',
            template: '<input dir [value]="someNumber">',
            standalone: false,
          })
          export class FooCmp {
            someNumber = 3;
          }

          @NgModule({
            declarations: [MyDir, FooCmp],
          })
          export class FooModule {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should give an error if the binding expression type is not accepted by the coercion function', () => {
        env.write(
          'test.ts',
          `
            import {Component, NgModule, Input, Directive} from '@angular/core';
            import {MatInputModule} from '@angular/material';

            @Component({
              selector: 'blah',
              template: '<input matInput [value]="invalidType">',
              standalone: false,
            })
            export class FooCmp {
              invalidType = true;
            }

            @NgModule({
              declarations: [FooCmp],
              imports: [MatInputModule],
            })
            export class FooModule {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Type 'boolean' is not assignable to type 'string | number'.`,
        );
      });

      it('should give an error for undefined bindings into regular inputs when coercion members are present', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'test.ts',
          `
            import {Component, Directive, NgModule, Input} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<input dir [regular]="undefined" [coerced]="1">',
              standalone: false,
            })
            export class FooCmp {
              invalidType = true;
            }

            @Directive({
              selector: '[dir]',
              standalone: false,
            })
            export class CoercionDir {
              @Input() regular: string;
              @Input() coerced: boolean;

              static ngAcceptInputType_coerced: boolean|number;
            }

            @NgModule({
              declarations: [FooCmp, CoercionDir],
            })
            export class FooModule {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Type 'undefined' is not assignable to type 'string'.`);
      });

      it('should type check using the first parameter type of a simple transform function', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';

          export function toNumber(val: boolean | string) { return 1; }

          @Directive({selector: '[dir]', standalone: true})
          export class CoercionDir {
            @Input({transform: toNumber}) val!: number;
          }

          @Component({
            template: '<input dir [val]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = 1;
          }
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Type 'number' is not assignable to type 'string | boolean'.`,
        );
      });

      it('should type checking using the first parameter type of a simple inline transform function', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'test.ts',
          `
            import {Component, Directive, Input} from '@angular/core';

            @Directive({selector: '[dir]', standalone: true})
            export class CoercionDir {
              @Input({transform: (val: boolean | string) => 1}) val!: number;
            }

            @Component({
              template: '<input dir [val]="invalidType">',
              standalone: true,
              imports: [CoercionDir],
            })
            export class FooCmp {
              invalidType = 1;
            }
          `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Type 'number' is not assignable to type 'string | boolean'.`,
        );
      });

      it('should type check using the transform function specified in the `inputs` array', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';

          export function toNumber(val: boolean | string) { return 1; }

          @Directive({
            selector: '[dir]',
            standalone: true,
            inputs: [{
              name: 'val',
              transform: toNumber
            }]
          })
          export class CoercionDir {
            val!: number;
          }

          @Component({
            template: '<input dir [val]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = 1;
          }
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Type 'number' is not assignable to type 'string | boolean'.`,
        );
      });

      it('should type check using the first parameter type of a built-in function', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({selector: '[dir]', standalone: true})
          export class CoercionDir {
            @Input({transform: parseInt}) val!: number;
          }

          @Component({
            template: '<input dir [val]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = 1;
          }
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'string'.`);
      });

      it('should type check an imported transform function with a complex type', () => {
        env.tsconfig({strictTemplates: true});

        env.write(
          'types.ts',
          `
          export class ComplexObjValue {
            foo: boolean;
          }

          export interface ComplexObj {
            value: ComplexObjValue;
          }
        `,
        );

        env.write(
          'utils.ts',
          `
          import {ComplexObj} from './types';

          export type ToNumberType = string | boolean | ComplexObj;

          export function toNumber(val: ToNumberType) { return 1; }
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';
          import {toNumber} from './utils';

          @Directive({selector: '[dir]', standalone: true})
          export class CoercionDir {
            @Input({transform: toNumber}) val!: number;
          }

          @Component({
            template: '<input dir [val]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = {
              value: {
                foo: 'hello'
              }
            };
          }
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);

        expect(getDiagnosticLines(diags[0])).toEqual([
          `Type '{ value: { foo: string; }; }' is not assignable to type 'ToNumberType'.`,
          `  Type '{ value: { foo: string; }; }' is not assignable to type 'ComplexObj'.`,
          `    The types of 'value.foo' are incompatible between these types.`,
          `      Type 'string' is not assignable to type 'boolean'.`,
        ]);
      });

      it('should type check an imported transform function with a complex type from an external library', () => {
        env.tsconfig({strictTemplates: true});

        env.write(
          'node_modules/external/index.d.ts',
          `
              export class ExternalComplexObjValue {
                foo: boolean;
              }

              export interface ExternalComplexObj {
                value: ExternalComplexObjValue;
              }

              export type ExternalToNumberType = string | boolean | ExternalComplexObj;

              export declare function externalToNumber(val: ExternalToNumberType): number;
            `,
        );

        env.write(
          'test.ts',
          `
              import {Component, Directive, Input} from '@angular/core';
              import {externalToNumber} from 'external';

              @Directive({selector: '[dir]', standalone: true})
              export class CoercionDir {
                @Input({transform: externalToNumber}) val!: number;
              }

              @Component({
                template: '<input dir [val]="invalidType">',
                standalone: true,
                imports: [CoercionDir],
              })
              export class FooCmp {
                invalidType = {
                  value: {
                    foo: 'hello'
                  }
                };
              }
            `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);

        expect(getDiagnosticLines(diags[0])).toEqual([
          `Type '{ value: { foo: string; }; }' is not assignable to type 'ExternalToNumberType'.`,
          `  Type '{ value: { foo: string; }; }' is not assignable to type 'ExternalComplexObj'.`,
          `    The types of 'value.foo' are incompatible between these types.`,
          `      Type 'string' is not assignable to type 'boolean'.`,
        ]);
      });

      it('should type check an input with a generic transform type', () => {
        env.tsconfig({strictTemplates: true});

        env.write(
          'generics.ts',
          `
          export interface GenericWrapper<T> {
            value: T;
          }
        `,
        );

        env.write(
          'types.ts',
          `
          export class ExportedClass {
            foo: boolean;
          }
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';
          import {GenericWrapper} from './generics';
          import {ExportedClass} from './types';

          export interface LocalInterface {
            foo: string;
          }

          @Directive({selector: '[dir]', standalone: true})
          export class CoercionDir {
            @Input({transform: (val: GenericWrapper<ExportedClass>) => 1}) importedVal!: number;
            @Input({transform: (val: GenericWrapper<LocalInterface>) => 1}) localVal!: number;
          }

          @Component({
            template: '<input dir [importedVal]="invalidType" [localVal]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = {
              value: {
                foo: 1
              }
            };
          }
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);

        expect(getDiagnosticLines(diags[0])).toEqual([
          `Type '{ value: { foo: number; }; }' is not assignable to type 'GenericWrapper<ExportedClass>'.`,
          `  The types of 'value.foo' are incompatible between these types.`,
          `    Type 'number' is not assignable to type 'boolean'.`,
        ]);

        expect(getDiagnosticLines(diags[1])).toEqual([
          `Type '{ value: { foo: number; }; }' is not assignable to type 'GenericWrapper<LocalInterface>'.`,
          `  The types of 'value.foo' are incompatible between these types.`,
          `    Type 'number' is not assignable to type 'string'.`,
        ]);
      });

      it('should type check an input with a generic transform union type', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'types.ts',
          `
          interface GenericWrapper<T> {
            value: T;
          }

          export type CoercionType<T> = boolean | string | GenericWrapper<T>;
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';
          import {CoercionType} from './types';

          @Directive({selector: '[dir]', standalone: true})
          export class CoercionDir {
            @Input({transform: (val: CoercionType<string>) => 1}) val!: number;
          }

          @Component({
            template: '<input dir [val]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = {value: 1};
          }
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);

        expect(getDiagnosticLines(diags[0])).toEqual([
          `Type '{ value: number; }' is not assignable to type 'CoercionType<string>'.`,
          `  Type '{ value: number; }' is not assignable to type 'GenericWrapper<string>'.`,
          `    Types of property 'value' are incompatible.`,
          `      Type 'number' is not assignable to type 'string'.`,
        ]);
      });

      it('should type check an input with a generic transform type from an external library', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'node_modules/external/index.d.ts',
          `
          export interface ExternalGenericWrapper<T> {
            value: T;
          }

          export declare class ExternalClass {
            foo: boolean;
          }
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';
          import {ExternalGenericWrapper, ExternalClass} from 'external';

          @Directive({selector: '[dir]', standalone: true})
          export class CoercionDir {
            @Input({transform: (val: ExternalGenericWrapper<ExternalClass>) => 1}) val!: number;
          }

          @Component({
            template: '<input dir [val]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = {
              value: {
                foo: 1
              }
            };
          }
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getDiagnosticLines(diags[0])).toEqual([
          `Type '{ value: { foo: number; }; }' is not assignable to type 'ExternalGenericWrapper<ExternalClass>'.`,
          `  The types of 'value.foo' are incompatible between these types.`,
          `    Type 'number' is not assignable to type 'boolean'.`,
        ]);
      });

      it('should allow any value to be assigned if the transform function has no parameters', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'test.ts',
          `
              import {Component, Directive, Input} from '@angular/core';

              @Directive({selector: '[dir]', standalone: true})
              export class CoercionDir {
                @Input({transform: () => 1}) val!: number;
              }

              @Component({
                template: '<input dir [val]="invalidType">',
                standalone: true,
                imports: [CoercionDir],
              })
              export class FooCmp {
                invalidType = {};
              }
            `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should type check static inputs against the transform function type', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';

          export function toNumber(val: number | boolean) { return 1; }

          @Directive({selector: '[dir]', standalone: true})
          export class CoercionDir {
            @Input({transform: toNumber}) val!: number;
          }

          @Component({
            template: '<input dir val="test">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Type '"test"' is not assignable to type 'number | boolean'.`,
        );
      });

      it('should type check inputs with a transform function coming from a host directive', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'host-dir.ts',
          `
          import {Directive, Input} from '@angular/core';

          export interface HostDirType {
            value: number;
          }

          @Directive({standalone: true})
          export class HostDir {
            @Input({transform: (val: HostDirType) => 1}) val!: number;
          }
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';
          import {HostDir} from './host-dir';

          @Directive({
            selector: '[dir]',
            standalone: true,
            hostDirectives: [{
              directive: HostDir,
              inputs: ['val']
            }]
          })
          export class CoercionDir {}

          @Component({
            template: '<input dir [val]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = {
              value: 'hello'
            };
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getDiagnosticLines(diags[0])).toEqual([
          `Type '{ value: string; }' is not assignable to type 'HostDirType'.`,
          `  Types of property 'value' are incompatible.`,
          `    Type 'string' is not assignable to type 'number'.`,
        ]);
      });

      it('should type check inputs with a transform inherited from a parent class', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'host-dir.ts',
          `
          import {Directive, Input} from '@angular/core';

          export interface ParentType {
            value: number;
          }

          @Directive({standalone: true})
          export class Parent {
            @Input({transform: (val: ParentType) => 1}) val!: number;
          }
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';
          import {Parent} from './host-dir';

          @Directive({
            selector: '[dir]',
            standalone: true
          })
          export class CoercionDir extends Parent {}

          @Component({
            template: '<input dir [val]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = {
              value: 'hello'
            };
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getDiagnosticLines(diags[0])).toEqual([
          `Type '{ value: string; }' is not assignable to type 'ParentType'.`,
          `  Types of property 'value' are incompatible.`,
          `    Type 'string' is not assignable to type 'number'.`,
        ]);
      });

      it('should type check inputs with transforms referring to an ambient type', () => {
        env.tsconfig({strictTemplates: true});
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          export class ElementRef<T> {
            nativeElement: T;
          }

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class Dir {
            @Input({transform: (val: HTMLInputElement | ElementRef<HTMLInputElement>) => {
              return val instanceof ElementRef ? val.nativeElement.value : val.value;
            }})
            expectsInput: string | null = null;
          }

          @Component({
            standalone: true,
            imports: [Dir],
            template: '<div dir [expectsInput]="someDiv"></div>',
          })
          export class App {
            someDiv!: HTMLDivElement;
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getDiagnosticLines(diags[0]).join('\n')).toContain(
          `Type 'HTMLDivElement' is not assignable to type ` +
            `'HTMLInputElement | ElementRef<HTMLInputElement>'`,
        );
      });

      it('should type check a two-way binding to an input with a transform', () => {
        env.tsconfig({strictTemplates: true, _checkTwoWayBoundEvents: true});
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

          export function toNumber(val: boolean | string) { return 1; }

          @Directive({selector: '[dir]', standalone: true})
          export class CoercionDir {
            @Input({transform: toNumber}) val!: number;
            @Output() valChange = new EventEmitter<number>();
          }

          @Component({
            template: '<input dir [(val)]="invalidType">',
            standalone: true,
            imports: [CoercionDir],
          })
          export class FooCmp {
            invalidType = 1;
          }
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Type 'number' is not assignable to type 'string | boolean'.`,
        );
      });
    });

    describe('restricted inputs', () => {
      const directiveDeclaration = `
            @Directive({
              selector: '[dir]',
              standalone: false,
            })
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
              standalone: false,
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
              standalone: false,
            })
            export class FooCmp {
              value = "value";
            }

            ${directiveDeclaration}

            @Directive({
              selector: '[child-dir]',
              standalone: false,
            })
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
            strictInputAccessModifiers: true,
          });
        });

        it('should produce diagnostics for inputs which assign to readonly, private, and protected fields', () => {
          env.write('test.ts', correctTypeInputsToRestrictedFields);
          expectIllegalAssignmentErrors(env.driveDiagnostics());
        });

        it('should produce diagnostics for inputs which assign to readonly, private, and protected fields inherited from a base class', () => {
          env.write('test.ts', correctInputsToRestrictedFieldsFromBaseClass);
          expectIllegalAssignmentErrors(env.driveDiagnostics());
        });

        function expectIllegalAssignmentErrors(diags: ReadonlyArray<ts.Diagnostic>) {
          expect(diags.length).toBe(3);
          const actualMessages = diags.map((d) => d.messageText).sort();
          const expectedMessages = [
            `Property 'protectedField' is protected and only accessible within class 'TestDir' and its subclasses.`,
            `Property 'privateField' is private and only accessible within class 'TestDir'.`,
            `Cannot assign to 'readonlyField' because it is a read-only property.`,
          ].sort();
          expect(actualMessages).toEqual(expectedMessages);
        }

        it('should report invalid type assignment when field name is not a valid JS identifier', () => {
          env.write(
            'test.ts',
            `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [private-input.xs]="value"></div>',
              standalone: false,
            })
            export class FooCmp {
              value = 5;
            }

            @Directive({
              selector: '[dir]',
              standalone: false,
            })
            export class TestDir {
              @Input()
              private 'private-input.xs'!: string;
            }

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
          `,
          );
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].messageText).toEqual(`Type 'number' is not assignable to type 'string'.`);
        });
      });

      describe('with strict inputs', () => {
        beforeEach(() => {
          env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
        });

        it('should not produce diagnostics for correct inputs which assign to readonly, private, or protected fields', () => {
          env.write('test.ts', correctTypeInputsToRestrictedFields);
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(0);
        });

        it('should not produce diagnostics for correct inputs which assign to readonly, private, or protected fields inherited from a base class', () => {
          env.write('test.ts', correctInputsToRestrictedFieldsFromBaseClass);
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(0);
        });

        it('should produce diagnostics when assigning incorrect type to readonly, private, or protected fields', () => {
          env.write(
            'test.ts',
            `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [readonlyField]="value" [protectedField]="value" [privateField]="value"></div>',
              standalone: false,
            })
            export class FooCmp {
              value = 1;
            }

            ${directiveDeclaration}

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
        `,
          );
          const diags = env.driveDiagnostics();
          expect(diags.length).toBe(3);
          expect(diags[0].messageText).toEqual(`Type 'number' is not assignable to type 'string'.`);
          expect(diags[1].messageText).toEqual(`Type 'number' is not assignable to type 'string'.`);
          expect(diags[2].messageText).toEqual(`Type 'number' is not assignable to type 'string'.`);
        });
      });
    });

    it('should not produce diagnostics for undeclared inputs', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write(
        'test.ts',
        `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [undeclared]="value"></div>',
              standalone: false,
            })
            export class FooCmp {
              value = "value";
            }

            @Directive({
              selector: '[dir]',
              inputs: ['undeclared'],
              standalone: false,
            })
            export class TestDir {
            }

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
        `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should produce diagnostics for invalid expressions when assigned into an undeclared input', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write(
        'test.ts',
        `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [undeclared]="value"></div>',
              standalone: false,
            })
            export class FooCmp {
            }

            @Directive({
              selector: '[dir]',
              inputs: ['undeclared'],
              standalone: false,
            })
            export class TestDir {
            }

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
        `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Property 'value' does not exist on type 'FooCmp'.`);
    });

    it('should not produce diagnostics for undeclared inputs inherited from a base class', () => {
      env.tsconfig({fullTemplateTypeCheck: true, strictInputTypes: true});
      env.write(
        'test.ts',
        `
            import {Component, NgModule, Input, Directive} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<div dir [undeclaredBase]="value"></div>',
              standalone: false,
            })
            export class FooCmp {
              value = "value";
            }

            @Directive({
              inputs: ['undeclaredBase'],
              standalone: false,
            })
            export class BaseDir {
            }

            @Directive({
              selector: '[dir]',
              standalone: false,
            })
            export class TestDir extends BaseDir {
            }

            @NgModule({
              declarations: [FooCmp, TestDir],
            })
            export class FooModule {}
        `,
      );
      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    describe('template literals', () => {
      it('should treat template literals as strings', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: 'Result: {{getValue(\`foo\`)}}',
            standalone: true,
          })
          export class Main {
            getValue(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        );
      });

      it('should check interpolations inside template literals', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '{{\`Hello \${getName(123)}\`}}',
            standalone: true,
          })
          export class Main {
            getName(value: string) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });
    });

    describe('tagged template literals', () => {
      function getDiagnosticLines(diag: ts.Diagnostic): string[] {
        const separator = '~~~~~';
        return ts.flattenDiagnosticMessageText(diag.messageText, separator).split(separator);
      }

      it('should not produce diagnostics for valid tagged literals', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: 'Result: {{ tag\`foo\` }} {{ tag\`foo \${"bar"}\` }}',
            standalone: true,
          })
          export class Main {
            tag(strings: TemplateStringsArray, ...args: string[]) {
              return '';
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should treat tagged template literals as strings', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: 'Result: {{ getValue(tag\`foo\`) }}',
            standalone: true,
          })
          export class Main {
            getValue(value: number) {
              return value;
            }
            tag(strings: TemplateStringsArray, ...args: string[]) {
              return '';
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getDiagnosticLines(diags[0])).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should produce diagnostics for invalid tag function', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: 'Result: {{ null\`foo\` }}',
            standalone: true,
          })
          export class Main { }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getDiagnosticLines(diags[0])).toEqual([
          `This expression is not callable.`,
          `  Type 'null' has no call signatures.`,
        ]);
      });

      it('should produce diagnostics for invalid tag function arguments', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: 'Result: {{ tag\`foo\${"str"}\` }}',
            standalone: true,
          })
          export class Main {
            tag(strings: TemplateStringsArray, arg1: number, arg2: string) {
              return '';
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getDiagnosticLines(diags[0])).toEqual(['Expected 3 arguments, but got 2.']);
      });
    });

    describe('legacy schema checking with the DOM schema', () => {
      beforeEach(() => {
        env.tsconfig({fullTemplateTypeCheck: false});
      });

      it('should check for unknown elements', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<foo>test</foo>',
          standalone: false,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`'foo' is not a known element:
1. If 'foo' is an Angular component, then verify that it is part of this module.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`);
      });

      it('should check for unknown elements in standalone components', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<foo>test</foo>',
          standalone: true,
        })
        export class FooCmp {}
        @NgModule({
          imports: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`'foo' is not a known element:
1. If 'foo' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component.`);
      });

      it('should check for unknown properties in standalone components', () => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule} from '@angular/core';
          @Component({
            selector: 'my-comp',
            template: '...',
            standalone: true,
          })
          export class MyComp {}

          @Component({
            selector: 'blah',
            imports: [MyComp],
            template: '<my-comp [foo]="true"></my-comp>',
            standalone: true,
          })
          export class FooCmp {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText)
          .toMatch(`Can't bind to 'foo' since it isn't a known property of 'my-comp'.
1. If 'my-comp' is an Angular component and it has 'foo' input, then verify that it is included in the '@Component.imports' of this component.
2. If 'my-comp' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.
3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component.`);
      });

      it('should have a descriptive error for unknown elements that contain a dash', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<my-foo>test</my-foo>',
          standalone: false,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`'my-foo' is not a known element:
1. If 'my-foo' is an Angular component, then verify that it is part of this module.
2. If 'my-foo' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.`);
      });

      it('should have a descriptive error for unknown elements that contain a dash in standalone components', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<my-foo>test</my-foo>',
          standalone: true,
        })
        export class FooCmp {}
        @NgModule({
          imports: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`'my-foo' is not a known element:
1. If 'my-foo' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'my-foo' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.`);
      });

      it('should check for unknown properties', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<div [foo]="1">test</div>',
          standalone: false,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Can't bind to 'foo' since it isn't a known property of 'div'.`,
        );
      });

      it('should have a descriptive error for unknown properties with an "ng-" prefix', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<div [foo]="1">test</div>',
          standalone: false,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Can't bind to 'foo' since it isn't a known property of 'div'.`,
        );
      });

      it('should convert property names when binding special properties', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        @Component({
          selector: 'blah',
          template: '<label [for]="test">',
          standalone: false,
        })
        export class FooCmp {
          test: string = 'test';
        }
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        // Should not be an error to bind [for] of <label>, even though the actual property in the
        // DOM schema.
        expect(diags.length).toBe(0);
      });

      it('should produce diagnostics for custom-elements-style elements when not using the CUSTOM_ELEMENTS_SCHEMA', () => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule} from '@angular/core';
          @Component({
            selector: 'blah',
            template: '<custom-element [foo]="1">test</custom-element>',
            standalone: false,
          })
          export class FooCmp {}
          @NgModule({
            declarations: [FooCmp],
          })
          export class FooModule {}
      `,
        );
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

      it('should not produce diagnostics for custom-elements-style elements when using the CUSTOM_ELEMENTS_SCHEMA', () => {
        env.write(
          'test.ts',
          `
            import {Component, NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

            @Component({
              selector: 'blah',
              template: '<custom-element [foo]="1">test</custom-element>',
              standalone: false,
            })
            export class FooCmp {}

            @NgModule({
              declarations: [FooCmp],
              schemas: [CUSTOM_ELEMENTS_SCHEMA],
            })
            export class FooModule {}
          `,
        );
        const diags = env.driveDiagnostics();
        expect(diags).toEqual([]);
      });

      it('should not produce diagnostics when using the NO_ERRORS_SCHEMA', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';

        @Component({
          selector: 'blah',
          template: '<foo [bar]="1"></foo>',
          standalone: false,
        })
        export class FooCmp {}

        @NgModule({
          declarations: [FooCmp],
          schemas: [NO_ERRORS_SCHEMA],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags).toEqual([]);
      });

      it('should allow HTML elements inside SVG foreignObject', () => {
        env.write(
          'test.ts',
          `
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
          standalone: false,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should allow HTML elements without explicit namespace inside SVG foreignObject', () => {
        env.write(
          'test.ts',
          `
        import {Component, NgModule} from '@angular/core';
        @Component({
          template: \`
            <svg>
              <foreignObject>
                <div>Hello</div>
              </foreignObject>
            </svg>
          \`,
          standalone: false,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should check for unknown elements inside an SVG foreignObject', () => {
        env.write(
          'test.ts',
          `
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
          standalone: false,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`'foo' is not a known element:
1. If 'foo' is an Angular component, then verify that it is part of this module.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`);
      });

      it('should check for unknown elements without explicit namespace inside an SVG foreignObject', () => {
        env.write(
          'test.ts',
          `
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
          standalone: false,
        })
        export class FooCmp {}
        @NgModule({
          declarations: [FooCmp],
        })
        export class FooModule {}
      `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`'foo' is not a known element:
1. If 'foo' is an Angular component, then verify that it is part of this module.
2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`);
      });

      it('should allow math elements', () => {
        env.write(
          'test.ts',
          `
            import {Component} from '@angular/core';
            @Component({
              template: \`
                <math>
                  <mfrac>
                    <mn>1</mn>
                    <msqrt>
                      <mn>2</mn>
                    </msqrt>
                  </mfrac>
                </math>
              \`,
              standalone: true,
            })
            export class MathCmp {}
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
    });

    // Test both sync and async compilations, see https://github.com/angular/angular/issues/32538
    ['sync', 'async'].forEach((mode) => {
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
          env.write(
            'test.ts',
            `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'test',
            template: \`<p>
              {{user.does_not_exist}}
            </p>\`,
            standalone: false,
          })
          export class TestCmp {
            user: {name: string}[];
          }`,
          );

          const diags = await driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].file!.fileName).toBe(_('/test.ts'));
          expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
        });

        it('should be correct for indirect templates', async () => {
          env.write(
            'test.ts',
            `
          import {Component, NgModule} from '@angular/core';

          const TEMPLATE = \`<p>
            {{user.does_not_exist}}
          </p>\`;

          @Component({
            selector: 'test',
            template: TEMPLATE,
            standalone: false,
          })
          export class TestCmp {
            user: {name: string}[];
          }`,
          );

          const diags = await driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].file!.fileName).toBe(_('/test.ts') + ' (TestCmp template)');
          expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
          expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0])).toBe('TEMPLATE');
        });

        it('should be correct for external templates', async () => {
          env.write(
            'template.html',
            `<p>
          {{user.does_not_exist}}
        </p>`,
          );
          env.write(
            'test.ts',
            `
          import {Component, NgModule} from '@angular/core';


          @Component({
            selector: 'test',
            templateUrl: './template.html',
            standalone: false,
          })
          export class TestCmp {
            user: {name: string}[];
          }`,
          );

          const diags = await driveDiagnostics();
          expect(diags.length).toBe(1);
          expect(diags[0].file!.fileName).toBe(_('/template.html'));
          expect(getSourceCodeForDiagnostic(diags[0])).toBe('does_not_exist');
          expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0])).toBe(
            `'./template.html'`,
          );
        });
      });
    });

    describe('option compatibility verification', () => {
      beforeEach(() => env.write('index.ts', `export const a = 1;`));

      it('should error if "fullTemplateTypeCheck" is false when "strictTemplates" is true', () => {
        env.tsconfig({fullTemplateTypeCheck: false, strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          'Angular compiler option "strictTemplates" is enabled, however "fullTemplateTypeCheck" is disabled.',
        );
      });
      it('should not error if "fullTemplateTypeCheck" is false when "strictTemplates" is false', () => {
        env.tsconfig({fullTemplateTypeCheck: false, strictTemplates: false});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
      it('should not error if "fullTemplateTypeCheck" is not set when "strictTemplates" is true', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
      it('should not error if "fullTemplateTypeCheck" is true set when "strictTemplates" is true', () => {
        env.tsconfig({strictTemplates: true});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should error if "strictTemplates" is false when "extendedDiagnostics" is configured', () => {
        env.tsconfig({strictTemplates: false, extendedDiagnostics: {}});

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          'Angular compiler option "extendedDiagnostics" is configured, however "strictTemplates" is disabled.',
        );
      });
      it('should not error if "strictTemplates" is true when "extendedDiagnostics" is configured', () => {
        env.tsconfig({strictTemplates: true, extendedDiagnostics: {}});

        const diags = env.driveDiagnostics();
        expect(diags).toEqual([]);
      });
      it('should not error if "strictTemplates" is false when "extendedDiagnostics" is not configured', () => {
        env.tsconfig({strictTemplates: false});

        const diags = env.driveDiagnostics();
        expect(diags).toEqual([]);
      });

      it('should error if "extendedDiagnostics.defaultCategory" is set to an unknown value', () => {
        env.tsconfig({
          extendedDiagnostics: {
            defaultCategory: 'does-not-exist',
          },
        });

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          'Angular compiler option "extendedDiagnostics.defaultCategory" has an unknown diagnostic category: "does-not-exist".',
        );
        expect(diags[0].messageText).toContain(
          `
Allowed diagnostic categories are:
warning
error
suppress
        `.trim(),
        );
      });
      it('should not error if "extendedDiagnostics.defaultCategory" is set to a known value', () => {
        env.tsconfig({
          extendedDiagnostics: {
            defaultCategory: DiagnosticCategoryLabel.Error,
          },
        });

        const diags = env.driveDiagnostics();
        expect(diags).toEqual([]);
      });

      it('should error if "extendedDiagnostics.checks" contains an unknown check', () => {
        env.tsconfig({
          extendedDiagnostics: {
            checks: {
              doesNotExist: DiagnosticCategoryLabel.Error,
            },
          },
        });

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          'Angular compiler option "extendedDiagnostics.checks" has an unknown check: "doesNotExist".',
        );
      });
      it('should not error if "extendedDiagnostics.checks" contains all known checks', () => {
        env.tsconfig({
          extendedDiagnostics: {
            checks: {
              [invalidBananaInBoxFactory.name]: DiagnosticCategoryLabel.Error,
            },
          },
        });

        const diags = env.driveDiagnostics();
        expect(diags).toEqual([]);
      });

      it('should error if "extendedDiagnostics.checks" contains an unknown diagnostic category', () => {
        env.tsconfig({
          extendedDiagnostics: {
            checks: {
              [invalidBananaInBoxFactory.name]: 'does-not-exist',
            },
          },
        });

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          `Angular compiler option "extendedDiagnostics.checks['${invalidBananaInBoxFactory.name}']" has an unknown diagnostic category: "does-not-exist".`,
        );
        expect(diags[0].messageText).toContain(
          `
Allowed diagnostic categories are:
warning
error
suppress
        `.trim(),
        );
      });
      it('should not error if "extendedDiagnostics.checks" contains all known diagnostic categories', () => {
        env.tsconfig({
          extendedDiagnostics: {
            checks: {
              [invalidBananaInBoxFactory.name]: DiagnosticCategoryLabel.Error,
            },
          },
        });

        const diags = env.driveDiagnostics();
        expect(diags).toEqual([]);
      });
    });

    describe('stability', () => {
      beforeEach(() => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'test-cmp',
            template: '{{expr}}'
          })
          export class TestCmp {
            expr = 'string';
          }
        `,
        );
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
        expect(sf.referencedFiles.map((ref) => ref.fileName)).toEqual([]);
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

    describe('host directives', () => {
      beforeEach(() => {
        env.tsconfig({strictTemplates: true});
      });

      it('should check bindings to host directive inputs', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Directive({
            standalone: true,
          })
          class HostDir {
            @Input() input: number;
            @Input() otherInput: string;
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{directive: HostDir, inputs: ['input', 'otherInput: alias']}],
            standalone: false,
          })
          class Dir {}

          @Component({
            selector: 'test',
            template: '<div dir [input]="person.name" [alias]="person.age"></div>',
            standalone: false,
          })
          class TestCmp {
            person: {
              name: string;
              age: number;
            };
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        expect(messages).toEqual([
          `Type 'string' is not assignable to type 'number'.`,
          `Type 'number' is not assignable to type 'string'.`,
        ]);
      });

      it('should check bindings to host directive outputs', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          class HostDir {
            @Output() stringEvent = new EventEmitter<string>();
            @Output() numberEvent = new EventEmitter<number>();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [
              {directive: HostDir, outputs: ['stringEvent', 'numberEvent: numberAlias']}
            ],
            standalone: false,
          })
          class Dir {}

          @Component({
            selector: 'test',
            template: \`
              <div
                dir
                (numberAlias)="handleStringEvent($event)"
                (stringEvent)="handleNumberEvent($event)"></div>
            \`,
            standalone: false,
          })
          class TestCmp {
            handleStringEvent(event: string): void {}
            handleNumberEvent(event: number): void {}
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        expect(messages).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should not pick up host directive inputs/outputs that have not been exposed', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input, Output} from '@angular/core';

          @Directive({
            standalone: true,
          })
          class HostDir {
            @Input() input: number;
            @Output() output: string;
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [HostDir],
            standalone: false,
          })
          class Dir {}

          @Component({
            selector: 'test',
            template: '<div dir [input]="person.name" (output)="handleStringEvent($event)"></div>',
            standalone: false,
          })
          class TestCmp {
            person: {
              name: string;
            };
            handleStringEvent(event: string): void {}
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        // These messages are expected to refer to the native
        // typings since the inputs/outputs haven't been exposed.
        expect(messages).toEqual([
          `Argument of type 'Event' is not assignable to parameter of type 'string'.`,
          `Can't bind to 'input' since it isn't a known property of 'div'.`,
        ]);
      });

      it('should check references to host directives', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
            exportAs: 'hostDir',
          })
          class HostDir {}

          @Directive({
            selector: '[dir]',
            hostDirectives: [HostDir],
            standalone: false,
          })
          class Dir {}

          @Component({
            selector: 'test',
            template: '<div dir #hostDir="hostDir">{{ render(hostDir) }}</div>',
            standalone: false,
          })
          class TestCmp {
            render(input: string): string { return input; }
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        expect(messages).toEqual([
          `Argument of type 'HostDir' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should check bindings to inherited host directive inputs', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Directive({
            standalone: true
          })
          class HostDirParent {
            @Input() input: number;
            @Input() otherInput: string;
          }

          @Directive({
            standalone: true,
          })
          class HostDir extends HostDirParent {}

          @Directive({
            selector: '[dir]',
            hostDirectives: [{directive: HostDir, inputs: ['input', 'otherInput: alias']}],
            standalone: false,
          })
          class Dir {}

          @Component({
            selector: 'test',
            template: '<div dir [input]="person.name" [alias]="person.age"></div>',
            standalone: false,
          })
          class TestCmp {
            person: {
              name: string;
              age: number;
            };
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        expect(messages).toEqual([
          `Type 'string' is not assignable to type 'number'.`,
          `Type 'number' is not assignable to type 'string'.`,
        ]);
      });

      it('should check bindings to inherited host directive outputs', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true
          })
          class HostDirParent {
            @Output() stringEvent = new EventEmitter<string>();
            @Output() numberEvent = new EventEmitter<number>();
          }

          @Directive({
            standalone: true,
          })
          class HostDir extends HostDirParent {}

          @Directive({
            selector: '[dir]',
            hostDirectives: [
              {directive: HostDir, outputs: ['stringEvent', 'numberEvent: numberAlias']}
            ],
            standalone: false,
          })
          class Dir {}

          @Component({
            selector: 'test',
            template: \`
              <div
                dir
                (numberAlias)="handleStringEvent($event)"
                (stringEvent)="handleNumberEvent($event)"></div>
            \`,
            standalone: false,
          })
          class TestCmp {
            handleStringEvent(event: string): void {}
            handleNumberEvent(event: number): void {}
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        expect(messages).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should check bindings to aliased host directive inputs', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Directive({
            standalone: true,
          })
          class HostDir {
            @Input('ownInputAlias') input: number;
            @Input('ownOtherInputAlias') otherInput: string;
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [{directive: HostDir, inputs: ['ownInputAlias', 'ownOtherInputAlias: customAlias']}],
            standalone: false,
          })
          class Dir {}

          @Component({
            selector: 'test',
            template: '<div dir [ownInputAlias]="person.name" [customAlias]="person.age"></div>',
            standalone: false,
          })
          class TestCmp {
            person: {
              name: string;
              age: number;
            };
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        expect(messages).toEqual([
          `Type 'string' is not assignable to type 'number'.`,
          `Type 'number' is not assignable to type 'string'.`,
        ]);
      });

      it('should check bindings to aliased host directive outputs', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          class HostDir {
            @Output('ownStringAlias') stringEvent = new EventEmitter<string>();
            @Output('ownNumberAlias') numberEvent = new EventEmitter<number>();
          }

          @Directive({
            selector: '[dir]',
            hostDirectives: [
              {directive: HostDir, outputs: ['ownStringAlias', 'ownNumberAlias: customNumberAlias']}
            ],
            standalone: false,
          })
          class Dir {}

          @Component({
            selector: 'test',
            template: \`
              <div
                dir
                (customNumberAlias)="handleStringEvent($event)"
                (ownStringAlias)="handleNumberEvent($event)"></div>
            \`,
            standalone: false,
          })
          class TestCmp {
            handleStringEvent(event: string): void {}
            handleNumberEvent(event: number): void {}
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        expect(messages).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('generates diagnostic when the library does not export the host directive', () => {
        env.tsconfig({
          paths: {'post': ['dist/post']},
          strictTemplates: true,
          _enableTemplateTypeChecker: true,
        });

        // export post module and component but not the host directive. This is not valid. We won't
        // be able to import the host directive for template type checking.
        env.write(
          'dist/post/index.d.ts',
          `
      export { PostComponent, PostModule } from './lib/post.component';
    `,
        );

        env.write(
          'dist/post/lib/post.component.d.ts',
          `
      import * as i0 from "@angular/core";
      export declare class HostBindDirective {
          static ɵdir: i0.ɵɵDirectiveDeclaration<HostBindDirective, never, never, {}, {}, never, never, true, never>;
      }
      export declare class PostComponent {
          static ɵcmp: i0.ɵɵComponentDeclaration<PostComponent, "lib-post", never, {}, {}, never, never, false, [{ directive: typeof HostBindDirective; inputs: {}; outputs: {}; }]>;
      }
      export declare class PostModule {
          static ɵmod: i0.ɵɵNgModuleDeclaration<PostModule, [typeof PostComponent], never, [typeof PostComponent]>;
          static ɵinj: i0.ɵɵInjectorDeclaration<PostModule>;
      }
      `,
        );
        env.write(
          'test.ts',
          `
      import {Component} from '@angular/core';
      import {PostModule} from 'post';

      @Component({
        template: '<lib-post />',
        imports: [PostModule],
        standalone: true,
      })
      export class Main { }
       `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '')).toContain(
          'Unable to import symbol HostBindDirective',
        );
      });

      it('should check bindings to inherited host directive inputs', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Input} from '@angular/core';

          @Directive({
            standalone: true,
          })
          class HostDir {
            @Input() input: number;
            @Input() otherInput: string;
          }

          @Directive({
            hostDirectives: [{directive: HostDir, inputs: ['input', 'otherInput: alias']}],
            standalone: false,
          })
          class Parent {}

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          class Dir extends Parent {}

          @Component({
            selector: 'test',
            template: '<div dir [input]="person.name" [alias]="person.age"></div>',
            standalone: false,
          })
          class TestCmp {
            person: {
              name: string;
              age: number;
            };
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        expect(messages).toEqual([
          `Type 'string' is not assignable to type 'number'.`,
          `Type 'number' is not assignable to type 'string'.`,
        ]);
      });

      it('should check bindings to inherited host directive outputs', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          class HostDir {
            @Output() stringEvent = new EventEmitter<string>();
            @Output() numberEvent = new EventEmitter<number>();
          }

          @Directive({
            hostDirectives: [
              {directive: HostDir, outputs: ['stringEvent', 'numberEvent: numberAlias']}
            ],
            standalone: false,
          })
          class Parent {}

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          class Dir extends Parent {}

          @Component({
            selector: 'test',
            template: \`
              <div
                dir
                (numberAlias)="handleStringEvent($event)"
                (stringEvent)="handleNumberEvent($event)"></div>
            \`,
            standalone: false,
          })
          class TestCmp {
            handleStringEvent(event: string): void {}
            handleNumberEvent(event: number): void {}
          }

          @NgModule({
            declarations: [TestCmp, Dir],
          })
          class Module {}
        `,
        );

        const messages = env.driveDiagnostics().map((d) => d.messageText);

        expect(messages).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });
    });

    describe('deferred blocks', () => {
      it('should check bindings inside deferred blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @defer {
                {{does_not_exist_main}}
              } @placeholder {
                {{does_not_exist_placeholder}}
              } @loading {
                {{does_not_exist_loading}}
              } @error {
                {{does_not_exist_error}}
              }
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist_main' does not exist on type 'Main'.`,
          `Property 'does_not_exist_placeholder' does not exist on type 'Main'.`,
          `Property 'does_not_exist_loading' does not exist on type 'Main'.`,
          `Property 'does_not_exist_error' does not exist on type 'Main'.`,
        ]);
      });

      it('should check `when` trigger expression', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @defer (when isVisible() || does_not_exist) {Hello}
            \`,
            standalone: true,
          })
          export class Main {
            isVisible() {
              return true;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist' does not exist on type 'Main'.`,
        ]);
      });

      it('should check `prefetch when` trigger expression', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @defer (prefetch when isVisible() || does_not_exist) {Hello}
            \`,
            standalone: true,
          })
          export class Main {
            isVisible() {
              return true;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist' does not exist on type 'Main'.`,
        ]);
      });

      it('should check `hydrate when` trigger expression', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @defer (hydrate when isVisible() || does_not_exist) {Hello}
            \`,
            standalone: true,
          })
          export class Main {
            isVisible() {
              return true;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist' does not exist on type 'Main'.`,
        ]);
      });

      it('should report if a deferred trigger reference does not exist', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @defer (on viewport(does_not_exist)) {Hello}
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '')).toContain(
          'Trigger cannot find reference "does_not_exist".',
        );
      });

      it('should report if a deferred trigger reference is in a different embedded view', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @defer (on viewport(trigger)) {Hello}

              <ng-template>
                <button #trigger></button>
              </ng-template>
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '')).toContain(
          'Trigger cannot find reference "trigger".',
        );
      });
    });

    describe('conditional blocks', () => {
      it('should check bindings inside if blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (expr) {
                {{does_not_exist_main}}
              } @else if (expr1) {
                {{does_not_exist_one}}
              } @else if (expr2) {
                {{does_not_exist_two}}
              } @else {
                {{does_not_exist_else}}
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr = false;
            expr1 = false;
            expr2 = false;
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist_main' does not exist on type 'Main'.`,
          `Property 'does_not_exist_one' does not exist on type 'Main'.`,
          `Property 'does_not_exist_two' does not exist on type 'Main'.`,
          `Property 'does_not_exist_else' does not exist on type 'Main'.`,
        ]);
      });

      it('should check bindings of if block expressions', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (does_not_exist_main) {
                main
              } @else if (does_not_exist_one) {
                one
              } @else if (does_not_exist_two) {
                two
              }
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist_main' does not exist on type 'Main'.`,
          `Property 'does_not_exist_one' does not exist on type 'Main'.`,
          `Property 'does_not_exist_two' does not exist on type 'Main'.`,
        ]);
      });

      it('should check aliased if block expression', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`@if (value === 1; as alias) {
              {{acceptsNumber(alias)}}
            }\`,
            standalone: true,
          })
          export class Main {
            value = 1;

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow the type of the if alias', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`@if (value; as alias) {
              {{acceptsNumber(alias)}}
            }\`,
            standalone: true,
          })
          export class Main {
            value: 'one' | 0 = 0;

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow the type of the if alias used in a listener', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`@if (value; as alias) {
              <button (click)="acceptsNumber(alias)"></button>
            }\`,
            standalone: true,
          })
          export class Main {
            value: 'one' | 0 = 0;

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow types inside the expression, even if aliased', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            template: \`@if (value; as alias) {
              {{ value.length }}
            }\`,
            standalone: true,
          })
          export class Main {
            value!: string|undefined;
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should narrow signal reads when aliased', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            template: \`@if (value(); as alias) {
              {{ alias.length }}
            }\`,
            standalone: true,
          })
          export class Main {
            value!: () => string|undefined;
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not expose the aliased expression outside of the current block', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (value === 0; as alias) {
                main block
              } @else {
                {{alias}}
              }
            \`,
            standalone: true,
          })
          export class Main {
            value = 1;
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'alias' does not exist on type 'Main'.`,
        ]);
      });

      it('should expose alias to nested if blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (value === 1; as alias) {
                @if (alias) {
                  {{acceptsNumber(alias)}}
                }
              }
            \`,
            standalone: true,
          })
          export class Main {
            value = 1;

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow the type inside if blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (expr === 1) {
                main block
              } @else {
                {{acceptsNumber(expr)}}
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr: 'hello' | 1 = 'hello';

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow the type in listeners inside if blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (expr === 'hello') {
                <button (click)="acceptsNumber(expr)"></button>
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr: 'hello' | 1 = 'hello';

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow the type in listeners inside else if blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (expr === 1) {
                One
              } @else if (expr === 'hello') {
                <button (click)="acceptsNumber(expr)"></button>
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr: 'hello' | 1 | 2 = 'hello';

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow the type in listeners inside else blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (expr === 1) {
                One
              } @else if (expr === 2) {
                Two
              } @else {
                <button (click)="acceptsNumber(expr)"></button>
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr: 'hello' | 1 | 2 = 'hello';

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should produce a single diagnostic for an invalid expression of an if block containing a event listener', () => {
        env.write(
          'test.ts',
          `
           import {Component} from '@angular/core';

           @Component({
             template: \`
               @if (does_not_exist) {
                 <button (click)="test()"></button>
               }
             \`,
             standalone: true,
           })
           export class Main {
             test() {}
           }
         `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist' does not exist on type 'Main'.`,
        ]);
      });

      it('should check bindings inside switch blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @switch (expr) {
                @case (1) {
                  {{does_not_exist_one}}
                }
                @case (2) {
                  {{does_not_exist_two}}
                }
                @default {
                  {{does_not_exist_default}}
                }
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr: any;
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist_one' does not exist on type 'Main'.`,
          `Property 'does_not_exist_two' does not exist on type 'Main'.`,
          `Property 'does_not_exist_default' does not exist on type 'Main'.`,
        ]);
      });

      it('should check expressions of switch blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @switch (does_not_exist_main) {
                @case (does_not_exist_case) {
                  One
                }
              }
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist_main' does not exist on type 'Main'.`,
          `Property 'does_not_exist_case' does not exist on type 'Main'.`,
        ]);
      });

      it('should only produce one diagnostic if the switch expression has an error', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @switch (does_not_exist_main) {
                @case (1) {
                  One
                }

                @case (2) {
                  Two
                }
              }
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist_main' does not exist on type 'Main'.`,
        ]);
      });

      it('should only produce one diagnostic if the case expression has an error and it contains an event listener', () => {
        env.write(
          'test.ts',
          `
              import {Component} from '@angular/core';

              @Component({
                template: \`
                  @switch (value) {
                    @case (does_not_exist) {
                      <button (click)="test()"></button>
                    }

                    @default {
                      <button (click)="test()"></button>
                    }
                  }
                \`,
                standalone: true,
              })
              export class Main {
                value = 'zero';
                test() {}
              }
            `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist' does not exist on type 'Main'.`,
        ]);
      });

      it('should check a switch block that only has a default case', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @switch (expr) {
                @default {
                  {{acceptsNumber(expr)}}
                }
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr: 'hello' | 1 = 'hello';

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string | number' is not assignable to parameter of type 'number'.  Type 'string' is not assignable to type 'number'.`,
        ]);
      });

      it('should narrow the type inside switch cases', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @switch (expr) {
                @case (1) {
                  One
                }
                @default {
                  {{acceptsNumber(expr)}}
                }
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr: 'hello' | 1 = 'hello';

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow the switch type based on a field', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          export interface Base {
            type: 'foo' | 'bar'
          }

          export interface Foo extends Base {
            type: 'foo';
            foo: string;
          }

          export interface Bar extends Base {
            type: 'bar';
            bar: number;
          }

          @Component({
            template: \`
              @switch (value.type) {
                @case ('foo') {
                  {{ acceptsNumber(value.foo) }}
                }
              }
            \`,
            standalone: true,
          })
          export class Main {
            value: Foo | Bar = { type: 'foo', foo: 'foo' };

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should produce a diagnostic if @switch and @case have different types', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @switch (expr) {
                @case (1) {
                  {{expr}}
                }
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr = true;
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Type 'number' is not comparable to type 'boolean'.`,
        ]);
      });

      it('should narrow the type in listener inside switch cases with expressions', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            template: \`
              @switch (expr) {
                @case ('hello') {
                  <button (click)="acceptsNumber(expr)"></button>
                }
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr: 'hello' | 1 = 'hello';
            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow the type in listener inside switch default case', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          @Component({
            template: \`
              @switch (expr) {
                @case (1) {
                  One
                }
                @case (2) {
                  Two
                }
                @default {
                  <button (click)="acceptsNumber(expr)"></button>
                }
              }
            \`,
            standalone: true,
          })
          export class Main {
            expr: 1 | 2 | 'hello' = 'hello';
            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string' is not assignable to parameter of type 'number'.`,
        ]);
      });

      it('should narrow the type of the `@else if` alias', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (typeof value === 'number') {
                {{acceptsNumber(value)}}
              } @else if (typeof value === 'string'; as alias) {
                {{acceptsNumber(alias)}}
              }
            \`,
          })
          export class Main {
            value: string | number;

            acceptsNumber(value: number) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Argument of type 'boolean' is not assignable to parameter of type 'number'.`,
        );
      });

      it('should handle same alias name for `@if` and `@else if`', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (value; as alias) {
                {{acceptsNumber(value)}}
              } @else if (value; as alias) {
                {{acceptsBoolean(alias)}}
              }
            \`,
          })
          export class Main {
            value: boolean | string;

            acceptsNumber(value: number) {
              return value;
            }

            acceptsBoolean(value: boolean) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'string | true' is not assignable to parameter of type 'number'.  Type 'string' is not assignable to type 'number'.`,
          `Argument of type 'string | true' is not assignable to parameter of type 'boolean'.  Type 'string' is not assignable to type 'boolean'.`,
        ]);
      });
    });

    describe('for loop blocks', () => {
      beforeEach(() => {
        // `fullTemplateTypeCheck: true` is necessary so content inside `ng-template` is checked.
        env.tsconfig({fullTemplateTypeCheck: true});
      });

      it('should check bindings inside of for loop blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @for (item of items; track item) {
                {{does_not_exist_main}}
              } @empty {
                {{does_not_exist_empty}}
              }
            \`,
          })
          export class Main {
            items = [];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist_main' does not exist on type 'Main'.`,
          `Property 'does_not_exist_empty' does not exist on type 'Main'.`,
        ]);
      });

      it('should check the expression of a for loop block', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '@for (item of does_not_exist; track item) {hello}',
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist' does not exist on type 'Main'.`,
        ]);
      });

      it('should check the type of the item of a for loop block', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '@for (item of items; track item) { {{acceptsString(item)}} }',
          })
          export class Main {
            items = [1, 2, 3];

            acceptsString(value: string) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should check the type of implicit variables for loop block', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @for (item of items; track item) {
                {{acceptsString($index)}}
                {{acceptsString($first)}}
                {{acceptsString($last)}}
                {{acceptsString($even)}}
                {{acceptsString($odd)}}
                {{acceptsString($count)}}
              }
            \`,
          })
          export class Main {
            items = [];

            acceptsString(value: string) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
          `Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
          `Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
          `Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
          `Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should check the type of aliased implicit variables for loop block', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @for (item of items; track item; let i = $index, f = $first, l = $last, e = $even, o = $odd, c = $count) {
                {{acceptsString(i)}}
                {{acceptsString(f)}}
                {{acceptsString(l)}}
                {{acceptsString(e)}}
                {{acceptsString(o)}}
                {{acceptsString(c)}}
              }
            \`,
          })
          export class Main {
            items = [];

            acceptsString(value: string) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
          `Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
          `Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
          `Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
          `Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should not expose variables from the main block to the empty block', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @for (item of items; track item) {
                Hello
              } @empty {
                {{item}} {{$index}}
              }
            \`,
          })
          export class Main {
            items = [];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'item' does not exist on type 'Main'. Did you mean 'items'?`,
          `Property '$index' does not exist on type 'Main'.`,
        ]);
      });

      it('should continue exposing implicit loop variables under their old names when they are aliased', () => {
        env.write(
          'test.ts',
          `
            import {Component} from '@angular/core';

            @Component({
              template: '@for (item of items; track item; let alias = $index) { {{acceptsString($index)}} }',
            })
            export class Main {
              items = [];
              acceptsString(str: string) {}
            }
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should not be able to write to loop template variables', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @for (item of items; track item) {
                <button (click)="$index = 1"></button>
              }
            \`,
          })
          export class Main {
            items = [];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot use variable '$index' as the left-hand side of an assignment expression. Template variables are read-only.`,
        ]);
      });

      it('should not be able to write to loop template variables in a two-way binding', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[twoWayDir]',
            standalone: true
          })
          export class TwoWayDir {
            @Input() value: number = 0;
            @Output() valueChange: EventEmitter<number> = new EventEmitter();
          }

          @Component({
            template: \`
              @for (item of items; track item) {
                <button twoWayDir [(value)]="$index"></button>
              }
            \`,
            standalone: true,
            imports: [TwoWayDir]
          })
          export class Main {
            items = [];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot use a non-signal variable '$index' in a two-way binding expression. Template variables are read-only.`,
        ]);
      });

      it('should allow writes to signal-based template variables in two-way bindings', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input, Output, EventEmitter, signal} from '@angular/core';

          @Directive({
            selector: '[twoWayDir]',
            standalone: true
          })
          export class TwoWayDir {
            @Input() value: number = 0;
            @Output() valueChange: EventEmitter<number> = new EventEmitter();
          }

          @Component({
            template: \`
              @for (current of signals; track current) {
                <button twoWayDir [(value)]="current"></button>
              }
            \`,
            standalone: true,
            imports: [TwoWayDir]
          })
          export class Main {
            signals = [signal(1)];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags).toEqual([]);
      });

      it('should check the track expression of a for loop block', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '@for (item of items; track does_not_exist) {}',
          })
          export class Main {
            items = [];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Property 'does_not_exist' does not exist on type 'Main'.`,
        ]);
      });

      it('should check the item in the tracking expression', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '@for (item of items; track trackingFn(item)) {}',
          })
          export class Main {
            items = [1, 2, 3];

            trackingFn(value: string) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should check $index in the tracking expression', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '@for (item of items; track trackingFn($index)) {}',
          })
          export class Main {
            items = [];

            trackingFn(value: string) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should check an aliased $index in the tracking expression', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: '@for (item of items; let i = $index; track trackingFn(i)) {}',
          })
          export class Main {
            items = [];

            trackingFn(value: string) {
              return value;
            }
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        ]);
      });

      it('should not allow usages of loop context variables inside the tracking expression', () => {
        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            selector: 'test-cmp',
            standalone: true,
            template: '@for (item of items; track $index + $count) {}',
          })
          export class TestCmp {
            items = [];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot access '$count' inside of a track expression. Only 'item', '$index' and ` +
            `properties on the containing component are available to this expression.`,
        ]);
      });

      it('should not allow usages of aliased loop context variables inside the tracking expression', () => {
        env.write(
          '/test.ts',
          `
              import { Component } from '@angular/core';

              @Component({
                selector: 'test-cmp',
                standalone: true,
                template: '@for (item of items; let c = $count; track $index + c) {}',
              })
              export class TestCmp {
                items = [];
              }
            `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot access 'c' inside of a track expression. Only 'item', '$index' and ` +
            `properties on the containing component are available to this expression.`,
        ]);
      });

      it('should not allow usages of local references within the same template inside the tracking expression', () => {
        env.write(
          '/test.ts',
          `
            import { Component } from '@angular/core';

            @Component({
              selector: 'test-cmp',
              standalone: true,
              template: \`
                <input #ref/>
                @for (item of items; track $index + ref.value) {}
              \`,
            })
            export class TestCmp {
              items = [];
            }
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot access 'ref' inside of a track expression. Only 'item', '$index' and ` +
            `properties on the containing component are available to this expression.`,
        ]);
      });

      it('should not allow usages of local references outside of the template in the tracking expression', () => {
        env.write(
          '/test.ts',
          `
            import { Component } from '@angular/core';

            @Component({
              selector: 'test-cmp',
              standalone: true,
              template: \`
                <input #ref/>

                <ng-template>
                  @for (item of items; track $index + ref.value) {}
                </ng-template>
              \`,
            })
            export class TestCmp {
              items = [];
            }
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot access 'ref' inside of a track expression. Only 'item', '$index' and ` +
            `properties on the containing component are available to this expression.`,
        ]);
      });

      it('should not allow usages of parent template variables inside the tracking expression', () => {
        env.write(
          '/test.ts',
          `
            import { Component } from '@angular/core';

            @Component({
              selector: 'test-cmp',
              standalone: true,
              template: \`
                <ng-template let-foo>
                  @for (item of items; track $index + foo.value) {}
                </ng-template>
              \`,
            })
            export class TestCmp {
              items: {value: number}[] = [];
            }
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot access 'foo' inside of a track expression. Only 'item', '$index' and ` +
            `properties on the containing component are available to this expression.`,
        ]);
      });

      it('should not allow usages of parent loop variables inside the tracking expression', () => {
        env.write(
          '/test.ts',
          `
          import { Component } from '@angular/core';

          @Component({
            selector: 'test-cmp',
            standalone: true,
            template: \`
              @for (parent of items; track $index) {
                @for (item of parent.items; track parent) {}
              }
            \`,
          })
          export class TestCmp {
            items: {items: any[]}[] = [];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot access 'parent' inside of a track expression. Only 'item', '$index' and ` +
            `properties on the containing component are available to this expression.`,
        ]);
      });

      it('should not allow usages of aliased `if` block variables inside the tracking expression', () => {
        env.write(
          '/test.ts',
          `
            import { Component } from '@angular/core';

            @Component({
              selector: 'test-cmp',
              standalone: true,
              template: \`
                @if (expr; as alias) {
                  @for (item of items; track $index + alias) {}
                }
              \`,
            })
            export class TestCmp {
              expr = 1;
              items = [];
            }
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot access 'alias' inside of a track expression. Only 'item', '$index' and ` +
            `properties on the containing component are available to this expression.`,
        ]);
      });

      it('should not allow usages of pipes inside the tracking expression', () => {
        env.write(
          '/test.ts',
          `
          import { Component, Pipe } from '@angular/core';

          @Pipe({name: 'test', standalone: true})
          export class TestPipe {
            transform(value: any) {
              return value;
            }
          }

          @Component({
            selector: 'test-cmp',
            standalone: true,
            imports: [TestPipe],
            template: '@for (item of items; track item | test) {}',
          })
          export class TestCmp {
            items = [];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain(
          'Error: Illegal State: Pipes are not allowed in this context',
        );
      });

      it('should allow nullable values in loop expression', () => {
        env.write(
          'test.ts',
          `
          import {Component, Pipe} from '@angular/core';

          @Pipe({name: 'fakeAsync', standalone: true})
          export class FakeAsyncPipe {
            transform<T>(value: Iterable<T>): Iterable<T> | null | undefined {
              return null;
            }
          }

          @Component({
            template: \`
              @for (item of items | fakeAsync; track item) {
                {{item}}
              }
            \`,
            standalone: true,
            imports: [FakeAsyncPipe]
          })
          export class Main {
            items = [];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([]);
      });

      it('should enforce that the loop expression is iterable', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @for (item of items; track item) {
                {{item}}
              }
            \`,
          })
          export class Main {
            items = 123;
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Type 'number' must have a '[Symbol.iterator]()' method that returns an iterator.`,
        ]);
      });

      it('should check for loop variables with the same name as built-in globals', () => {
        // strictTemplates are necessary so the event listener is checked.
        env.tsconfig({strictTemplates: true});
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            standalone: true,
            selector: '[dir]'
          })
          export class Dir {
            @Input('dir') value!: string;
          }

          @Component({
            standalone: true,
            imports: [Dir],
            template: \`
              @for (document of documents; track document) {
                <button [dir]="document" (click)="$event.stopPropagation()"></button>
              }
            \`,
          })
          export class Main {
            documents = [1, 2, 3];
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Type 'number' is not assignable to type 'string'.`,
        ]);
      });
    });

    describe('control flow content projection diagnostics', () => {
      it('should report when an @if block prevents an element from being projected', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content/> <ng-content select="bar, [foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (true) {
                  <div foo></div>
                  breaks projection
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(1);
        expect(diags[0]).toContain(
          `Node matches the "bar, [foo]" slot of the "Comp" component, but will ` +
            `not be projected into the specific slot because the surrounding @if has more than one node at its root.`,
        );
      });

      it('should report when an @if block prevents a template from being projected', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content/> <ng-content select="bar, [foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (true) {
                  <ng-template foo></ng-template>
                  breaks projection
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(1);
        expect(diags[0]).toContain(
          `Node matches the "bar, [foo]" slot of the "Comp" component, but will ` +
            `not be projected into the specific slot because the surrounding @if has more than one node at its root.`,
        );
      });

      it('should report when an @else block prevents content projection', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content select="[foo]"/> <ng-content select="[bar]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (expr) {
                  <div foo></div>
                } @else {
                  <div bar></div>
                  breaks projection
                }
              </comp>
            \`,
          })
          class TestCmp {
            expr = 0;
          }
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(1);
        expect(diags[0]).toContain(
          `Node matches the "[bar]" slot of the "Comp" component, but will ` +
            `not be projected into the specific slot because the surrounding @else has more than one node at its root.`,
        );
      });

      it('should report when an @else if block prevents content projection', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content select="[foo]"/> <ng-content select="[bar]"/> <ng-content select="[baz]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (expr === 1) {
                  <div foo></div>
                } @else if (expr === 2) {
                  <div bar></div>
                  breaks projection
                } @else {
                  <div baz></div>
                }
              </comp>
            \`,
          })
          class TestCmp {
            expr = 0;
          }
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(1);
        expect(diags[0]).toContain(
          `Node matches the "[bar]" slot of the "Comp" component, but will ` +
            `not be projected into the specific slot because the surrounding @else if has more than one node at its root.`,
        );
      });

      it('should report when an @for block prevents content from being projected', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content/> <ng-content select="bar, [foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @for (i of [1, 2, 3]; track i) {
                  <div foo></div>
                  breaks projection
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(1);
        expect(diags[0]).toContain(
          `Node matches the "bar, [foo]" slot of the "Comp" component, but will ` +
            `not be projected into the specific slot because the surrounding @for has more than one node at its root.`,
        );
      });

      it('should report when an @empty block prevents content from being projected', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content/> <ng-content select="bar, [foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @for (i of [1, 2, 3]; track i) {

                } @empty {
                  <div foo></div>
                  breaks projection
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(1);
        expect(diags[0]).toContain(
          `Node matches the "bar, [foo]" slot of the "Comp" component, but will ` +
            `not be projected into the specific slot because the surrounding @empty has more than one node at its root.`,
        );
      });

      it('should report nodes that are targeting different slots but cannot be projected', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content select="[foo]"/> <ng-content select="[bar]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (true) {
                  <div foo></div>
                  <div bar></div>
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(2);
        expect(diags[0]).toContain(
          `Node matches the "[foo]" slot of the "Comp" component, but will not be projected`,
        );
        expect(diags[1]).toContain(
          `Node matches the "[bar]" slot of the "Comp" component, but will not be projected`,
        );
      });

      it('should report nodes that are targeting the same slot but cannot be projected', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content select="[foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (true) {
                  <div foo></div>
                  <span foo></span>
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(2);
        expect(diags[0]).toContain(
          `Node matches the "[foo]" slot of the "Comp" component, but will not be projected`,
        );
        expect(diags[1]).toContain(
          `Node matches the "[foo]" slot of the "Comp" component, but will not be projected`,
        );
      });

      it('should report when preserveWhitespaces may affect content projection', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content select="[foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            preserveWhitespaces: true,
            template: \`
              <comp>
                @if (true) {
                  <div foo></div>
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(1);
        expect(diags[0]).toContain(`Node matches the "[foo]" slot of the "Comp" component`);
        expect(diags[0]).toContain(
          `Note: the host component has \`preserveWhitespaces: true\` which may cause ` +
            `whitespace to affect content projection.`,
        );
      });

      it('should not report when there is only one root node', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content select="[foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (true) {
                  <div foo></div>
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not report when there are comments at the root of the control flow node', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content select="[foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (true) {
                  <!-- before -->
                  <div foo></div>
                  <!-- after -->
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not report when the component only has a catch-all slot', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (true) {
                  <div foo></div>
                  breaks projection
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should allow the content projection diagnostic to be disabled individually', () => {
        env.tsconfig({
          extendedDiagnostics: {
            checks: {
              controlFlowPreventingContentProjection: DiagnosticCategoryLabel.Suppress,
            },
          },
        });
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content/> <ng-content select="bar, [foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @if (true) {
                  <div foo></div>
                  breaks projection
                }
              </comp>
            \`,
          })
          class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should allow the content projection diagnostic to be disabled via `defaultCategory`', () => {
        env.tsconfig({
          extendedDiagnostics: {
            defaultCategory: DiagnosticCategoryLabel.Suppress,
          },
        });
        env.write(
          'test.ts',
          `
              import {Component} from '@angular/core';

              @Component({
                selector: 'comp',
                template: '<ng-content/> <ng-content select="bar, [foo]"/>',
                standalone: true,
              })
              class Comp {}

              @Component({
                standalone: true,
                imports: [Comp],
                template: \`
                  <comp>
                    @if (true) {
                      <div foo></div>
                      breaks projection
                    }
                  </comp>
                \`,
              })
              class TestCmp {}
            `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should report when an @case block prevents an element from being projected', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content/> <ng-content select="bar, [foo]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @switch (expr) {
                  @case (1) {
                    <div foo></div>
                    breaks projection
                  }
                }
              </comp>
            \`,
          })
          class TestCmp {
            expr = 1;
          }
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(1);
        expect(diags[0]).toContain(
          `Node matches the "bar, [foo]" slot of the "Comp" component, but will ` +
            `not be projected into the specific slot because the surrounding @case has more than one node at its root.`,
        );
      });

      it('should report when an @default block prevents an element from being projected', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            selector: 'comp',
            template: '<ng-content select="[foo]"/> <ng-content select="[bar]"/>',
            standalone: true,
          })
          class Comp {}

          @Component({
            standalone: true,
            imports: [Comp],
            template: \`
              <comp>
                @switch (expr) {
                  @case (1) {
                    <div foo></div>
                  }
                  @default {
                    <div bar></div>
                    breaks projection
                  }
                }
              </comp>
            \`,
          })
          class TestCmp {
            expr = 2;
          }
        `,
        );

        const diags = env
          .driveDiagnostics()
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''));
        expect(diags.length).toBe(1);
        expect(diags[0]).toContain(
          `Node matches the "[bar]" slot of the "Comp" component, but will ` +
            `not be projected into the specific slot because the surrounding @default has more than one node at its root.`,
        );
      });
    });

    describe('@let declarations', () => {
      beforeEach(() =>
        env.tsconfig({
          strictTemplates: true,
          extendedDiagnostics: {
            checks: {
              // Suppress the diagnostic for unused @let since some of the error cases
              // we're checking for here also qualify as being unused which adds noise.
              unusedLetDeclaration: 'suppress',
            },
          },
        }),
      );

      it('should infer the type of a let declaration', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let one = 1;
              {{acceptsString(one)}}
            \`,
            standalone: true,
          })
          export class Main {
            acceptsString(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getSourceCodeForDiagnostic(diags[0])).toBe('one');
        expect(diags[0].messageText).toBe(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should infer the type of a nested let declaration', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div>
                @let one = 1;
                <span>{{acceptsString(one)}}</span>
              </div>
            \`,
            standalone: true,
          })
          export class Main {
            acceptsString(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getSourceCodeForDiagnostic(diags[0])).toBe('one');
        expect(diags[0].messageText).toBe(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should check the expression of a let declaration', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = {} + 1;
            \`,
            standalone: true,
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getSourceCodeForDiagnostic(diags[0])).toBe('{} + 1');
        expect(diags[0].messageText).toBe(
          `Operator '+' cannot be applied to types '{}' and 'number'.`,
        );
      });

      it('should narrow the type of a let declaration used directly in the template', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = cond ? 1 : 'one';

              @if (value === 1) {
                {{expectsString(value)}}
              }
            \`,
            standalone: true,
          })
          export class Main {
            cond: boolean = true;
            expectsString(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getSourceCodeForDiagnostic(diags[0])).toBe('value');
        expect(diags[0].messageText).toBe(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should narrow the type of a let declaration inside an event listener', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = cond ? 1 : 'one';

              @if (value === 1) {
                <button (click)="expectsString(value)">Click me</button>
              }
            \`,
            standalone: true,
          })
          export class Main {
            cond: boolean = true;
            expectsString(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(getSourceCodeForDiagnostic(diags[0])).toBe('value');
        expect(diags[0].messageText).toBe(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should be able to access the let declaration from a parent embedded view', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <ng-template>
                @let value = 1;

                <ng-template>
                  @if (true) {
                    @switch (1) {
                      @case (1) {
                        <ng-template>{{expectsString(value)}}</ng-template>
                      }
                    }
                  }
                </ng-template>
              </ng-template>

            \`,
            standalone: true,
          })
          export class Main {
            expectsString(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should not be able to access a let declaration from a child embedded view', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (true) {
                @let value = 1;
              }

              {{value}}
            \`,
            standalone: true,
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Property 'value' does not exist on type 'Main'.`);
      });

      it('should not be able to access a let declaration from a sibling embedded view', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (true) {
                @let value = 1;
              }

              @if (true) {
                {{value}}
              }
            \`,
            standalone: true,
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Property 'value' does not exist on type 'Main'.`);
      });

      it('should give precedence to a local let declaration over a component property', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = 1;
              {{expectsString(value)}}
            \`,
            standalone: true,
          })
          export class Main {
            value = 'one';
            expectsString(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should give precedence to a local let declaration over one from a parent view', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = 'one';

              @if (true) {
                @let value = 1;
                {{expectsString(value)}}
              }
            \`,
            standalone: true,
          })
          export class Main {
            expectsString(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should not allow multiple @let declarations with the same name within a scope', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (true) {
                @let value = 1;
                @let value = 'one';
                {{value}}
              }
            \`,
            standalone: true,
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot declare @let called 'value' as there is another symbol in the template with the same name.`,
        );
      });

      it('should not allow @let declaration with the same name as a local reference defined before it', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <input #value>
              @let value = 1;
              {{value}}
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot declare @let called 'value' as there is another symbol in the template with the same name.`,
        );
      });

      it('should not allow @let declaration with the same name as a local reference defined after it', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = 1;
              <input #value>
              {{value}}
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot declare @let called 'value' as there is another symbol in the template with the same name.`,
        );
      });

      it('should not allow @let declaration with the same name as a template variable', () => {
        env.write(
          'test.ts',
          `
            import {Component} from '@angular/core';
            import {CommonModule} from '@angular/common';

            @Component({
              template: \`
                <div *ngIf="x as value">
                  @let value = 1;
                  {{value}}
                </div>
              \`,
              standalone: true,
              imports: [CommonModule],
            })
            export class Main {
              x!: unknown;
            }
          `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot declare @let called 'value' as there is another symbol in the template with the same name.`,
        );
      });

      it('should allow @let declaration with the same name as a local reference defined in a parent view', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <input #value>

              @if (true) {
                @let value = 1;
                {{value}}
              }
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not allow a let declaration to be referenced before it is defined', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              {{value}}
              @let value = 1;
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot read @let declaration 'value' before it has been defined.`,
        );
      });

      it('should not allow a let declaration to be referenced before it is defined inside a child view', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <ng-template>
                {{value}}
                @let value = 1;
              </ng-template>
            \`,
            standalone: true,
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot read @let declaration 'value' before it has been defined.`,
        );
      });

      it('should not be able to access let declarations via `this`', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = 1;
              {{this.value}}
            \`,
            standalone: true,
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Property 'value' does not exist on type 'Main'.`);
      });

      it('should not allow a let declaration to refer to itself', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = value;
            \`,
            standalone: true,
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot read @let declaration 'value' before it has been defined.`,
        );
      });

      it('should produce a single diagnostic if a @let declaration refers to properties on itself', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = value.a.b.c;
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot read @let declaration 'value' before it has been defined.`,
        );
      });

      it('should produce a single diagnostic if a @let declaration invokes itself', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = value();
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot read @let declaration 'value' before it has been defined.`,
        );
      });

      it('should allow event listeners to refer to a declaration before it has been defined', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <button (click)="expectsString(value)">Click me</button>
              @let value = 1;
            \`,
            standalone: true,
          })
          export class Main {
            expectsString(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Argument of type 'number' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should allow child views to refer to a declaration before it has been defined', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (true) {
                {{value}}
              }

              @let value = 1;
            \`,
            standalone: true,
          })
          export class Main {
            expectsString(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not allow a let declaration value to be changed', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = 1;
              <button (click)="value = 2">Click me</button>
            \`,
            standalone: true,
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Cannot assign to @let declaration 'value'.`);
      });

      it('should not allow a let declaration value to be changed through a `this` access', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @let value = 1;
              <button (click)="this.value = 2">Click me</button>
            \`,
            standalone: true,
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(`Property 'value' does not exist on type 'Main'.`);
      });

      it('should not be able to write to let declaration in a two-way binding', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input, Output, EventEmitter} from '@angular/core';
          @Directive({
            selector: '[twoWayDir]',
            standalone: true
          })
          export class TwoWayDir {
            @Input() value: number = 0;
            @Output() valueChange: EventEmitter<number> = new EventEmitter();
          }
          @Component({
            template: \`
              @let nonWritable = 1;
              <button twoWayDir [(value)]="nonWritable"></button>
            \`,
            standalone: true,
            imports: [TwoWayDir]
          })
          export class Main {
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.map((d) => ts.flattenDiagnosticMessageText(d.messageText, ''))).toEqual([
          `Cannot use non-signal @let declaration 'nonWritable' in a two-way binding expression. @let declarations are read-only.`,
        ]);
      });

      it('should allow two-way bindings to signal-based let declarations', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, Input, Output, EventEmitter, signal} from '@angular/core';
          @Directive({
            selector: '[twoWayDir]',
            standalone: true
          })
          export class TwoWayDir {
            @Input() value: number = 0;
            @Output() valueChange: EventEmitter<number> = new EventEmitter();
          }
          @Component({
            template: \`
              @let writable = signalValue;
              <button twoWayDir [(value)]="writable"></button>
            \`,
            standalone: true,
            imports: [TwoWayDir]
          })
          export class Main {
            signalValue = signal(1);
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should report @let declaration used in the expression of a @if block before it is defined', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @if (value) {
                Hello
              }
              @let value = 123;
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot read @let declaration 'value' before it has been defined.`,
        );
      });

      it('should report @let declaration used in the expression of a @for block before it is defined', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @for (current of value; track $index) {
                {{current}}
              }

              @let value = [1, 2, 3];
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot read @let declaration 'value' before it has been defined.`,
        );
      });

      it('should report @let declaration used in the expression of a @switch block before it is defined', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              @switch (value) {
                @case (123) {
                  Hello
                }
              }

              @let value = [1, 2, 3];
            \`,
            standalone: true,
          })
          export class Main {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Cannot read @let declaration 'value' before it has been defined.`,
        );
      });
    });

    describe('unused standalone imports', () => {
      it('should report when a directive is not used within a template', () => {
        env.write(
          'used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[used]', standalone: true})
            export class UsedDir {}
          `,
        );

        env.write(
          'unused.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[unused]', standalone: true})
            export class UnusedDir {}
          `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {UsedDir} from './used';
          import {UnusedDir} from './unused';

          @Component({
            template: \`
              <section>
                <div></div>
                <span used></span>
              </section>
            \`,
            standalone: true,
            imports: [UsedDir, UnusedDir]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe('UnusedDir is not used within the template of MyComp');
      });

      it('should report when a pipe is not used within a template', () => {
        env.write(
          'used.ts',
          `
            import {Pipe} from '@angular/core';

            @Pipe({name: 'used', standalone: true})
            export class UsedPipe {
              transform(value: number) {
                return value * 2;
              }
            }
          `,
        );

        env.write(
          'unused.ts',
          `
            import {Pipe} from '@angular/core';

            @Pipe({name: 'unused', standalone: true})
            export class UnusedPipe {
              transform(value: number) {
                return value * 2;
              }
            }
          `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {UsedPipe} from './used';
          import {UnusedPipe} from './unused';

          @Component({
            template: \`
              <section>
                <div></div>
                <span [attr.id]="1 | used"></span>
              </section>
            \`,
            standalone: true,
            imports: [UsedPipe, UnusedPipe]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe('UnusedPipe is not used within the template of MyComp');
      });

      it('should not report imports only used inside @defer blocks', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, Pipe} from '@angular/core';

          @Directive({selector: '[used]', standalone: true})
          export class UsedDir {}

          @Pipe({name: 'used', standalone: true})
          export class UsedPipe {
            transform(value: number) {
              return value * 2;
            }
          }

          @Component({
            template: \`
              <section>
                @defer (on idle) {
                  <div used></div>
                  <span [attr.id]="1 | used"></span>
                }
              </section>
            \`,
            standalone: true,
            imports: [UsedDir, UsedPipe]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should report when all imports in an import array are not used', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, Pipe} from '@angular/core';

          @Directive({selector: '[unused]', standalone: true})
          export class UnusedDir {}

          @Pipe({name: 'unused', standalone: true})
          export class UnusedPipe {
            transform(value: number) {
              return value * 2;
            }
          }

          @Component({
            template: '',
            standalone: true,
            imports: [UnusedDir, UnusedPipe]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe('All imports are unused');
      });

      it('should not report unused imports coming from modules', () => {
        env.write(
          'module.ts',
          `
            import {Directive, NgModule} from '@angular/core';

            @Directive({
              selector: '[unused-from-module]',
              standalone: false,
            })
            export class UnusedDirFromModule {}

            @NgModule({
              declarations: [UnusedDirFromModule],
              exports: [UnusedDirFromModule]
            })
            export class UnusedModule {}
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {UnusedModule} from './module';

          @Component({
            template: '',
            standalone: true,
            imports: [UnusedModule]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should be able to opt out for checking for unused imports via the tsconfig', () => {
        env.tsconfig({
          extendedDiagnostics: {
            checks: {
              unusedStandaloneImports: DiagnosticCategoryLabel.Suppress,
            },
          },
        });

        env.write(
          'test.ts',
          `
          import {Component, Directive} from '@angular/core';

          @Directive({selector: '[unused]', standalone: true})
          export class UnusedDir {}

          @Component({
            template: '',
            standalone: true,
            imports: [UnusedDir]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should unused imports from external modules', () => {
        // Note: we don't use the existing fake `@angular/common`,
        // because all the declarations there are non-standalone.
        env.write(
          'node_modules/fake-common/index.d.ts',
          `
          import * as i0 from '@angular/core';

          export declare class NgIf {
            static ɵdir: i0.ɵɵDirectiveDeclaration<NgIf<any, any>, "[ngIf]", never, {}, {}, never, never, true, never>;
            static ɵfac: i0.ɵɵFactoryDeclaration<NgIf<any, any>, never>;
          }

          export declare class NgFor {
            static ɵdir: i0.ɵɵDirectiveDeclaration<NgFor<any, any>, "[ngFor]", never, {}, {}, never, never, true, never>;
            static ɵfac: i0.ɵɵFactoryDeclaration<NgFor<any, any>, never>;
          }

          export class PercentPipe {
            static ɵfac: i0.ɵɵFactoryDeclaration<PercentPipe, never>;
            static ɵpipe: i0.ɵɵPipeDeclaration<PercentPipe, "percent", true>;
          }
        `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {NgIf, NgFor, PercentPipe} from 'fake-common';

          @Component({
            template: \`
              <section>
                <div></div>
                <span *ngIf="true"></span>
              </section>
            \`,
            standalone: true,
            imports: [NgFor, NgIf, PercentPipe]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].messageText).toBe('NgFor is not used within the template of MyComp');
        expect(diags[1].messageText).toBe('PercentPipe is not used within the template of MyComp');
      });

      it('should report unused imports coming from a nested array from the same file', () => {
        env.write(
          'used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[used]', standalone: true})
            export class UsedDir {}
          `,
        );

        env.write(
          'other-used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[other-used]', standalone: true})
            export class OtherUsedDir {}
          `,
        );

        env.write(
          'unused.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[unused]', standalone: true})
            export class UnusedDir {}
          `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {UsedDir} from './used';
          import {OtherUsedDir} from './other-used';
          import {UnusedDir} from './unused';

          const COMMON = [OtherUsedDir, UnusedDir];

          @Component({
            template: \`
              <section>
                <div other-used></div>
                <span used></span>
              </section>
            \`,
            standalone: true,
            imports: [UsedDir, COMMON]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe('UnusedDir is not used within the template of MyComp');
      });

      it('should report unused imports coming from an array used as the `imports` initializer', () => {
        env.write(
          'used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[used]', standalone: true})
            export class UsedDir {}
          `,
        );

        env.write(
          'unused.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[unused]', standalone: true})
            export class UnusedDir {}
          `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {UsedDir} from './used';
          import {UnusedDir} from './unused';

          const IMPORTS = [UsedDir, UnusedDir];

          @Component({
            template: \`
              <section>
                <div></div>
                <span used></span>
              </section>
            \`,
            standalone: true,
            imports: IMPORTS
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe('UnusedDir is not used within the template of MyComp');
      });

      it('should not report unused imports coming from an array through a spread expression from a different file', () => {
        env.write(
          'used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[used]', standalone: true})
            export class UsedDir {}
          `,
        );

        env.write(
          'other-used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[other-used]', standalone: true})
            export class OtherUsedDir {}
          `,
        );

        env.write(
          'unused.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[unused]', standalone: true})
            export class UnusedDir {}
          `,
        );

        env.write(
          'common.ts',
          `
            import {OtherUsedDir} from './other-used';
            import {UnusedDir} from './unused';

            export const COMMON = [OtherUsedDir, UnusedDir];
          `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {UsedDir} from './used';
          import {COMMON} from './common';

          @Component({
            template: \`
              <section>
                <div other-used></div>
                <span used></span>
              </section>
            \`,
            standalone: true,
            imports: [UsedDir, ...COMMON]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not report unused imports coming from a nested array from a different file', () => {
        env.write(
          'used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[used]', standalone: true})
            export class UsedDir {}
          `,
        );

        env.write(
          'other-used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[other-used]', standalone: true})
            export class OtherUsedDir {}
          `,
        );

        env.write(
          'unused.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[unused]', standalone: true})
            export class UnusedDir {}
          `,
        );

        env.write(
          'common.ts',
          `
            import {OtherUsedDir} from './other-used';
            import {UnusedDir} from './unused';

            export const COMMON = [OtherUsedDir, UnusedDir];
          `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {UsedDir} from './used';
          import {COMMON} from './common';

          @Component({
            template: \`
              <section>
                <div other-used></div>
                <span used></span>
              </section>
            \`,
            standalone: true,
            imports: [UsedDir, COMMON]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });

      it('should not report unused imports coming from an exported array in the same file', () => {
        env.write(
          'used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[used]', standalone: true})
            export class UsedDir {}
          `,
        );

        env.write(
          'other-used.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[other-used]', standalone: true})
            export class OtherUsedDir {}
          `,
        );

        env.write(
          'unused.ts',
          `
            import {Directive} from '@angular/core';

            @Directive({selector: '[unused]', standalone: true})
            export class UnusedDir {}
          `,
        );

        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {UsedDir} from './used';
          import {OtherUsedDir} from './other-used';
          import {UnusedDir} from './unused';

          export const COMMON = [OtherUsedDir, UnusedDir];

          @Component({
            template: \`
              <section>
                <div other-used></div>
                <span used></span>
              </section>
            \`,
            standalone: true,
            imports: [UsedDir, COMMON]
          })
          export class MyComp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);
      });
    });

    describe('DOM event target type inference', () => {
      beforeEach(() => {
        env.tsconfig({strictTemplates: true});
      });

      it('should infer the type of the event target when bound on a void element', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '<input (input)="handleEvent($event.target)">'})
          export class TestCmp {
            handleEvent(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toBe(
          `Argument of type 'HTMLInputElement' is not assignable to parameter of type 'string'.`,
        );
      });

      it('should not infer the type of the event target when bound on a non-void element', () => {
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '<div (click)="handleEvent($event.target)"></div>'})
          export class TestCmp {
            handleEvent(value: string) {}
          }
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect((diags[0].messageText as ts.DiagnosticMessageChain).messageText).toBe(
          `Argument of type 'EventTarget | null' is not assignable to parameter of type 'string'.`,
        );
      });
    });
  });
});
