# /out/shadowed_let.ngtypecheck.ts
```ts
/**
 * TCB for /shadowed_let.ts
 * @generated
 */

import * as i0 from './shadowed_let';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t1 /*78,83*/ = 'parent' /*86,94*/; /*73,95*/
    if (true /*106,110*/) {
      const _t2 /*125,130*/ = 'local' /*133,140*/; /*120,141*/
      '' + _t2 /*165,170*/;
    }
  }
}

```

# /out/shadowed_let.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const value_r1: any = 'local';
    i0.ɵɵtextInterpolate1(' The value comes from ', value_r1, ' ');
  }
}

export class MyApp {
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
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 1, 1);
      }
      if (rf & 2) {
        ('parent');
        i0.ɵɵconditional(true ? 0 : -1);
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
        @let value = 'parent';

        @if (true) {
          @let value = 'local';
          The value comes from {{value}}
        }
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
      filePath: 'shadowed_let.ts',
      lineNumber: 13,
    });
})();

```