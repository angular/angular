# /out/else_if_with_same_alias.ngtypecheck.ts
```ts
/**
 * TCB for /else_if_with_same_alias.ts
 * @generated
 */

import * as i0 from './else_if_with_same_alias';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*81,88*/ /*81,88*/;
    var _t1 /*116,121*/ = this.one /*108,111*/ /*108,111*/; /*116,121*/
    var _t2 /*169,174*/ = this.two /*161,164*/ /*161,164*/; /*169,174*/
    if (this.one /*108,111*/ /*108,111*/ && _t1) {
      '' + _t1 /*127,132*/;
    } else if (this.two /*161,164*/ /*161,164*/ && _t2) {
      '' + _t2 /*180,185*/;
    }
  }
}

```

# /out/else_if_with_same_alias.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(' ', ctx, ' ');
  }
}
function MyApp_Conditional_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    i0.ɵɵtextInterpolate1(' ', ctx, ' ');
  }
}

export class MyApp {
  message = 'hello';
  one = false;
  two = 2;
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
    vars: 2,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵconditionalCreate(2, MyApp_Conditional_2_Template, 1, 1)(
          3,
          MyApp_Conditional_3_Template,
          1,
          1,
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional((tmp_1_0 = ctx.one) ? 2 : (tmp_1_0 = ctx.two) ? 3 : -1, tmp_1_0);
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
        <div>
          {{message}}
          @if (one; as alias) {
            {{alias}}
          } @else if (two; as alias) {
            {{alias}}
          }
        </div>
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
      filePath: 'else_if_with_same_alias.ts',
      lineNumber: 15,
    });
})();

```