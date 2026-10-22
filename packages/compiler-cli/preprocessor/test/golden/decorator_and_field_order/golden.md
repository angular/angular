# /out/app.ts
```ts
import { Injectable, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

function CustomClassDec(): ClassDecorator {
  return () => {};
}

@CustomClassDec()
export class DualDecoratedModule {
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjectable({
      token: DualDecoratedModule,
      factory: DualDecoratedModule.ɵfac,
    });
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DualDecoratedModule, never> =
    function DualDecoratedModule_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DualDecoratedModule)();
    };
  // @ts-ignore
  static ɵmod: DualDecoratedModule =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: DualDecoratedModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<DualDecoratedModule> =
    // @ts-ignore
    /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        DualDecoratedModule,
        [{ type: NgModule }, { type: Injectable }],
        null,
        null,
      );
  }
}

```