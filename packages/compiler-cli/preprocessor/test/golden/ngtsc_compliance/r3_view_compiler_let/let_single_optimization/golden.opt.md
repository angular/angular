# /out/let_single_optimization.ngtypecheck.ts
```ts
/**
 * TCB for /let_single_optimization.ts
 * @generated
 */

import * as i0 from './let_single_optimization';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.value /*71,76*/ /*71,76*/;
    const _t1 /*92,98*/ = this.value /*101,106*/ /*101,106*/ * 2 /*109,110*/ /*101,110*/; /*87,111*/
    '' + this.value /*114,119*/ /*114,119*/;
  }
}

```

# /out/let_single_optimization.ts
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
        ctx.value * 2;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.value, ' ');
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
        @let result = value * 2;
        {{value}}
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
      filePath: 'let_single_optimization.ts',
      lineNumber: 10,
    });
})();

```