# /out/call_rest.ngtypecheck.ts
```ts
/**
 * TCB for /call_rest.ts
 * @generated
 */

import * as i0 from './call_rest';

/*tcb1*/
function _tcb1(this: i0.TestComp) {
  if (true) {
    '' + this.fn(/*71,73*/ ...this.foo /*77,80*/ /*77,80*/ /*74,80*/) /*71,81*/;
    '' +
      this.fn(
        /*99,101*/ 1 /*102,103*/,
        ...this.foo /*108,111*/ /*108,111*/ /*105,111*/,
        2 /*113,114*/,
      ) /*99,115*/;
    '' +
      this.fn(
        /*133,135*/ ...this.foo /*139,142*/ /*139,142*/ /*136,142*/,
        1 /*144,145*/,
        ...this.bar /*150,153*/ /*150,153*/ /*147,153*/,
        ...this.baz /*158,161*/ /*158,161*/ /*155,161*/,
        2 /*163,164*/,
      ) /*133,165*/;
    '' +
      this.fn(
        /*183,185*/ 1 /*186,187*/,
        ...[2 /*193,194*/, ...[3 /*200,201*/] /*199,202*/ /*196,202*/] /*192,203*/ /*189,203*/,
      ) /*183,204*/;
  }
}

```

# /out/call_rest.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => [3];
const _c1 = (a0: any): any => [2, ...a0];

export class TestComp {
  foo = [];
  bar = [];
  baz = [];
  fn(..._: any[]) {}
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
    decls: 7,
    vars: 7,
    template: function TestComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
        i0.ɵɵdomElement(1, 'hr');
        i0.ɵɵtext(2);
        i0.ɵɵdomElement(3, 'hr');
        i0.ɵɵtext(4);
        i0.ɵɵdomElement(5, 'hr');
        i0.ɵɵtext(6);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolate1(' ', ctx.fn(...ctx.foo), ' ');
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(' ', ctx.fn(1, ...ctx.foo, 2), ' ');
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(' ', ctx.fn(...ctx.foo, 1, ...ctx.bar, ...ctx.baz, 2), ' ');
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          ' ',
          ctx.fn(1, ...i0.ɵɵpureFunction1(5, _c1, i0.ɵɵpureFunction0(4, _c0))),
          ' ',
        );
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
        {{fn(...foo)}}
        <hr>
        {{fn(1, ...foo, 2)}}
        <hr>
        {{fn(...foo, 1, ...bar, ...baz, 2)}}
        <hr>
        {{fn(1, ...[2, ...[3]])}}
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
      filePath: 'call_rest.ts',
      lineNumber: 14,
    });
})();

```