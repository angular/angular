# /out/nested_for_listener_computed_template_variables.ngtypecheck.ts
```ts
/**
 * TCB for /nested_for_listener_computed_template_variables.ts
 * @generated
 */

import * as i0 from './nested_for_listener_computed_template_variables';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    for (const _t1 /*81,86*/ of this.items /*90,95*/ /*90,95*/! /*90,95*/) {
      var _t2 /*198,268*/ = document.createElement('button'); /*198,268*/ /*198,268*/
      var _t3 /*114,122*/ = null! as boolean; /*T:VAE*/ /*114,129*/
      var _t4 /*131,140*/ = null! as boolean; /*T:VAE*/ /*131,148*/
      var _t5 /*150,160*/ = null! as boolean; /*T:VAE*/ /*150,169*/
      var _t6 /*171,180*/ = null! as boolean; /*T:VAE*/ /*171,188*/
      _t2.addEventListener(/*207,212*/ 'click', ($event /*T:EP*/): any => {
        this.outerCb(
          /*215,222*/ _t3 /*223,231*/,
          _t4 /*233,242*/,
          _t5 /*244,254*/,
          _t6 /*256,265*/,
        ) /*215,266*/;
      }) /*206,267*/;
      for (const _t7 /*291,296*/ of this.items /*300,305*/ /*300,305*/! /*300,305*/) {
        var _t8 /*410,480*/ = document.createElement('button'); /*410,480*/ /*410,480*/
        var _t9 /*324,332*/ = null! as boolean; /*T:VAE*/ /*324,339*/
        var _t10 /*341,350*/ = null! as boolean; /*T:VAE*/ /*341,358*/
        var _t11 /*360,370*/ = null! as boolean; /*T:VAE*/ /*360,379*/
        var _t12 /*381,390*/ = null! as boolean; /*T:VAE*/ /*381,398*/
        _t8.addEventListener(/*419,424*/ 'click', ($event /*T:EP*/): any => {
          this.innerCb(
            /*427,434*/ _t9 /*435,443*/,
            _t10 /*445,454*/,
            _t11 /*456,466*/,
            _t12 /*468,477*/,
          ) /*427,478*/;
        }) /*418,479*/;
        var _t13 /*498,568*/ = document.createElement('button'); /*498,568*/ /*498,568*/
        _t13.addEventListener(/*507,512*/ 'click', ($event /*T:EP*/): any => {
          this.outerCb(
            /*515,522*/ _t3 /*523,531*/,
            _t4 /*533,542*/,
            _t5 /*544,554*/,
            _t6 /*556,565*/,
          ) /*515,566*/;
        }) /*506,567*/;
        for (const _t14 /*593,602*/ of this.items /*606,611*/ /*606,611*/! /*606,611*/) {
          var _t15 /*738,828*/ = document.createElement('button'); /*738,828*/ /*738,828*/
          var _t16 /*634,646*/ = null! as boolean; /*T:VAE*/ /*634,653*/
          var _t17 /*655,668*/ = null! as boolean; /*T:VAE*/ /*655,676*/
          var _t18 /*678,692*/ = null! as boolean; /*T:VAE*/ /*678,701*/
          var _t19 /*703,716*/ = null! as boolean; /*T:VAE*/ /*703,724*/
          _t15.addEventListener(/*747,752*/ 'click', ($event /*T:EP*/): any => {
            this.innermostCb(
              /*755,766*/ _t16 /*767,779*/,
              _t17 /*781,794*/,
              _t18 /*796,810*/,
              _t19 /*812,825*/,
            ) /*755,826*/;
          }) /*746,827*/;
          var _t20 /*848,918*/ = document.createElement('button'); /*848,918*/ /*848,918*/
          _t20.addEventListener(/*857,862*/ 'click', ($event /*T:EP*/): any => {
            this.innerCb(
              /*865,872*/ _t9 /*873,881*/,
              _t10 /*883,892*/,
              _t11 /*894,904*/,
              _t12 /*906,915*/,
            ) /*865,916*/;
          }) /*856,917*/;
          var _t21 /*938,1008*/ = document.createElement('button'); /*938,1008*/ /*938,1008*/
          _t21.addEventListener(/*947,952*/ 'click', ($event /*T:EP*/): any => {
            this.outerCb(
              /*955,962*/ _t3 /*963,971*/,
              _t4 /*973,982*/,
              _t5 /*984,994*/,
              _t6 /*996,1005*/,
            ) /*955,1006*/;
          }) /*946,1007*/;
          _t14 /*619,628*/;
        }
        _t7 /*313,318*/;
      }
      _t1 /*103,108*/;
    }
  }
}

```

