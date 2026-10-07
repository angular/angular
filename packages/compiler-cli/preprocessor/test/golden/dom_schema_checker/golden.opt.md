# /out/dom_schema_checker.ngtypecheck.ts
```ts
/**
 * TCB for /dom_schema_checker.ts
 * @generated
 */

import * as i0 from './dom_schema_checker';

/*tcb1*/
function _tcb1(this: i0.MyComp) {
  if (true) {
    true /*181,185*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.MyCompNoErrors) {
  if (true) {
    true /*355,359*/;
  }
}

/* Diagnostics:
 - (116, 133) 'unknown-element' is not a known element:
1. If 'unknown-element' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'unknown-element' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.
 - (161, 186) Can't bind to 'unknown-property' since it isn't a known property of 'div'.
*/

```

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
        i0.ɵɵdomElement(0, 'unknown-element')(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵdomProperty('unknown-property', true);
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
        i0.ɵɵdomElement(0, 'unknown-element')(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵdomProperty('unknown-property', true);
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

# /tsconfig.ngdiag.json
```json
{
  "tsconfigPath": "/tsconfig.json",
  "diagnostics": [
    {
      "filePath": "/dom_schema_checker.ts",
      "category": "error",
      "code": 8001,
      "messageText": "'unknown-element' is not a known element:\n1. If 'unknown-element' is an Angular component, then verify that it is included in the '@Component.imports' of this component.\n2. If 'unknown-element' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.",
      "span": {
        "start": 116,
        "end": 133
      }
    },
    {
      "filePath": "/dom_schema_checker.ts",
      "category": "error",
      "code": 8002,
      "messageText": "Can't bind to 'unknown-property' since it isn't a known property of 'div'.",
      "span": {
        "start": 161,
        "end": 186
      }
    }
  ]
}

```