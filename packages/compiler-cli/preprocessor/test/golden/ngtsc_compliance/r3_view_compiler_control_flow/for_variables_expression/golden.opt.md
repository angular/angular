# /out/for_variables_expression.ngtypecheck.ts
```ts
/**
 * TCB for /for_variables_expression.ts
 * @generated
 */

import * as i0 from './for_variables_expression';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*76,80*/ of this.items /*84,89*/ /*84,89*/! /*84,89*/) {
      var _t2 /*104,104*/ = null! as boolean; /*T:VAE*/ /*104,104*/
      '' + (_t2 /*107,111*/ + '' /*114,116*/) /*107,116*/;
      _t1 /*97,101*/;
    }
  }
}

```

# /out/for_variables_expression.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ɵ$index_1_r1: any = ctx.$index;
    i0.ɵɵtextInterpolate1(' ', (ɵ$index_1_r1 % 2 !== 0) + '', ' ');
  }
}

export class MyApp {
  items = [];
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 2,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          MyApp_For_1_Template,
          1,
          1,
          null,
          null,
          i0.ɵɵrepeaterTrackByIdentity,
        );
      }
      if (rf & 2) {
        i0.ɵɵrepeater(ctx.items);
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
                template: `@for (item of items; track item) {
        {{$odd + ''}}
      }`,
                standalone: false,
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
      filePath: 'for_variables_expression.ts',
      lineNumber: 9,
    });
})();

```