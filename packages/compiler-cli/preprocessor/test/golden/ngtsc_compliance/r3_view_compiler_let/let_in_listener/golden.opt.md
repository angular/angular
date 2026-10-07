# /out/let_in_listener.ngtypecheck.ts
```ts
/**
 * TCB for /let_in_listener.ts
 * @generated
 */

import * as i0 from './let_in_listener';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    const _t1 /*78,81*/ = this.value /*84,89*/ /*84,89*/ + 1 /*92,93*/ /*84,93*/; /*73,94*/
    const _t2 /*104,107*/ = _t1 /*110,113*/ + 1 /*116,117*/ /*110,117*/; /*99,118*/
    var _t3 /*124,161*/ = document.createElement('button'); /*124,161*/ /*124,161*/
    _t3.addEventListener(/*133,138*/ 'click', ($event /*T:EP*/): any => {
      this.callback(/*141,149*/ _t1 /*150,153*/, _t2 /*155,158*/) /*141,159*/;
    }) /*132,160*/;
  }
}

```

# /out/let_in_listener.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  value = 1;

  callback(one: number, two: number) {
    console.log(one, two);
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
    decls: 3,
    vars: 2,
    consts: [[3, 'click']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        const _r1: any = i0.ɵɵgetCurrentView();
        i0.ɵɵdeclareLet(0)(1);
        i0.ɵɵdomElementStart(2, 'button', 0);
        i0.ɵɵdomListener('click', function MyApp_Template_button_click_2_listener(): any {
          i0.ɵɵrestoreView(_r1);
          const one_r2: any = i0.ɵɵreadContextLet(0);
          const two_r3: any = i0.ɵɵreadContextLet(1);
          return i0.ɵɵresetView(ctx.callback(one_r2, two_r3));
        });
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        const one_r4: any = i0.ɵɵstoreLet(ctx.value + 1);
        i0.ɵɵadvance();
        i0.ɵɵstoreLet(one_r4 + 1);
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
        @let two = one + 1;

        <button (click)="callback(one, two)"></button>
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
      filePath: 'let_in_listener.ts',
      lineNumber: 11,
    });
})();

```