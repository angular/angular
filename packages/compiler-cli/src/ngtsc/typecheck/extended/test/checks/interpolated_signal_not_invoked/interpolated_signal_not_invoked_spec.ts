/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as interpolatedSignalFactory} from '../../../checks/interpolated_signal_not_invoked';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('Interpolated Signal', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(interpolatedSignalFactory.code).toBe(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED);
      expect(interpolatedSignalFactory.name).toBe(
        ExtendedTemplateDiagnosticName.INTERPOLATED_SIGNAL_NOT_INVOKED,
      );
    });

    it('should not produce a warning when a signal getter is invoked', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div>{{ mySignal() }}</div>`,
          },
          source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            mySignal = signal(0);
          }`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [interpolatedSignalFactory],
        {},
        /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });

  it('should produce a warning when a signal is not invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ mySignal1 }} {{ mySignal2 }} {{ !mySignal3 }}</div>`,
        },
        source: `
          import {signal, Signal} from '@angular/core';

          export class TestCmp {
            mySignal1 = signal<number>(0);
            mySignal2: Signal<number>;
            mySignal3 = signal<number>(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(3);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal1`);
    expect(getSourceCodeForDiagnostic(diags[1])).toBe(`mySignal2`);
    expect(getSourceCodeForDiagnostic(diags[2])).toBe(`mySignal3`);
  });

  it('should produce a warning when a readonly signal is not invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ count }}</div>`,
        },
        source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            count = signal(0).asReadonly();
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe('count');
  });

  it('should produce a warning when a computed signal is not invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ mySignal2 }}</div>`,
        },
        source: `
          import {signal, computed} from '@angular/core';

          export class TestCmp {
            mySignal1 = signal<number>(0);
            mySignal2 = computed(() => mySignal() * 2);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal2`);
  });

  it('should produce a warning when an input signal is not invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ myInput }}</div>`,
        },
        source: `
          import {input} from '@angular/core';

          export class TestCmp {
            myInput = input(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`myInput`);
  });

  it('should produce a warning when a required input signal is not invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ myRequiredInput }}</div>`,
        },
        source: `
          import {input} from '@angular/core';

          export class TestCmp {
            myRequiredInput = input.required(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`myRequiredInput`);
  });

  it('should produce a warning when a model signal is not invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ myModel }}</div>`,
        },
        source: `
          import {model} from '@angular/core';

          export class TestCmp {
            myModel = model(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`myModel`);
  });

  it('should produce a warning when a required model signal is not invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ myRequiredModel }}</div>`,
        },
        source: `
          import {model} from '@angular/core';

          export class TestCmp {
            myRequiredModel = model.required(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`myRequiredModel`);
  });

  it('should not produce a warning when a signal is not invoked in a banana in box binding', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div [(value)]="signal">{{ myRequiredModel }}</div>`,
        },
        source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            mySignal = signal(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  it('should not produce a warning when a signal is not invoked in an input binding as they are skipped', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div dir [myInput]="mySignal"></div>`,
        },
        source: `
          import {signal, input} from '@angular/core';

          export class TestDir {
            myInput = input.required();
          }
          export class TestCmp {
            mySignal = signal(0);
          }`,
        declarations: [
          {
            type: 'directive',
            name: 'TestDir',
            selector: '[dir]',
            inputs: {
              myInput: {
                isSignal: true,
                bindingPropertyName: 'myInput',
                classPropertyName: 'myInput',
                required: true,
                transform: null,
              },
            },
          },
        ],
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {},
      /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  it('should produce a warning when a signal in a nested property read is not invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ obj.nested.prop.signal }}</div>`,
        },
        source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            obj = {
              nested: {
                prop: {
                  signal: signal<number>(0)
                }
              }
            }
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`signal`);
  });

  it('should not produce a warning when model signals are invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ myModel() }} - {{ myRequiredModel() }}</div>`,
        },
        source: `
          import {model} from '@angular/core';

          export class TestCmp {
            myModel = model(0);
            myRequiredModel = model.required(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  it('should not produce a warning when a computed signal is invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ mySignal2() }}</div>`,
        },
        source: `
          import {signal, computed} from '@angular/core';

          export class TestCmp {
            mySignal1 = signal<number>(0);
            mySignal2 = computed(() => mySignal() * 2);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  it('should not produce a warning when input signals are invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ myInput() }} - {{ myRequiredInput() }}</div>`,
        },
        source: `
          import {input} from '@angular/core';

          export class TestCmp {
            myInput = input(0);
            myRequiredInput = input.required(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  it('should produce a warning when signal is not invoked on interpolated binding', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div id="{{mySignal}}"></div>`,
        },
        source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal`);
  });

  it('should not produce a warning when signal is invoked on interpolated binding', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div id="{{mySignal()}}"></div>`,
        },
        source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  it('should produce a warning when signal is invoked in attribute binding interpolation ', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div attr.id="my-{{mySignal}}-item"></div>`,
        },
        source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal`);
  });

  it('should not produce a warning when signal is invoked in attribute binding interpolation ', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div attr.id="my-{{mySignal()}}-item"></div>`,
        },
        source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {},
      /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  it('should produce a warning when nested signal is not invoked on interpolated binding', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div id="{{myObject.myObject2.myNestedSignal}}"></div>`,
        },
        source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            myObject = {myObject2: {myNestedSignal: signal<number>(0)}};
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`myNestedSignal`);
  });

  [
    ['dom property', 'id'],
    ['class', 'class.green'],
    ['style', 'style.width'],
    ['attribute', 'attr.role'],
    ['animation', '@triggerName'],
  ].forEach(([name, binding]) => {
    it(`should produce a warning when signal isn't invoked on ${name} binding`, () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [${binding}]="mySignal"></div> 
            <div [${binding}]="!negatedSignal"></div>`,
          },
          source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
            negatedSignal = signal<number>(0);
          }`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [interpolatedSignalFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(2);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal`);
      expect(getSourceCodeForDiagnostic(diags[1])).toBe(`negatedSignal`);
    });

    it(`should not produce a warning when signal is invoked on ${name} binding`, () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([
        {
          fileName,
          templates: {
            'TestCmp': `<div [${binding}]="mySignal()"></div>
            <div [${binding}]="!negatedSignal()"></div>`,
          },
          source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
            negatedSignal = signal<number>(0);
          }`,
        },
      ]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker,
        program.getTypeChecker(),
        [interpolatedSignalFactory],
        {} /* options */,
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });

  it('should not produce a warning with other Signal type', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ mySignal }} {{ mySignal2 }}</div>`,
        },
        source: `
          import {signal} from '@not-angular/core';

          export class TestCmp {
            mySignal = signal(0);
            mySignal2 = signal(2);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  it('should not produce a warning with other Signal type', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ foo(mySignal) }} </div>`,
        },
        source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            mySignal = signal(0);

            foo(signal: Signal) {
              return 'foo'
            }
          }
          `,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
      templateTypeChecker,
      program.getTypeChecker(),
      [interpolatedSignalFactory],
      {} /* options */,
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  ['name', 'length', 'prototype', 'set', 'update', 'asReadonly'].forEach(
    (functionInstanceProperty) => {
      it(`should produce a warning when a property named '${functionInstanceProperty}' of a not invoked signal is used in interpolation`, () => {
        const fileName = absoluteFrom('/main.ts');
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {
              'TestCmp': `<div>{{myObject.mySignal.${functionInstanceProperty}}}</div>`,
            },
            source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            myObject = { mySignal: signal<{ ${functionInstanceProperty}: string }>({ ${functionInstanceProperty}: 'foo' }) };
          }`,
          },
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const component = getClass(sf, 'TestCmp');
        const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker,
          program.getTypeChecker(),
          [interpolatedSignalFactory],
          {},
          /* options */
        );
        const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
        expect(diags.length).toBe(1);
        expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
        expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal`);
      });

      it(`should not produce a warning when a property named ${functionInstanceProperty} of an invoked signal is used in interpolation`, () => {
        const fileName = absoluteFrom('/main.ts');
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {
              'TestCmp': `<div>{{mySignal().${functionInstanceProperty}}}</div>`,
            },
            source: `
            import {signal} from '@angular/core';

            export class TestCmp {
              mySignal = signal<{ ${functionInstanceProperty}: string }>({ ${functionInstanceProperty}: 'foo' });
            }`,
          },
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const component = getClass(sf, 'TestCmp');
        const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker,
          program.getTypeChecker(),
          [interpolatedSignalFactory],
          {},
          /* options */
        );
        const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
        expect(diags.length).toBe(0);
      });

      it(`should not produce a warning when a property named ${functionInstanceProperty} of an object is used in interpolation`, () => {
        const fileName = absoluteFrom('/main.ts');
        const {program, templateTypeChecker} = setup([
          {
            fileName,
            templates: {
              'TestCmp': `<div>{{myObject.${functionInstanceProperty}}}</div>`,
            },
            source: `
            import {signal} from '@angular/core';

            export class TestCmp {
              myObject = { ${functionInstanceProperty}: 'foo' };
            }`,
          },
        ]);
        const sf = getSourceFileOrError(program, fileName);
        const component = getClass(sf, 'TestCmp');
        const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker,
          program.getTypeChecker(),
          [interpolatedSignalFactory],
          {},
          /* options */
        );
        const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
        expect(diags.length).toBe(0);
      });

      [false, true].forEach((negate) => {
        // Control flow
        it(`should produce a warning when a property named '${functionInstanceProperty}' of a not invoked signal is used in an @if control flow expression`, () => {
          const fileName = absoluteFrom('/main.ts');
          const {program, templateTypeChecker} = setup([
            {
              fileName,
              templates: {
                'TestCmp': `@if(${negate ? '!' : ''}myObject.mySignal.${functionInstanceProperty}) { <div>Show</div> }`,
              },
              source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            myObject = { mySignal: signal<{ ${functionInstanceProperty}: string }>({ ${functionInstanceProperty}: 'foo' }) };
          }`,
            },
          ]);
          const sf = getSourceFileOrError(program, fileName);
          const component = getClass(sf, 'TestCmp');
          const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
            templateTypeChecker,
            program.getTypeChecker(),
            [interpolatedSignalFactory],
            {},
            /* options */
          );
          const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
          expect(diags.length).toBe(1);
          expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
          expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal`);
        });

        it(`should not produce a warning when a property named '${functionInstanceProperty}' of an invoked signal is used in an @if control flow expression`, () => {
          const fileName = absoluteFrom('/main.ts');
          const {program, templateTypeChecker} = setup([
            {
              fileName,
              templates: {
                'TestCmp': `@if(${negate ? '!' : ''}myObject.mySignal().${functionInstanceProperty}) { <div>Show</div> }`,
              },
              source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            myObject = { mySignal: signal<{ ${functionInstanceProperty}: string }>({ ${functionInstanceProperty}: 'foo' }) };
          }`,
            },
          ]);
          const sf = getSourceFileOrError(program, fileName);
          const component = getClass(sf, 'TestCmp');
          const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
            templateTypeChecker,
            program.getTypeChecker(),
            [interpolatedSignalFactory],
            {},
            /* options */
          );
          const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
          expect(diags.length).toBe(0);
        });

        it(`should produce a warning when a property named '${functionInstanceProperty}' of a not invoked signal is used in an @switch control flow expression`, () => {
          const fileName = absoluteFrom('/main.ts');
          const {program, templateTypeChecker} = setup([
            {
              fileName,
              templates: {
                'TestCmp': `@switch(${negate ? '!' : ''}myObject.mySignal.${functionInstanceProperty}) { }`,
              },
              source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            myObject = { mySignal: signal<{ ${functionInstanceProperty}: string }>({ ${functionInstanceProperty}: 'foo' }) };
          }`,
            },
          ]);
          const sf = getSourceFileOrError(program, fileName);
          const component = getClass(sf, 'TestCmp');
          const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
            templateTypeChecker,
            program.getTypeChecker(),
            [interpolatedSignalFactory],
            {},
            /* options */
          );
          const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
          expect(diags.length).toBe(1);
          expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
          expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
          expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal`);
        });

        it(`should not produce a warning when a property named '${functionInstanceProperty}' of an invoked signal is used in an @switch control flow expression`, () => {
          const fileName = absoluteFrom('/main.ts');
          const {program, templateTypeChecker} = setup([
            {
              fileName,
              templates: {
                'TestCmp': `@switch(${negate ? '!' : ''}myObject.mySignal().${functionInstanceProperty}) { }`,
              },
              source: `
          import {signal} from '@angular/core';

          export class TestCmp {
            myObject = { mySignal: signal<{ ${functionInstanceProperty}: string }>({ ${functionInstanceProperty}: 'foo' }) };
          }`,
            },
          ]);
          const sf = getSourceFileOrError(program, fileName);
          const component = getClass(sf, 'TestCmp');
          const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
            templateTypeChecker,
            program.getTypeChecker(),
            [interpolatedSignalFactory],
            {},
            /* options */
          );
          const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
          expect(diags.length).toBe(0);
        });
      });
    },
  );
});
