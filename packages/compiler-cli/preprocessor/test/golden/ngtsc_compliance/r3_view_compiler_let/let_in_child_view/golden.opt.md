# /out/let_in_child_view.ngtypecheck.ts
```ts
/**
 * TCB for /let_in_child_view.ts
 * @generated
 */

import * as i0 from './let_in_child_view';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t3 /*203,206*/ = 1 /*209,210*/; /*198,211*/
    if (true /*78,82*/) {
      const _t2 /*172,175*/ = _t3 /*178,181*/ + 1 /*184,185*/ /*178,185*/; /*167,186*/
      if (true /*97,101*/) {
        const _t1 /*118,123*/ = _t2 /*126,129*/ + 1 /*132,133*/ /*126,133*/; /*113,134*/
        '' + _t1 /*137,142*/;
      }
    }
  }
}

```

# /out/let_in_child_view.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_0_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const two_r1: any = i0.ɵɵreadContextLet(1);
    const three_r2: any = two_r1 + 1;
    i0.ɵɵtextInterpolate1(' ', three_r2, ' ');
  }
}
function MyApp_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Conditional_0_Template, 1, 1);
    i0.ɵɵdeclareLet(1);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const one_r3: any = i0.ɵɵreadContextLet(1);
    i0.ɵɵconditional(true ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵstoreLet(one_r3 + 1);
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
    decls: 2,
    vars: 2,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 2);
        i0.ɵɵdeclareLet(1);
      }
      if (rf & 2) {
        i0.ɵɵconditional(true ? 0 : -1);
        i0.ɵɵadvance();
        i0.ɵɵstoreLet(1);
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
        @if (true) {
          @if (true) {
            @let three = two + 1;
            {{three}}
          }
          @let two = one + 1;
        }

        @let one = 1;
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
      filePath: 'let_in_child_view.ts',
      lineNumber: 16,
    });
})();

```