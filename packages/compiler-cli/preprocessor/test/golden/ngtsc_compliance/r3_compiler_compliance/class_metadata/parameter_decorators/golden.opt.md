# /out/parameter_decorators.ts
```ts
import { Inject, Injectable, InjectionToken, SkipSelf } from '@angular/core';
import { CustomParamDecorator } from './custom';
// @ts-ignore
import * as i0 from '@angular/core';

export const TOKEN = new InjectionToken<string>('TOKEN');
class Service {}

export class ParameterizedInjectable {
  constructor(
    service: Service,
    token: string,
    @CustomParamDecorator() custom: Service,
    @CustomParamDecorator() mixed: string,
  ) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<
    ParameterizedInjectable,
    [null, null, null, { skipSelf: true }]
  > = function ParameterizedInjectable_Factory(__ngFactoryType__: any): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ParameterizedInjectable)(
      i0.ɵɵinject(Service),
      i0.ɵɵinject(TOKEN),
      i0.ɵɵinject(Service),
      i0.ɵɵinject(TOKEN, 4),
    );
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: ParameterizedInjectable,
    factory: ParameterizedInjectable.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        ParameterizedInjectable,
        [{ type: Injectable }],
        (): any => [
          { type: Service },
          { type: undefined, decorators: [{ type: Inject, args: [TOKEN] }] },
          { type: Service, decorators: [] },
          { type: undefined, decorators: [{ type: Inject, args: [TOKEN] }, { type: SkipSelf }] },
        ],
        null,
      );
  }
}

export class NoCtor {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NoCtor, never> = function NoCtor_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || NoCtor)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: NoCtor,
    factory: NoCtor.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(NoCtor, [{ type: Injectable }], null, null);
  }
}

export class EmptyCtor {
  constructor() {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<EmptyCtor, never> = function EmptyCtor_Factory(
    __ngFactoryType__: any,
  ): any {
    return new (__ngFactoryType__ || EmptyCtor)();
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: EmptyCtor,
    factory: EmptyCtor.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(EmptyCtor, [{ type: Injectable }], (): any => [], null);
  }
}

export class NoDecorators {
  constructor(service: Service) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<NoDecorators, never> = function NoDecorators_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NoDecorators)(i0.ɵɵinject(Service));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: NoDecorators,
    factory: NoDecorators.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        NoDecorators,
        [{ type: Injectable }],
        (): any => [{ type: Service }],
        null,
      );
  }
}

export class CustomInjectable {
  constructor(@CustomParamDecorator() service: Service) {}
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<CustomInjectable, never> = function CustomInjectable_Factory(
    __ngFactoryType__: any,
  ): any {
    /* @ts-ignore */
    return new (__ngFactoryType__ || CustomInjectable)(i0.ɵɵinject(Service));
  };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: CustomInjectable,
    factory: CustomInjectable.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        CustomInjectable,
        [{ type: Injectable }],
        (): any => [{ type: Service, decorators: [] }],
        null,
      );
  }
}

export class DerivedInjectable extends ParameterizedInjectable {
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DerivedInjectable, never> = /*@__PURE__*/ ((): any => {
    let ɵDerivedInjectable_BaseFactory: any;
    return function DerivedInjectable_Factory(__ngFactoryType__: any): any {
      return (
        ɵDerivedInjectable_BaseFactory ||
        (ɵDerivedInjectable_BaseFactory = i0.ɵɵgetInheritedFactory(DerivedInjectable))
      )(__ngFactoryType__ || DerivedInjectable);
    };
  })();
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: DerivedInjectable,
    factory: DerivedInjectable.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(DerivedInjectable, [{ type: Injectable }], null, null);
  }
}

export class DerivedInjectableWithCtor extends ParameterizedInjectable {
  constructor() {
    super(null!, '', null!, '');
  }
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<DerivedInjectableWithCtor, never> =
    function DerivedInjectableWithCtor_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || DerivedInjectableWithCtor)();
    };
  // @ts-ignore
  static ɵprov: i0.ɵɵInjectableDeclaration<any> = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: DerivedInjectableWithCtor,
    factory: DerivedInjectableWithCtor.ɵfac,
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(DerivedInjectableWithCtor, [{ type: Injectable }], (): any => [], null);
  }
}

```