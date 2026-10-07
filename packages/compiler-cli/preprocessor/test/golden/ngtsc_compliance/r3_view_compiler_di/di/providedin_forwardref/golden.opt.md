# /out/providedin_forwardref.ts
```ts
import { forwardRef, Injectable, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Dep {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Dep, never> = function Dep_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Dep)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: Dep,
    factory: Dep.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Dep, [{ type: Injectable }], null, null);
  }
}
export class Service {
  constructor(dep: Dep) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Service, never> = function Service_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || Service)(i0.ɵɵinject(Dep));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: Service,
    factory: Service.ɵfac,
    providedIn: i0.forwardRef((): any => Mod),
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        Service,
        [{ type: Injectable, args: [{ providedIn: forwardRef(() => Mod) }] }],
        (): any => [{ type: Dep }],
        null,
      );
  }
}
export class Mod {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Mod, never> = function Mod_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Mod)();
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<Mod, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: Mod });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<Mod> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Mod, [{ type: NgModule }], null, null);
  }
}

```