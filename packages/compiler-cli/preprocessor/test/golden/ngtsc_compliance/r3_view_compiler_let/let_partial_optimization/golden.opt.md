# /out/let_partial_optimization.ngtypecheck.ts
```ts
/**
 * TCB for /let_partial_optimization.ts
 * @generated
 */

import * as i0 from './let_partial_optimization';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.value /*71,76*/ /*71,76*/;
    const _t1 /*92,95*/ = this.value /*98,103*/ /*98,103*/ + 1 /*106,107*/ /*98,107*/; /*87,108*/
    const _t2 /*118,121*/ = _t1 /*124,127*/ + 1 /*130,131*/ /*124,131*/; /*113,132*/
    const _t3 /*142,147*/ = _t2 /*150,153*/ + 1 /*156,157*/ /*150,157*/; /*137,158*/
    const _t4 /*168,172*/ = _t3 /*175,180*/ + 1 /*183,184*/ /*175,184*/; /*163,185*/
    '' + _t2 /*188,191*/;
  }
}

```

# /out/let_partial_optimization.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  value = 0;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    decls: 2,
    vars: 2,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵtext(1);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', ctx.value, ' ');
        const one_r1: any = ctx.value + 1;
        const two_r2: any = one_r1 + 1;
        const three_r3: any = two_r2 + 1;
        three_r3 + 1;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', two_r2, ' ');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyApp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        {{value}}
        @let one = value + 1;
        @let two = one + 1;
        @let three = two + 1;
        @let four = three + 1;
        {{two}}
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
    i0.ɵsetClassDebugInfo(MyApp, {
      className: 'MyApp',
      filePath: 'let_partial_optimization.ts',
      lineNumber: 13,
    });
})();

```