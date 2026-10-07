# /out/multiple_let.ngtypecheck.ts
```ts
/**
 * TCB for /multiple_let.ts
 * @generated
 */

import * as i0 from './multiple_let';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t1 /*78,81*/ = this.value /*84,89*/ /*84,89*/ + 1 /*92,93*/ /*84,93*/; /*73,94*/
    const _t2 /*104,107*/ = _t1 /*110,113*/ + 1 /*116,117*/ /*110,117*/; /*99,118*/
    const _t3 /*128,134*/ = _t2 /*137,140*/ + 1 /*143,144*/ /*137,144*/; /*123,145*/
    '' + _t3 /*162,168*/;
  }
}

```

# /out/multiple_let.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  value = 1;
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
    decls: 1,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        const one_r1: any = ctx.value + 1;
        const two_r2: any = one_r1 + 1;
        const result_r3: any = two_r2 + 1;
        i0.ɵɵtextInterpolate1(' The result is ', result_r3, ' ');
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
        @let one = value + 1;
        @let two = one + 1;
        @let result = two + 1;
        The result is {{result}}
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
      filePath: 'multiple_let.ts',
      lineNumber: 11,
    });
})();

```