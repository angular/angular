# /out/nullish_coalescing_parens_use_null.ngtypecheck.ts
```ts
/**
 * TCB for /nullish_coalescing_parens_use_null.ts
 * @generated
 */

import * as i0 from './nullish_coalescing_parens_use_null';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      ((this.x /*104,105*/ /*104,105*/ && this.y /*109,110*/ /*109,110*/) /*104,110*/ ??
        this.z /*115,116*/ /*115,116*/) /*103,116*/;
    '' +
      (this.x /*138,139*/ /*138,139*/ &&
        (this.y /*144,145*/ /*144,145*/ ?? this.z /*149,150*/ /*149,150*/) /*144,150*/) /*138,151*/;
    '' +
      (this.x /*173,174*/ /*173,174*/?.y /*176,177*/ /*173,177*/ ??
        this.y /*181,182*/ /*181,182*/?.z /*184,185*/ /*181,185*/) /*173,185*/;
    '' +
      ((this.x /*208,209*/ /*208,209*/?.y /*211,212*/ /*208,212*/ ??
        this.y /*216,217*/ /*216,217*/) /*208,217*/ ||
        this.z /*222,223*/ /*222,223*/) /*207,223*/;
    '' +
      ((this.x /*246,247*/ /*246,247*/?.y /*249,250*/ /*246,250*/ ??
        this.y /*254,255*/ /*254,255*/) /*246,255*/ &&
        this.z /*260,261*/ /*260,261*/) /*245,261*/;
    '' +
      (this.z /*283,284*/ /*283,284*/ ||
        (this.x /*289,290*/ /*289,290*/?.y /*292,293*/ /*289,293*/ ??
          this.y /*297,298*/ /*297,298*/) /*289,298*/) /*283,299*/;
    '' +
      (this.z /*321,322*/ /*321,322*/ &&
        (this.x /*327,328*/ /*327,328*/?.y /*330,331*/ /*327,331*/ ??
          this.y /*335,336*/ /*335,336*/) /*327,336*/) /*321,337*/;
  }
}

```

# /out/nullish_coalescing_parens_use_null.ts
```ts
import { Component } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  x: any = null;
  y: any = 0;
  z: any = 1;
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyApp, never> = function MyApp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyApp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyApp,
    'my-app',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    decls: 14,
    vars: 7,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵdomElementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(2, 'div');
        i0.ɵɵtext(3);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(4, 'div');
        i0.ɵɵtext(5);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(6, 'div');
        i0.ɵɵtext(7);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(8, 'div');
        i0.ɵɵtext(9);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(10, 'div');
        i0.ɵɵtext(11);
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(12, 'div');
        i0.ɵɵtext(13);
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate((ctx.x && ctx.y) ?? ctx.z);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(ctx.x && (ctx.y ?? ctx.z));
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate((ctx.x == null ? null : ctx.x.y) ?? (ctx.y == null ? null : ctx.y.z));
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(((ctx.x == null ? null : ctx.x.y) ?? ctx.y) || ctx.z);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(((ctx.x == null ? null : ctx.x.y) ?? ctx.y) && ctx.z);
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(ctx.z || ((ctx.x == null ? null : ctx.x.y) ?? ctx.y));
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate(ctx.z && ((ctx.x == null ? null : ctx.x.y) ?? ctx.y));
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
                selector: 'my-app',
                template: `
        <div>{{ (x && y) ?? z }}</div>
        <div>{{ x && (y ?? z) }}</div>
        <div>{{ x?.y ?? y?.z }}</div>
        <div>{{ (x?.y ?? y) || z }}</div>
        <div>{{ (x?.y ?? y) && z }}</div>
        <div>{{ z || (x?.y ?? y) }}</div>
        <div>{{ z && (x?.y ?? y) }}</div>
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
      filePath: 'nullish_coalescing_parens_use_null.ts',
      lineNumber: 15,
    });
})();

```