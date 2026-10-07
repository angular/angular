# /out/array_literal_spread.ngtypecheck.ts
```ts
/**
 * TCB for /array_literal_spread.ts
 * @generated
 */

import * as i0 from './array_literal_spread';

/*tcb1*/
function _tcb1(this: i0.ArrayComp) {
  if (true) {
    const _t1 /*78,84*/ = [...this.foo /*91,94*/ /*91,94*/ /*88,94*/] /*87,95*/; /*73,96*/
    const _t2 /*106,118*/ = [
      1 /*122,123*/,
      ...this.foo /*128,131*/ /*128,131*/ /*125,131*/,
      2 /*133,134*/,
    ] /*121,135*/; /*101,136*/
    const _t3 /*146,161*/ = [
      ...this.foo /*168,171*/ /*168,171*/ /*165,171*/,
      1 /*173,174*/,
      ...this.bar /*179,182*/ /*179,182*/ /*176,182*/,
      ...this.baz /*187,190*/ /*187,190*/ /*184,190*/,
      2 /*192,193*/,
    ] /*164,194*/; /*141,195*/
    const _t4 /*205,222*/ = [
      1 /*226,227*/,
      ...[2 /*233,234*/, ...[3 /*240,241*/] /*239,242*/ /*236,242*/] /*232,243*/ /*229,243*/,
    ] /*225,244*/; /*200,245*/
    '' + _t1 /*314,320*/ + _t2 /*325,337*/ + _t3 /*342,357*/ + _t4 /*362,379*/;
  }
}

```

# /out/array_literal_spread.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any): any => [...a0];
const _c1 = (a0: any): any => [1, ...a0, 2];
const _c2 = (a0: any, a1: any, a2: any): any => [...a0, 1, ...a1, ...a2, 2];
const _c3 = (): any => [3];
const _c4 = (a0: any): any => [2, ...a0];
const _c5 = (a0: any): any => [1, ...a0];

export class ArrayComp {
  foo = [];
  bar = [];
  baz = [];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ArrayComp, never> = function ArrayComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ArrayComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ArrayComp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ArrayComp,
    selectors: [['ng-component']],
    decls: 1,
    vars: 17,
    template: function ArrayComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        const simple_r1: any = i0.ɵɵpureFunction1(4, _c0, ctx.foo);
        const otherEntries_r2: any = i0.ɵɵpureFunction1(6, _c1, ctx.foo);
        const multipleSpreads_r3: any = i0.ɵɵpureFunction3(8, _c2, ctx.foo, ctx.bar, ctx.baz);
        const inlineArraySpread_r4: any = i0.ɵɵpureFunction1(
          15,
          _c5,
          i0.ɵɵpureFunction1(13, _c4, i0.ɵɵpureFunction0(12, _c3)),
        );
        i0.ɵɵtextInterpolate4(
          ' ',
          simple_r1,
          ' ',
          otherEntries_r2,
          ' ',
          multipleSpreads_r3,
          ' ',
          inlineArraySpread_r4,
          ' ',
        );
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ArrayComp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        @let simple = [...foo];
        @let otherEntries = [1, ...foo, 2];
        @let multipleSpreads = [...foo, 1, ...bar, ...baz, 2];
        @let inlineArraySpread = [1, ...[2, ...[3]]];

        <!-- Use the arrays so they don't get flagged as unused. -->
        {{simple}} {{otherEntries}} {{multipleSpreads}} {{inlineArraySpread}}
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
    i0.ɵsetClassDebugInfo(ArrayComp, {
      className: 'ArrayComp',
      filePath: 'array_literal_spread.ts',
      lineNumber: 14,
    });
})();

```