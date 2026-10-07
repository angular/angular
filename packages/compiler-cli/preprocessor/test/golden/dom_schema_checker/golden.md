# /out/dom_schema_checker.ts
```ts
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyComp {
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
    decls: 2,
    vars: 1,
    consts: [[3, 'unknown-property']],
    template: function MyComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'unknown-element')(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('unknown-property', true);
      }
    },
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
        <unknown-element></unknown-element>
        <div [unknown-property]="true"></div>
      `,
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
    i0.ɵsetClassDebugInfo(MyComp, {
      className: 'MyComp',
      filePath: 'dom_schema_checker.ts',
      lineNumber: 10,
    });
})();

export class MyCompNoErrors {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyCompNoErrors, never> = function MyCompNoErrors_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyCompNoErrors)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyCompNoErrors,
    'my-comp-no-errors',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyCompNoErrors,
    selectors: [['my-comp-no-errors']],
    decls: 2,
    vars: 1,
    consts: [[3, 'unknown-property']],
    template: function MyCompNoErrors_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'unknown-element')(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵproperty('unknown-property', true);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyCompNoErrors,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp-no-errors',
                template: `
        <unknown-element></unknown-element>
        <div [unknown-property]="true"></div>
      `,
                schemas: [NO_ERRORS_SCHEMA],
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
    i0.ɵsetClassDebugInfo(MyCompNoErrors, {
      className: 'MyCompNoErrors',
      filePath: 'dom_schema_checker.ts',
      lineNumber: 20,
    });
})();

```