/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInEachFileSystem} from '../../file_system/testing';

import {generateDiagnoseJasmineSpecs, TestCase} from './test_case_helper';

runInEachFileSystem(() => {
  describe('model inputs type-check diagnostics', () => {
    const bindingCases: TestCase[] = [
      {
        id: 'static binding',
        inputs: {show: {type: 'ModelSignal<boolean>', isSignal: true}},
        outputs: {showChange: {type: 'ModelSignal<boolean>'}},
        template: `<div dir show="works">`,
        expected: [`TestComponent.html(1, 10): Type 'string' is not assignable to type 'boolean'.`],
      },
      {
        id: 'one-way property binding',
        inputs: {show: {type: 'ModelSignal<boolean>', isSignal: true}},
        outputs: {showChange: {type: 'ModelSignal<boolean>'}},
        template: `<div dir [show]="prop">`,
        component: 'prop = true;',
        expected: [],
      },
      {
        id: 'complex object one-way binding',
        inputs: {show: {type: 'ModelSignal<{works: boolean}>', isSignal: true}},
        outputs: {showChange: {type: 'ModelSignal<{works: boolean}>'}},
        template: `<div dir [show]="{works: true}">`,
        expected: [],
      },
      {
        id: 'complex object one-way binding, unexpected extra fields',
        inputs: {show: {type: 'ModelSignal<{works: boolean}>', isSignal: true}},
        outputs: {showChange: {type: 'ModelSignal<boolean>'}},
        template: `<div dir [show]="{works: true, extraField: true}">`,
        expected: [
          jasmine.stringContaining(
            `Object literal may only specify known properties, and '"extraField"' does not exist in type '{ works: boolean; }'.`,
          ),
        ],
      },
      {
        id: 'complex object input, missing fields',
        inputs: {show: {type: 'ModelSignal<{works: boolean}>', isSignal: true}},
        outputs: {showChange: {type: 'ModelSignal<boolean>'}},
        template: `<div dir [show]="{}">`,
        expected: [
          `TestComponent.html(1, 11): Property 'works' is missing in type '{}' but required in type '{ works: boolean; }'.`,
        ],
      },
      // mixing cases
      {
        id: 'mixing zone input and model, valid',
        inputs: {
          zoneProp: {type: 'string', isSignal: false},
          signalProp: {type: 'ModelSignal<string>', isSignal: true},
        },
        outputs: {signalPropChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [zoneProp]="'works'" [signalProp]="'stringVal'">`,
        expected: [],
      },
      {
        id: 'mixing zone input and model, invalid zone binding',
        inputs: {
          zoneProp: {type: 'string', isSignal: false},
          signalProp: {type: 'ModelSignal<string>', isSignal: true},
        },
        outputs: {signalPropChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [zoneProp]="false" [signalProp]="'stringVal'">`,
        expected: [`TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`],
      },
      {
        id: 'mixing zone input and model, invalid signal binding',
        inputs: {
          zoneProp: {type: 'string', isSignal: false},
          signalProp: {type: 'ModelSignal<string>', isSignal: true},
        },
        outputs: {signalPropChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [zoneProp]="'works'" [signalProp]="{}">`,
        expected: [`TestComponent.html(1, 32): Type '{}' is not assignable to type 'string'.`],
      },
      {
        id: 'mixing zone input and model, both invalid',
        inputs: {
          zoneProp: {type: 'string', isSignal: false},
          signalProp: {type: 'ModelSignal<string>', isSignal: true},
        },
        outputs: {signalPropChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [zoneProp]="false" [signalProp]="{}">`,
        expected: [
          `TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`,
          `TestComponent.html(1, 30): Type '{}' is not assignable to type 'string'.`,
        ],
      },
      // restricted fields
      {
        id: 'disallows access to private model',
        inputs: {
          pattern: {type: 'ModelSignal<string>', isSignal: true, restrictionModifier: 'private'},
        },
        outputs: {patternChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [pattern]="'works'">`,
        expected: [
          `TestComponent.html(1, 11): Property 'pattern' is private and only accessible within class 'Dir'.`,
        ],
      },
      {
        id: 'disallows access to protected model',
        inputs: {
          pattern: {type: 'ModelSignal<string>', isSignal: true, restrictionModifier: 'protected'},
        },
        outputs: {patternChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [pattern]="'works'">`,
        expected: [
          `TestComponent.html(1, 11): Property 'pattern' is protected and only accessible within class 'Dir' and its subclasses.`,
        ],
      },
      {
        id: 'allows access to readonly model by default',
        inputs: {
          pattern: {type: 'ModelSignal<string>', isSignal: true, restrictionModifier: 'readonly'},
        },
        outputs: {patternChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [pattern]="'works'">`,
        expected: [],
      },
      // restricted fields (but opt-out of check)
      {
        id: 'allow access to private input if modifiers are explicitly ignored',
        inputs: {
          pattern: {type: 'ModelSignal<string>', isSignal: true, restrictionModifier: 'private'},
        },
        outputs: {patternChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [pattern]="'works'">`,
        expected: [],
        options: {
          honorAccessModifiersForInputBindings: false,
        },
      },
      {
        id: 'allow access to protected model if modifiers are explicitly ignored',
        inputs: {
          pattern: {type: 'ModelSignal<string>', isSignal: true, restrictionModifier: 'protected'},
        },
        outputs: {patternChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [pattern]="'works'">`,
        expected: [],
        options: {
          honorAccessModifiersForInputBindings: false,
        },
      },
      {
        id: 'allow access to readonly input if modifiers are explicitly ignored',
        inputs: {
          pattern: {type: 'ModelSignal<string>', isSignal: true, restrictionModifier: 'readonly'},
        },
        outputs: {patternChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [pattern]="'works'">`,
        expected: [],
        options: {
          honorAccessModifiersForInputBindings: false,
        },
      },
      {
        id: 'allow access to private model if modifiers are explicitly ignored, but error if not assignable',
        inputs: {
          pattern: {type: 'ModelSignal<string>', isSignal: true, restrictionModifier: 'private'},
        },
        outputs: {patternChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [pattern]="false">`,
        expected: [`TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`],
        options: {
          honorAccessModifiersForInputBindings: false,
        },
      },
      // coercion is not supported / respected
      {
        id: 'coercion members are not respected',
        inputs: {pattern: {type: 'ModelSignal<string>', isSignal: true}},
        outputs: {patternChange: {type: 'ModelSignal<string>'}},
        extraDirectiveMembers: ['static ngAcceptInputType_pattern: string|boolean'],
        template: `<div dir [pattern]="false">`,
        expected: [`TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`],
      },
      // with generics (type constructor tests)
      {
        id: 'generic inference and one-way binding to directive, all model inputs',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
        },
        outputs: {
          genChange: {type: 'ModelSignal<T>'},
          otherChange: {type: 'ModelSignal<T>'},
        },
        directiveGenerics: '<T>',
        template: `<div dir [gen]="false" [other]="'invalid'">`,
        expected: [`TestComponent.html(1, 25): Type 'string' is not assignable to type 'boolean'.`],
      },
      {
        id: 'generic inference and one-way binding to directive, mix of zone input and model',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'T',
            isSignal: false,
          },
        },
        outputs: {genChange: {type: 'ModelSignal<T>'}},
        directiveGenerics: '<T>',
        template: `<div dir [gen]="false" [other]="'invalid'">`,
        expected: [`TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`],
      },
      {
        id: 'generic inference and one-way binding to directive (with `extends boolean`), all model inputs',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
        },
        outputs: {genChange: {type: 'ModelSignal<T>'}, otherChange: {type: 'ModelSignal<T>'}},
        directiveGenerics: '<T extends boolean>',
        template: `<div dir [gen]="false" [other]="'invalid'">`,
        expected: [
          `TestComponent.html(1, 25): Type '"invalid"' is not assignable to type 'false'.`,
        ],
      },
      {
        id: 'generic inference and one-way binding to directive (with `extends boolean`), mix of zone inputs and model',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'T',
            isSignal: false,
          },
        },
        outputs: {genChange: {type: 'ModelSignal<T>'}},
        directiveGenerics: '<T extends boolean>',
        template: `<div dir [gen]="false" [other]="'invalid'">`,
        expected: [`TestComponent.html(1, 25): Type 'string' is not assignable to type 'boolean'.`],
      },
      {
        id: 'generic multi-inference and one-way bindings to directive, all model inputs',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'ModelSignal<U>',
            isSignal: true,
          },
        },
        outputs: {
          genChange: {type: 'ModelSignal<T>'},
          otherChange: {type: 'ModelSignal<U>'},
        },
        extraDirectiveMembers: ['tester: {t: T, u: U} = null!'],
        directiveGenerics: '<T, U>',
        template: `
              <div dir [gen]="false" [other]="'text'"
                       #ref="dir" (click)="ref.tester = {t: 1, u: 0}">`,
        expected: [
          `TestComponent.html(3, 61): Type 'number' is not assignable to type 'boolean'.`,
          `TestComponent.html(3, 67): Type 'number' is not assignable to type 'string'.`,
        ],
      },
      {
        id: 'generic multi-inference and one-way bindings to directive, mix of zone inputs and models',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'U',
            isSignal: false,
          },
        },
        outputs: {genChange: {type: 'ModelSignal<T>'}},
        extraDirectiveMembers: ['tester: {t: T, u: U} = null!'],
        directiveGenerics: '<T, U>',
        template: `
              <div dir [gen]="false" [other]="'text'"
                       #ref="dir" (click)="ref.tester = {t: 1, u: 0}">`,
        expected: [
          `TestComponent.html(3, 61): Type 'number' is not assignable to type 'boolean'.`,
          `TestComponent.html(3, 67): Type 'number' is not assignable to type 'string'.`,
        ],
      },
      {
        id: 'generic multi-inference and one-way bindings to directive, more complicated generic inference',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'ModelSignal<{u: U}>',
            isSignal: true,
          },
        },
        outputs: {
          genChange: {type: 'ModelSignal<T>'},
          otherChange: {type: 'ModelSignal<{u: U}>'},
        },
        extraDirectiveMembers: ['tester: {t: T, u: U} = null!'],
        directiveGenerics: '<T, U>',
        template: `
              <div dir [gen]="false" [other]="{u: null}"
                   #ref="dir" (click)="ref.tester = {t: 1, u: 0}">`,
        expected: [
          `TestComponent.html(3, 57): Type 'number' is not assignable to type 'boolean'.`,
          `TestComponent.html(3, 63): Type 'number' is not assignable to type 'null'.`,
        ],
      },
      {
        id: 'inline constructor generic inference, one-way binding',
        inputs: {
          bla: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
        },
        outputs: {blaChange: {type: 'ModelSignal<T>'}},
        extraFileContent: `
          class SomeNonExportedClass {}
        `,
        extraDirectiveMembers: [`tester: {t: T} = null!`],
        directiveGenerics: '<T extends SomeNonExportedClass>',
        template: `<div dir [bla]="prop" #ref="dir" (click)="ref.tester = {t: 0}">`,
        component: `prop: HTMLElement = null!`,
        expected: [
          // This verifies that the `ref.tester.ts` is correctly inferred to be `HTMLElement`.
          `TestComponent.html(1, 60): Type 'number' is not assignable to type 'HTMLElement'.`,
        ],
      },
      {
        id: 'generic inference and two-way binding to directive, all model inputs',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
        },
        outputs: {
          genChange: {type: 'ModelSignal<T>'},
          otherChange: {type: 'ModelSignal<T>'},
        },
        directiveGenerics: '<T>',
        component: `
          genVal!: boolean;
          otherVal!: string;
        `,
        template: `<div dir [(gen)]="genVal" [(other)]="otherVal">`,
        expected: [
          `TestComponent.html(1, 29): Type 'string' is not assignable to type 'boolean'.`,
          `TestComponent.html(1, 27): Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
        ],
      },
      {
        id: 'generic inference and two-way binding to directive, mix of zone input and model',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'T',
            isSignal: false,
          },
        },
        outputs: {
          genChange: {type: 'ModelSignal<T>'},
          otherChange: {type: 'EventEmitter<T>'},
        },
        directiveGenerics: '<T>',
        template: `<div dir [(gen)]="genVal" [(other)]="otherVal">`,
        component: `
          genVal!: boolean;
          otherVal!: string;
        `,
        expected: [
          `TestComponent.html(1, 12): Type 'boolean' is not assignable to type 'string'.`,
          `TestComponent.html(1, 10): Argument of type 'string' is not assignable to parameter of type 'boolean'.`,
        ],
      },
      {
        id: 'generic inference and two-way binding to directive (with `extends boolean`), all model inputs',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
        },
        outputs: {genChange: {type: 'ModelSignal<T>'}, otherChange: {type: 'ModelSignal<T>'}},
        directiveGenerics: '<T extends boolean>',
        template: `<div dir [(gen)]="genVal" [(other)]="otherVal">`,
        component: `
          genVal!: boolean;
          otherVal!: string;
        `,
        expected: [
          `TestComponent.html(1, 29): Type 'string' is not assignable to type 'boolean'.`,
          `TestComponent.html(1, 27): Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
        ],
      },
      {
        id: 'generic inference and two-way binding to directive (with `extends boolean`), mix of zone inputs and model',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'T',
            isSignal: false,
          },
        },
        outputs: {
          genChange: {type: 'ModelSignal<T>'},
          otherChange: {type: 'EventEmitter<T>'},
        },
        directiveGenerics: '<T extends boolean>',
        template: `<div dir [(gen)]="genVal" [(other)]="otherVal">`,
        component: `
          genVal!: boolean;
          otherVal!: string;
        `,
        expected: [
          `TestComponent.html(1, 29): Type 'string' is not assignable to type 'boolean'.`,
          `TestComponent.html(1, 27): Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
        ],
      },
      {
        id: 'generic multi-inference and two-way bindings to directive, all model inputs',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'ModelSignal<U>',
            isSignal: true,
          },
        },
        outputs: {
          genChange: {type: 'ModelSignal<T>'},
          otherChange: {type: 'ModelSignal<U>'},
        },
        extraDirectiveMembers: ['tester: {t: T, u: U} = null!'],
        directiveGenerics: '<T, U>',
        template: `
              <div dir [(gen)]="genVal" [(other)]="otherVal"
                       #ref="dir" (click)="ref.tester = {t: 1, u: 0}">`,
        component: `
          genVal!: boolean;
          otherVal!: string;
        `,
        expected: [
          `TestComponent.html(3, 61): Type 'number' is not assignable to type 'boolean'.`,
          `TestComponent.html(3, 67): Type 'number' is not assignable to type 'string'.`,
        ],
      },
      {
        id: 'generic multi-inference and two-way bindings to directive, mix of zone inputs and models',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'U',
            isSignal: false,
          },
        },
        outputs: {
          genChange: {type: 'ModelSignal<T>'},
          otherChange: {type: 'EventEmitter<U>'},
        },
        extraDirectiveMembers: ['tester: {t: T, u: U} = null!'],
        directiveGenerics: '<T, U>',
        template: `
              <div dir [(gen)]="genVal" [(other)]="otherVal"
                       #ref="dir" (click)="ref.tester = {t: 1, u: 0}">`,
        component: `
          genVal!: boolean;
          otherVal!: string;
        `,
        expected: [
          `TestComponent.html(3, 61): Type 'number' is not assignable to type 'boolean'.`,
          `TestComponent.html(3, 67): Type 'number' is not assignable to type 'string'.`,
        ],
      },
      {
        id: 'generic multi-inference and two-way bindings to directive, more complicated generic inference',
        inputs: {
          gen: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
          other: {
            type: 'ModelSignal<{u: U}>',
            isSignal: true,
          },
        },
        outputs: {
          genChange: {type: 'ModelSignal<T>'},
          otherChange: {type: 'ModelSignal<{u: U}>'},
        },
        extraDirectiveMembers: ['tester: {t: T, u: U} = null!'],
        directiveGenerics: '<T, U>',
        template: `
              <div dir [(gen)]="genVal" [(other)]="otherVal"
                   #ref="dir" (click)="ref.tester = {t: 1, u: 0}">`,
        component: `
          genVal!: boolean;
          otherVal!: {u: null};
        `,
        expected: [
          `TestComponent.html(3, 57): Type 'number' is not assignable to type 'boolean'.`,
          `TestComponent.html(3, 63): Type 'number' is not assignable to type 'null'.`,
        ],
      },
      {
        id: 'inline constructor generic inference, two-way binding',
        inputs: {
          bla: {
            type: 'ModelSignal<T>',
            isSignal: true,
          },
        },
        outputs: {blaChange: {type: 'ModelSignal<T>'}},
        extraFileContent: `
          class SomeNonExportedClass {}
        `,
        extraDirectiveMembers: [`tester: {t: T} = null!`],
        directiveGenerics: '<T extends SomeNonExportedClass>',
        template: `<div dir [(bla)]="prop" #ref="dir" (click)="ref.tester = {t: 0}">`,
        component: `prop: HTMLElement = null!`,
        expected: [
          // This verifies that the `ref.tester.ts` is correctly inferred to be `HTMLElement`.
          `TestComponent.html(1, 62): Type 'number' is not assignable to type 'HTMLElement'.`,
        ],
      },
      {
        id: 'one-way output binding to a model',
        inputs: {evt: {type: 'ModelSignal<string>', isSignal: true}},
        outputs: {evtChange: {type: 'ModelSignal<string>'}},
        template: `<div dir (evtChange)="$event.bla">`,
        expected: [`TestComponent.html(1, 30): Property 'bla' does not exist on type 'string'.`],
      },
      {
        id: 'one-way output to a model with a void type',
        inputs: {evt: {type: 'ModelSignal<string>', isSignal: true}},
        outputs: {evtChange: {type: 'ModelSignal<void>'}},
        template: `<div dir (evtChange)="$event.x">`,
        expected: [`TestComponent.html(1, 30): Property 'x' does not exist on type 'void'.`],
      },
      {
        id: 'two-way binding to primitive, invalid',
        inputs: {value: {type: 'ModelSignal<string>', isSignal: true}},
        outputs: {valueChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [(value)]="bla">`,
        component: `bla = true;`,
        expected: [
          `TestComponent.html(1, 12): Type 'boolean' is not assignable to type 'string'.`,
          `TestComponent.html(1, 10): Argument of type 'string' is not assignable to parameter of type 'boolean'.`,
        ],
      },
      {
        id: 'two-way binding to primitive, valid',
        inputs: {value: {type: 'ModelSignal<string>', isSignal: true}},
        outputs: {valueChange: {type: 'ModelSignal<string>'}},
        template: `<div dir [(value)]="bla">`,
        component: `bla: string = ''`,
        expected: [],
      },
      // mixing cases
      {
        id: 'mixing decorator-based and model-based event bindings',
        inputs: {evt1: {type: 'ModelSignal<string>', isSignal: true}},
        outputs: {
          evt1Change: {type: 'ModelSignal<string>'},
          evt2: {type: 'EventEmitter<string>'},
        },
        template: `<div dir (evt1Change)="x1 = $event" (evt2)="x2 = $event">`,
        component: `
          x1: never = null!;
          x2: never = null!;
        `,
        expected: [
          `TestComponent.html(1, 24): Type 'string' is not assignable to type 'never'.`,
          `TestComponent.html(1, 45): Type 'string' is not assignable to type 'never'.`,
        ],
      },
      // restricted fields
      {
        id: 'allows access to private output',
        inputs: {
          evt: {
            type: 'ModelSignal<string>',
            isSignal: true,
            restrictionModifier: 'private',
          },
        },
        outputs: {evtChange: {type: 'ModelSignal<string>', restrictionModifier: 'private'}},
        template: `<div dir (evtChange)="true">`,
        expected: [],
      },
      {
        id: 'allows access to protected output',
        inputs: {
          evt: {
            type: 'ModelSignal<string>',
            isSignal: true,
            restrictionModifier: 'protected',
          },
        },
        outputs: {evt: {type: 'ModelSignal<string>', restrictionModifier: 'protected'}},
        template: `<div dir (evtChange)="true">`,
        expected: [],
      },
      {
        id: 'WritableSignal binding, valid',
        inputs: {value: {type: 'ModelSignal<boolean>', isSignal: true}},
        outputs: {valueChange: {type: 'ModelSignal<boolean>'}},
        template: `<div dir [(value)]="val">`,
        component: `val!: WritableSignal<boolean>;`,
        expected: [],
      },
      {
        id: 'WritableSignal binding, invalid',
        inputs: {value: {type: 'ModelSignal<boolean>', isSignal: true}},
        outputs: {valueChange: {type: 'ModelSignal<boolean>'}},
        template: `<div dir [(value)]="val">`,
        component: `val!: WritableSignal<string>;`,
        expected: [
          `TestComponent.html(1, 12): Type 'string' is not assignable to type 'boolean'.`,
          `TestComponent.html(1, 10): Argument of type 'boolean' is not assignable to parameter of type 'string'.`,
        ],
      },
      {
        id: 'non-writable signal binding',
        inputs: {value: {type: 'ModelSignal<boolean>', isSignal: true}},
        outputs: {valueChange: {type: 'ModelSignal<boolean>'}},
        template: `<div dir [(value)]="val">`,
        component: `val!: InputSignal<boolean>;`,
        expected: [
          `TestComponent.html(1, 10): Type 'InputSignal<boolean>' is not assignable to type 'boolean'.`,
          `TestComponent.html(1, 10): Argument of type 'boolean' is not assignable to parameter of type 'InputSignal<boolean>'.`,
        ],
      },
      {
        id: 'getter function binding, valid',
        inputs: {value: {type: 'ModelSignal<(v: string) => number>', isSignal: true}},
        outputs: {valueChange: {type: 'ModelSignal<(v: string) => number>'}},
        template: `<div dir [(value)]="val">`,
        component: `val!: (v: string) => number;`,
        expected: [],
      },
      {
        id: 'getter function binding, invalid',
        inputs: {value: {type: 'ModelSignal<(v: number) => number>', isSignal: true}},
        outputs: {valueChange: {type: 'ModelSignal<(v: number) => number>'}},
        template: `<div dir [(value)]="val">`,
        component: `val!: (v: string) => number;`,
        expected: [
          jasmine.stringContaining(
            `TestComponent.html(1, 12): Type '(v: string) => number' is not assignable to type '(v: number) => number`,
          ),
          jasmine.stringContaining(
            `TestComponent.html(1, 10): Argument of type '(v: number) => number' is not assignable to parameter of type '(v: string) => number`,
          ),
        ],
      },
    ];

    generateDiagnoseJasmineSpecs(bindingCases);
  });
});
