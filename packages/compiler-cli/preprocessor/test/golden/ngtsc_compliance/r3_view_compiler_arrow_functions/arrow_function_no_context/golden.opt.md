# /out/arrow_function_no_context.ngtypecheck.ts
```ts
/**
 * TCB for /arrow_function_no_context.ts
 * @generated
 */

import * as i0 from './arrow_function_no_context';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    var _t1 /*81,131*/ = document.createElement('button'); /*81,131*/ /*81,131*/
    _t1.addEventListener(/*90,95*/ 'click', ($event /*T:EP*/): any => {
      this.sigA /*98,102*/ /*98,102*/
        .update(
          /*103,109*/ (value) /*D:ignore*/ => value /*119,124*/ + 1 /*127,128*/ /*119,128*/,
        ) /*98,129*/;
    }) /*89,130*/;
    var _t2 /*156,206*/ = document.createElement('button'); /*156,206*/ /*156,206*/
    _t2.addEventListener(/*165,170*/ 'click', ($event /*T:EP*/): any => {
      this.sigA /*173,177*/ /*173,177*/
        .update(
          /*178,184*/ (value) /*D:ignore*/ => value /*194,199*/ - 1 /*202,203*/ /*194,203*/,
        ) /*173,204*/;
    }) /*164,205*/;
    var _t3 /*231,281*/ = document.createElement('button'); /*231,281*/ /*231,281*/
    _t3.addEventListener(/*240,245*/ 'click', ($event /*T:EP*/): any => {
      this.sigB /*248,252*/ /*248,252*/
        .update(
          /*253,259*/ (value) /*D:ignore*/ => value /*269,274*/ + 1 /*277,278*/ /*269,278*/,
        ) /*248,279*/;
    }) /*239,280*/;
  }
}

```

# /out/arrow_function_no_context.ts
```ts
import { Component, signal } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestComp {
  sigA = signal(
    1,
    ...((ngDevMode ? [{ debugName: 'sigA' }] : /* istanbul ignore next */ []) as []),
  );
  sigB = signal(
    2,
    ...((ngDevMode ? [{ debugName: 'sigB' }] : /* istanbul ignore next */ []) as []),
  );
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestComp, never> = function TestComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestComp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestComp,
    selectors: [['ng-component']],
    decls: 6,
    vars: 0,
    consts: [[3, 'click']],
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'button', 0);
        i0.ɵɵdomListener('click', function TestComp_Template_button_click_0_listener(): any {
          return ctx.sigA.update((value: any): any => value + 1);
        });
        i0.ɵɵtext(1, 'Increment A');
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(2, 'button', 0);
        i0.ɵɵdomListener('click', function TestComp_Template_button_click_2_listener(): any {
          return ctx.sigA.update((value: any): any => value - 1);
        });
        i0.ɵɵtext(3, 'Decrement A');
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(4, 'button', 0);
        i0.ɵɵdomListener('click', function TestComp_Template_button_click_4_listener(): any {
          return ctx.sigB.update((value: any): any => value + 1);
        });
        i0.ɵɵtext(5, 'Increment B');
        i0.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestComp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        <button (click)="sigA.update(value => value + 1)">Increment A</button>
        <button (click)="sigA.update(value => value - 1)">Decrement A</button>
        <button (click)="sigB.update(value => value + 1)">Increment B</button>
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
    i0.ɵsetClassDebugInfo(TestComp, {
      className: 'TestComp',
      filePath: 'arrow_function_no_context.ts',
      lineNumber: 10,
    });
})();

```