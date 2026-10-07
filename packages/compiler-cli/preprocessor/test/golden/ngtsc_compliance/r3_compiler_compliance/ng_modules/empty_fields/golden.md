# /out/empty_fields.ts
```ts
import { NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class FooModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<FooModule, never> = function FooModule_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || FooModule)();
  };
  // @ts-ignore
  static ɵmod: FooModule = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FooModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<FooModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FooModule,
        [
          {
            type: NgModule,
            args: [
              {
                providers: [],
                declarations: [],
                imports: [],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}
(function (): any {
  (typeof ngJitMode === 'undefined' || ngJitMode) &&
    i0.ɵɵsetNgModuleScope(FooModule, { declarations: [], imports: [] });
})();

```