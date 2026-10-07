# /out/let_optimization_child_view.ngtypecheck.ts
```ts
/**
 * TCB for /let_optimization_child_view.ts
 * @generated
 */

import * as i0 from './let_optimization_child_view';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.value /*71,76*/ /*71,76*/;
    const _t1 /*92,95*/ = this.value /*98,103*/ /*98,103*/ + 1 /*106,107*/ /*98,107*/; /*87,108*/
    const _t2 /*118,121*/ = _t1 /*124,127*/ + 1 /*130,131*/ /*124,131*/; /*113,132*/
    const _t3 /*142,147*/ = _t2 /*150,153*/ + 1 /*156,157*/ /*150,157*/; /*137,158*/
    const _t4 /*168,172*/ = _t3 /*175,180*/ + 1 /*183,184*/ /*175,184*/; /*163,185*/
    '' + this.value /*188,193*/ /*188,193*/;
    if (true /*209,213*/) {
      '' + _t3 /*219,224*/;
    }
  }
}

```

# /out/let_optimization_child_view.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const three_r1: any = i0.ɵɵreadContextLet(1);
    i0.ɵɵtextInterpolate1(' ', three_r1, ' ');
  }
}

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
    decls: 4,
    vars: 4,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdeclareLet(1);
        i0.ɵɵtext(2);
        i0.ɵɵconditionalCreate(3, MyApp_Conditional_3_Template, 1, 1);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', ctx.value, ' ');
        const one_r2: any = ctx.value + 1;
        const two_r3: any = one_r2 + 1;
        i0.ɵɵadvance();
        const three_r4: any = i0.ɵɵstoreLet(two_r3 + 1);
        three_r4 + 1;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.value, ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional(true ? 3 : -1);
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
        {{value}}
        @if (true) {
          {{three}}
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
      filePath: 'let_optimization_child_view.ts',
      lineNumber: 16,
    });
})();

```