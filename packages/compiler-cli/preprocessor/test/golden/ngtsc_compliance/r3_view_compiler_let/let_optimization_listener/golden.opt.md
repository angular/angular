# /out/let_optimization_listener.ngtypecheck.ts
```ts
/**
 * TCB for /let_optimization_listener.ts
 * @generated
 */

import * as i0 from './let_optimization_listener';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + this.value /*71,76*/ /*71,76*/;
    const _t1 /*92,95*/ = this.value /*98,103*/ /*98,103*/ + 1 /*106,107*/ /*98,107*/; /*87,108*/
    const _t2 /*118,121*/ = _t1 /*124,127*/ + 1 /*130,131*/ /*124,131*/; /*113,132*/
    const _t3 /*142,147*/ = _t2 /*150,153*/ + 1 /*156,157*/ /*150,157*/; /*137,158*/
    const _t4 /*168,172*/ = _t3 /*175,180*/ + 1 /*183,184*/ /*175,184*/; /*163,185*/
    '' + this.value /*188,193*/ /*188,193*/;
    var _t5 /*204,238*/ = document.createElement('button'); /*204,238*/ /*204,238*/
    _t5.addEventListener(/*213,218*/ 'click', ($event /*T:EP*/): any => {
      this.callback(/*221,229*/ _t3 /*230,235*/) /*221,236*/;
    }) /*212,237*/;
  }
}

```

# /out/let_optimization_listener.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  value = 0;

  callback(value: number) {
    console.log(value);
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
    decls: 4,
    vars: 3,
    consts: [[3, 'click']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        const _r1: any = i0.ɵɵgetCurrentView();
        i0.ɵɵtext(0);
        i0.ɵɵdeclareLet(1);
        i0.ɵɵtext(2);
        i0.ɵɵdomElementStart(3, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_3_listener(): any {
          i0.ɵɵrestoreView(_r1);
          const three_r2: any = i0.ɵɵreadContextLet(1);
          return i0.ɵɵresetView(ctx.callback(three_r2));
        });
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', ctx.value, ' ');
        const one_r3: any = ctx.value + 1;
        const two_r4: any = one_r3 + 1;
        i0.ɵɵadvance();
        const three_r5: any = i0.ɵɵstoreLet(two_r4 + 1);
        three_r5 + 1;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', ctx.value, ' ');
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
        <button (click)="callback(three)"></button>
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
      filePath: 'let_optimization_listener.ts',
      lineNumber: 14,
    });
})();

```