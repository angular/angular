# /out/simple_let.ngtypecheck.ts
```ts
/**
 * TCB for /simple_let.ts
 * @generated
 */

import * as i0 from './simple_let';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t1 /*78,84*/ = this.value /*87,92*/ /*87,92*/ * 2 /*95,96*/ /*87,96*/; /*73,97*/
    '' + _t1 /*114,120*/;
  }
}

```

# /out/simple_let.ts
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
        const result_r1: any = ctx.value * 2;
        i0.ɵɵtextInterpolate1(' The result is ', result_r1, ' ');
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
        @let result = value * 2;
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'simple_let.ts', lineNumber: 9 });
})();

```