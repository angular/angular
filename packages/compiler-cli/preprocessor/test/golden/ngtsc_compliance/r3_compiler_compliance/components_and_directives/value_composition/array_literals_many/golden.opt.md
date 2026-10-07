# /out/array_literals_many.ngtypecheck.ts
```ts
/**
 * TCB for /array_literals_many.ts
 * @generated
 */

import * as i0 from './array_literals_many';

/*tcb1*/
function _tcb1(this: i0.MyComp) {
  if (true) {
    '' +
      this.names /*116,121*/ /*116,121*/[0 /*122,123*/] /*116,124*/ +
      this.names /*131,136*/ /*131,136*/[1 /*137,138*/] /*131,139*/ +
      this.names /*146,151*/ /*146,151*/[3 /*152,153*/] /*146,154*/ +
      this.names /*161,166*/ /*161,166*/[4 /*167,168*/] /*161,169*/ +
      this.names /*176,181*/ /*176,181*/[5 /*182,183*/] /*176,184*/ +
      this.names /*191,196*/ /*191,196*/[6 /*197,198*/] /*191,199*/ +
      this.names /*206,211*/ /*206,211*/[7 /*212,213*/] /*206,214*/ +
      this.names /*221,226*/ /*221,226*/[8 /*227,228*/] /*221,229*/ +
      this.names /*236,241*/ /*236,241*/[9 /*242,243*/] /*236,244*/ +
      this.names /*251,256*/ /*251,256*/[10 /*257,259*/] /*251,260*/ +
      this.names /*267,272*/ /*267,272*/[11 /*273,275*/] /*267,276*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.MyApp) {
  if (true) {
    var _t1 /*T:DIR:0*/ /*463,549*/ = null! as i0.MyComp; /*T:VAE*/
    _t1.names /*473,478*/ = [
      'start-' /*482,490*/,
      this.n0 /*492,494*/ /*492,494*/,
      this.n1 /*496,498*/ /*496,498*/,
      this.n2 /*500,502*/ /*500,502*/,
      this.n3 /*504,506*/ /*504,506*/,
      this.n4 /*508,510*/ /*508,510*/,
      '-middle-' /*512,522*/,
      this.n5 /*524,526*/ /*524,526*/,
      this.n6 /*528,530*/ /*528,530*/,
      this.n7 /*532,534*/ /*532,534*/,
      this.n8 /*536,538*/ /*536,538*/,
      '-end' /*540,546*/,
    ] /*481,547*/ /*472,548*/;
  }
}

```

# /out/array_literals_many.ts
```ts
import { Component, Input, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (
  a0: any,
  a1: any,
  a2: any,
  a3: any,
  a4: any,
  a5: any,
  a6: any,
  a7: any,
  a8: any,
): any => ['start-', a0, a1, a2, a3, a4, '-middle-', a5, a6, a7, a8, '-end'];

export class MyComp {
  names!: string[];
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyComp, never> = function MyComp_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyComp)();
  };
  // @ts-ignore
  static ɵcmp: i0.ɵɵComponentDeclaration<
    MyComp,
    'my-comp',
    never,
    { 'names': { 'alias': 'names'; 'required': false } },
    {},
    never,
    never,
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComp,
    selectors: [['my-comp']],
    inputs: { names: 'names' },
    standalone: false,
    decls: 1,
    vars: 11,
    template: function MyComp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolateV([
          ' ',
          ctx.names[0],
          ' ',
          ctx.names[1],
          ' ',
          ctx.names[3],
          ' ',
          ctx.names[4],
          ' ',
          ctx.names[5],
          ' ',
          ctx.names[6],
          ' ',
          ctx.names[7],
          ' ',
          ctx.names[8],
          ' ',
          ctx.names[9],
          ' ',
          ctx.names[10],
          ' ',
          ctx.names[11],
          ' ',
        ]);
      }
    },
    encapsulation: 2,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyComp,
        [
          {
            type: Component,
            args: [
              {
                selector: 'my-comp',
                template: `
        {{ names[0] }}
        {{ names[1] }}
        {{ names[3] }}
        {{ names[4] }}
        {{ names[5] }}
        {{ names[6] }}
        {{ names[7] }}
        {{ names[8] }}
        {{ names[9] }}
        {{ names[10] }}
        {{ names[11] }}
      `,
                standalone: false,
              },
            ],
          },
        ],
        null,
        { names: [{ type: Input }] },
      );
  }
}
((): any => {
  (typeof ngDevMode === 'undefined' || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComp, {
      className: 'MyComp',
      filePath: 'array_literals_many.ts',
      lineNumber: 20,
    });
})();

export class MyApp {
  n0 = 'a';
  n1 = 'b';
  n2 = 'c';
  n3 = 'd';
  n4 = 'e';
  n5 = 'f';
  n6 = 'g';
  n7 = 'h';
  n8 = 'i';
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['my-app']],
    standalone: false,
    decls: 1,
    vars: 11,
    consts: [[3, 'names']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'my-comp', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty(
          'names',
          i0.ɵɵpureFunctionV(1, _c0, [
            ctx.n0,
            ctx.n1,
            ctx.n2,
            ctx.n3,
            ctx.n4,
            ctx.n5,
            ctx.n6,
            ctx.n7,
            ctx.n8,
          ]),
        );
      }
    },
    dependencies: [MyComp],
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
      <my-comp [names]="['start-', n0, n1, n2, n3, n4, '-middle-', n5, n6, n7, n8, '-end']">
      </my-comp>
    `,
                standalone: false,
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
      filePath: 'array_literals_many.ts',
      lineNumber: 32,
    });
})();

export class MyModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<MyModule, never> = function MyModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || MyModule)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyComp, typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyComp, MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyComp, MyApp] });
})();

```