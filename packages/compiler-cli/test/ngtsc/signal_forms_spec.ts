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
import ts from 'typescript';

const testFiles = loadStandardTestFiles({forms: true});

runInEachFileSystem(() => {
  describe('signal forms', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({
        // This is the default in Angular apps so we enable it to ensure consistent behavior.
        strict: true,
        strictTemplates: true,
      });
    });

    function extractMessage(diag: ts.Diagnostic) {
      return typeof diag.messageText === 'string' ? diag.messageText : diag.messageText.messageText;
    }

    it('should check that the field is present', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Field} from '@angular/forms/signals';

          @Component({
            template: '<input [field]="null"/>',
            imports: [Field]
          })
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Type 'null' is not assignable to type '() => FieldState<string, string | number>'.`,
      );
    });

    it('should treat Field directives not coming from the forms module as regular directives', () => {
      env.write(
        'field.ts',
        `
          import {Directive, input} from '@angular/core';

          @Directive({selector: '[field]'})
          export class Field {
            readonly field = input.required<string>();
          }
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Field} from './field';

          @Component({
            template: '<input [field]="null"/>',
            imports: [Field]
          })
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(`Type 'null' is not assignable to type 'string'.`);
    });

    it('should infer an input without a `type` as a string field', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal} from '@angular/core';
          import {Field, form} from '@angular/forms/signals';

          @Component({
            template: '<input [field]="f"/>',
            imports: [Field]
          })
          export class Comp {
            f = form(signal(0));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Type '() => FieldState<number, string | number>' is not assignable to type '() => FieldState<string, string | number>'.`,
      );
    });

    it('should infer the type of the field from the input `type`', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal} from '@angular/core';
          import {Field, form} from '@angular/forms/signals';

          @Component({
            template: '<input type="date" [field]="f"/>',
            imports: [Field]
          })
          export class Comp {
            f = form(signal(null as unknown));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Type '() => FieldState<unknown, string | number>' is not assignable to type '() => FieldState<string | number | Date | null, string | number>'.`,
      );
    });

    it('should infer the type of a custom value control', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal, model} from '@angular/core';
          import {Field, form, FormValueControl} from '@angular/forms/signals';

          interface User {
            firstName: string;
            lastName: string;
          }

          @Component({selector: 'user-control', template: ''})
          export class UserControl implements FormValueControl<User> {
            readonly value = model<User>({firstName: 'Frodo', lastName: 'Baggins'});
          }

          @Component({
            template: '<user-control [field]="f"/>',
            imports: [Field, UserControl]
          })
          export class Comp {
            f = form(signal({name: 'Bilbo'}));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Type 'FieldTree<{ name: string; }, string | number>' is not assignable to type 'FieldTree<User, string | number>'.`,
      );
    });

    it('should infer the type of a custom checkbox control', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal, model} from '@angular/core';
          import {Field, form, FormCheckboxControl} from '@angular/forms/signals';

          @Component({selector: 'my-checkbox', template: ''})
          export class MyCheckbox implements FormCheckboxControl {
            readonly checked = model(false);
          }

          @Component({
            template: '<my-checkbox [field]="f"/>',
            imports: [Field, MyCheckbox]
          })
          export class Comp {
            f = form(signal(''));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Type '() => FieldState<string, string | number>' is not assignable to type '() => FieldState<boolean, string | number>'.`,
      );
    });

    it('should not report a custom control that conforms to `FormValueControl`', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal, model} from '@angular/core';
          import {Field, form, FormValueControl} from '@angular/forms/signals';

          @Component({ selector: 'string-control', template: '' })
          class StringControl implements FormValueControl<string> {
            value = model('');
          }

          @Component({
            selector: 'app-root',
            imports: [Field, StringControl],
            template: '<string-control [field]="field" />',
          })
          class App {
            field = form(signal(''));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should report unsupported property bindings on a field', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal} from '@angular/core';
          import {Field, form} from '@angular/forms/signals';

          @Component({
            template: '<input type="number" [field]="f" [max]="10"/>',
            imports: [Field]
          })
          export class Comp {
            f = form(signal(0));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Binding to '[max]' is not allowed on nodes using the '[field]' directive`,
      );
    });

    it('should report unsupported attribute bindings on a field', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal} from '@angular/core';
          import {Field, form} from '@angular/forms/signals';

          @Component({
            template: '<input [attr.type]="type" [field]="f"/>',
            imports: [Field]
          })
          export class Comp {
            f = form(signal(''));
            type = 'number';
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Binding to '[attr.type]' is not allowed on nodes using the '[field]' directive`,
      );
    });

    it('should report unsupported static attributes of a field', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal} from '@angular/core';
          import {Field, form} from '@angular/forms/signals';

          @Component({
            template: '<input value="Hello" [field]="f"/>',
            imports: [Field]
          })
          export class Comp {
            f = form(signal(''));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Setting the 'value' attribute is not allowed on nodes using the '[field]' directive`,
      );
    });

    it('should check that a custom value control conforms to FormValueControl', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal, model, input} from '@angular/core';
          import {Field, form} from '@angular/forms/signals';

          @Component({selector: 'user-control', template: ''})
          export class UserControl {
            readonly value = model<number>(0);
            required = input<number>(0);
          }

          @Component({
            template: '<user-control [field]="f"/>',
            imports: [Field, UserControl]
          })
          export class Comp {
            f = form(signal(1));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Type 'UserControl' is not assignable to type 'FormValueControl<any>'.`,
      );
      expect((diags[0].messageText as ts.DiagnosticMessageChain).next?.[0].messageText).toBe(
        `The types of 'required[SIGNAL].transformFn' are incompatible between these types.`,
      );
    });

    it('should check that a custom checkbox control conforms to FormCheckboxControl', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal, model, input} from '@angular/core';
          import {Field, form} from '@angular/forms/signals';

          @Component({selector: 'user-control', template: ''})
          export class UserControl {
            readonly checked = model<boolean>(false);
            required = input<number>(0);
          }

          @Component({
            template: '<user-control [field]="f"/>',
            imports: [Field, UserControl]
          })
          export class Comp {
            f = form(signal(true));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Type 'UserControl' is not assignable to type 'FormCheckboxControl'.`,
      );
      expect((diags[0].messageText as ts.DiagnosticMessageChain).next?.[0].messageText).toBe(
        `The types of 'required[SIGNAL].transformFn' are incompatible between these types.`,
      );
    });

    it('should not report `value` as a missing required input when the `Field` directive is present', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal, model} from '@angular/core';
          import {Field, form, FormValueControl} from '@angular/forms/signals';

          @Component({selector: 'custom-control', template: ''})
          export class CustomControl implements FormValueControl<string> {
            readonly value = model.required<string>();
          }

          @Component({
            template: '<custom-control [field]="f"/>',
            imports: [Field, CustomControl]
          })
          export class Comp {
            f = form(signal(''));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should not report `checked` as a missing required input when the `Field` directive is present', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal, model} from '@angular/core';
          import {Field, form, FormCheckboxControl} from '@angular/forms/signals';

          @Component({selector: 'custom-control', template: ''})
          export class CustomControl implements FormCheckboxControl {
            readonly checked = model.required<boolean>();
          }

          @Component({
            template: '<custom-control [field]="f"/>',
            imports: [Field, CustomControl]
          })
          export class Comp {
            f = form(signal(false));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });
  });
});
