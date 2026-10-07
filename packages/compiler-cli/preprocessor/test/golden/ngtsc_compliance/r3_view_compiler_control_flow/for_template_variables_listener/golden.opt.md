# /out/for_template_variables_listener.ngtypecheck.ts
```ts
/**
 * TCB for /for_template_variables_listener.ts
 * @generated
 */

import * as i0 from './for_template_variables_listener';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.message /*83,90*/ /*83,90*/;
    for (const _t1 /*111,115*/ of this.items /*119,124*/ /*119,124*/! /*119,124*/) {
      var _t2 /*164,211*/ = document.createElement('div'); /*164,211*/ /*164,211*/
      var _t3 /*155,155*/ = null! as number; /*T:VAE*/ /*155,155*/
      var _t4 /*142,144*/ = null! as boolean; /*T:VAE*/ /*142,152*/
      var _t5 /*155,155*/ = null! as boolean; /*T:VAE*/ /*155,155*/
      var _t6 /*155,155*/ = null! as number; /*T:VAE*/ /*155,155*/
      _t2.addEventListener(/*170,175*/ 'click', ($event /*T:EP*/): any => {
        this.log(
          /*178,181*/ _t3 /*182,188*/,
          _t4 /*190,192*/,
          _t5 /*194,200*/,
          _t6 /*202,208*/,
        ) /*178,209*/;
      }) /*169,210*/;
      _t1 /*132,136*/;
    }
  }
}

```

# /out/for_template_variables_listener.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'div', 0);
    i0.ɵɵlistener('click', function MyApp_For_3_Template_div_click_0_listener(): any {
      const ctx_r1: any = i0.ɵɵrestoreView(_r1);
      const $index_r3: any = ctx_r1.$index;
      const ɵ$index_4_r4: any = ctx_r1.$index;
      const $count_r5: any = ctx_r1.$count;
      const ctx_r5: any = i0.ɵɵnextContext();
      return i0.ɵɵresetView(
        ctx_r5.log($index_r3, ɵ$index_4_r4 % 2 === 0, ɵ$index_4_r4 === 0, $count_r5),
      );
    });
    i0.ɵɵelementEnd();
  }
}

export class MyApp {
  message = 'hello';
  items = [];
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
    decls: 4,
    vars: 1,
    consts: [[3, 'click']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵrepeaterCreate(
          2,
          MyApp_For_3_Template,
          1,
          0,
          'div',
          null,
          i0.ɵɵrepeaterTrackByIdentity,
        );
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.message, ' ');
        i0.ɵɵadvance();
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
                template: `
        <div>
          {{message}}
          @for (item of items; track item; let ev = $even) {
            <div (click)="log($index, ev, $first, $count)"></div>
          }
        </div>
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
      filePath: 'for_template_variables_listener.ts',
      lineNumber: 14,
    });
})();

```