# /out/nested_for_listener_computed_template_variables.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function MyApp_For_1_For_2_For_3_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r11: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'button', 0);
    i0.ɵɵlistener(
      'click',
      function MyApp_For_1_For_2_For_3_Template_button_click_0_listener(): any {
        const ctx_r11: any = i0.ɵɵrestoreView(_r11);
        const ɵ$index_9_r13: any = ctx_r11.$index;
        const ɵ$count_9_r14: any = ctx_r11.$count;
        const ctx_r4: any = i0.ɵɵnextContext(3);
        return i0.ɵɵresetView(
          ctx_r4.innermostCb(
            ɵ$index_9_r13 % 2 !== 0,
            ɵ$index_9_r13 % 2 === 0,
            ɵ$index_9_r13 === 0,
            ɵ$index_9_r13 === ɵ$count_9_r14 - 1,
          ),
        );
      },
    );
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(1, 'button', 0);
    i0.ɵɵlistener(
      'click',
      function MyApp_For_1_For_2_For_3_Template_button_click_1_listener(): any {
        i0.ɵɵrestoreView(_r11);
        const ctx_r14: any = i0.ɵɵnextContext();
        const ɵ$index_4_r8: any = ctx_r14.$index;
        const ɵ$count_4_r9: any = ctx_r14.$count;
        const ctx_r4: any = i0.ɵɵnextContext(2);
        return i0.ɵɵresetView(
          ctx_r4.innerCb(
            ɵ$index_4_r8 % 2 !== 0,
            ɵ$index_4_r8 % 2 === 0,
            ɵ$index_4_r8 === 0,
            ɵ$index_4_r8 === ɵ$count_4_r9 - 1,
          ),
        );
      },
    );
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, 'button', 0);
    i0.ɵɵlistener(
      'click',
      function MyApp_For_1_For_2_For_3_Template_button_click_2_listener(): any {
        i0.ɵɵrestoreView(_r11);
        const ctx_r9: any = i0.ɵɵnextContext(2);
        const ɵ$index_1_r3: any = ctx_r9.$index;
        const ɵ$count_1_r4: any = ctx_r9.$count;
        const ctx_r4: any = i0.ɵɵnextContext();
        return i0.ɵɵresetView(
          ctx_r4.outerCb(
            ɵ$index_1_r3 % 2 !== 0,
            ɵ$index_1_r3 % 2 === 0,
            ɵ$index_1_r3 === 0,
            ɵ$index_1_r3 === ɵ$count_1_r4 - 1,
          ),
        );
      },
    );
    i0.ɵɵelementEnd();
  }
}
function MyApp_For_1_For_2_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r6: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'button', 0);
    i0.ɵɵlistener('click', function MyApp_For_1_For_2_Template_button_click_0_listener(): any {
      const ctx_r6: any = i0.ɵɵrestoreView(_r6);
      const ɵ$index_4_r8: any = ctx_r6.$index;
      const ɵ$count_4_r9: any = ctx_r6.$count;
      const ctx_r4: any = i0.ɵɵnextContext(2);
      return i0.ɵɵresetView(
        ctx_r4.innerCb(
          ɵ$index_4_r8 % 2 !== 0,
          ɵ$index_4_r8 % 2 === 0,
          ɵ$index_4_r8 === 0,
          ɵ$index_4_r8 === ɵ$count_4_r9 - 1,
        ),
      );
    });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(1, 'button', 0);
    i0.ɵɵlistener('click', function MyApp_For_1_For_2_Template_button_click_1_listener(): any {
      i0.ɵɵrestoreView(_r6);
      const ctx_r9: any = i0.ɵɵnextContext();
      const ɵ$index_1_r3: any = ctx_r9.$index;
      const ɵ$count_1_r4: any = ctx_r9.$count;
      const ctx_r4: any = i0.ɵɵnextContext();
      return i0.ɵɵresetView(
        ctx_r4.outerCb(
          ɵ$index_1_r3 % 2 !== 0,
          ɵ$index_1_r3 % 2 === 0,
          ɵ$index_1_r3 === 0,
          ɵ$index_1_r3 === ɵ$count_1_r4 - 1,
        ),
      );
    });
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(
      2,
      MyApp_For_1_For_2_For_3_Template,
      3,
      0,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity,
    );
  }
  if (rf & 2) {
    const ctx_r4: any = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r4.items);
  }
}
function MyApp_For_1_Template(rf: number, ctx: any): any {
  if (rf & 1) {
    const _r1: any = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, 'button', 0);
    i0.ɵɵlistener('click', function MyApp_For_1_Template_button_click_0_listener(): any {
      const ctx_r1: any = i0.ɵɵrestoreView(_r1);
      const ɵ$index_1_r3: any = ctx_r1.$index;
      const ɵ$count_1_r4: any = ctx_r1.$count;
      const ctx_r4: any = i0.ɵɵnextContext();
      return i0.ɵɵresetView(
        ctx_r4.outerCb(
          ɵ$index_1_r3 % 2 !== 0,
          ɵ$index_1_r3 % 2 === 0,
          ɵ$index_1_r3 === 0,
          ɵ$index_1_r3 === ɵ$count_1_r4 - 1,
        ),
      );
    });
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(
      1,
      MyApp_For_1_For_2_Template,
      4,
      0,
      null,
      null,
      i0.ɵɵrepeaterTrackByIdentity,
    );
  }
  if (rf & 2) {
    const ctx_r4: any = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r4.items);
  }
}

export class MyApp {
  items = [];

  outerCb(...args: unknown[]) {}
  innerCb(...args: unknown[]) {}
  innermostCb(...args: unknown[]) {}
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
    consts: [[3, 'click']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵrepeaterCreate(
          0,
          MyApp_For_1_Template,
          3,
          0,
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
                template: `
        @for (outer of items; track outer; let outerOdd = $odd, outerEven = $even, outerFirst = $first, outerLast = $last) {
          <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>

          @for (inner of items; track inner; let innerOdd = $odd, innerEven = $even, innerFirst = $first, innerLast = $last) {
            <button (click)="innerCb(innerOdd, innerEven, innerFirst, innerLast)"></button>
            <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>

            @for (innermost of items; track innermost; let innermostOdd = $odd, innermostEven = $even, innermostFirst = $first, innermostLast = $last) {
              <button (click)="innermostCb(innermostOdd, innermostEven, innermostFirst, innermostLast)"></button>
              <button (click)="innerCb(innerOdd, innerEven, innerFirst, innerLast)"></button>
              <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>
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
      filePath: 'nested_for_listener_computed_template_variables.ts',
      lineNumber: 22,
    });
})();

```