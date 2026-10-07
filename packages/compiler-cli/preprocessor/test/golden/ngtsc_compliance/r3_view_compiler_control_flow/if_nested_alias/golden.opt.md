# /out/if_nested_alias.ngtypecheck.ts
```ts
/**
 * TCB for /if_nested_alias.ts
 * @generated
 */

import * as i0 from './if_nested_alias';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    var _t1 /*92,96*/ = this
      .value /*80,85*/
      () /*80,87*/; /*92,96*/
    if (
      this
        .value /*80,85*/
        () /*80,87*/ &&
      _t1
    ) {
      '' +
        this
          .value /*108,113*/
          () /*108,115*/ +
        _t1 /*120,124*/;
      var _t2 /*157,162*/ = this
        .value /*145,150*/
        () /*145,152*/; /*157,162*/
      if (
        this
          .value /*145,150*/
          () /*145,152*/ &&
        _t2
      ) {
        '' +
          this
            .value /*175,180*/
            () /*175,182*/ +
          _t1 /*187,191*/ +
          _t2 /*196,201*/;
        var _t3 /*238,247*/ = this
          .value /*226,231*/
          () /*226,233*/; /*238,247*/
        if (
          this
            .value /*226,231*/
            () /*226,233*/ &&
          _t3
        ) {
          '' +
            this
              .value /*264,269*/
              () /*264,271*/ +
            _t1 /*276,280*/ +
            _t2 /*285,290*/ +
            _t3 /*295,304*/;
        }
      }
    }
  }
}

```

# /out/if_nested_alias.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_0_Conditional_1_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
  }
  if (rf & 2) {
    const inner_r1: any = i0.ɵɵnextContext();
    const root_r2: any = i0.ɵɵnextContext();
    const ctx_r2: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate4(
      ' Innermost: ',
      ctx_r2.value(),
      '/',
      root_r2,
      '/',
      inner_r1,
      '/',
      ctx,
      ' ',
    );
  }
}
function MyApp_Conditional_0_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵconditionalCreate(1, MyApp_Conditional_0_Conditional_1_Conditional_1_Template, 1, 4);
  }
  if (rf & 2) {
    let tmp_5_0;
    const root_r2: any = i0.ɵɵnextContext();
    const ctx_r2: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate3(' Inner: ', ctx_r2.value(), '/', root_r2, '/', ctx, ' ');
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_5_0 = ctx_r2.value()) ? 1 : -1, tmp_5_0);
  }
}
function MyApp_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵconditionalCreate(1, MyApp_Conditional_0_Conditional_1_Template, 2, 4);
  }
  if (rf & 2) {
    let tmp_3_0;
    const ctx_r2: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(' Root: ', ctx_r2.value(), '/', ctx, ' ');
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_3_0 = ctx_r2.value()) ? 1 : -1, tmp_3_0);
  }
}

export class MyApp {
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 1,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 3);
      }
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵconditional((tmp_0_0 = ctx.value()) ? 0 : -1, tmp_0_0);
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
        @if (value(); as root) {
          Root: {{value()}}/{{root}}

          @if (value(); as inner) {
            Inner: {{value()}}/{{root}}/{{inner}}

            @if (value(); as innermost) {
              Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
            }
          }
        }
      `,
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
      filePath: 'if_nested_alias.ts',
      lineNumber: 19,
    });
})();

```