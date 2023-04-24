class BaseModule {
  constructor(service) { this.service = service; }
}
BaseModule.ɵfac = function BaseModule_Factory(t) { return new (t || BaseModule)(i0.ɵɵinject(Service)); };
BaseModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BaseModule });
BaseModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ providers: [Service] });
export { BaseModule };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BaseModule, [{
  type: NgModule,
  args: [{ providers: [Service] }]
}], function () { return [{ type: Service }]; }, null); })();
…
class BasicModule extends BaseModule {
}

BasicModule.ɵfac = /*@__PURE__*/ function () {
  let ɵBasicModule_BaseFactory;
  return function BasicModule_Factory(t) {
    return (ɵBasicModule_BaseFactory || (ɵBasicModule_BaseFactory = i0.ɵɵgetInheritedFactory(BasicModule)))(t || BasicModule);
  };
}();

BasicModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: BasicModule });
BasicModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({});
export { BasicModule };
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BasicModule, [{
  type: NgModule,
  args: [{}]
}], null, null); })();
…