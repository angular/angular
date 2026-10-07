# /out/else_if_with_alias.ngtypecheck.ts
```ts
/**
 * TCB for /else_if_with_alias.ts
 * @generated
 */

import * as i0 from './else_if_with_alias';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*81,88*/ /*81,88*/;
    var _t1 /*161,166*/ = this
      .value /*149,154*/
      () /*149,156*/; /*161,166*/
    if (this.one /*108,111*/ /*108,111*/) {
      '' + this.one /*117,120*/ /*117,120*/;
    } else if (
      this
        .value /*149,154*/
        () /*149,156*/ &&
      _t1
    ) {
      '' +
        this
          .value /*172,177*/
          () /*172,179*/ +
        _t1 /*187,192*/;
    }
  }
}

```

# /out/else_if_with_alias.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(' ', ctx_r0.one, ' ');
  }
}
function MyApp_Conditional_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(' ', ctx_r0.value(), ' as ', ctx, ' ');
  }
}

export class MyApp {
  message = 'hello';
  one = false;
  value = () => 1;
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
          2,
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
        i0.ɵɵconditional(ctx.one ? 2 : (tmp_1_0 = ctx.value()) ? 3 : -1, tmp_1_0);
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
          @if (one) {
            {{one}}
          } @else if (value(); as alias) {
            {{value()}} as {{alias}}
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
      filePath: 'else_if_with_alias.ts',
      lineNumber: 15,
    });
})();

```