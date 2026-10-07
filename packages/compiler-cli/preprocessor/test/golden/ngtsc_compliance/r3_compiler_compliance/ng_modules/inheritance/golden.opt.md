# /out/inheritance.ts
```ts
import { Injectable, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Service {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Service, never> = function Service_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Service)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: Service,
    factory: Service.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Service, [{ type: Injectable }], null, null);
  }
}

export class BaseModule {
  constructor(private service: Service) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BaseModule, never> = function BaseModule_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || BaseModule)(i0.ɵɵinject(Service));
  };
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<BaseModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BaseModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<BaseModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [Service],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        BaseModule,
        [{ type: NgModule, args: [{ providers: [Service] }] }],
        (): any => [{ type: Service }],
        null,
      );
  }
}

export class BasicModule extends BaseModule {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BasicModule, never> = /*@__PURE__*/ ((): any => {
    let ɵBasicModule_BaseFactory: any;
    return function BasicModule_Factory(__ngFactoryType__: any): any {
      return (
        ɵBasicModule_BaseFactory ||
        (ɵBasicModule_BaseFactory = i0.ɵɵgetInheritedFactory(BasicModule))
      )(__ngFactoryType__ || BasicModule);
    };
  })();
  // @ts-ignore
  static ɵmod: i0.ɵɵNgModuleDeclaration<BasicModule, never, never, never> =
    /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BasicModule });
  // @ts-ignore
  static ɵinj: i0.ɵɵInjectorDeclaration<BasicModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({});
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(BasicModule, [{ type: NgModule, args: [{}] }], null, null);
  }
}

```