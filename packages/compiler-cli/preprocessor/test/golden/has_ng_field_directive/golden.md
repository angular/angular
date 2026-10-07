# /out/test.ts
```ts
import { Directive, Component, Input } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const ɵNgFieldDirective = Symbol();

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
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
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
                standalone: true,
              },
            ],
          },
        ],
        null,
        { formField: [{ type: Input }] },
      );
  }
}

export class MyOtherDirective {
  // Missing ɵNgFieldDirective
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyOtherDirective, never> = function MyOtherDirective_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyOtherDirective)();
  };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    MyOtherDirective,
    '[myOtherDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: MyOtherDirective,
    selectors: [['', 'myOtherDir', '']],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyOtherDirective,
        [
          {
            type: Directive,
            args: [
              {
                selector: '[myOtherDir]',
                standalone: true,
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
  myField: any;
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
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComp,
    selectors: [['my-comp']],
    decls: 1,
    vars: 1,
    consts: [['myOtherDir', '', 3, 'formField']],
    template: function MyComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'input', 0);
        i0.ɵɵcontrolCreate();
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵproperty('formField', ctx.myField);
        i0.ɵɵcontrol();
      }
    },
    dependencies: i0.ɵɵgetComponentDepsFactory(MyComp, [FormField, MyOtherDirective]),
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
                standalone: true,
                template: `
        <input [formField]="myField" myOtherDir>
      `,
                imports: [FormField, MyOtherDirective],
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
    i0.ɵsetClassDebugInfo(MyComp, { className: 'MyComp', filePath: 'test.ts', lineNumber: 30 });
})();

```