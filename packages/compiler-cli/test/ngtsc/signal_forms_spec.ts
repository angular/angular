/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {NgtscTestEnvironment} from './env';

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
        `Type 'null' is not assignable to type 'FieldTree<any, string | number>'.`,
      );
    });

    it('should check that the field type is correct', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Field} from '@angular/forms/signals';

          @Component({
            template: '<input field="staticString"/>',
            imports: [Field]
          })
          export class Comp {}
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Type 'string' is not assignable to type 'FieldTree<any, string | number>'.`,
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
      expect(extractMessage(diags[0])).toBe(`Type 'number' is not assignable to type 'string'.`);
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
            f = form(signal({}));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Type '{}' is not assignable to type 'string | number | Date | null'.`,
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
        `Type '{ name: string; }' is missing the following properties from type 'User': firstName, lastName`,
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
      expect(extractMessage(diags[0])).toBe(`Type 'string' is not assignable to type 'boolean'.`);
    });

    it('should infer the type of a generic custom control', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal, model} from '@angular/core';
          import {Field, form, FormValueControl} from '@angular/forms/signals';

          @Component({selector: 'custom-control', template: ''})
          export class CustomControl<T> implements FormValueControl<T> {
            readonly value = model.required<T>();
          }

          @Component({
            template: \`
              <custom-control [field]="f" #comp/>
              {{expectsString(comp.value())}}
            \`,
            imports: [Field, CustomControl]
          })
          export class Comp {
            f = form(signal(0));
            expectsString(value: string) {}
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Argument of type 'number' is not assignable to parameter of type 'string'.`,
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
            template: '<input [field]="f" [attr.maxlength]="maxLength"/>',
            imports: [Field]
          })
          export class Comp {
            f = form(signal(''));
            maxLength = 10;
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(extractMessage(diags[0])).toBe(
        `Binding to '[attr.maxlength]' is not allowed on nodes using the '[field]' directive`,
      );
    });

    it('should report unsupported property bindings on a field with a custom control', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal, model, input} from '@angular/core';
          import {Field, form, FormValueControl} from '@angular/forms/signals';

          @Component({selector: 'custom-control', template: ''})
          export class CustomControl implements FormValueControl<number> {
            readonly value = model<number>(0);
            readonly max = input<number | undefined>(1);
          }

          @Component({
            template: '<custom-control [field]="f" [max]="2"/>',
            imports: [Field, CustomControl]
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

    it('should allow binding to `value` on radio controls', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal} from '@angular/core';
          import {Field, form} from '@angular/forms/signals';

          @Component({
            template: \`
              <form>
                <input type="radio" value="a" [field]="f">
                <input type="radio" value="b" [field]="f">
                <input type="radio" value="c" [field]="f">
              </form>
            \`,
            imports: [Field]
          })
          export class Comp {
            f = form(signal('a'), {name: 'test'});
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should check that the radio button value is a string', () => {
      env.write(
        'test.ts',
        `
          import {Component, signal} from '@angular/core';
          import {Field, form} from '@angular/forms/signals';

          @Component({
            template: \`
              <form>
                <input type="radio" [value]="num" [field]="f">
              </form>
            \`,
            imports: [Field]
          })
          export class Comp {
            f = form(signal('a'), {name: 'test'});
            num = 1;
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toBe(`Type 'number' is not assignable to type 'string'.`);
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
      expect(extractMessage(diags[0])).toBe(`Type 'boolean' is not assignable to type 'number'.`);
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
      expect(extractMessage(diags[0])).toBe(`Type 'boolean' is not assignable to type 'number'.`);
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

    it('should not check field on native control that has a ControlValueAccessor directive', () => {
      env.write(
        'test.ts',
        `
          import {Component, Directive, signal} from '@angular/core';
          import {ControlValueAccessor} from '@angular/forms';
          import {Field, form} from '@angular/forms/signals';

          @Directive({selector: '[customCva]'})
          export class CustomCva implements ControlValueAccessor {
            writeValue() {}
            registerOnChange() {}
            registerOnTouched() {}
          }

          @Component({
            template: '<input customCva [field]="f"/>',
            imports: [Field, CustomCva]
          })
          export class Comp {
            f = form(signal(0));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should not check field on native control that has a directive inheriting from a ControlValueAccessor', () => {
      env.write(
        'test.ts',
        `
          import {Component, Directive, signal} from '@angular/core';
          import {ControlValueAccessor} from '@angular/forms';
          import {Field, form} from '@angular/forms/signals';

          @Directive()
          export class Grandparent implements ControlValueAccessor {
            writeValue() {}
            registerOnChange() {}
            registerOnTouched() {}
          }

          @Directive()
          export class Parent extends Grandparent {}

          @Directive({selector: '[customCva]'})
          export class CustomCva extends Parent {}

          @Component({
            template: '<input customCva [field]="f"/>',
            imports: [Field, CustomCva]
          })
          export class Comp {
            f = form(signal(0));
          }
        `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });
  });
});
