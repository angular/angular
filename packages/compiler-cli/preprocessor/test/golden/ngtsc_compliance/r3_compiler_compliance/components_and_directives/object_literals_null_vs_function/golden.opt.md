# /out/object_literals_null_vs_function.ngtypecheck.ts
```ts
/**
 * TCB for /object_literals_null_vs_function.ts
 * @generated
 */

import * as i0 from './object_literals_null_vs_function';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    ({ 'foo' /*98,101*/: null /*103,107*/ }) /*97,108*/;
    ({
      'foo' /*134,137*/: this
        .getFoo /*139,145*/
        () /*139,147*/,
    }) /*133,148*/;
  }
}

```

# /out/object_literals_null_vs_function.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

const _c0 = (): any => ({ foo: null });
const _c1 = (a0: any): any => ({ foo: a0 });

export class MyApp {
  getFoo() {
    return 'foo!';
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
    decls: 2,
    vars: 5,
    consts: [[3, 'dir']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0)(1, 'div', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('dir', i0.ɵɵpureFunction0(2, _c0));
        i0.ɵɵadvance();
        i0.ɵɵproperty('dir', i0.ɵɵpureFunction1(3, _c1, ctx.getFoo()));
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
        <div [dir]="{foo: null}"></div>
        <div [dir]="{foo: getFoo()}"></div>
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
      filePath: 'object_literals_null_vs_function.ts',
      lineNumber: 10,
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