import { Injectable, InjectionToken, NgModule } from "@angular/core";
import * as i0 from "@angular/core";
export class Thing {
  static ɵfac = function Thing_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || Thing)();
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: Thing, factory: Thing.ɵfac });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      Thing,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
export class BaseService {
  thing;
  constructor(thing) {
    this.thing = thing;
  }
  static ɵfac = function BaseService_Factory(__ngFactoryType__) {
    /* @ts-ignore */
    return new (__ngFactoryType__ || BaseService)(i0.ɵɵinject(Thing));
  };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: BaseService,
    factory: BaseService.ɵfac
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      BaseService,
      [
        {
          type: Injectable
        }
      ],
      () => [{ type: Thing }],
      null
    );
})();
export class ChildService extends BaseService {
  static ɵfac = /*@__PURE__*/ (() => {
    let ɵChildService_BaseFactory;
    return function ChildService_Factory(__ngFactoryType__) {
      return (
        ɵChildService_BaseFactory ||
        (ɵChildService_BaseFactory = i0.ɵɵgetInheritedFactory(ChildService))
      )(__ngFactoryType__ || ChildService);
    };
  })();
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({
    token: ChildService,
    factory: ChildService.ɵfac
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      ChildService,
      [
        {
          type: Injectable
        }
      ],
      null,
      null
    );
})();
const MY_TOKEN = new InjectionToken("MY_TOKEN");
export class FooModule {
  static ɵfac = function FooModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FooModule)();
  };
  static ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: FooModule });
  static ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({
    providers: [
      Thing,
      BaseService,
      ChildService,
      { provide: MY_TOKEN, useFactory: child => ({ child }), deps: [ChildService] }
    ]
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
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
                { provide: MY_TOKEN, useFactory: child => ({ child }), deps: [ChildService] }
              ]
            }
          ]
        }
      ],
      null,
      null
    );
})();
