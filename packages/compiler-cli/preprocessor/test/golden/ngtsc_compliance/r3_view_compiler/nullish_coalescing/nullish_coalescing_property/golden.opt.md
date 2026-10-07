# /out/nullish_coalescing_property.ngtypecheck.ts
```ts
/**
 * TCB for /nullish_coalescing_property.ts
 * @generated
 */

import * as i0 from './nullish_coalescing_property';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    'Hello, ' /*123,132*/ +
      (this.firstName /*136,145*/ /*136,145*/ ?? 'Frodo' /*149,156*/) /*136,156*/ /*123,157*/ +
      '!' /*160,163*/ /*123,163*/;
    'Your last name is ' /*191,211*/ +
      (this.lastName /*215,223*/ /*215,223*/ ??
        this.lastNameFallback /*227,243*/ /*227,243*/ /*215,243*/ ??
        'unknown' /*247,256*/) /*215,256*/ /*191,257*/;
  }
}

```

# /out/nullish_coalescing_property.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  firstName: string | null = null;
  lastName: string | null = null;
  lastNameFallback = 'Baggins';
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
    decls: 2,
    vars: 2,
    consts: [[3, 'title']],
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelement(0, 'div', 0)(1, 'span', 0);
      }
      if (rf & 2) {
        i0.ɵɵproperty('title', 'Hello, ' + (ctx.firstName ?? 'Frodo') + '!');
        i0.ɵɵadvance();
        i0.ɵɵproperty(
          'title',
          'Your last name is ' + (ctx.lastName ?? ctx.lastNameFallback ?? 'unknown'),
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
                selector: 'my-app',
                template: `
        <div [title]="'Hello, ' + (firstName ?? 'Frodo') + '!'"></div>
        <span [title]="'Your last name is ' + (lastName ?? lastNameFallback ?? 'unknown')"></span>
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
      filePath: 'nullish_coalescing_property.ts',
      lineNumber: 11,
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