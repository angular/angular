export class BaseModule {
  constructor(service) { this.service = service; }
}
BaseModule.ɵfac = function BaseModule_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BaseModule)(i0.ɵɵinject(Service)); };
BaseModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BaseModule });
BaseModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [Service] });
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BaseModule, [{
    type: NgModule,
    args: [{ providers: [Service] }]
  }], () => [{ type: Service }], null);
})();
…
export class BasicModule extends BaseModule {
}

BasicModule.ɵfac = /*@__PURE__*/ (() => {
  let ɵBasicModule_BaseFactory;
  return function BasicModule_Factory(__ngFactoryType__) {
    return (ɵBasicModule_BaseFactory || (ɵBasicModule_BaseFactory = i0.ɵɵgetInheritedFactory(BasicModule)))(__ngFactoryType__ || BasicModule);
  };
})();

BasicModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BasicModule });
BasicModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BasicModule, [{
    type: NgModule,
    args: [{}]
  }], null, null);
})();
…
