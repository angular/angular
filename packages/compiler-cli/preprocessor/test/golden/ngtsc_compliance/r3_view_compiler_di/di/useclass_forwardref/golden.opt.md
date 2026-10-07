# /out/useclass_forwardref.ts
```ts
import { forwardRef, Injectable } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

abstract class SomeProvider {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeProvider, never> = function SomeProvider_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || SomeProvider)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: SomeProvider,
    factory: (__ngFactoryType__: any): any => SomeProviderImpl.ɵfac(__ngFactoryType__),
    providedIn: 'root',
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        SomeProvider,
        [
          {
            type: Injectable,
            args: [{ providedIn: 'root', useClass: forwardRef(() => SomeProviderImpl) }],
          },
        ],
        null,
        null,
      );
  }
}

class SomeProviderImpl extends SomeProvider {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<SomeProviderImpl, never> = /*@__PURE__*/ ((): any => {
    let ɵSomeProviderImpl_BaseFactory: any;
    return function SomeProviderImpl_Factory(__ngFactoryType__: any): any {
      return (
        ɵSomeProviderImpl_BaseFactory ||
        (ɵSomeProviderImpl_BaseFactory = i0.ɵɵgetInheritedFactory(SomeProviderImpl))
      )(__ngFactoryType__ || SomeProviderImpl);
    };
  })();
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: SomeProviderImpl,
    factory: SomeProviderImpl.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(SomeProviderImpl, [{ type: Injectable }], null, null);
  }
}

```