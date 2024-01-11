/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
  describe('Interpolated Signal ', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(interpolatedSignalFactory.code).toBe(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED);
      expect(interpolatedSignalFactory.name)
          .toBe(ExtendedTemplateDiagnosticName.INTERPOLATED_SIGNAL_NOT_INVOKED);
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
          templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {}
          /* options */
      );
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(0);
    });
  });

  it('should produce a warning when a signal isn\'t invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ mySignal1 }} {{ mySignal2 }}</div>`,
        },
        source: `
          import {signal, Signal} from '@angular/core';

          export class TestCmp {
            mySignal1 = signal<number>(0);
            mySignal2:Signal<number>;
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(2);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal1`);
    expect(getSourceCodeForDiagnostic(diags[1])).toBe(`mySignal2`);
  });

  it('should produce a warning when a readonly signal isn\'t invoked', () => {
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
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe('count');
  });

  it('should produce a warning when a computed signal isn\'t invoked', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div>{{ mySignal2 }}</div>`,
        },
        source: `
          import {signal, Signal, computed} from '@angular/core';

          export class TestCmp {
            mySignal1 = signal<number>(0);
            mySignal2 = computed(() => mySignal() * 2);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal2`);
  });

  it('should produce a warning when an input signal isn\'t invoked', () => {
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
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`myInput`);
  });

  it('should produce a warning when a required input signal isn\'t invoked', () => {
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
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`myRequiredInput`);
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
          import {signal, Signal, computed} from '@angular/core';

          export class TestCmp {
            mySignal1 = signal<number>(0);
            mySignal2 = computed(() => mySignal() * 2);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
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
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });

  it('should produce a warning when signal isn\'t invoked on interpolated binding', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div id="{{mySignal}}"></div>`,
        },
        source: `
          import {signal, Signal, computed} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
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
          import {signal, Signal, computed} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
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
          import {signal, Signal, computed} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`mySignal`);
  });

  it('should not produce a warning when signal is invoked in attribute binding interpolation ',
     () => {
       const fileName = absoluteFrom('/main.ts');
       const {program, templateTypeChecker} = setup([
         {
           fileName,
           templates: {
             'TestCmp': `<div attr.id="my-{{mySignal()}}-item"></div>`,
           },
           source: `
          import {signal, Signal, computed} from '@angular/core';

          export class TestCmp {
            mySignal = signal<number>(0);
          }`,
         },
       ]);
       const sf = getSourceFileOrError(program, fileName);
       const component = getClass(sf, 'TestCmp');
       const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
           templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {}
           /* options */
       );
       const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
       expect(diags.length).toBe(0);
     });

  it('should produce a warning when nested signal isn\'t invoked on interpolated binding', () => {
    const fileName = absoluteFrom('/main.ts');
    const {program, templateTypeChecker} = setup([
      {
        fileName,
        templates: {
          'TestCmp': `<div id="{{myObject.myObject2.myNestedSignal}}"></div>`,
        },
        source: `
          import {signal, Signal, computed} from '@angular/core';

          export class TestCmp {
            myObject = {myObject2: {myNestedSignal: signal<number>(0)}};
          }`,
      },
    ]);
    const sf = getSourceFileOrError(program, fileName);
    const component = getClass(sf, 'TestCmp');
    const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(1);
    expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
    expect(diags[0].code).toBe(ngErrorCode(ErrorCode.INTERPOLATED_SIGNAL_NOT_INVOKED));
    expect(getSourceCodeForDiagnostic(diags[0])).toBe(`myNestedSignal`);
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
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
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
        templateTypeChecker, program.getTypeChecker(), [interpolatedSignalFactory], {} /* options */
    );
    const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
    expect(diags.length).toBe(0);
  });
});
