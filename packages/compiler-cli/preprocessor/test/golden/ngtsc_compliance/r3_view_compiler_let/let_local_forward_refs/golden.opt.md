# /out/let_local_forward_refs.ngtypecheck.ts
```ts
/**
 * TCB for /let_local_forward_refs.ts
 * @generated
 */

import * as i0 from './let_local_forward_refs';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    var _t3 /*132,145*/ = document.createElement('input'); /*132,145*/ /*132,145*/
    var _t2 /*140,144*/ = _t3; /*139,144*/
    const _t1 /*78,85*/ =
      'Hello, ' /*88,97*/ + _t2 /*100,104*/.value /*105,110*/ /*100,110*/ /*88,110*/; /*73,111*/
    '' + _t1 /*114,121*/;
  }
}

```

# /out/let_local_forward_refs.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
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
    vars: 1,
    consts: [['name', '']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomElement(1, 'input', null, 0);
      }
      if (rf & 2) {
        const name_r1: any = i0.ɵɵreference(2);
        const message_r2: any = 'Hello, ' + name_r1.value;
        i0.ɵɵtextInterpolate1(' ', message_r2, ' ');
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
        @let message = 'Hello, ' + name.value;
        {{message}}
        <input #name>
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
      filePath: 'let_local_forward_refs.ts',
      lineNumber: 10,
    });
})();

```