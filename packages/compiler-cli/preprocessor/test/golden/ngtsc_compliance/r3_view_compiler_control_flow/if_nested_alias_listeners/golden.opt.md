# /out/if_nested_alias_listeners.ngtypecheck.ts
```ts
/**
 * TCB for /if_nested_alias_listeners.ts
 * @generated
 */

import * as i0 from './if_nested_alias_listeners';

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
      var _t2 /*106,143*/ = document.createElement('button'); /*106,143*/ /*106,143*/
      _t2.addEventListener(/*115,120*/ 'click', ($event /*T:EP*/): any => {
        if (
          this
            .value /*80,85*/
            () /*80,87*/ &&
          _t1 /*D:ignore*/
        ) {
          this.log(
            /*123,126*/ this
              .value /*127,132*/
              () /*127,134*/,
            _t1 /*136,140*/,
          ) /*123,141*/;
        }
      }) /*114,142*/;
      var _t3 /*177,182*/ = this
        .value /*165,170*/
        () /*165,172*/; /*177,182*/
      if (
        this
          .value /*165,170*/
          () /*165,172*/ &&
        _t3
      ) {
        var _t4 /*194,238*/ = document.createElement('button'); /*194,238*/ /*194,238*/
        _t4.addEventListener(/*203,208*/ 'click', ($event /*T:EP*/): any => {
          if (
            this
              .value /*80,85*/
              () /*80,87*/ &&
            _t1 /*D:ignore*/ &&
            this
              .value /*165,170*/
              () /*165,172*/ &&
            _t3 /*D:ignore*/
          ) {
            this.log(
              /*211,214*/ this
                .value /*215,220*/
                () /*215,222*/,
              _t1 /*224,228*/,
              _t3 /*230,235*/,
            ) /*211,236*/;
          }
        }) /*202,237*/;
        var _t5 /*274,283*/ = this
          .value /*262,267*/
          () /*262,269*/; /*274,283*/
        if (
          this
            .value /*262,267*/
            () /*262,269*/ &&
          _t5
        ) {
          var _t6 /*297,352*/ = document.createElement('button'); /*297,352*/ /*297,352*/
          _t6.addEventListener(/*306,311*/ 'click', ($event /*T:EP*/): any => {
            if (
              this
                .value /*80,85*/
                () /*80,87*/ &&
              _t1 /*D:ignore*/ &&
              this
                .value /*165,170*/
                () /*165,172*/ &&
              _t3 /*D:ignore*/ &&
              this
                .value /*262,267*/
                () /*262,269*/ &&
              _t5 /*D:ignore*/
            ) {
              this.log(
                /*314,317*/ this
                  .value /*318,323*/
                  () /*318,325*/,
                _t1 /*327,331*/,
                _t3 /*333,338*/,
                _t5 /*340,349*/,
              ) /*314,350*/;
            }
          }) /*305,351*/;
        }
      }
    }
  }
}

```

# /out/if_nested_alias_listeners.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_Conditional_0_Conditional_1_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r6: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'button', 0);
    i0.ɵɵlistener(
      'click',
      function MyApp_Conditional_0_Conditional_1_Conditional_1_Template_button_click_0_listener(): any {
        const innermost_r7: any = i0.ɵɵrestoreView(_r6);
        const inner_r5: any = i0.ɵɵnextContext();
        const root_r2: any = i0.ɵɵnextContext();
        const ctx_r2: any = i0.ɵɵnextContext();
        return i0.ɵɵresetView(ctx_r2.log(ctx_r2.value(), root_r2, inner_r5, innermost_r7));
      },
    );
    i0.ɵɵelementEnd();
  }
}
function MyApp_Conditional_0_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r4: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'button', 0);
    i0.ɵɵlistener(
      'click',
      function MyApp_Conditional_0_Conditional_1_Template_button_click_0_listener(): any {
        const inner_r5: any = i0.ɵɵrestoreView(_r4);
        const root_r2: any = i0.ɵɵnextContext();
        const ctx_r2: any = i0.ɵɵnextContext();
        return i0.ɵɵresetView(ctx_r2.log(ctx_r2.value(), root_r2, inner_r5));
      },
    );
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(
      1,
      MyApp_Conditional_0_Conditional_1_Conditional_1_Template,
      1,
      0,
      'button',
    );
  }
  if (rf & 2) {
    let tmp_4_0;
    const ctx_r2: any = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_4_0 = ctx_r2.value()) ? 1 : -1, tmp_4_0);
  }
}
function MyApp_Conditional_0_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'button', 0);
    i0.ɵɵlistener('click', function MyApp_Conditional_0_Template_button_click_0_listener(): any {
      const root_r2: any = i0.ɵɵrestoreView(_r1);
      const ctx_r2: any = i0.ɵɵnextContext();
      return i0.ɵɵresetView(ctx_r2.log(ctx_r2.value(), root_r2));
    });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(1, MyApp_Conditional_0_Conditional_1_Template, 2, 1);
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r2: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_2_0 = ctx_r2.value()) ? 1 : -1, tmp_2_0);
  }
}

export class MyApp {
  value = () => 1;
  log(..._: any[]) {}
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
    consts: [[3, 'click']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵconditionalCreate(0, MyApp_Conditional_0_Template, 2, 1);
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
          <button (click)="log(value(), root)"></button>

          @if (value(); as inner) {
            <button (click)="log(value(), root, inner)"></button>

            @if (value(); as innermost) {
              <button (click)="log(value(), root, inner, innermost)"></button>
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
      filePath: 'if_nested_alias_listeners.ts',
      lineNumber: 19,
    });
})();

```