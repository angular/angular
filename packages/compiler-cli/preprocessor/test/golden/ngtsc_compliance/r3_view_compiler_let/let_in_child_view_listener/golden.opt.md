# /out/let_in_child_view_listener.ngtypecheck.ts
```ts
/**
 * TCB for /let_in_child_view_listener.ts
 * @generated
 */

import * as i0 from './let_in_child_view_listener';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t1 /*78,81*/ = this.value /*84,89*/ /*84,89*/ + 1 /*92,93*/ /*84,93*/; /*73,94*/
    {
      const _t2 /*125,128*/ = _t1 /*131,134*/ + 1 /*137,138*/ /*131,138*/; /*120,139*/
      if (true /*152,156*/) {
        const _t3 /*173,178*/ = _t2 /*181,184*/ + 1 /*187,188*/ /*181,188*/; /*168,189*/
        switch (1 /*208,209*/) {
          case 1 /*230,231*/:
            const _t4 /*252,256*/ = _t3 /*259,264*/ + 1 /*267,268*/ /*259,268*/; /*247,269*/
            var _t5 /*282,332*/ = document.createElement('button'); /*282,332*/ /*282,332*/
            _t5.addEventListener(/*291,296*/ 'click', ($event /*T:EP*/): any => {
              if (true /*D:ignore*/ /*152,156*/ && 1 /*208,209*/ === 1 /*D:ignore*/ /*230,231*/) {
                this.callback(
                  /*299,307*/ _t1 /*308,311*/,
                  _t2 /*313,316*/,
                  _t3 /*318,323*/,
                  _t4 /*325,329*/,
                ) /*299,330*/;
              }
            }) /*290,331*/;
            break;
        }
      }
    }
  }
}

```

# /out/let_in_child_view_listener.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_ng_template_1_Conditional_1_Case_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵdeclareLet(0);
    i0.ɵɵdomElementStart(1, 'button', 0);
    i0.ɵɵdomListener(
      'click',
      function MyApp_ng_template_1_Conditional_1_Case_1_Template_button_click_1_listener(): any {
        i0.ɵɵrestoreView(_r1);
        const four_r2: any = i0.ɵɵreadContextLet(0);
        i0.ɵɵnextContext();
        const three_r3: any = i0.ɵɵreadContextLet(0);
        i0.ɵɵnextContext();
        const two_r4: any = i0.ɵɵreadContextLet(0);
        const ctx_r4: any = i0.ɵɵnextContext();
        const one_r6: any = i0.ɵɵreadContextLet(0);
        return i0.ɵɵresetView(ctx_r4.callback(one_r6, two_r4, three_r3, four_r2));
      },
    );
    i0.ɵɵdomElementEnd();
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const three_r3: any = i0.ɵɵreadContextLet(0);
    i0.ɵɵstoreLet(three_r3 + 1);
  }
}
function MyApp_ng_template_1_Conditional_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, MyApp_ng_template_1_Conditional_1_Case_1_Template, 2, 1, 'button');
  }
  if (rf & 2) {
    let tmp_5_0;
    i0.ɵɵnextContext();
    const two_r4: any = i0.ɵɵreadContextLet(0);
    i0.ɵɵstoreLet(two_r4 + 1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_5_0 = 1) === 1 ? 1 : -1);
  }
}
function MyApp_ng_template_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, MyApp_ng_template_1_Conditional_1_Template, 2, 2);
  }
  if (rf & 2) {
    i0.ɵɵnextContext();
    const one_r6: any = i0.ɵɵreadContextLet(0);
    i0.ɵɵstoreLet(one_r6 + 1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(true ? 1 : -1);
  }
}

export class MyApp {
  value = 1;

  callback(one: number, two: number, three: number, four: number) {
    console.log(one, two, three, four);
  }
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
    consts: [[3, 'click']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdeclareLet(0);
        i0.ɵɵdomTemplate(1, MyApp_ng_template_1_Template, 2, 2, 'ng-template');
      }
      if (rf & 2) {
        i0.ɵɵstoreLet(ctx.value + 1);
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
        @let one = value + 1;

        <ng-template>
          @let two = one + 1;

          @if (true) {
            @let three = two + 1;

            @switch (1) {
              @case (1) {
                @let four = three + 1;
                <button (click)="callback(one, two, three, four)"></button>
              }
            }
          }
        </ng-template>
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
      filePath: 'let_in_child_view_listener.ts',
      lineNumber: 23,
    });
})();

```