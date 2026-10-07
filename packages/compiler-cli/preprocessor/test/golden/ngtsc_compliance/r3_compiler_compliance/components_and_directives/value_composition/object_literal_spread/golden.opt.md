# /out/object_literal_spread.ngtypecheck.ts
```ts
/**
 * TCB for /object_literal_spread.ts
 * @generated
 */

import * as i0 from './object_literal_spread';

/*tcb1*/
function _tcb1(this: i0.ObjectComp) {
  if (true) {
    const _t1 /*78,84*/ = { ...this.foo /*91,94*/ /*91,94*/ } /*87,95*/; /*73,96*/
    const _t2 /*106,116*/ = {
      'a' /*120,121*/: 1 /*123,124*/,
      ...this.foo /*129,132*/ /*129,132*/,
      'b' /*134,135*/: 2 /*137,138*/,
    } /*119,139*/; /*101,140*/
    const _t3 /*150,165*/ = {
      ...this.foo /*172,175*/ /*172,175*/,
      'a' /*177,178*/: 1 /*180,181*/,
      ...this.bar /*186,189*/ /*186,189*/,
      ...this.baz /*194,197*/ /*194,197*/,
      'b' /*199,200*/: 2 /*202,203*/,
    } /*168,204*/; /*145,205*/
    const _t4 /*215,228*/ = {
      'a' /*232,233*/: 1 /*235,236*/,
      ...{
        'b' /*242,243*/: { ...{ 'c' /*250,251*/: 3 /*253,254*/ } /*249,255*/ } /*245,256*/,
      } /*241,257*/,
    } /*231,258*/; /*210,259*/
    '' + _t1 /*329,335*/ + _t2 /*340,350*/ + _t3 /*355,370*/ + _t4 /*375,388*/;
  }
}

```

# /out/object_literal_spread.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (a0: any): any => ({ ...a0 });
const _c1 = (a0: any): any => ({ a: 1, ...a0, b: 2 });
const _c2 = (a0: any, a1: any, a2: any): any => ({ ...a0, a: 1, ...a1, ...a2, b: 2 });
const _c3 = (): any => ({ c: 3 });
const _c4 = (a0: any): any => ({ b: a0 });
const _c5 = (a0: any): any => ({ a: 1, ...a0 });

export class ObjectComp {
  foo = {};
  bar = {};
  baz = {};
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ObjectComp, never> = function ObjectComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || ObjectComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    ObjectComp,
    'ng-component',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: ObjectComp,
    selectors: [['ng-component']],
    decls: 1,
    vars: 19,
    template: function ObjectComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        const simple_r1: any = i0.ɵɵpureFunction1(4, _c0, ctx.foo);
        const otherProps_r2: any = i0.ɵɵpureFunction1(6, _c1, ctx.foo);
        const multipleSpreads_r3: any = i0.ɵɵpureFunction3(8, _c2, ctx.foo, ctx.bar, ctx.baz);
        const objectLiteral_r4: any = i0.ɵɵpureFunction1(
          17,
          _c5,
          i0.ɵɵpureFunction1(15, _c4, i0.ɵɵpureFunction1(13, _c0, i0.ɵɵpureFunction0(12, _c3))),
        );
        i0.ɵɵtextInterpolate4(
          ' ',
          simple_r1,
          ' ',
          otherProps_r2,
          ' ',
          multipleSpreads_r3,
          ' ',
          objectLiteral_r4,
          ' ',
        );
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ObjectComp,
        [
          {
            type: Component,
            args: [
              {
                template: `
        @let simple = {...foo};
        @let otherProps = {a: 1, ...foo, b: 2};
        @let multipleSpreads = {...foo, a: 1, ...bar, ...baz, b: 2};
        @let objectLiteral = {a: 1, ...{b: {...{c: 3}}}};

        <!-- Use the objects so they don't get flagged as unused. -->
        {{simple}} {{otherProps}} {{multipleSpreads}} {{objectLiteral}}
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
    i0.ɵsetClassDebugInfo(ObjectComp, {
      className: 'ObjectComp',
      filePath: 'object_literal_spread.ts',
      lineNumber: 14,
    });
})();

```