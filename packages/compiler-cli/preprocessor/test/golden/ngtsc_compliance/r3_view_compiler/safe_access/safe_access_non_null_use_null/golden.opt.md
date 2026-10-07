# /out/safe_access_non_null_use_null.ngtypecheck.ts
```ts
/**
 * TCB for /safe_access_non_null_use_null.ts
 * @generated
 */

import * as i0 from './safe_access_non_null_use_null';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      (this.val /*84,87*/ /*84,87*/?.foo /*89,92*/ /*84,92*/)! /*84,93*/.bar /*94,97*/ /*84,97*/ +
      (this.val /*104,107*/ /*104,107*/?.[0 /*110,111*/] /*104,112*/
        .foo /*113,116*/ /*104,116*/)! /*104,117*/.bar /*118,121*/ /*104,121*/ +
      (this.foo(/*128,131*/ this.val /*132,135*/ /*132,135*/) /*128,136*/
        ?.foo /*138,141*/ /*128,141*/)! /*128,142*/.bar /*143,146*/ /*128,146*/ +
      ((this.val /*158,161*/ /*158,161*/ as any) /*153,162*/
        ?.foo /*164,167*/ /*153,167*/)! /*153,168*/.bar /*169,172*/ /*153,172*/;
  }
}

```

# /out/safe_access_non_null_use_null.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  val: any = null;

  foo(val: unknown) {
    return val;
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
    false,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyApp,
    selectors: [['ng-component']],
    standalone: false,
    decls: 1,
    vars: 4,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        let tmp_0_0;
        i0.ɵɵtextInterpolate4(
          ' ',
          ctx.val == null ? null : ctx.val.foo.bar,
          ' ',
          ctx.val == null ? null : ctx.val[0].foo.bar,
          ' ',
          (tmp_0_0 = ctx.foo(ctx.val)) == null ? null : tmp_0_0.foo.bar,
          ' ',
          ctx.val == null ? null : ctx.val.foo.bar,
          ' ',
        );
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
        {{ val?.foo!.bar }}
        {{ val?.[0].foo!.bar }}
        {{ foo(val)?.foo!.bar }}
        {{ $any(val)?.foo!.bar }}
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
      filePath: 'safe_access_non_null_use_null.ts',
      lineNumber: 12,
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
  static ɵmod: i0.ɵɵNgModuleDeclaration<MyModule, [typeof MyApp], never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: MyModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<MyModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        MyModule,
        [{ type: NgModule, args: [{ declarations: [MyApp] }] }],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(MyModule, { declarations: [MyApp] });
})();

```