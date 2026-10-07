# /out/radio_bindings.ngtypecheck.ts
```ts
/**
 * TCB for /radio_bindings.ts
 * @generated
 */

import * as i0 from './radio_bindings';
import * as i1 from '@angular/core';

/*tcb1*/
function _tcb1(this: i0.MyComponent) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*261,368*/ = null! as i0.FormField; /*T:VAE*/
    var _t2 = null! as (typeof _t1)['formField']; /*T:VAE*/
    _t2[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*298,307*/ =
      this.value /*310,315*/ /*310,315*/ /*297,316*/;
    ('foo') /*334,339*/;
    var _t3 /*T:DIR:0*/ /*376,483*/ = null! as i0.FormField; /*T:VAE*/
    var _t4 = null! as (typeof _t3)['formField']; /*T:VAE*/
    _t4[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE] /*437,446*/ =
      this.value /*449,454*/ /*449,454*/ /*436,455*/;
    ('foo') /*421,426*/;
  }
}

```

# /out/radio_bindings.ts
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

// Notice that we check that the binding order doesn't matter
export class MyComponent {
  value = 'foo';

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
    decls: 2,
    vars: 4,
    consts: [
      ['type', 'radio', 'id', 'radio', 3, 'formField', 'value'],
      ['type', 'radio', 'id', 'radio', 3, 'value', 'formField'],
    ],
    template: function MyComponent_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'input', 0);
        i0.ɵɵcontrolCreate();
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(1, 'input', 1);
        i0.ɵɵcontrolCreate();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('formField', ctx.value)('value', 'foo');
        i0.ɵɵcontrol();
        i0.ɵɵadvance();
        i0.ɵɵproperty('value', 'foo')('formField', ctx.value);
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
        <input
            type="radio"
            [formField]="value"
            [value]="'foo'"
            id="radio"
          />

          <input
            type="radio"
            [value]="'foo'"
            [formField]="value"
            id="radio"
          />
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
      filePath: 'radio_bindings.ts',
      lineNumber: 27,
    });
})();

```