# /out/providers.ts
```ts
import { Injectable, InjectionToken, NgModule } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class Thing {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<Thing, never> = function Thing_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || Thing)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: Thing,
    factory: Thing.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(Thing, [{ type: Injectable }], null, null);
  }
}

export class BaseService {
  constructor(protected thing: Thing) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<BaseService, never> = function BaseService_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || BaseService)(i0.ɵɵinject(Thing));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: BaseService,
    factory: BaseService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(BaseService, [{ type: Injectable }], (): any => [{ type: Thing }], null);
  }
}

export class ChildService extends BaseService {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<ChildService, never> = /*@__PURE__*/ ((): any => {
    let ɵChildService_BaseFactory: any;
    return function ChildService_Factory(__ngFactoryType__: any): any {
      return (
        ɵChildService_BaseFactory ||
        (ɵChildService_BaseFactory = i0.ɵɵgetInheritedFactory(ChildService))
      )(__ngFactoryType__ || ChildService);
    };
  })();
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: ChildService,
    factory: ChildService.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(ChildService, [{ type: Injectable }], null, null);
  }
}

const MY_TOKEN = new InjectionToken('MY_TOKEN');

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
  static ɵinj: i0.ɵɵInjectorDeclaration<FooModule> = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [
      Thing,
      BaseService,
      ChildService,
      { provide: MY_TOKEN, useFactory: (child: ChildService) => ({ child }), deps: [ChildService] },
    ],
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        FooModule,
        [
          {
            type: NgModule,
            args: [
              {
                providers: [
                  Thing,
                  BaseService,
                  ChildService,
                  {
                    provide: MY_TOKEN,
                    useFactory: (child: ChildService) => ({ child }),
                    deps: [ChildService],
                  },
                ],
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```