# /out/nullish_coalescing_host.ngtypecheck.ts
```ts
/**
 * TCB for /nullish_coalescing_host.ts
 * @generated
 */

import * as i0 from './nullish_coalescing_host';

/*tcb1*/
function _tcb1(this: i0.MyApp) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    'Hello, ' /*131,140*/ +
      (this.firstName /*144,153*/ /*144,153*/ ?? 'Frodo' /*157,164*/) /*144,164*/ /*131,165*/ +
      '!' /*168,171*/ /*131,171*/;
    var _t1 = document.createElement('my-app'); /*313,318*/
    _t1.addEventListener(/*183,190*/ 'click', ($event /*T:EP*/): any => {
      this.logLastName(
        /*194,205*/ this.lastName /*206,214*/ /*206,214*/ ??
          this.lastNameFallback /*218,234*/ /*218,234*/ /*206,234*/ ??
          'unknown' /*238,247*/ /*206,247*/,
      ) /*194,248*/;
    }) /*183,248*/;
  }
}

```

# /out/nullish_coalescing_host.ts
```ts
import { Component, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class MyApp {
  firstName: string | null = null;
  lastName: string | null = null;
  lastNameFallback = 'Baggins';

  logLastName(name: string) {
    console.log(name);
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
    hostVars: 1,
    hostBindings: function MyApp_HostBindings(rf: number, ctx: any): any {
      if (rf & 1) {
        i0.ɵɵlistener('click', function MyApp_click_HostBindingHandler(): any {
          return ctx.logLastName(ctx.lastName ?? ctx.lastNameFallback ?? 'unknown');
        });
      }
      if (rf & 2) {
        i0.ɵɵattribute('first-name', 'Hello, ' + (ctx.firstName ?? 'Frodo') + '!');
      }
    },
    standalone: false,
    decls: 0,
    vars: 0,
    template: function MyApp_Template(rf: number, ctx: any): any {},
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
                host: {
                  '[attr.first-name]': `'Hello, ' + (firstName ?? 'Frodo') + '!'`,
                  '(click)': `logLastName(lastName ?? lastNameFallback ?? 'unknown')`,
                },
                template: ``,
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
      filePath: 'nullish_coalescing_host.ts',
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