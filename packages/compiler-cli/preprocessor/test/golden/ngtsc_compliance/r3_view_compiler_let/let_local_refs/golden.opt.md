# /out/let_local_refs.ngtypecheck.ts
```ts
/**
 * TCB for /let_local_refs.ts
 * @generated
 */

import * as i0 from './let_local_refs';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    var _t3 /*73,86*/ = document.createElement('input'); /*73,86*/ /*73,86*/
    var _t2 /*81,85*/ = _t3; /*80,85*/
    var _t5 /*91,108*/ = document.createElement('input'); /*91,108*/ /*91,108*/
    var _t4 /*99,107*/ = _t5; /*98,107*/
    const _t1 /*119,127*/ =
      _t2 /*130,134*/.value /*135,140*/ /*130,140*/ +
      ' ' /*143,146*/ /*130,146*/ +
      _t4 /*149,157*/.value /*158,163*/ /*149,163*/ /*130,163*/; /*114,164*/
    '' + _t1 /*174,182*/;
  }
}

```

# /out/let_local_refs.ts
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
    decls: 5,
    vars: 1,
    consts: [
      ['name', ''],
      ['lastName', ''],
    ],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElement(0, 'input', null, 0)(2, 'input', null, 1);
        i0.ɵɵtext(4);
      }
      if (rf & 2) {
        const name_r1: any = i0.ɵɵreference(1);
        const lastName_r2: any = i0.ɵɵreference(3);
        const fullName_r3: any = name_r1.value + ' ' + lastName_r2.value;
        i0.ɵɵadvance(4);
        i0.ɵɵtextInterpolate1(' Hello, ', fullName_r3, ' ');
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
        <input #name>
        <input #lastName>

        @let fullName = name.value + ' ' + lastName.value;
        Hello, {{fullName}}
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
      filePath: 'let_local_refs.ts',
      lineNumber: 12,
    });
})();

```