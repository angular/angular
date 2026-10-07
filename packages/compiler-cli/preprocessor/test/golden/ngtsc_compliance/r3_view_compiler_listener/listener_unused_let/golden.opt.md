# /out/listener_unused_let.ngtypecheck.ts
```ts
/**
 * TCB for /listener_unused_let.ts
 * @generated
 */

import * as i0 from './listener_unused_let';

/*tcb1*/
function _tcb1(this: i0.TestCmp) {
  if (true) {
    const _t1 /*78,81*/ = 123 /*84,87*/; /*73,88*/
    var _t2 /*93,118*/ = document.createElement('button'); /*93,118*/ /*93,118*/
    _t2.addEventListener(/*102,107*/ 'click', ($event /*T:EP*/): any => {
      this
        .noop /*110,114*/
        () /*110,116*/;
    }) /*101,117*/;
    '' + _t1 /*130,133*/;
  }
}

```

# /out/listener_unused_let.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class TestCmp {
  noop() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || TestCmp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    TestCmp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [['ng-component']],
    decls: 2,
    vars: 1,
    consts: [[3, 'click']],
    template: function TestCmp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'button', 0);
        i0.ɵɵdomListener('click', function TestCmp_Template_button_click_0_listener(): any {
          return ctx.noop();
        });
        i0.ɵɵdomElementEnd();
        i0.ɵɵtext(1);
      }
      if (rf & 2) {
        const foo_r1: any = 123;
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1(' ', foo_r1, ' ');
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        TestCmp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        @let foo = 123;
        <button (click)="noop()"></button>
        {{foo}}
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
    i0.ɵsetClassDebugInfo(TestCmp, {
      className: 'TestCmp',
      filePath: 'listener_unused_let.ts',
      lineNumber: 10,
    });
})();

```