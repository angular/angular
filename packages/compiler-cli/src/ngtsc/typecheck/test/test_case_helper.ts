/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {TypeCheckingConfig} from '../api';
import {diagnose} from '../testing';

export interface TestInput {
  /** String type of the input. e.g. `InputSignal<string>` or just `string`. */
  type: string;
  /** Whether the input is signal-based and should be registered as such in metadata. */
  isSignal: boolean;
  /** Restriction modifier for the input. e.g. `private`, `protected` etc. */
  restrictionModifier?: string;
}

export interface TestOutput {
  /** String type of the output. e.g. `EventEmitter<string>`. */
  type: string;
  /** Restriction modifier for the input. e.g. `private`, `protected` etc. */
  restrictionModifier?: string;
}

export interface TestCase {
  /** Unique id for the test. */
  id: string;
  /** Record of inputs registered in the test directive. */
  inputs?: Record<string, TestInput>;
  /** Record of outputs registered in the test directive. */
  outputs?: Record<string, TestOutput>;
  /** Template of the test component. */
  template: string;
  /** Additional class members to be added to the test directive */
  extraDirectiveMembers?: string[];
  /** Generics to be added to the test. directive */
  directiveGenerics?: string;
  /** Additional test code that can be added to the test file. */
  extraFileContent?: string;
  /** Test component class code. */
  component?: string;
  /** Expected diagnostics. */
  expected: (string | jasmine.AsymmetricMatcher<string>)[];
  /** Additional type checking options to be used. */
  options?: Partial<TypeCheckingConfig>;
  /** Whether the test case should exclusively run. */
  focus?: boolean;
}

/**
 * Diagnoses the given test case, by constructing the test TypeScript file
 * and running the type checker on it.
 */
export function typeCheckDiagnose(c: TestCase, compilerOptions?: ts.CompilerOptions) {
  const inputs = c.inputs ?? {};
  const outputs = c.outputs ?? {};

  const inputFields = Object.keys(inputs).map(
    (inputName) =>
      `${inputs[inputName].restrictionModifier ?? ''} ${inputName}: ${inputs[inputName].type}`,
  );

  const outputFields = Object.keys(outputs).map(
    (name) => `${outputs[name].restrictionModifier ?? ''} ${name}: ${outputs[name].type}`,
  );

  const testComponent = `
      import {
        InputSignal,
        EventEmitter,
        OutputEmitterRef,
        InputSignalWithTransform,
        ModelSignal,
        WritableSignal,
      } from '@angular/core';

      ${c.extraFileContent ?? ''}

      class Dir${c.directiveGenerics ?? ''} {
        ${inputFields.join('\n')}
        ${outputFields.join('\n')}

        ${c.extraDirectiveMembers?.join('\n') ?? ''}
      }
      class TestComponent {
        ${c.component ?? ''}
      }
    `;

  const inputDeclarations = Object.keys(inputs).reduce((res, inputName) => {
    return {
      ...res,
      [inputName]: {
        bindingPropertyName: inputName,
        classPropertyName: inputName,
        isSignal: inputs[inputName].isSignal,
        required: false,
        transform: null,
      },
    };
  }, {});

  const outputDeclarations = Object.keys(outputs).reduce((res, outputName) => {
    return {
      ...res,
      [outputName]: outputName,
    };
  }, {});

  const messages = diagnose(
    c.template,
    testComponent,
    [
      {
        type: 'directive',
        name: 'Dir',
        selector: '[dir]',
        exportAs: ['dir'],
        isGeneric: c.directiveGenerics !== undefined,
        outputs: outputDeclarations,
        inputs: inputDeclarations,
        restrictedInputFields: Object.entries(inputs)
          .filter(([_, i]) => i.restrictionModifier !== undefined)
          .map(([name]) => name),
      },
    ],
    undefined,
    c.options,
    compilerOptions,
  );

  expect(messages).toEqual(c.expected);
}

/** Generates Jasmine `it` specs for all test cases. */
export function generateDiagnoseJasmineSpecs(cases: TestCase[]): void {
  for (const c of cases) {
    (c.focus ? fit : it)(c.id, () => {
      typeCheckDiagnose(c);
    });
  }

  describe('with `--strict`', () => {
    for (const c of cases) {
      (c.focus ? fit : it)(c.id, () => {
        typeCheckDiagnose(c, {strict: true});
      });
    }
  });
}
