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
  describe('output() function type-check diagnostics', () => {
    const testCases: TestCase[] = [
      {
        id: 'basic output',
        outputs: {'evt': {type: 'OutputEmitterRef<string>'}},
        template: `<div dir (evt)="$event.bla">`,
        expected: [`TestComponent.html(1, 24): Property 'bla' does not exist on type 'string'.`],
      },
      {
        id: 'output with void type',
        outputs: {'evt': {type: 'OutputEmitterRef<void>'}},
        template: `<div dir (evt)="$event.x">`,
        expected: [`TestComponent.html(1, 24): Property 'x' does not exist on type 'void'.`],
      },
      {
        id: 'two way data binding, invalid',
        inputs: {'value': {type: 'InputSignal<string>', isSignal: true}},
        outputs: {'valueChange': {type: 'OutputEmitterRef<string>'}},
        template: `<div dir [(value)]="bla">`,
        component: `bla = true;`,
        expected: [
          `TestComponent.html(1, 12): Type 'boolean' is not assignable to type 'string'.`,
          `TestComponent.html(1, 10): Argument of type 'string' is not assignable to parameter of type 'boolean'.`,
        ],
      },
      {
        id: 'two way data binding, valid',
        inputs: {'value': {type: 'InputSignal<string>', isSignal: true}},
        outputs: {'valueChange': {type: 'OutputEmitterRef<string>'}},
        template: `<div dir [(value)]="bla">`,
        component: `bla: string = ''`,
        expected: [],
      },
      {
        id: 'complex output object',
        outputs: {'evt': {type: 'OutputEmitterRef<{works: boolean}>'}},
        template: `<div dir (evt)="x = $event.works">`,
        component: `x: never = null!`, // to raise a diagnostic to check the type.
        expected: [`TestComponent.html(1, 17): Type 'boolean' is not assignable to type 'never'.`],
      },
      // mixing cases
      {
        id: 'mixing decorator-based and initializer-based outputs',
        outputs: {
          evt1: {type: 'EventEmitter<string>'},
          evt2: {type: 'OutputEmitterRef<string>'},
        },
        template: `<div dir (evt1)="x1 = $event" (evt2)="x2 = $event">`,
        component: `
          x1: never = null!;
          x2: never = null!;
        `,
        expected: [
          `TestComponent.html(1, 18): Type 'string' is not assignable to type 'never'.`,
          `TestComponent.html(1, 39): Type 'string' is not assignable to type 'never'.`,
        ],
      },
      // restricted fields
      {
        id: 'allows access to private output',
        outputs: {evt: {type: 'OutputEmitterRef<string>', restrictionModifier: 'private'}},
        template: `<div dir (evt)="true">`,
        expected: [],
      },
      {
        id: 'allows access to protected output',
        outputs: {evt: {type: 'OutputEmitterRef<string>', restrictionModifier: 'protected'}},
        template: `<div dir (evt)="true">`,
        expected: [],
      },
    ];

    generateDiagnoseJasmineSpecs(testCases);
  });
});
