/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {runInEachFileSystem} from '../../file_system/testing';
import {TypeCheckingConfig} from '../api';
import {diagnose} from '../testing';

runInEachFileSystem(() => {
  describe('input signal type-check diagnostics', () => {
    const bindingCases: {
      id: string,
      inputs: Record<string, {type: string, isSignal: boolean, restrictionModifier?: string}>,
      template: string,
      extraDirectiveMembers?: string[],
      directiveGenerics?: string,
      component?: string, expected: (string|jasmine.AsymmetricMatcher<string>)[],
      options?: Partial<TypeCheckingConfig>,
      focus?: boolean,
    }[] =
        [
          {
            id: 'binding via attribute',
            inputs: {'show': {type: 'InputSignal<boolean, boolean>', isSignal: true}},
            template: `<div dir show="works">`,
            expected: [
              `TestComponent.html(1, 10): Type 'string' is not assignable to type 'boolean'.`,
            ],
          },
          {
            id: 'explicit inline true binding',
            inputs: {'show': {type: 'InputSignal<boolean, boolean>', isSignal: true}},
            template: `<div dir [show]="true">`,
            expected: [],
          },
          {
            id: 'explicit inline false binding',
            inputs: {'show': {type: 'InputSignal<boolean, boolean>', isSignal: true}},
            template: `<div dir [show]="false">`,
            expected: [],
          },
          {
            id: 'explicit binding using component field',
            inputs: {'show': {type: 'InputSignal<boolean, boolean>', isSignal: true}},
            template: `<div dir [show]="prop">`,
            component: 'prop = true;',
            expected: [],
          },
          {
            id: 'complex object input',
            inputs:
                {'show': {type: 'InputSignal<{works: boolean}, {works: boolean}>', isSignal: true}},
            template: `<div dir [show]="{works: true}">`,
            expected: [],
          },
          {
            id: 'complex object input, unexpected extra fields',
            inputs:
                {'show': {type: 'InputSignal<{works: boolean}, {works: boolean}>', isSignal: true}},
            template: `<div dir [show]="{works: true, extraField: true}">`,
            expected: [
              jasmine.stringContaining(
                  `Object literal may only specify known properties, and '"extraField"' does not exist in type '{ works: boolean; }'.`)
            ],
          },
          {
            id: 'complex object input, missing fields',
            inputs:
                {'show': {type: 'InputSignal<{works: boolean}, {works: boolean}>', isSignal: true}},
            template: `<div dir [show]="{}">`,
            expected: [
              `TestComponent.html(1, 11): Property 'works' is missing in type '{}' but required in type '{ works: boolean; }'.`
            ],
          },
          // mixing cases
          {
            id: 'mixing zone and signal inputs, valid',
            inputs: {
              zoneProp: {type: 'string', isSignal: false},
              signalProp: {type: 'InputSignal<string, string>', isSignal: true},
            },
            template: `<div dir [zoneProp]="'works'" [signalProp]="'stringVal'">`,
            expected: []
          },
          {
            id: 'mixing zone and signal inputs, invalid zone binding',
            inputs: {
              zoneProp: {type: 'string', isSignal: false},
              signalProp: {type: 'InputSignal<string, string>', isSignal: true},
            },
            template: `<div dir [zoneProp]="false" [signalProp]="'stringVal'">`,
            expected:
                [`TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`]
          },
          {
            id: 'mixing zone and signal inputs, invalid signal binding',
            inputs: {
              zoneProp: {type: 'string', isSignal: false},
              signalProp: {type: 'InputSignal<string, string>', isSignal: true},
            },
            template: `<div dir [zoneProp]="'works'" [signalProp]="{}">`,
            expected: [`TestComponent.html(1, 32): Type '{}' is not assignable to type 'string'.`]
          },
          {
            id: 'mixing zone and signal inputs, both invalid',
            inputs: {
              zoneProp: {type: 'string', isSignal: false},
              signalProp: {type: 'InputSignal<string, string>', isSignal: true},
            },
            template: `<div dir [zoneProp]="false" [signalProp]="{}">`,
            expected: [
              `TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`,
              `TestComponent.html(1, 30): Type '{}' is not assignable to type 'string'.`
            ]
          },
          // restricted fields
          {
            id: 'disallows access to private input',
            inputs: {
              pattern: {
                type: 'InputSignal<string, string>',
                isSignal: true,
                restrictionModifier: 'private'
              }
            },
            template: `<div dir [pattern]="'works'">`,
            expected: [
              `TestComponent.html(1, 11): Property 'pattern' is private and only accessible within class 'Dir'.`
            ],
          },
          {
            id: 'disallows access to protected input',
            inputs: {
              pattern: {
                type: 'InputSignal<string, string>',
                isSignal: true,
                restrictionModifier: 'protected'
              }
            },
            template: `<div dir [pattern]="'works'">`,
            expected: [
              `TestComponent.html(1, 11): Property 'pattern' is protected and only accessible within class 'Dir' and its subclasses.`
            ],
          },
          {
            // NOTE FOR REVIEWER: This is something different with input signals. The framework
            // runtime, and the input public API are already read-only, but under the hood it would
            // be perfectly fine to keep the `input()` member as readonly.
            id: 'allows access to readonly input',
            inputs: {
              pattern: {
                type: 'InputSignal<string, string>',
                isSignal: true,
                restrictionModifier: 'readonly'
              }
            },
            template: `<div dir [pattern]="'works'">`,
            expected: [],
          },
          // restricted fields (but opt-out of check)
          {
            id: 'allow access to private input if modifiers are explicitly ignored',
            inputs: {
              pattern: {
                type: 'InputSignal<string, string>',
                isSignal: true,
                restrictionModifier: 'private'
              }
            },
            template: `<div dir [pattern]="'works'">`,
            expected: [],
            options: {
              honorAccessModifiersForInputBindings: false,
            },
          },
          {
            id: 'allow access to protected input if modifiers are explicitly ignored',
            inputs: {
              pattern: {
                type: 'InputSignal<string, string>',
                isSignal: true,
                restrictionModifier: 'protected'
              }
            },
            template: `<div dir [pattern]="'works'">`,
            expected: [],
            options: {
              honorAccessModifiersForInputBindings: false,
            },
          },
          {
            id: 'allow access to readonly input if modifiers are explicitly ignored',
            inputs: {
              pattern: {
                type: 'InputSignal<string, string>',
                isSignal: true,
                restrictionModifier: 'readonly'
              }
            },
            template: `<div dir [pattern]="'works'">`,
            expected: [],
            options: {
              honorAccessModifiersForInputBindings: false,
            },
          },
          {
            id: 'allow access to private input if modifiers are explicitly ignored, but error if not assignable',
            inputs: {
              pattern: {
                type: 'InputSignal<string, string>',
                isSignal: true,
                restrictionModifier: 'private'
              }
            },
            template: `<div dir [pattern]="false">`,
            expected: [
              `TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`,
            ],
            options: {
              honorAccessModifiersForInputBindings: false,
            },
          },
          // coercion is not supported / respected
          {
            id: 'coercion members are not respected',
            inputs: {
              pattern: {
                type: 'InputSignal<string, string>',
                isSignal: true,
              },
            },
            extraDirectiveMembers: [
              'static ngAcceptInputType_pattern: string|boolean',
            ],
            template: `<div dir [pattern]="false">`,
            expected: [
              `TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`,
            ],
          },
          // transforms
          {
            id: 'signal inputs write transform type respected',
            inputs: {
              pattern: {
                type: 'InputSignal<string, string|boolean>',
                isSignal: true,
              },
            },
            template: `<div dir [pattern]="false">`,
            expected: [],
          },
          // with generics (type constructor tests)
          {
            id: 'generic inference and binding to directive, all signal inputs',
            inputs: {
              gen: {
                type: 'InputSignal<T, T>',
                isSignal: true,
              },
              other: {
                type: 'InputSignal<T, T>',
                isSignal: true,
              }
            },
            directiveGenerics: '<T>',
            template: `<div dir [gen]="false" [other]="'invalid'">`,
            expected: [
              `TestComponent.html(1, 25): Type 'string' is not assignable to type 'boolean'.`,
            ],
          },
          {
            id: 'generic inference and binding to directive, mix of zone and signal',
            inputs: {
              gen: {
                type: 'InputSignal<T, T>',
                isSignal: true,
              },
              other: {
                type: 'T',
                isSignal: false,
              }
            },
            directiveGenerics: '<T>',
            template: `<div dir [gen]="false" [other]="'invalid'">`,
            expected: [
              `TestComponent.html(1, 11): Type 'boolean' is not assignable to type 'string'.`,
            ],
          },
          {
            id: 'generic inference and binding to directive (with `extends boolean`), all signal inputs',
            inputs: {
              gen: {
                type: 'InputSignal<T, T>',
                isSignal: true,
              },
              other: {
                type: 'InputSignal<T, T>',
                isSignal: true,
              }
            },
            directiveGenerics: '<T extends boolean>',
            template: `<div dir [gen]="false" [other]="'invalid'">`,
            expected: [
              `TestComponent.html(1, 25): Type '"invalid"' is not assignable to type 'false'.`,
            ],
          },
          {
            id: 'generic inference and binding to directive (with `extends boolean`), mix of zone and signal inputs',
            inputs: {
              gen: {
                type: 'InputSignal<T, T>',
                isSignal: true,
              },
              other: {
                type: 'T',
                isSignal: false,
              }
            },
            directiveGenerics: '<T extends boolean>',
            template: `<div dir [gen]="false" [other]="'invalid'">`,
            expected: [
              `TestComponent.html(1, 25): Type 'string' is not assignable to type 'boolean'.`,
            ],
          },
          {
            id: 'generic multi-inference and bindings to directive, all signal inputs',
            inputs: {
              gen: {
                type: 'InputSignal<T, T>',
                isSignal: true,
              },
              other: {
                type: 'InputSignal<U, U>',
                isSignal: true,
              }
            },
            extraDirectiveMembers: [
              'tester: {t: T, u: U} = null!',
            ],
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
            id: 'generic multi-inference and bindings to directive, mix of zone and signal inputs',
            inputs: {
              gen: {
                type: 'InputSignal<T, T>',
                isSignal: true,
              },
              other: {
                type: 'U',
                isSignal: false,
              }
            },
            extraDirectiveMembers: [
              'tester: {t: T, u: U} = null!',
            ],
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
            id: 'generic multi-inference and bindings to directive, more complicated generic inference',
            inputs: {
              gen: {
                type: 'InputSignal<T, T>',
                isSignal: true,
              },
              other: {
                type: 'InputSignal<{u: U}, {u: U}>',
                isSignal: true,
              }
            },
            extraDirectiveMembers: [
              'tester: {t: T, u: U} = null!',
            ],
            directiveGenerics: '<T, U>',
            template: `
              <div dir [gen]="false" [other]="{u: null}"
                   #ref="dir" (click)="ref.tester = {t: 1, u: 0}">`,
            expected: [
              `TestComponent.html(3, 57): Type 'number' is not assignable to type 'boolean'.`,
              `TestComponent.html(3, 63): Type 'number' is not assignable to type 'null'.`,
            ],
          },
        ];

    for (const c of bindingCases) {
      (c.focus ? fit : it)(`bindings case - ${c.id}`, () => {
        const inputFields = Object.keys(c.inputs).map(
            inputName => `${c.inputs[inputName].restrictionModifier ?? ''} ${inputName}: ${
                c.inputs[inputName].type}`);

        const testComponent = `
              import {InputSignal} from '@angular/core';

              class Dir${c.directiveGenerics ?? ''} {
                ${inputFields.join('\n')}
                ${c.extraDirectiveMembers?.join('\n') ?? ''}
              }
              class TestComponent {
                ${c.component ?? ''}
              }
            `;

        const inputDeclarations = Object.keys(c.inputs).reduce((res, inputName) => {
          return {
            ...res,
            [inputName]: {
              bindingPropertyName: inputName,
              classPropertyName: inputName,
              isSignal: c.inputs[inputName].isSignal,
              required: false,
              transform: null,
            },
          };
        }, {});

        const messages = diagnose(
            c.template, testComponent,
            [
              {
                type: 'directive',
                name: 'Dir',
                selector: '[dir]',
                exportAs: ['dir'],
                isGeneric: c.directiveGenerics !== undefined,
                inputs: inputDeclarations,
                restrictedInputFields: Object.entries(c.inputs)
                                           .filter(([_, i]) => i.restrictionModifier !== undefined)
                                           .map(([name]) => name),
              },
            ],
            undefined, c.options);

        expect(messages).toEqual(c.expected);
      });
    }
  });
});
