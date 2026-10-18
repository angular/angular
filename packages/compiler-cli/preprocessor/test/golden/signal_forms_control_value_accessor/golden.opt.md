# /out/test.ngtypecheck.ts
```ts
/**
 * TCB for /test.ts
 * @generated
 */

import * as i0 from './test';

/*tcb1*/
function _tcb1(this: i0.MyComp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*1395,1455*/ = null! as i0.CustomCvaDirective; /*T:VAE*/
    _t1.max /*1437,1440*/ = this.maxValue /*1443,1451*/ /*1443,1451*/; /*1436,1452*/
    _t1.max /*1413,1422*/ = this
      .itemField /*1425,1434*/ /*1425,1434*/
      () /*1425,1434*/
      .max /*1425,1434*/ /*1425,1434*/
      ?.() /*1425,1434*/; /*1412,1435*/
    var _t2 /*T:DIR:1*/ /*1395,1455*/ = null! as i0.FormField; /*T:VAE*/
    _t2.formField /*1413,1422*/ = this.itemField /*1425,1434*/ /*1425,1434*/; /*1412,1435*/
    var _t3 = null! as
      | { (): string; set: (v: string) => void }
      | { (): number | null; set: (v: number | null) => void }; /*T:VAE*/
    _t3 = this
      .itemField /*1491,1500*/ /*1491,1500*/
      () /*D:ignore*/.value; /*1491,1500*/
    var _t4 /*T:DIR:1*/ /*1460,1504*/ = null! as i0.FormField; /*T:VAE*/
    _t4.formField /*1479,1488*/ = this.itemField /*1491,1500*/ /*1491,1500*/; /*1478,1501*/
    var _t5 = null! as
      | { (): string; set: (v: string) => void }
      | { (): number | null; set: (v: number | null) => void }; /*T:VAE*/
    _t5 = this
      .itemField /*1540,1549*/ /*1540,1549*/
      () /*D:ignore*/.value; /*1540,1549*/
    var _t6 /*T:DIR:1*/ /*1509,1553*/ = null! as i0.FormField; /*T:VAE*/
    _t6.formField /*1528,1537*/ = this.itemField /*1540,1549*/ /*1540,1549*/; /*1527,1550*/
  }
}

```

# /out/test.ts
```ts
import { Directive, Component, Input, signal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const ɵNgFieldDirective = Symbol();

export interface Item {
  id: string;
  label: string;
}

/** Stand-in for `FieldTree` from `@angular/forms/signals`. */
export interface FieldTree<T> {
  (): { value: { (): T; set: (v: T) => void } };
}

export class FormField {
  formField: any;
  [ɵNgFieldDirective] = true;
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
    { 'formField': { 'alias': 'formField'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: FormField,
      selectors: [['', 'formField', '']],
      inputs: { formField: 'formField' },
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FormField,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[formField]',
              },
            ],
          },
        ],
        null,
        { formField: [{ type: Input }] },
      );
  }
}

/** Shaped like a `ControlValueAccessor`: all three methods are public instance methods. */
export class CustomCvaDirective {
  max: number | null = null;
  writeValue(value: Item | null): void {}
  registerOnChange(fn: (value: Item | null) => void): void {}
  registerOnTouched(fn: () => void): void {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CustomCvaDirective, never> =
    function CustomCvaDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || CustomCvaDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    CustomCvaDirective,
    'input[customCva]',
    never,
    { 'max': { 'alias': 'max'; 'required': false } },
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: CustomCvaDirective,
      selectors: [['input', 'customCva', '']],
      inputs: { max: 'max' },
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CustomCvaDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'input[customCva]',
              },
            ],
          },
        ],
        null,
        { max: [{ type: Input }] },
      );
  }
}

/** Only has some of the methods, so it is not a `ControlValueAccessor`. */
export class PartialCvaDirective {
  writeValue(value: Item | null): void {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PartialCvaDirective, never> =
    function PartialCvaDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || PartialCvaDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    PartialCvaDirective,
    'input[partialCva]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: PartialCvaDirective,
      selectors: [['input', 'partialCva', '']],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PartialCvaDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'input[partialCva]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

/** The methods exist but are not public, so it is not a `ControlValueAccessor`. */
export class PrivateCvaDirective {
  private writeValue(value: Item | null): void {}
  protected registerOnChange(fn: (value: Item | null) => void): void {}
  registerOnTouched(fn: () => void): void {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<PrivateCvaDirective, never> =
    function PrivateCvaDirective_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || PrivateCvaDirective)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    PrivateCvaDirective,
    'input[privateCva]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineDirective({
      type: PrivateCvaDirective,
      selectors: [['input', 'privateCva', '']],
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        PrivateCvaDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'input[privateCva]',
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class MyComp {
  itemField!: FieldTree<Item | null>;
  maxValue = 10;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never> = function MyComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComp,
    'my-comp',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineComponent({
      type: MyComp,
      selectors: [['my-comp']],
      decls: 3,
      vars: 4,
      consts: [
        ['customCva', '', 3, 'formField', 'max'],
        ['partialCva', '', 3, 'formField'],
        ['privateCva', '', 3, 'formField'],
      ],
      template: function MyComp_Template(rf: number, ctx: any): any {
        if (rf & 1) {
          i0.ɵɵelementStart(0, 'input', 0);
          i0.ɵɵcontrolCreate();
          i0.ɵɵelementEnd();
          i0.ɵɵelementStart(1, 'input', 1);
          i0.ɵɵcontrolCreate();
          i0.ɵɵelementEnd();
          i0.ɵɵelementStart(2, 'input', 2);
          i0.ɵɵcontrolCreate();
          i0.ɵɵelementEnd();
        }
        if (rf & 2) {
          i0.ɵɵproperty('formField', ctx.itemField)('max', ctx.maxValue);
          i0.ɵɵcontrol();
          i0.ɵɵadvance();
          i0.ɵɵproperty('formField', ctx.itemField);
          i0.ɵɵcontrol();
          i0.ɵɵadvance();
          i0.ɵɵproperty('formField', ctx.itemField);
          i0.ɵɵcontrol();
        }
      },
      dependencies: [FormField, CustomCvaDirective, PartialCvaDirective, PrivateCvaDirective],
      encapsulation: 2,
    });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp',
                template: `
        <input customCva [formField]="itemField" [max]="maxValue" />
        <input partialCva [formField]="itemField" />
        <input privateCva [formField]="itemField" />
      `,
                imports: [FormField, CustomCvaDirective, PartialCvaDirective, PrivateCvaDirective],
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
    i0.ɵsetClassDebugInfo(MyComp, { className: 'MyComp', filePath: 'test.ts', lineNumber: 61 });
})();

```