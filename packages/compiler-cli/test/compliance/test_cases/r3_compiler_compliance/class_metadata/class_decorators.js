export class BasicInjectable {
  static ɵfac = …;
  static ɵprov = …;
}

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(BasicInjectable, [{
    type: Injectable
  }], null, null);
})();

…

export class RootInjectable {
  static ɵfac = …;
  static ɵprov = …;
}

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(RootInjectable, [{
    type: Injectable,
    args: [{providedIn: 'root'}]
  }], null, null);
})();

…

let CustomInjectable = class CustomInjectable {
  static ɵfac = function CustomInjectable_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CustomInjectable)(); };
  static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: CustomInjectable, factory: CustomInjectable.ɵfac });
};
CustomInjectable = __decorate([
  CustomClassDecorator()
], CustomInjectable);
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(CustomInjectable, [{
    type: Injectable
  }], null, null);
})();

…

export class ComponentWithExternalResource {
  static ɵfac = …;
  static ɵcmp = …;
}

(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && $i0$.ɵsetClassMetadata(ComponentWithExternalResource, [{
    type: Component,
    args: [{
      selector: 'test-cmp',
      template: "<span>Test template</span>\n"
    }]
  }], null, null);
})();
