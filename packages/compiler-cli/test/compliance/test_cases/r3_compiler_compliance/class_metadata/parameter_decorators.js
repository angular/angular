var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
import { Inject, Injectable, InjectionToken, SkipSelf } from "@angular/core";
import { CustomParamDecorator } from "./custom";
import * as i0 from "@angular/core";
export const TOKEN = new InjectionToken("TOKEN");
class Service {}
let ParameterizedInjectable = class ParameterizedInjectable {
  constructor(service, token, custom, mixed) {}
  static ɵfac = function ParameterizedInjectable_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || ParameterizedInjectable)(
      i0.ɵɵinject(Service),
      i0.ɵɵinject(TOKEN),
      i0.ɵɵinject(Service),
      i0.ɵɵinject(TOKEN, 4)
    );
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: ParameterizedInjectable,
    factory: ParameterizedInjectable.ɵfac
  });
};
ParameterizedInjectable = __decorate(
  [
    __param(2, CustomParamDecorator()),
    __param(3, CustomParamDecorator()),
    __metadata("design:paramtypes", [Service, String, Service, String])
  ],
  ParameterizedInjectable
);
export { ParameterizedInjectable };
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ParameterizedInjectable,
      [
        {
          type: Injectable
        }
      ],
      () => [
        { type: Service },
        {
          type: undefined,
          decorators: [
            {
              type: Inject,
              args: [TOKEN]
            }
          ]
        },
        { type: Service, decorators: [] },
        {
          type: undefined,
          decorators: [
            {
              type: Inject,
              args: [TOKEN]
            },
            {
              type: SkipSelf
            }
          ]
        }
      ],
      null
    );
})();
export class NoCtor {
  static ɵfac = function NoCtor_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || NoCtor)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: NoCtor, factory: NoCtor.ɵfac });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      NoCtor,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
export class EmptyCtor {
  constructor() {}
  static ɵfac = function EmptyCtor_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || EmptyCtor)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: EmptyCtor, factory: EmptyCtor.ɵfac });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      EmptyCtor,
      [
        {
          type: Injectable
        }
      ],
      () => [],
      null
    );
})();
export class NoDecorators {
  constructor(service) {}
  static ɵfac = function NoDecorators_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || NoDecorators)(i0.ɵɵinject(Service));
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: NoDecorators,
    factory: NoDecorators.ɵfac
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      NoDecorators,
      [
        {
          type: Injectable
        }
      ],
      () => [{ type: Service }],
      null
    );
})();
let CustomInjectable = class CustomInjectable {
  constructor(service) {}
  static ɵfac = function CustomInjectable_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || CustomInjectable)(i0.ɵɵinject(Service));
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: CustomInjectable,
    factory: CustomInjectable.ɵfac
  });
};
CustomInjectable = __decorate(
  [__param(0, CustomParamDecorator()), __metadata("design:paramtypes", [Service])],
  CustomInjectable
);
export { CustomInjectable };
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      CustomInjectable,
      [
        {
          type: Injectable
        }
      ],
      () => [{ type: Service, decorators: [] }],
      null
    );
})();
export class DerivedInjectable extends ParameterizedInjectable {
  static ɵfac = /*@__PURE__*/ (() => {
    let ɵDerivedInjectable_BaseFactory;
    return function DerivedInjectable_Factory(__ngFactoryType__) {
      return (
        ɵDerivedInjectable_BaseFactory ||
        (ɵDerivedInjectable_BaseFactory = i0.ɵɵgetInheritedFactory(DerivedInjectable))
      )(__ngFactoryType__ || DerivedInjectable);
    };
  })();
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: DerivedInjectable,
    factory: DerivedInjectable.ɵfac
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DerivedInjectable,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
export class DerivedInjectableWithCtor extends ParameterizedInjectable {
  constructor() {
    super(null, "", null, "");
  }
  static ɵfac = function DerivedInjectableWithCtor_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DerivedInjectableWithCtor)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: DerivedInjectableWithCtor,
    factory: DerivedInjectableWithCtor.ɵfac
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      DerivedInjectableWithCtor,
      [
        {
          type: Injectable
        }
      ],
      () => [],
      null
    );
})();
