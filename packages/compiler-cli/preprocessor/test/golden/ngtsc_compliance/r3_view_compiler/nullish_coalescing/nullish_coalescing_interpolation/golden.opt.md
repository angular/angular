# /out/nullish_coalescing_interpolation.ngtypecheck.ts
```ts
/**
 * TCB for /nullish_coalescing_interpolation.ts
 * @generated
 */

import * as i0 from './nullish_coalescing_interpolation';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
    '' + (this.firstName /*124,133*/ /*124,133*/ ?? 'Frodo' /*137,144*/) /*124,144*/;
    '' +
      (this.lastName /*186,194*/ /*186,194*/ ??
        this.lastNameFallback /*198,214*/ /*198,214*/ /*186,214*/ ??
        'unknown' /*218,227*/) /*186,227*/;
  }
}

```

# /out/nullish_coalescing_interpolation.ts
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
    decls: 4,
    vars: 2,
    template: function MyApp_Template(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵelementStart(0, 'div');
        i0.ɵɵtext(1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(2, 'span');
        i0.ɵɵtext(3);
        i0.ɵɵelementEnd();
      }
      if (rf & 2) {
        i0.ɵɵadvance();
        i0.ɵɵtextInterpolate1('Hello, ', ctx.firstName ?? 'Frodo', '!');
        i0.ɵɵadvance(2);
        i0.ɵɵtextInterpolate1(
          'Your last name is ',
          ctx.lastName ?? ctx.lastNameFallback ?? 'unknown',
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
        <div>Hello, {{ firstName ?? 'Frodo' }}!</div>
        <span>Your last name is {{ lastName ?? lastNameFallback ?? 'unknown' }}</span>
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
      filePath: 'nullish_coalescing_interpolation.ts',
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