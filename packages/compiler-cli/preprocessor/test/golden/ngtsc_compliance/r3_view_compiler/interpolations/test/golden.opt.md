# /out/test.ngtypecheck.ts
```ts
/**
 * TCB for /test.ts
 * @generated
 */

import * as i0 from './test';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' +
      this.list /*107,111*/ /*107,111*/[0 /*112,113*/] /*107,114*/ +
      this.list /*119,123*/ /*119,123*/[1 /*124,125*/] /*119,126*/ +
      this.list /*131,135*/ /*131,135*/[2 /*136,137*/] /*131,138*/ +
      this.list /*143,147*/ /*143,147*/[3 /*148,149*/] /*143,150*/ +
      this.list /*155,159*/ /*155,159*/[4 /*160,161*/] /*155,162*/ +
      this.list /*167,171*/ /*167,171*/[5 /*172,173*/] /*167,174*/ +
      this.list /*179,183*/ /*179,183*/[6 /*184,185*/] /*179,186*/ +
      this.list /*191,195*/ /*191,195*/[7 /*196,197*/] /*191,198*/ +
      this.list /*203,207*/ /*203,207*/[8 /*208,209*/] /*203,210*/;
  }
}

```

# /out/test.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  list: any[] = [];
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
    vars: 9,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵtext(0);
      }
      if (rf & 2) {
        i0.ɵɵtextInterpolateV([
          ' ',
          ctx.list[0],
          ' ',
          ctx.list[1],
          ' ',
          ctx.list[2],
          ' ',
          ctx.list[3],
          ' ',
          ctx.list[4],
          ' ',
          ctx.list[5],
          ' ',
          ctx.list[6],
          ' ',
          ctx.list[7],
          ' ',
          ctx.list[8],
          ' ',
        ]);
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
                template:
                  ' {{list[0]}} {{list[1]}} {{list[2]}} {{list[3]}} {{list[4]}} {{list[5]}} {{list[6]}} {{list[7]}} {{list[8]}} ',
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
    i0.ɵsetClassDebugInfo(MyApp, { className: 'MyApp', filePath: 'test.ts', lineNumber: 8 });
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