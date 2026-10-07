# /out/control_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /control_bindings.ts
 * @generated
 */

import * as i0 from './control_bindings';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*199,235*/ = null! as i0.FormField; /*T:VAE*/
    var _t2 = null! as (typeof _t1)['formField']; /*T:VAE*/
    _t2[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*204,213*/ = 'Not a form control' /*204,234*/;
    this.value /*269,274*/ /*269,274*/;
    var _t3 /*T:DIR:0*/ /*313,340*/ = null! as i0.FormField; /*T:VAE*/
    var _t4 = null! as (typeof _t3)['formField']; /*T:VAE*/
    _t4[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*321,330*/ =
      this.value /*333,338*/ /*333,338*/ /*320,339*/;
  }
}

```

# /out/control_bindings.ts
```ts
import { Component, Directive, input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FormField {
  readonly formField = input<string>(
    ...((ngDevMode
      ? [undefined, { debugName: 'formField' }]
      : /* istanbul ignore next */ []) as []),
  );
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FormField, never> = function FormField_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FormField)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    FormField,
    '[formField]',
    never,
    { 'formField': { 'alias': 'formField'; 'required': false; 'isSignal': true } },
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: FormField,
    selectors: [['', 'formField', '']],
    inputs: { formField: [1, 'formField'] },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FormField,
        [{ type: Directive, args: [{ selector: '[formField]' }] }],
        null,
        {
          formField: [
            { type: i0.Input, args: [{ isSignal: true, alias: 'formField', required: false }] },
          ],
        },
      );
  }
}

export class MyComponent {
  value = 'Hello, world!';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComponent, never> = function MyComponent_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComponent)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComponent,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [['ng-component']],
    decls: 4,
    vars: 2,
    consts: [
      ['formField', 'Not a form control'],
      [3, 'formField'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0);
        i0.ɵɵelementStart(1, 'div');
        i0.ɵɵtext(2, 'Not a form control either.');
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, 'input', 1);
        i0.ɵɵcontrolCreate();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵattribute('formField', ctx.value);
        i0.ɵɵadvance(2);
        i0.ɵɵproperty('formField', ctx.value);
        i0.ɵɵcontrol();
      }
    },
    dependencies: [FormField],
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComponent,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <div formField="Not a form control"></div>
        <div [attr.formField]="value">Not a form control either.</div>
        <input [formField]="value">
      `,
                imports: [FormField],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: 'MyComponent',
      filePath: 'control_bindings.ts',
      lineNumber: 16,
    });
})();

```