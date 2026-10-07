# /out/else_if_nested_with_alias.ngtypecheck.ts
```ts
/**
 * TCB for /else_if_nested_with_alias.ts
 * @generated
 */

import * as i0 from './else_if_nested_with_alias';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    var _t1 /*123,127*/ = this
      .value /*111,116*/
      () /*111,118*/; /*123,127*/
    if (this.foo /*78,81*/ /*78,81*/) {
    } else if (
      this
        .value /*111,116*/
        () /*111,118*/ &&
      _t1
    ) {
      '' +
        this
          .value /*139,144*/
          () /*139,146*/ +
        _t1 /*151,155*/;
      var _t2 /*225,230*/ = this
        .value /*213,218*/
        () /*213,220*/; /*225,230*/
      if (this.foo /*176,179*/ /*176,179*/) {
      } else if (
        this
          .value /*213,218*/
          () /*213,220*/ &&
        _t2
      ) {
        '' +
          this
            .value /*243,248*/
            () /*243,250*/ +
          _t1 /*255,259*/ +
          _t2 /*264,269*/;
        var _t3 /*347,356*/ = this
          .value /*335,340*/
          () /*335,342*/; /*347,356*/
        if (this.foo /*294,297*/ /*294,297*/) {
        } else if (
          this
            .value /*335,340*/
            () /*335,342*/ &&
          _t3
        ) {
          '' +
            this
              .value /*373,378*/
              () /*373,380*/ +
            _t1 /*385,389*/ +
            _t2 /*394,399*/ +
            _t3 /*404,413*/;
        }
      }
    }
  }
}

```

# /out/else_if_nested_with_alias.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' foo ');
  }
}
function MyApp_Conditional_1_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' foo ');
  }
}
function MyApp_Conditional_1_Conditional_2_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0, ' foo ');
  }
}
function MyApp_Conditional_1_Conditional_2_Conditional_2_Template(rf: number, ctx: any): any {
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
function MyApp_Conditional_1_Conditional_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵconditionalCreate(1, MyApp_Conditional_1_Conditional_2_Conditional_1_Template, 1, 0)(
      2,
      MyApp_Conditional_1_Conditional_2_Conditional_2_Template,
      1,
      4,
    );
  }
  if (rf & 2) {
    let tmp_5_0;
    const root_r2: any = i0.ɵɵnextContext();
    const ctx_r2: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate3(' Inner: ', ctx_r2.value(), '/', root_r2, '/', ctx, ' ');
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.foo ? 1 : (tmp_5_0 = ctx_r2.value()) ? 2 : -1, tmp_5_0);
  }
}
function MyApp_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵconditionalCreate(1, MyApp_Conditional_1_Conditional_1_Template, 1, 0)(
      2,
      MyApp_Conditional_1_Conditional_2_Template,
      3,
      4,
    );
  }
  if (rf & 2) {
    let tmp_3_0;
    const ctx_r2: any = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate2(' Root: ', ctx_r2.value(), '/', ctx, ' ');
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.foo ? 1 : (tmp_3_0 = ctx_r2.value()) ? 2 : -1, tmp_3_0);
  }
}

export class MyApp {
  foo = false;
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
    decls: 2,
    vars: 1,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 1, 0)(
          1,
          MyApp_Conditional_1_Template,
          3,
          3,
        );
      }
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵconditional(ctx.foo ? 0 : (tmp_0_0 = ctx.value()) ? 1 : -1, tmp_0_0);
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
        @if (foo) {
          foo
        } @else if (value(); as root) {
          Root: {{value()}}/{{root}}

          @if (foo) {
            foo
          } @else if (value(); as inner) {
            Inner: {{value()}}/{{root}}/{{inner}}

            @if (foo) {
              foo
            } @else if (value(); as innermost) {
              Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
            }
          }
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
      filePath: 'else_if_nested_with_alias.ts',
      lineNumber: 24,
    });
})();

```